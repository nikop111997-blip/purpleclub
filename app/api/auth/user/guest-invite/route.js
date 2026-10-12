
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import crypto from "crypto";

import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashInviteToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Normalize Indian mobile numbers to 10 digits.
function normalizeMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return "";
}

// Escape user input before building a regular expression.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Match common stored formats: 9876543210, +919876543210,
// or 91 9876543210.
function mobileRegex(mobile) {
  const digits = escapeRegex(mobile);
  return new RegExp(`^(?:\\+?91[\\s-]?)?${digits}$`);
}

export async function POST(request) {
  try {
    // =========================================
    // AUTHENTICATION
    // =========================================

    const session = await auth();

    if (!session?.user?.memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const memberId = String(session.user.memberId);

    if (!ObjectId.isValid(memberId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member.",
        },
        { status: 400 }
      );
    }

    // =========================================
    // REQUEST VALIDATION
    // =========================================

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const { eventId, guestName, guestMobile } = body || {};

    if (!eventId || !ObjectId.isValid(eventId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid event is required.",
        },
        { status: 400 }
      );
    }

    const name =
      typeof guestName === "string" ? guestName.trim() : "";

    if (!name || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Guest name is required and must be under 100 characters.",
        },
        { status: 400 }
      );
    }

    const mobile = normalizeMobile(guestMobile);

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    // =========================================
    // DATABASE
    // =========================================

    const db = await getDB();

    const inviterId = new ObjectId(memberId);
    const selectedEventId = new ObjectId(eventId);

    // =========================================
    // VERIFY INVITER
    // =========================================

    const member = await db.collection("members").findOne({
      _id: inviterId,
      isActive: true,
    });

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "Your active member account was not found.",
        },
        { status: 404 }
      );
    }

    // =========================================
    // VERIFY EVENT
    // =========================================

    const event = await db.collection("events").findOne({
      _id: selectedEventId,
      status: "PUBLISHED",
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "Event not found or unavailable.",
        },
        { status: 404 }
      );
    }

    // Event dates are commonly stored as YYYY-MM-DD strings.
    // Compare the calendar date, not midnight against the current time.
    const eventDateString =
      event.date instanceof Date
        ? [
            event.date.getFullYear(),
            String(event.date.getMonth() + 1).padStart(2, "0"),
            String(event.date.getDate()).padStart(2, "0"),
          ].join("-")
        : String(event.date || "").slice(0, 10);

    const today = [
      new Date().getFullYear(),
      String(new Date().getMonth() + 1).padStart(2, "0"),
      String(new Date().getDate()).padStart(2, "0"),
    ].join("-");

    if (!eventDateString || eventDateString < today) {
      return NextResponse.json(
        {
          success: false,
          message: "This event has already passed.",
        },
        { status: 400 }
      );
    }

    // =========================================
    // CHECK WHETHER GUEST IS ALREADY A MEMBER
    // =========================================

    const numberPattern = mobileRegex(mobile);

    const existingMember = await db.collection("members").findOne({
      $or: [
        { mobile: { $regex: numberPattern } },
        { phone: { $regex: numberPattern } },
      ],
    });

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          code: "ALREADY_MEMBER",
          message:
            "This mobile number already belongs to a Purple member. They should use their own Member QR.",
        },
        { status: 409 }
      );
    }

    // =========================================
    // CHECK DUPLICATE ACTIVE INVITATION
    // =========================================

    const existingInvite = await db
      .collection("guest_invites")
      .findOne({
        eventId: selectedEventId,
        guestMobile: mobile,
        status: {
          $in: ["INVITED", "REGISTERED"],
        },
      });

    if (existingInvite) {
      return NextResponse.json(
        {
          success: false,
          code: "INVITE_ALREADY_EXISTS",
          message:
            "An active invitation already exists for this mobile number and event.",
        },
        { status: 409 }
      );
    }

    // =========================================
    // GENERATE INVITATION TOKEN
    // =========================================

    const rawToken = generateInviteToken();
    const tokenHash = hashInviteToken(rawToken);
    const now = new Date();

    // =========================================
    // CREATE INVITATION
    // =========================================

    const invite = {
      inviterMemberId: inviterId,
      guestUserId: null,
      eventId: selectedEventId,

      // Store a hash for server-side token verification.
      tokenHash,

      // Keep the raw token only if your existing invite acceptance
      // flow depends on it. Prefer using tokenHash for lookup.
      shareToken: rawToken,

      guestName: name,
      guestMobile: mobile,

      status: "INVITED",
      registrationId: null,
      referralId: null,

      createdAt: now,
      registeredAt: null,
      attendedAt: null,
      cancelledAt: null,
    };

    const result = await db
      .collection("guest_invites")
      .insertOne(invite);

    // =========================================
    // BUILD INVITATION URL
    // =========================================

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000"
    ).replace(/\/+$/, "");

    const inviteUrl = `${baseUrl}/invite/${rawToken}`;

    return NextResponse.json(
      {
        success: true,
        message: "Guest invitation created successfully.",
        invite: {
          id: result.insertedId.toString(),
          eventId: selectedEventId.toString(),
          guestName: name,
          guestMobile: mobile,
          status: "INVITED",
          inviteUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE GUEST INVITE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create guest invitation.",
      },
      { status: 500 }
    );
  }
}
