import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const memberId = new ObjectId(session.user.id);
    const db = await getDB();

    /* =========================================================
       GET USER REGISTRATIONS
    ========================================================= */

    const registrations = await db
      .collection("event_registrations")
      .find({
        memberId,
      })
      .sort({
        registeredAt: -1,
        createdAt: -1,
      })
      .toArray();

    /* =========================================================
       GET EVENT IDS
    ========================================================= */

    const eventIds = registrations
      .map((item) => item.eventId)
      .filter(Boolean);

    const uniqueEventIds = [
      ...new Map(
        eventIds.map((id) => [id.toString(), id])
      ).values(),
    ];

    /* =========================================================
       GET EVENTS
    ========================================================= */

    const events = uniqueEventIds.length
      ? await db
          .collection("events")
          .find({
            _id: {
              $in: uniqueEventIds,
            },
          })
          .toArray()
      : [];

    const eventMap = new Map(
      events.map((event) => [
        event._id.toString(),
        event,
      ])
    );

    /* =========================================================
       GET ATTENDANCE RECORDS
    ========================================================= */

    const attendanceRecords = await db
      .collection("attendance")
      .find({
        memberId,
        type: "EVENT",
      })
      .sort({
        attendedAt: -1,
        createdAt: -1,
      })
      .toArray();

    const attendanceMap = new Map();

    for (const attendance of attendanceRecords) {
      if (!attendance.eventId) continue;

      attendanceMap.set(
        attendance.eventId.toString(),
        attendance
      );
    }

    /* =========================================================
       BUILD HISTORY
    ========================================================= */

    const history = registrations.map((registration) => {
      const event = eventMap.get(
        registration.eventId?.toString()
      );

      const attendance = attendanceMap.get(
        registration.eventId?.toString()
      );

      /* -------------------------------------------------------
         REGISTRATION TYPE
      ------------------------------------------------------- */

      let type = "Membership";

      if (
        registration.registrationType ===
        "SELF_PASS"
      ) {
        type = "Self Pass";
      }

      if (
        registration.registrationType ===
        "GUEST"
      ) {
        type = "Guest";
      }

      /* -------------------------------------------------------
         STATUS
      ------------------------------------------------------- */

      let status = "Registered";

      if (registration.status === "ATTENDED") {
        status = "Attended";
      }

      /* -------------------------------------------------------
         GUEST DETAILS
         
         Only expose guest information when this
         registration was actually made for a guest.
      ------------------------------------------------------- */

      let guest = null;

      if (
        registration.registrationType ===
          "GUEST" &&
        registration.guest
      ) {
        guest = {
          name:
            registration.guest.name ||
            null,

          mobile:
            registration.guest.mobile ||
            null,

          status:
            registration.guest.status ||
            null,
        };
      }

      /* -------------------------------------------------------
         RETURN HISTORY ITEM
      ------------------------------------------------------- */

      return {
        id: registration._id.toString(),

        eventId:
          registration.eventId?.toString() ||
          null,

        eventName:
          event?.name ||
          event?.title ||
          "Purple Experience",

        eventDate:
          event?.date ||
          event?.eventDate ||
          null,

        location:
          event?.location ||
          event?.venue ||
          "",

        type,

        status,

        registeredAt:
          registration.registeredAt ||
          registration.createdAt ||
          null,

        attendedAt:
          registration.attendedAt ||
          attendance?.attendedAt ||
          null,

        qrCode:
          registration.qrCode ||
          null,

        /* Guest details */
        guest,
      };
    });

    /* =========================================================
       SUMMARY
    ========================================================= */

    const attended = history.filter(
      (item) => item.status === "Attended"
    ).length;

    const reserved = history.filter(
      (item) => item.status === "Registered"
    ).length;

    /* =========================================================
       RESPONSE
    ========================================================= */

    return NextResponse.json({
      success: true,

      summary: {
        total: history.length,
        attended,
        reserved,
      },

      history,
    });
  } catch (error) {
    console.error(
      "USER ATTENDANCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load attendance",
      },
      { status: 500 }
    );
  }
}