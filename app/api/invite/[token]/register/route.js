import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { getDB } from "@/lib/db";

function hashInviteToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function generateQrCode() {
  return `ER-${crypto.randomBytes(16).toString("hex").toUpperCase()}`;
}

export async function POST(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invitation token is missing.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body?.name || "").trim();

    const mobile = String(body?.mobile || "")
      .replace(/\D/g, "")
      .trim();

    const password = String(body?.password || "");

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 10 digit mobile number.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least one capital letter.",
        },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least one small letter.",
        },
        { status: 400 }
      );
    }

    if (!/\d/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least one number.",
        },
        { status: 400 }
      );
    }

    const tokenHash = hashInviteToken(token);

    const db = await getDB();

    /*
     * =====================================================
     * 1. FIND INVITATION
     * =====================================================
     */

    const invite = await db
      .collection("guest_invites")
      .findOne({
        tokenHash,
      });

    if (!invite) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This invitation is invalid or no longer available.",
        },
        { status: 404 }
      );
    }

    /*
     * =====================================================
     * 2. INVITATION STATUS
     * =====================================================
     */

    if (invite.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "This invitation has been cancelled.",
        },
        { status: 410 }
      );
    }

    if (
      invite.status === "REGISTERED" ||
      invite.status === "ATTENDED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This invitation has already been accepted.",
        },
        { status: 409 }
      );
    }

    /*
     * =====================================================
     * 3. FIND EVENT
     * =====================================================
     */

    const event = await db.collection("events").findOne({
      _id: invite.eventId,
      status: "PUBLISHED",
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This experience is no longer available.",
        },
        { status: 410 }
      );
    }

    /*
     * =====================================================
     * 4. CHECK EVENT DATE
     * =====================================================
     */

    if (event.date) {
      const eventDate = new Date(event.date);

      if (
        !Number.isNaN(eventDate.getTime()) &&
        eventDate < new Date()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "This experience has already passed.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * =====================================================
     * 5. FIND EXISTING MEMBER
     * =====================================================
     */

    const existingMember = await db
      .collection("members")
      .findOne({
        mobile,
      });

    let memberId;

    if (existingMember) {
      /*
       * Existing account:
       *
       * We do not overwrite its password.
       *
       * The guest must use the existing account.
       */

      if (!existingMember.isActive) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This mobile number belongs to an inactive account.",
          },
          { status: 403 }
        );
      }

      memberId = existingMember._id;
    } else {
      /*
       * =====================================================
       * 6. CREATE NEW MEMBER
       * =====================================================
       */

      const hashedPassword = await bcrypt.hash(
        password,
        12
      );

      const now = new Date();

      const member = {
        name,
        mobile,
        password: hashedPassword,

        role: "USER",

        isActive: true,

        /*
         * Guest is not a paid member yet.
         */
        membershipStatus: "NONE",

        createdAt: now,
        updatedAt: now,

        source: "GUEST_INVITATION",
        invitedByMemberId: invite.inviterMemberId,
      };

      const memberResult = await db
        .collection("members")
        .insertOne(member);

      memberId = memberResult.insertedId;
    }

    /*
     * =====================================================
     * 7. CHECK WHETHER THIS MEMBER ALREADY HAS
     *    A REGISTRATION FOR THIS EVENT
     * =====================================================
     */

    const existingRegistration = await db
      .collection("event_registrations")
      .findOne({
        eventId: invite.eventId,
        memberId,
        registrationType: "GUEST",
      });

    if (existingRegistration) {
      /*
       * Link the invitation to the existing registration.
       */

      await db.collection("guest_invites").updateOne(
        {
          _id: invite._id,
          status: "INVITED",
        },
        {
          $set: {
            guestUserId: memberId,
            registrationId: existingRegistration._id,
            status: "REGISTERED",
            registeredAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message:
          "You are already registered for this experience.",
        member: {
          id: memberId.toString(),
          name:
            existingMember?.name || name,
          mobile,
        },
        event: {
          id: event._id.toString(),
          name: event.name || "",
        },
        registration: {
          id: existingRegistration._id.toString(),
          qrCode: existingRegistration.qrCode,
        },
      });
    }

    /*
     * =====================================================
     * 8. GENERATE UNIQUE EVENT QR
     * =====================================================
     */

    let qrCode = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateQrCode();

      const qrExists = await db
        .collection("event_registrations")
        .findOne({
          qrCode: candidate,
        });

      if (!qrExists) {
        qrCode = candidate;
        break;
      }
    }

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create your event QR. Please try again.",
        },
        { status: 500 }
      );
    }

    /*
     * =====================================================
     * 9. CREATE EVENT REGISTRATION
     * =====================================================
     *
     * IMPORTANT:
     *
     * This is a GUEST registration.
     *
     * It does NOT consume the inviter's
     * Sunday experience.
     *
     * It also does NOT create a referral yet.
     *
     * Referral is created only after attendance.
     */

    const now = new Date();

    const registration = {
      eventId: invite.eventId,

      memberId,

      registrationType: "GUEST",

      status: "REGISTERED",

      qrCode,

      registeredAt: now,

      attendedAt: null,

      passUsage: null,

      experienceStatus: null,

      guestInviteId: invite._id,

      guest: {
        enabled: true,

        name,

        mobile,

        guestPassId: null,

        status: null,
      },

      createdAt: now,
      updatedAt: now,
    };

    const registrationResult = await db
      .collection("event_registrations")
      .insertOne(registration);

    /*
     * =====================================================
     * 10. UPDATE INVITATION
     * =====================================================
     */

    const inviteUpdate = await db
      .collection("guest_invites")
      .updateOne(
        {
          _id: invite._id,
          status: "INVITED",
        },
        {
          $set: {
            guestUserId: memberId,

            registrationId:
              registrationResult.insertedId,

            status: "REGISTERED",

            registeredAt: now,

            updatedAt: now,
          },
        }
      );

    /*
     * Race-condition protection.
     *
     * If another request accepted this invitation first,
     * do not leave a second registration attached to it.
     */

    if (inviteUpdate.modifiedCount !== 1) {
      await db
        .collection("event_registrations")
        .deleteOne({
          _id: registrationResult.insertedId,
        });

      return NextResponse.json(
        {
          success: false,
          message:
            "This invitation has already been accepted.",
        },
        { status: 409 }
      );
    }

    /*
     * =====================================================
     * 11. RESPONSE
     * =====================================================
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Registration completed successfully.",

        member: {
          id: memberId.toString(),
          name,
          mobile,
        },

        event: {
          id: event._id.toString(),
          name: event.name || "",
          date: event.date || null,
          startTime: event.startTime || "",
          endTime: event.endTime || "",
          location: event.location || "",
        },

        registration: {
          id: registrationResult.insertedId.toString(),
          qrCode,
          status: "REGISTERED",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "GUEST INVITATION REGISTRATION ERROR:",
      error
    );

    /*
     * Duplicate mobile protection.
     */

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this mobile number already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to complete registration. Please try again.",
      },
      { status: 500 }
    );
  }
}