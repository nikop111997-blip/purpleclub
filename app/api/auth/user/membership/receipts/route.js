import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ITEMS = new Set(["tshirt", "shaker", "bodyAssessment"]);

function asObjectId(value) {
  const stringValue = String(value ?? "");
  return ObjectId.isValid(stringValue) ? new ObjectId(stringValue) : null;
}

async function findMember(db, user) {
  const ids = [user?.memberId, user?.id, user?._id].filter(Boolean);

  for (const value of ids) {
    const stringValue = String(value);
    const objectId = asObjectId(stringValue);
    const clauses = [{ _id: stringValue }];
    if (objectId) clauses.push({ _id: objectId });

    const member = await db.collection("members").findOne({ $or: clauses });
    if (member) return member;
  }

  if (user?.email) {
    return db.collection("members").findOne({
      email: { $regex: `^${String(user.email).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
  }

  return null;
}

function memberIdConditions(memberId) {
  const stringId = String(memberId);
  const objectId = asObjectId(stringId);
  const conditions = [{ memberId: stringId }];
  if (objectId) conditions.push({ memberId: objectId });
  return conditions;
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const membershipObjectId = asObjectId(body?.membershipId);
    const items = body?.items;

    if (
      !membershipObjectId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.some((item) => typeof item !== "string" || !ALLOWED_ITEMS.has(item)) ||
      new Set(items).size !== items.length
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid benefit confirmation request." },
        { status: 400 }
      );
    }

    const db = await getDB();
    const member = await findMember(db, session.user);
    if (!member?._id) {
      return NextResponse.json(
        { success: false, message: "Member profile not found." },
        { status: 404 }
      );
    }

    const membership = await db.collection("memberships").findOne({
      _id: membershipObjectId,
      $or: memberIdConditions(member._id),
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, message: "Membership not found for this account." },
        { status: 404 }
      );
    }

    const kit = membership.purpleKit || {};
    const assessment = membership.bodyAssessment || {};
    const eligible = {
      tshirt: kit.included === true && kit.tshirtIncluded !== false,
      shaker: kit.included === true && kit.shakerIncluded !== false,
      bodyAssessment: assessment.included === true,
    };

    const ineligible = items.find((item) => !eligible[item]);
    if (ineligible) {
      return NextResponse.json(
        { success: false, message: `${ineligible} is not included in this membership.` },
        { status: 400 }
      );
    }

    const now = new Date();
    const members = db.collection("members");
    const memberships = db.collection("memberships");
    const saved = [];

    // Member-level flags make the confirmation permanent across renewals and later memberships.
    for (const item of items) {
      const memberResult = await members.updateOne(
        {
          _id: member._id,
          [`benefitReceipts.${item}.received`]: { $ne: true },
        },
        {
          $set: {
            [`benefitReceipts.${item}`]: {
              received: true,
              confirmedAt: now,
              confirmedMembershipId: membership._id,
            },
            updatedAt: now,
          },
        }
      );

      if (memberResult.modifiedCount !== 1) {
        return NextResponse.json(
          {
            success: false,
            message: `${item} has already been confirmed and cannot be changed. Refresh your membership to see the saved status.`,
          },
          { status: 409 }
        );
      }

      await memberships.updateOne(
        { _id: membership._id, $or: memberIdConditions(member._id) },
        {
          $set: {
            [`receiptConfirmations.${item}`]: {
              received: true,
              confirmedAt: now,
              confirmedBy: member._id,
            },
            updatedAt: now,
          },
        }
      );
      saved.push(item);
    }

    const updatedMember = await members.findOne({ _id: member._id });
    const updatedMembership = await memberships.findOne({ _id: membership._id });

    return NextResponse.json({
      success: true,
      message: "Benefit receipt confirmations saved permanently.",
      benefitReceipts: updatedMember?.benefitReceipts || {},
      receiptConfirmations: updatedMembership?.receiptConfirmations || {},
      saved,
    });
  } catch (error) {
    console.error("MEMBERSHIP RECEIPT CONFIRMATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to save benefit confirmations." },
      { status: 500 }
    );
  }
}
