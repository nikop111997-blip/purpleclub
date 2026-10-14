
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

function idString(value) {
  if (!value) return "";
  return String(value.toString()).trim();
}

function isSameId(a, b) {
  return idString(a) !== "" && idString(a) === idString(b);
}

function isSuperCoach(member) {
  return (
    typeof member?.role === "string" &&
    member.role.trim().toUpperCase() === "SUPERCOACH"
  );
}

function isAssignedToSuperCoach(club, memberId) {
  const assignedIds = [
    club.superCoachId,
    club.superCoachMemberId,
    ...(Array.isArray(club.superCoachIds)
      ? club.superCoachIds
      : []),
  ];

  return assignedIds.some((id) => isSameId(id, memberId));
}

function formatDate(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    const memberId = session.user.memberId || session.user.id;

    if (!memberId || !ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, message: "Invalid member account." },
        { status: 403 }
      );
    }

    const db = await getDB();

    // Verify the member from the database instead of trusting
    // the session role alone.
    const member = await db.collection("members").findOne({
      _id: new ObjectId(memberId),
      isActive: true,
    });

    if (!member || !isSuperCoach(member)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only active SuperCoaches can access the scanner.",
        },
        { status: 403 }
      );
    }

    // Find clubs assigned to this SuperCoach.
    const allClubs = await db.collection("clubs").find({}).toArray();

    const assignedClubs = allClubs.filter((club) =>
      isAssignedToSuperCoach(club, member._id)
    );

    if (assignedClubs.length === 0) {
      return NextResponse.json({
        success: true,
        member: {
          id: member._id.toString(),
          name: member.name,
          role: member.role,
        },
        clubs: [],
        events: [],
        message: "No clubs are assigned to your account yet.",
      });
    }

    const clubIds = assignedClubs.map((club) => club._id);

    // Support event documents storing clubId as either ObjectId
    // or a string.
    const clubIdValues = [
      ...clubIds,
      ...clubIds.map((id) => id.toString()),
    ];

    const events = await db
      .collection("events")
      .find({
        clubId: { $in: clubIdValues },
      })
      .sort({ date: 1, startTime: 1, createdAt: -1 })
      .toArray();

    const clubMap = new Map(
      assignedClubs.map((club) => [
        club._id.toString(),
        club,
      ])
    );

    const formattedEvents = events.map((event) => {
      const club = clubMap.get(idString(event.clubId));

      return {
        _id: event._id.toString(),
        name: event.name || "Untitled event",
        description: event.description || "",
        date: formatDate(event.date),
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        location: event.location || "",
        status: event.status || "UNKNOWN",
        eventType:
          event.eventType ||
          event.type ||
          event.category ||
          "CLUB",
        club: club
          ? {
              _id: club._id.toString(),
              name: club.name || "Unnamed club",
              city: club.city || "",
              area: club.area || "",
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      member: {
        id: member._id.toString(),
        name: member.name,
        role: member.role,
      },
      clubs: assignedClubs.map((club) => ({
        _id: club._id.toString(),
        name: club.name || "Unnamed club",
      })),
      events: formattedEvents,
    });
  } catch (error) {
    console.error("SUPERCOACH SCAN EVENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your assigned events.",
      },
      { status: 500 }
    );
  }
}
