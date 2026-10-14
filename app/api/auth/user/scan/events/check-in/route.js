import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

const ACTIVE_REGISTRATION_STATUSES = ["REGISTERED"];
const ACTIVE_MEMBERSHIP_STATUSES = ["ACTIVE"];
const EVENT_TIME_ZONE = "Asia/Kolkata";

function response(message, status = 400, extra = {}) {
  return NextResponse.json(
    { success: false, message, ...extra },
    { status }
  );
}

function asId(value) {
  if (!value) return null;
  const id = value.toString();
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function idString(value) {
  return value ? value.toString() : "";
}

function eventDateKey(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type) =>
    parts.find((part) => part.type === type)?.value || "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function isSundayDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || "")) {
    return false;
  }

  const date = new Date(`${dateKey}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateKey &&
    date.getUTCDay() === 0
  );
}

/*
 * Attendance policy:
 * 1. A member can check in only once per event.
 * 2. A member can check in for only one event on a Sunday.
 * 3. The restriction applies across member and guest QR types.
 */
async function validateAttendancePolicy({
  db,
  memberId,
  event,
  dateKey,
}) {
  if (!memberId) {
    return response("Unable to identify the attending member.", 400);
  }

  if (!dateKey) {
    return response("The event has no valid date.", 400);
  }

  const isSunday = isSundayDateKey(dateKey);
  const conditions = [{ eventId: event._id }];

  if (isSunday) {
    conditions.push({ eventDateKey: dateKey });
  }

  const existing = await db.collection("attendance").findOne({
    memberId,
    $or: conditions,
  });

  if (!existing) return null;

  if (idString(existing.eventId) === idString(event._id)) {
    return response(
      "This member has already checked in for this event. A second scan using another QR type is not allowed.",
      409,
      { code: "ALREADY_CHECKED_IN" }
    );
  }

  if (isSunday) {
    return response(
      "This member has already checked in for an event this Sunday. Only one event at one club is allowed per Sunday.",
      409,
      { code: "SUNDAY_ATTENDANCE_LIMIT" }
    );
  }

  return null;
}

function getRole(session, member) {
  const values = [
    session?.user?.role,
    member?.role,
    member?.profile,
    ...(Array.isArray(member?.roles) ? member.roles : []),
  ];

  return values
    .filter(Boolean)
    .map((value) => String(value).toUpperCase());
}

function isCommunityEvent(event) {
  return (
    event?.isCommunityEvent === true ||
    event?.isCommunityEventVolAccess === true ||
    String(event?.eventType || "").toUpperCase() === "COMMUNITY" ||
    String(event?.category || "").toUpperCase() === "COMMUNITY" ||
    String(event?.type || "").toUpperCase() === "COMMUNITY"
  );
}

function isCharterMembership(membership) {
  const plan = String(
    membership?.plan ||
      membership?.planName ||
      membership?.type ||
      ""
  ).toUpperCase();

  return plan === "CHARTER" || plan === "CHARTER_MEMBERSHIP";
}

function sameId(value, operatorId) {
  if (!value || !operatorId) return false;

  if (Array.isArray(value)) {
    return value.some((item) => sameId(item, operatorId));
  }

  if (typeof value === "object" && value._id) {
    return sameId(value._id, operatorId);
  }

  return value.toString() === operatorId.toString();
}

function clubAssignedToMember(club, operatorId) {
  const fields = [
    "superCoachId",
    "superCoachMemberId",
    "superCoachIds",
    "coachId",
    "coachMemberId",
    "coachIds",
    "assignedCoachId",
    "assignedCoachIds",
  ];

  return fields.some((field) =>
    sameId(club?.[field], operatorId)
  );
}

/*
 * Only SUPERCOACH accounts assigned to the event's club can scan.
 * Authorization is checked on the server for every QR request.
 */
async function authorizeScanner({ db, session, event }) {
  const sessionRole = String(
    session?.user?.role || ""
  ).toUpperCase();

  if (sessionRole !== "SUPERCOACH") {
    return {
      allowed: false,
      message:
        "Not authorised. Only SuperCoach users can scan QR codes.",
    };
  }

  const operatorId = asId(session?.user?.memberId);

  if (!operatorId) {
    return {
      allowed: false,
      message: "Your SuperCoach account could not be verified.",
    };
  }

  const operator = await db.collection("members").findOne({
    _id: operatorId,
    isActive: true,
  });

  if (!operator) {
    return {
      allowed: false,
      message: "Your active SuperCoach account could not be found.",
    };
  }

  const actualRoles = getRole(null, operator);

  if (!actualRoles.includes("SUPERCOACH")) {
    return {
      allowed: false,
      message: "Your account is not authorized as a SuperCoach.",
    };
  }

  const clubId = asId(event?.clubId);

  if (!clubId) {
    return {
      allowed: false,
      message: "This event is not assigned to a valid club.",
    };
  }

  const club = await db.collection("clubs").findOne({
    _id: clubId,
  });

  if (!club || !clubAssignedToMember(club, operatorId)) {
    return {
      allowed: false,
      message:
        "Not authorised. You are not the SuperCoach assigned to this event's club.",
    };
  }

  return {
    allowed: true,
    operatorId,
    clubId: club._id,
  };
}

async function findActiveMembership(db, memberId, now) {
  const memberships = await db
    .collection("memberships")
    .find({
      memberId,
      status: { $in: ACTIVE_MEMBERSHIP_STATUSES },
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(30)
    .toArray();

  return (
    memberships.find((membership) => {
      if (!membership.endDate) return true;

      const endDate = new Date(membership.endDate);

      return (
        !Number.isNaN(endDate.getTime()) &&
        endDate > now
      );
    }) || null
  );
}

async function findMemberByUniversalQR(db, code) {
  return db.collection("members").findOne({
    $or: [
      { qrCode: code },
      { qrToken: code },
      { memberQrCode: code },
    ],
  });
}

async function checkMemberIn({
  db,
  member,
  membership,
  event,
  operatorId,
  clubId,
  now,
}) {
  const memberId = member._id;
  const dateKey = eventDateKey(event.date);

  if (!dateKey) {
    return response("The event has no valid date.", 400);
  }

  if (!member.isActive) {
    return response("This member account is inactive.", 403);
  }

  if (!membership) {
    return response(
      "No active membership found. The member must buy or renew a membership.",
      403,
      { code: "MEMBERSHIP_REQUIRED" }
    );
  }

  if (isCommunityEvent(event)) {
    if (
      !isCharterMembership(membership) ||
      membership.isCommunityEventVolAccess !== true
    ) {
      return response(
        "Community events are available only to Charter members with community-event access.",
        403,
        { code: "CHARTER_MEMBERSHIP_REQUIRED" }
      );
    }
  }

  const policyError = await validateAttendancePolicy({
    db,
    memberId,
    event,
    dateKey,
  });

  if (policyError) return policyError;

  const attendance = {
    memberId,
    eventId: event._id,
    clubId: clubId || event.clubId || null,
    type: "MEMBER",
    status: "PRESENT",
    membershipId: membership._id,
    membershipPlan:
      membership.plan ||
      membership.planName ||
      membership.type ||
      "",
    eventDateKey: dateKey,
    isSunday: isSundayDateKey(dateKey),
    checkedInAt: now,
    checkedInBy: operatorId || null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const inserted = await db
      .collection("attendance")
      .insertOne(attendance);

    await db.collection("event_registrations").updateOne(
      {
        memberId,
        eventId: event._id,
        status: "REGISTERED",
        registrationType: "MEMBERSHIP",
      },
      {
        $set: {
          status: "ATTENDED",
          attendedAt: now,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({
      success: true,
      type: "MEMBER",
      message: "Member checked in successfully.",
      data: {
        attendanceId: inserted.insertedId.toString(),
        member: {
          id: memberId.toString(),
          name: member.name || "",
          mobile: member.mobile || member.phone || "",
          email: member.email || "",
        },
        membership: {
          plan: attendance.membershipPlan,
          endDate: membership.endDate || null,
        },
        event: {
          id: event._id.toString(),
          name: event.name || event.title || "",
          date: dateKey,
          location: event.location || event.venue || "",
        },
        clubId: attendance.clubId
          ? attendance.clubId.toString()
          : null,
        checkedInAt: now,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return response(
        isSundayDateKey(dateKey)
          ? "This member has already checked in for an event this Sunday."
          : "This member has already checked in for this event.",
        409,
        {
          code: isSundayDateKey(dateKey)
            ? "SUNDAY_ATTENDANCE_LIMIT"
            : "ALREADY_CHECKED_IN",
        }
      );
    }

    throw error;
  }
}

async function checkGuestIn({
  db,
  registration,
  event,
  operatorId,
  clubId,
  now,
  guestPass = null,
}) {
  if (registration.status !== "REGISTERED") {
    return response(
      "This guest registration is not active or has already been used.",
      409
    );
  }

  const registrationType =
    registration.registrationType ||
    (registration.passUsage === "GUEST" ? "GUEST" : "");

  if (
    registrationType !== "GUEST" &&
    registration.passUsage !== "GUEST"
  ) {
    return response(
      "This QR is not a guest registration. Scan the member's permanent QR instead.",
      400
    );
  }

  // registration.memberId identifies the member whose attendance
  // is being restricted when a guest invitation is scanned.
  const hostMemberId = registration.memberId;
  const dateKey = eventDateKey(event.date);

  if (!dateKey) {
    return response("The event has no valid date.", 400);
  }

  if (!hostMemberId) {
    return response(
      "The guest registration has no associated member. Check-in cannot continue.",
      400
    );
  }

  const policyError = await validateAttendancePolicy({
    db,
    memberId: hostMemberId,
    event,
    dateKey,
  });

  if (policyError) return policyError;

  const attendanceAlreadyExists = await db
    .collection("attendance")
    .findOne({
      registrationId: registration._id,
      type: "GUEST",
    });

  if (attendanceAlreadyExists) {
    return response(
      "This registration has already been checked in.",
      409,
      { code: "ALREADY_CHECKED_IN" }
    );
  }

  // Claim the registration before consuming a guest pass.
  const registrationUpdate = await db
    .collection("event_registrations")
    .updateOne(
      {
        _id: registration._id,
        eventId: event._id,
        status: "REGISTERED",
      },
      {
        $set: {
          status: "ATTENDED",
          attendedAt: now,
          updatedAt: now,
          "guest.status": "ATTENDED",
        },
      }
    );

  if (registrationUpdate.modifiedCount !== 1) {
    return response(
      "This registration has already been checked in or is no longer active.",
      409
    );
  }

  if (guestPass) {
    const passUpdate = await db.collection("guest_passes").updateOne(
      {
        _id: guestPass._id,
        status: "RESERVED",
        eventId: event._id,
      },
      {
        $set: {
          status: "USED",
          usedAt: now,
          usedBy: operatorId || null,
          updatedAt: now,
        },
      }
    );

    if (passUpdate.modifiedCount !== 1) {
      await db.collection("event_registrations").updateOne(
        {
          _id: registration._id,
          status: "ATTENDED",
        },
        {
          $set: {
            status: "REGISTERED",
            attendedAt: null,
            "guest.status": "RESERVED",
            updatedAt: new Date(),
          },
        }
      );

      return response(
        "The guest pass is no longer available. Please scan again.",
        409
      );
    }
  }

  const attendance = {
    memberId: hostMemberId,
    eventId: event._id,
    clubId: clubId || event.clubId || null,
    registrationId: registration._id,
    type: "GUEST",
    registrationType: "GUEST",
    status: "PRESENT",
    eventDateKey: dateKey,
    isSunday: isSundayDateKey(dateKey),
    guestPassId: guestPass?._id || null,
    guestPassCode: guestPass?.code || null,
    guest: {
      name: registration.guest?.name || guestPass?.guestName || "",
      mobile:
        registration.guest?.mobile || guestPass?.guestMobile || "",
    },
    checkedInAt: now,
    checkedInBy: operatorId || null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const inserted = await db
      .collection("attendance")
      .insertOne(attendance);

    return NextResponse.json({
      success: true,
      type: "GUEST",
      message: "Check-in through guest invitation recorded successfully.",
      data: {
        attendanceId: inserted.insertedId.toString(),
        registrationId: registration._id.toString(),
        guestPassId: guestPass?._id?.toString() || null,
        member: { id: hostMemberId.toString() },
        event: {
          id: event._id.toString(),
          name: event.name || event.title || "",
          date: dateKey,
          location: event.location || event.venue || "",
        },
        clubId: attendance.clubId
          ? attendance.clubId.toString()
          : null,
        checkedInAt: now,
      },
    });
  } catch (error) {
    // Roll back the registration and pass if attendance insertion fails.
    await db.collection("event_registrations").updateOne(
      {
        _id: registration._id,
        status: "ATTENDED",
      },
      {
        $set: {
          status: "REGISTERED",
          attendedAt: null,
          "guest.status": "RESERVED",
          updatedAt: new Date(),
        },
      }
    );

    if (guestPass) {
      await db.collection("guest_passes").updateOne(
        { _id: guestPass._id, status: "USED" },
        {
          $set: {
            status: "RESERVED",
            usedAt: null,
            usedBy: null,
            updatedAt: new Date(),
          },
        }
      );
    }

    if (error?.code === 11000) {
      return response(
        isSundayDateKey(dateKey)
          ? "This member has already checked in for an event this Sunday."
          : "This registration or member has already been checked in.",
        409,
        {
          code: isSundayDateKey(dateKey)
            ? "SUNDAY_ATTENDANCE_LIMIT"
            : "ALREADY_CHECKED_IN",
        }
      );
    }

    throw error;
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return response("Unauthorized.", 401);
    }

    const body = await request.json();
    const code = String(body?.code || "").trim();
    const eventId = String(body?.eventId || "").trim();

    if (!code) {
      return response("QR code is required.", 400);
    }

    if (!ObjectId.isValid(eventId)) {
      return response(
        "Select a valid event before scanning the QR.",
        400
      );
    }

    const db = await getDB();
    const selectedEventId = new ObjectId(eventId);
    const now = new Date();

    const event = await db.collection("events").findOne({
      _id: selectedEventId,
      status: "PUBLISHED",
    });

    if (!event) {
      return response("Event not found or unavailable.", 404);
    }

    // Check role and club assignment before processing any QR.
    const scanner = await authorizeScanner({
      db,
      session,
      event,
    });

    if (!scanner.allowed) {
      return response(scanner.message, 403);
    }

    // Guest pass QR: GP-...
    if (code.toUpperCase().startsWith("GP-")) {
      const guestPass = await db.collection("guest_passes").findOne({
        code: code.toUpperCase(),
        type: "FREE",
      });

      if (!guestPass) {
        return response("Guest pass not found.", 404);
      }

      if (idString(guestPass.eventId) !== eventId) {
        return response(
          "This guest pass belongs to a different event.",
          400
        );
      }

      if (guestPass.status !== "RESERVED") {
        return response(
          "This guest pass is not reserved or has already been used.",
          409
        );
      }

      const registration = await db
        .collection("event_registrations")
        .findOne({
          eventId: selectedEventId,
          "guest.guestPassId": guestPass._id,
          status: { $in: ACTIVE_REGISTRATION_STATUSES },
        });

      if (!registration) {
        return response(
          "Guest registration for this event was not found.",
          404
        );
      }

      return checkGuestIn({
        db,
        registration,
        event,
        operatorId: scanner.operatorId,
        clubId: scanner.clubId,
        now,
        guestPass,
      });
    }

    // Legacy event registration QR: ER-...
    if (code.toUpperCase().startsWith("ER-")) {
      const registration = await db
        .collection("event_registrations")
        .findOne({
          eventId: selectedEventId,
          qrCode: code.toUpperCase(),
        });

      if (!registration) {
        return response(
          "Registration QR was not found for the selected event.",
          404
        );
      }

      const type =
        registration.registrationType ||
        (registration.passUsage === "GUEST" ? "GUEST" : "MEMBERSHIP");

      if (type === "GUEST" || registration.passUsage === "GUEST") {
        return checkGuestIn({
          db,
          registration,
          event,
          operatorId: scanner.operatorId,
          clubId: scanner.clubId,
          now,
        });
      }

      const legacyMember = await db.collection("members").findOne({
        _id: registration.memberId,
        isActive: true,
      });

      if (!legacyMember) {
        return response("Member not found or inactive.", 404);
      }

      const membership = await findActiveMembership(
        db,
        legacyMember._id,
        now
      );

      return checkMemberIn({
        db,
        member: legacyMember,
        membership,
        event,
        operatorId: scanner.operatorId,
        clubId: scanner.clubId,
        now,
      });
    }

    // Universal member QR.
    const member = await findMemberByUniversalQR(db, code);

    if (!member) {
      return response(
        "QR code not recognized. Scan the permanent Member QR or a valid guest QR.",
        404
      );
    }

    if (!member.isActive) {
      return response("This member account is inactive.", 403);
    }

    const membership = await findActiveMembership(
      db,
      member._id,
      now
    );

    return checkMemberIn({
      db,
      member,
      membership,
      event,
      operatorId: scanner.operatorId,
      clubId: scanner.clubId,
      now,
    });
  } catch (error) {
    console.error("CHECK-IN ERROR:", error);
    return response("Failed to process check-in.", 500);
  }
}