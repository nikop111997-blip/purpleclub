// app/api/auth/user/attendance/route.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

const MILESTONES = [10, 25, 50, 75, 100];

function toIdString(value) {
  return value?.toString?.() || null;
}

function isAttended(record) {
  return ["PRESENT", "ATTENDED"].includes(
    String(record?.status || "").toUpperCase()
  );
}

function getRegistrationType(registration, attendance) {
  const registrationType = String(
    registration?.registrationType || ""
  ).toUpperCase();

  const attendanceType = String(
    attendance?.type || ""
  ).toUpperCase();

  if (
    registrationType === "SELF_PASS" ||
    registrationType === "SELF-PASS"
  ) {
    return "Self pass";
  }

  // The member attended using an invitation.
  // This does NOT mean the member brought a guest.
  if (
    registrationType === "GUEST" ||
    attendanceType === "GUEST"
  ) {
    return "Guest invite";
  }

  return "Membership";
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const memberId = new ObjectId(userId);
    const db = await getDB();

    // Load the user's registrations and attendance independently.
    const [registrations, attendanceRecords] = await Promise.all([
      db.collection("event_registrations")
        .find({ memberId })
        .sort({ registeredAt: -1, createdAt: -1 })
        .toArray(),

      db.collection("attendance")
        .find({ memberId })
        .sort({ checkedInAt: -1, attendedAt: -1, createdAt: -1 })
        .toArray(),
    ]);

    // Deduplicate check-ins by event. A GUEST attendance type can
    // still represent this member's own attendance via an invitation.
    const attendanceMap = new Map();

    for (const record of attendanceRecords) {
      const eventKey = toIdString(record.eventId);
      if (!eventKey || !isAttended(record)) continue;

      if (!attendanceMap.has(eventKey)) {
        attendanceMap.set(eventKey, record);
      }
    }

    // Keep the latest registration for each event.
    const registrationMap = new Map();

    for (const registration of registrations) {
      const eventKey = toIdString(registration.eventId);
      if (!eventKey) continue;

      if (!registrationMap.has(eventKey)) {
        registrationMap.set(eventKey, registration);
      }
    }

    // Include events found in either registrations or attendance.
    const eventKeys = new Set([
      ...registrationMap.keys(),
      ...attendanceMap.keys(),
    ]);

    const eventObjectIds = [...eventKeys]
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    const events = eventObjectIds.length
      ? await db.collection("events")
          .find({ _id: { $in: eventObjectIds } })
          .toArray()
      : [];

    const eventMap = new Map(
      events.map((event) => [event._id.toString(), event])
    );

    const history = [...eventKeys].map((eventId) => {
      const registration = registrationMap.get(eventId) || null;
      const attendance = attendanceMap.get(eventId) || null;
      const event = eventMap.get(eventId) || null;

      const attended =
        Boolean(attendance) ||
        String(registration?.status || "").toUpperCase() === "ATTENDED";

      return {
        id: registration?._id?.toString() ||
            attendance?._id?.toString() ||
            eventId,

        eventId,
        eventName: event?.name || event?.title || "Purple Experience",
        eventDate: event?.date || event?.eventDate || null,
        location: event?.location || event?.venue || "",

        type: getRegistrationType(registration, attendance),
        status: attended ? "Attended" : "Registered",

        registeredAt:
          registration?.registeredAt ||
          registration?.createdAt ||
          null,

        attendedAt:
          attendance?.checkedInAt ||
          attendance?.attendedAt ||
          registration?.attendedAt ||
          null,

        // Do not expose registration.guest or attendance.guest.
        qrCode: registration?.qrCode || null,
      };
    });

    // Most recent event first.
    history.sort((a, b) => {
      const aDate = new Date(
        a.attendedAt || a.registeredAt || a.eventDate || 0
      ).getTime();

      const bDate = new Date(
        b.attendedAt || b.registeredAt || b.eventDate || 0
      ).getTime();

      return bDate - aDate;
    });

    const attended = history.filter(
      (item) => item.status === "Attended"
    ).length;

    const reserved = history.filter(
      (item) => item.status === "Registered"
    ).length;

    const earnedBadges = MILESTONES.filter(
      (milestone) => attended >= milestone
    );

    const nextMilestone =
      MILESTONES.find((milestone) => attended < milestone) || null;

    return NextResponse.json({
      success: true,

      summary: {
        total: history.length,
        attended,
        reserved,
      },

      badges: {
        milestones: MILESTONES,
        earned: earnedBadges,
        next: nextMilestone,
        remaining: nextMilestone
          ? nextMilestone - attended
          : 0,
      },

      history,
    });
  } catch (error) {
    console.error("USER ATTENDANCE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load attendance",
      },
      { status: 500 }
    );
  }
}