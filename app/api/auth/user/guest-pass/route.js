import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const memberId = new ObjectId(session.user.memberId);

    const db = await getDB();

    const guestPasses = db.collection("guest_passes");
    const registrations = db.collection("event_registrations");
    const events = db.collection("events");

    // =====================================================
    // GET FREE PASS
    // =====================================================

    const guestPass = await guestPasses.findOne({
      memberId,
      type: "FREE",
    });

    if (!guestPass) {
      return NextResponse.json(
        {
          success: false,
          message: "Guest pass not found.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // GET CURRENT REGISTRATION
    // =====================================================

    let registration = null;
    let event = null;

    if (
      guestPass.status === "RESERVED" ||
      guestPass.status === "USED"
    ) {
      registration = await registrations.findOne({
        "guest.guestPassId": guestPass._id,
        status: {
          $in: ["REGISTERED", "ATTENDED"],
        },
      });

      if (registration?.eventId) {
        event = await events.findOne({
          _id: registration.eventId,
        });
      }
    }

    // =====================================================
    // UPCOMING EVENTS
    // =====================================================

    const now = new Date();

    const upcomingEvents = await events
      .find({
        status: "PUBLISHED",
        date: {
          $gte: now,
        },
      })
      .sort({
        date: 1,
      })
      .limit(20)
      .toArray();

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      pass: {
        id: guestPass._id.toString(),
        code: guestPass.code,
        type: guestPass.type,
        status: guestPass.status,

        reservedAt: guestPass.reservedAt || null,
        usedAt: guestPass.usedAt || null,
      },

      registration: registration
        ? {
            id: registration._id.toString(),
            status: registration.status,
            registrationType:
              registration.registrationType || null,
            passUsage: registration.passUsage || null,

            guest: registration.guest
              ? {
                  enabled:
                    registration.guest.enabled || false,
                  name:
                    registration.guest.name || null,
                  mobile:
                    registration.guest.mobile || null,
                  status:
                    registration.guest.status || null,
                }
              : null,
          }
        : null,

      event: event
        ? {
            id: event._id.toString(),
            name: event.name,
            description: event.description || "",
            date: event.date,
            startTime: event.startTime || "",
            endTime: event.endTime || "",
            location: event.location || "",
            capacity: event.capacity || 0,
            status: event.status,
          }
        : null,

      events: upcomingEvents.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        description: item.description || "",
        date: item.date,
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        location: item.location || "",
        capacity: item.capacity || 0,
        status: item.status,
      })),
    });
  } catch (error) {
    console.error("GET USER GUEST PASS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load guest pass.",
      },
      { status: 500 }
    );
  }
}