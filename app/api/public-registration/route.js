
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { getDB } from "@/lib/db";

const PLANS = ["charter-member", "charter-coach", "membership"];

export async function POST(request) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const mobile =
      typeof body.phone === "string"
        ? body.phone.replace(/\D/g, "")
        : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const plan = typeof body.plan === "string" ? body.plan : "";

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Enter a valid name." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    if (city.length < 2 || city.length > 100) {
      return NextResponse.json(
        { success: false, message: "Enter a valid city." },
        { status: 400 }
      );
    }

    if (!PLANS.includes(plan)) {
      return NextResponse.json(
        { success: false, message: "Select a valid plan." },
        { status: 400 }
      );
    }

    const db = await getDB();

    const existing = await db.collection("members").findOne({
      $or: [{ mobile }, { email }],
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "This email or phone number is already registered.",
        },
        { status: 409 }
      );
    }

    const temporaryPassword =
      `Pc!${randomBytes(18).toString("base64url")}9`;
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const registrationToken = randomBytes(32).toString("base64url");
    const registrationTokenHash = createHash("sha256")
      .update(registrationToken)
      .digest("hex");

    const now = new Date();

    const member = {
      name,
      email,
      mobile,
      password: passwordHash,
      isActive: false,
      registrationPlan: plan,
      registrationStatus: "PAYMENT_PENDING",
      paymentStatus: "NOT_SUBMITTED",
      paymentReference: null,
      paymentReferenceSubmittedAt: null,
      paymentVerifiedAt: null,
      registrationTokenHash,
      referralCode: `PURPLE${randomBytes(4).toString("hex").toUpperCase()}`,
      referredBy: null,
      profile: {
        photo: null,
        city,
        dob: null,
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("members").insertOne(member);

    try {
      await db.collection("registration_credentials").insertOne({
        memberId: result.insertedId,
        email,
        temporaryPassword,
        status: "PENDING_DELIVERY",
        createdAt: now,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      // Avoid leaving a member record behind if credential storage fails.
      await db.collection("members").deleteOne({ _id: result.insertedId });
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration saved successfully.",
        registration: {
          memberId: result.insertedId.toString(),
          name,
          email,
          mobile,
          city,
          plan,
          registrationToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save registration." },
      { status: 500 }
    );
  }
}
