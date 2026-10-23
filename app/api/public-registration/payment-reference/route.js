
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

    // Validate member ID
    if (!ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, message: "Invalid member ID." },
        { status: 400 }
      );
    }

    // Validate registration token
    if (!/^[A-Za-z0-9_-]{30,100}$/.test(registrationToken)) {
      return NextResponse.json(
        { success: false, message: "Invalid registration session." },
        { status: 401 }
      );
    }

    // Validate payment reference
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
    const members = db.collection("members");
    const id = new ObjectId(memberId);

    // Normalize reference so case/whitespace differences
    // do not allow the same reference to be reused.
    const normalizedReference = referenceNumber
      .trim()
      .toUpperCase();

    // Fetch registration and stored token hash
    const member = await members.findOne(
      { _id: id },
      {
        projection: {
          registrationTokenHash: 1,
          paymentReference: 1,
          paymentReferenceNormalized: 1,
        },
      }
    );

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Registration not found." },
        { status: 404 }
      );
    }

    // Verify registration token using constant-time comparison
    const submittedHash = createHash("sha256")
      .update(registrationToken)
      .digest();

    let storedHash;

    try {
      storedHash =
        typeof member.registrationTokenHash === "string"
          ? Buffer.from(member.registrationTokenHash, "hex")
          : Buffer.alloc(0);
    } catch {
      storedHash = Buffer.alloc(0);
    }

    if (
      storedHash.length !== submittedHash.length ||
      !timingSafeEqual(storedHash, submittedHash)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid registration session." },
        { status: 401 }
      );
    }

    // A member can submit a payment reference only once.
    if (
      typeof member.paymentReference === "string" &&
      member.paymentReference.trim() !== ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference has already been submitted.",
        },
        { status: 409 }
      );
    }

    // Check whether another member already used this reference.
    const existingReference = await members.findOne(
      {
        paymentReference: normalizedReference,
        _id: { $ne: id },
      },
      { projection: { _id: 1 } }
    );

    if (existingReference) {
      return NextResponse.json(
        {
          success: false,
          message: "This payment reference has already been used.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    // Atomic update: do not overwrite a reference submitted
    // by another request for this same member.
    const result = await members.updateOne(
      {
        _id: id,
        registrationTokenHash: member.registrationTokenHash,
        $or: [
          { paymentReference: { $exists: false } },
          { paymentReference: null },
          { paymentReference: "" },
        ],
      },
      {
        $set: {
          paymentReference: referenceNumber,
          paymentReferenceNormalized: normalizedReference,
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
          message:
            "Payment reference already submitted. Please refresh.",
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
    // Unique index violation means another member submitted
    // the same normalized payment reference simultaneously.
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "This payment reference has already been used.",
        },
        { status: 409 }
      );
    }

    console.error("PAYMENT REFERENCE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save payment reference.",
      },
      { status: 500 }
    );
  }
}
