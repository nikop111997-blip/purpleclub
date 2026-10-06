import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { getDB } from "@/lib/db";

function generateReferralCode() {
  return `PURPLE${Math.floor(100000 + Math.random() * 900000)}`;
}

function generateGuestPassCode() {
  return `GP-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const mobile = body.mobile?.replace(/\D/g, "");
    const password = body.password;

    if (!name || !mobile || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, mobile and password are required",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 10 digit mobile number",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 8 characters",
        },
        { status: 400 }
      );
    }

    const db = await getDB();

    const existingMember = await db.collection("members").findOne({
      mobile,
    });

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this mobile number already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const now = new Date();

    const member = {
      name,
      mobile,
      password: hashedPassword,

      isActive: true,

      referralCode: generateReferralCode(),
      referredBy: null,

      profile: {
        photo: null,
        city: null,
        dob: null,
      },

      createdAt: now,
      updatedAt: now,
    };

    const memberResult = await db
      .collection("members")
      .insertOne(member);

    const memberId = memberResult.insertedId;

    // =================================
    // CREATE ONE FREE PASS
    // =================================

    const freePass = {
      memberId,

      type: "FREE",

      code: generateGuestPassCode(),

      status: "AVAILABLE",

      eventId: null,

      reservedAt: null,
      reservedBy: null,

      usedAt: null,
      usedBy: null,

      createdAt: now,
      updatedAt: now,
    };

    await db.collection("guest_passes").insertOne(freePass);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",

        member: {
          id: memberId.toString(),
          name,
          mobile,
        },

        freePass: {
          code: freePass.code,
          status: freePass.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("USER SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your account",
      },
      { status: 500 }
    );
  }
}