import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REVIEW_COLLECTION = "attendance_reviews";

const ALLOWED_HIGHLIGHTS = [
  "Great experience",
  "Amazing trainer",
  "Welcoming community",
  "Well organised",
  "Fun and engaging",
  "Great venue",
];

function respond(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function parseObjectId(value) {
  if (!ObjectId.isValid(String(value ?? ""))) return null;

  const id = new ObjectId(String(value));

  // Reject malformed 24-character hexadecimal strings.
  if (id.toHexString() !== String(value).toLowerCase()) return null;

  return id;
}

function getSessionIdentifiers(session) {
  return [
    session?.user?.memberId,
    session?.user?.id,
    session?.user?._id,
  ].filter((value) => value != null && String(value).trim());
}

async function resolveMember(db, session) {
  const identifiers = getSessionIdentifiers(session);

  if (!identifiers.length) return null;

  const members = db.collection("members");

  for (const identifier of identifiers) {
    const rawId = String(identifier);
    const objectId = parseObjectId(rawId);

    const conditions = [];

    if (objectId) {
      conditions.push({ _id: objectId });
    }

    conditions.push({ _id: rawId });

    const member = await members.findOne(
      { $or: conditions },
      { projection: { _id: 1 } }
    );

    if (member) return member;
  }

  return null;
}

async function findOwnedAttendance(db, attendanceId, memberId) {
  const objectId = parseObjectId(attendanceId);

  if (!objectId) return null;

  const memberObjectId = parseObjectId(String(memberId));

  const ownerConditions = [
    { memberId: String(memberId) },
  ];

  if (memberObjectId) {
    ownerConditions.push({ memberId: memberObjectId });
  }

  const record = await db.collection("attendance").findOne({
    _id: objectId,
    $or: ownerConditions,
  });

  if (!record) return null;

  const status = String(record.status ?? "").toUpperCase();

  // Match the actual attendance schema.
  const isCheckedIn =
    Boolean(record.checkedInAt) ||
    Boolean(record.attendedAt) ||
    record.checkedIn === true ||
    record.isCheckedIn === true ||
    ["PRESENT", "ATTENDED", "CHECKED_IN"].includes(status);

  if (!isCheckedIn) return null;

  return record;
}

function serializeReview(review) {
  if (!review) return null;

  return {
    rating: review.rating,
    highlights: review.highlights || [],
    review: review.review || "",
    createdAt: review.createdAt || null,
    updatedAt: review.updatedAt || null,
  };
}

export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return respond(
        { success: false, message: "Please log in to view reviews." },
        401
      );
    }

    const db = await getDB();
    const member = await resolveMember(db, session);

    if (!member) {
      return respond(
        { success: false, message: "Member account not found." },
        404
      );
    }

    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get("attendanceId");

    if (!parseObjectId(attendanceId)) {
      return respond(
        { success: false, message: "A valid attendance ID is required." },
        400
      );
    }

    const attendanceRecord = await findOwnedAttendance(
      db,
      attendanceId,
      member._id
    );

    if (!attendanceRecord) {
      return respond(
        {
          success: false,
          message:
            "This attended experience could not be verified for your account.",
        },
        403
      );
    }

    const review = await db.collection(REVIEW_COLLECTION).findOne({
      attendanceId: String(attendanceRecord._id),
      memberId: String(member._id),
    });

    return respond({
      success: true,
      review: serializeReview(review),
    });
  } catch (error) {
    console.error("GET ATTENDANCE REVIEW ERROR:", error);

    return respond(
      { success: false, message: "Unable to load your review." },
      500
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return respond(
        { success: false, message: "Please log in to submit a review." },
        401
      );
    }

    const db = await getDB();
    const member = await resolveMember(db, session);

    if (!member) {
      return respond(
        { success: false, message: "Member account not found." },
        404
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return respond(
        { success: false, message: "Invalid request body." },
        400
      );
    }

    const attendanceId = String(body.attendanceId ?? "").trim();
    const rating = Number(body.rating);
    const reviewText = String(body.review ?? "").trim();

    const highlights = Array.isArray(body.highlights)
      ? [...new Set(body.highlights.map((item) => String(item).trim()))]
          .filter(Boolean)
      : [];

    if (!parseObjectId(attendanceId)) {
      return respond(
        { success: false, message: "A valid attendance ID is required." },
        400
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return respond(
        { success: false, message: "Select a rating from 1 to 5 stars." },
        400
      );
    }

    if (reviewText.length > 1000) {
      return respond(
        {
          success: false,
          message: "Your review must be 1000 characters or fewer.",
        },
        400
      );
    }

    if (highlights.length > 6) {
      return respond(
        { success: false, message: "Select up to 6 review options." },
        400
      );
    }

    if (highlights.some((item) => !ALLOWED_HIGHLIGHTS.includes(item))) {
      return respond(
        { success: false, message: "Invalid review option selected." },
        400
      );
    }

    if (!reviewText && highlights.length === 0) {
      return respond(
        {
          success: false,
          message: "Select a review option or write a short review.",
        },
        400
      );
    }

    const attendanceRecord = await findOwnedAttendance(
      db,
      attendanceId,
      member._id
    );

    if (!attendanceRecord) {
      return respond(
        {
          success: false,
          message:
            "You can review only experiences with a confirmed check-in.",
        },
        403
      );
    }

    const now = new Date();
    const canonicalAttendanceId = String(attendanceRecord._id);
    const canonicalMemberId = String(member._id);

    const filter = {
      attendanceId: canonicalAttendanceId,
      memberId: canonicalMemberId,
    };

    await db.collection(REVIEW_COLLECTION).updateOne(
      filter,
      {
        $set: {
          attendanceId: canonicalAttendanceId,
          memberId: canonicalMemberId,
          eventName: attendanceRecord.eventName || "",
          rating,
          highlights,
          review: reviewText,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const savedReview = await db.collection(REVIEW_COLLECTION).findOne(filter);

    return respond({
      success: true,
      message: "Your review has been saved.",
      review: serializeReview(savedReview),
    });
  } catch (error) {
    console.error("POST ATTENDANCE REVIEW ERROR:", error);

    return respond(
      { success: false, message: "Unable to save your review." },
      500
    );
  }
}