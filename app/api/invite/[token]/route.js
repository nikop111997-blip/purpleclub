import { NextResponse } from "next/server";
import crypto from "crypto";
import { ObjectId } from "mongodb";

import { getDB } from "@/lib/db";

function hashInviteToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function GET(request, { params }) {
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

    const tokenHash = hashInviteToken(token);

    const db = await getDB();

    const invite = await db
      .collection("guest_invites")
      .findOne({
        tokenHash,
      });

    if (!invite) {
      return NextResponse.json(
        {
          success: false,
          message: "This invitation is invalid or no longer available.",
        },
        { status: 404 }
      );
    }

    if (invite.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "This invitation has been cancelled.",
        },
        { status: 410 }
      );
    }

    // An invitation that has already been registered
    // should not create another guest account.
    if (
      invite.status === "REGISTERED" ||
      invite.status === "ATTENDED"
    ) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        invite: {
          id: invite._id.toString(),
          status: invite.status,
        },
      });
    }

    const event = await db
      .collection("events")
      .findOne({
        _id: invite.eventId,
      });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "The experience associated with this invitation no longer exists.",
        },
        { status: 404 }
      );
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        {
          success: false,
          message: "This experience is no longer available.",
        },
        { status: 410 }
      );
    }

    // Get inviter details.
    const inviter = await db
      .collection("members")
      .findOne(
        {
          _id: invite.inviterMemberId,
        },
        {
          projection: {
            name: 1,
          },
        }
      );

    return NextResponse.json({
      success: true,
      alreadyRegistered: false,

      invite: {
        id: invite._id.toString(),
        guestName: invite.guestName || "",
        guestMobile: invite.guestMobile || "",
        status: invite.status,
      },

      inviter: {
        name: inviter?.name || "A Purple member",
      },

      event: {
        id: event._id.toString(),
        name: event.name || "Purple Experience",
        description: event.description || "",
        date: event.date || null,
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        location: event.location || "",
        image: event.image || "/cheer.png",
      },
    });
  } catch (error) {
    console.error("GET INVITATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load this invitation.",
      },
      { status: 500 }
    );
  }
}