
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { createHash, timingSafeEqual } from "node:crypto";
import { getDB } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const memberId =
      typeof body.memberId === "string" ? body.memberId : "";
    const referenceNumber =
      typeof body.referenceNumber === "string"
        ? body.referenceNumber.trim()
        : "";
    const registrationToken =
      typeof body.registrationToken === "string"
        ? body.registrationToken
        : "";

    if (!ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, message: "Invalid member ID." },
        { status: 400 }
      );
    }

    if (!/^[A-Za-z0-9_-]{30,100}$/.test(registrationToken)) {
      return NextResponse.json(
        { success: false, message: "Invalid registration session." },
        { status: 401 }
      );
    }

    if (
      referenceNumber.length < 4 ||
      referenceNumber.length > 100 ||
      /[\r\n<>]/.test(referenceNumber)
    ) {
      return NextResponse.json(
        { success: false, message: "Enter a valid payment reference." },
        { status: 400 }
      );
    }

    const db = await getDB();
    const id = new ObjectId(memberId);

    const member = await db.collection("members").findOne(
      { _id: id },
      {
        projection: {
          registrationTokenHash: 1,
          paymentReference: 1,
        },
      }
    );

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Registration not found." },
        { status: 404 }
      );
    }

    const submittedHash = createHash("sha256")
      .update(registrationToken)
      .digest();

    const storedHash = member.registrationTokenHash
      ? Buffer.from(member.registrationTokenHash, "hex")
      : Buffer.alloc(0);

    if (
      storedHash.length !== submittedHash.length ||
      !timingSafeEqual(storedHash, submittedHash)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid registration session." },
        { status: 401 }
      );
    }

    if (member.paymentReference) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference has already been submitted.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    const result = await db.collection("members").updateOne(
      {
        _id: id,
        registrationTokenHash: member.registrationTokenHash,
        paymentReference: null,
      },
      {
        $set: {
          paymentReference: referenceNumber,
          paymentStatus: "PENDING_VERIFICATION",
          registrationStatus: "PAYMENT_REVIEW",
          paymentReferenceSubmittedAt: now,
          updatedAt: now,
        },
      }
    );

    if (result.modifiedCount !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Reference already submitted. Please refresh.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment reference saved. Awaiting verification.",
      paymentStatus: "PENDING_VERIFICATION",
    });
  } catch (error) {
    console.error("PAYMENT REFERENCE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save payment reference." },
      { status: 500 }
    );
  }
}
