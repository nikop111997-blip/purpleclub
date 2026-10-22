import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getMembershipStatus(membership, now = new Date()) {
  const status = String(membership.status || "ACTIVE").toUpperCase();

  if (status !== "ACTIVE") return status;

  if (membership.endDate) {
    const endDate = new Date(membership.endDate);

    if (!Number.isNaN(endDate.getTime()) && endDate <= now) {
      return "EXPIRED";
    }
  }

  return "ACTIVE";
}

function serializeMembership(membership, now) {
  return {
    _id: membership._id.toString(),
    id: membership._id.toString(),
    memberId: membership.memberId?.toString(),
    plan: membership.plan || "PURPLE_MEMBERSHIP",
    amount: membership.amount ?? 1499,
    status: getMembershipStatus(membership, now),
    startDate: membership.startDate || null,
    endDate: membership.endDate || null,
    createdAt: membership.createdAt || null,
    isFirstMembership: membership.isFirstMembership === true,

    firstMembershipBenefits: {
      tshirt: membership.firstMembershipBenefits?.tshirt === true,
      bodyAssessment:
        membership.firstMembershipBenefits?.bodyAssessment === true,
    },

    purpleKit: {
      included: membership.purpleKit?.included === true,
      tshirt: membership.purpleKit?.tshirt === true,
      shaker: membership.purpleKit?.shaker === true,
    },

    bodyAssessment: {
      included: membership.bodyAssessment?.included === true,
      completed: membership.bodyAssessment?.completed === true,
      completedAt: membership.bodyAssessment?.completedAt || null,
    },

    receiptConfirmations: membership.receiptConfirmations || {},
  };
}

function getPendingBenefits(membership, member) {
  const plan = String(membership.plan || "").toUpperCase();

  const isFirstMembership = membership.isFirstMembership === true;
  const kit = membership.purpleKit || {};
  const assessment = membership.bodyAssessment || {};
  const firstBenefits = membership.firstMembershipBenefits || {};
  const receipts = membership.receiptConfirmations || {};

  // Prefer permanent member-level receipt records when present.
  const permanentReceipts = member?.benefitReceipts || {};

  const tshirtReceived =
    permanentReceipts.tshirt?.received === true ||
    receipts.tshirt?.received === true ||
    kit.tshirt === true;

  const shakerReceived =
    permanentReceipts.shaker?.received === true ||
    receipts.shaker?.received === true ||
    kit.shaker === true;

  const assessmentReceived =
    permanentReceipts.bodyAssessment?.received === true ||
    receipts.bodyAssessment?.received === true ||
    assessment.completed === true;

  // First-membership benefits are only eligible once across plans.
  const firstBenefitsAlreadyGranted = Boolean(
    member?.firstMembershipBenefitsGrantedAt
  );

  const firstBenefitsEligible =
    isFirstMembership && !firstBenefitsAlreadyGranted;

  const tshirtIncluded =
    firstBenefitsEligible &&
    firstBenefits.tshirt === true &&
    kit.included === true;

  const assessmentIncluded =
    assessment.included === true ||
    (firstBenefitsEligible && firstBenefits.bodyAssessment === true);

  const shakerIncluded = kit.included === true;

  return {
    purpleKit: {
      included: kit.included === true,
      received: tshirtReceived && shakerReceived,
      pending:
        kit.included === true && (!tshirtReceived || !shakerReceived),
    },

    tshirt: {
      included: tshirtIncluded,
      received: tshirtReceived,
      pending: tshirtIncluded && !tshirtReceived,
    },

    shaker: {
      included: shakerIncluded,
      received: shakerReceived,
      pending: shakerIncluded && !shakerReceived,
    },

    bodyAssessment: {
      included: assessmentIncluded,
      received: assessmentReceived,
      completed: assessment.completed === true,
      completedAt: assessment.completedAt || null,
      pending: assessmentIncluded && !assessmentReceived,
    },

    firstMembershipBenefits: {
      eligible: firstBenefitsEligible,
      alreadyGranted: firstBenefitsAlreadyGranted,
      tshirt: {
        included: tshirtIncluded,
        received: tshirtReceived,
        pending: tshirtIncluded && !tshirtReceived,
      },
      bodyAssessment: {
        included: firstBenefitsEligible && firstBenefits.bodyAssessment === true,
        received: assessmentReceived,
        pending:
          firstBenefitsEligible &&
          firstBenefits.bodyAssessment === true &&
          !assessmentReceived,
      },
    },

    plan,
  };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.memberId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const memberId = String(session.user.memberId);

    if (!ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, message: "Invalid member ID" },
        { status: 400 }
      );
    }

    const db = await getDB();
    const memberObjectId = new ObjectId(memberId);
    const now = new Date();

    const member = await db.collection("members").findOne({
      _id: memberObjectId,
    });

    const memberships = await db
      .collection("memberships")
      .find({ memberId: memberObjectId })
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    if (!memberships.length) {
      return NextResponse.json(
        {
          success: true,
          hasMembership: false,
          membership: null,
          membershipHistory: [],
          pendingBenefits: null,
          firstMembershipBenefitsGranted: Boolean(
            member?.firstMembershipBenefitsGrantedAt
          ),
        },
        {
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    // Persist expired memberships.
    for (const item of memberships) {
      if (
        String(item.status || "").toUpperCase() === "ACTIVE" &&
        getMembershipStatus(item, now) === "EXPIRED" &&
        item.endDate
      ) {
        await db.collection("memberships").updateOne(
          {
            _id: item._id,
            memberId: memberObjectId,
            status: "ACTIVE",
            endDate: { $lte: now },
          },
          {
            $set: {
              status: "EXPIRED",
              updatedAt: now,
            },
          }
        );

        item.status = "EXPIRED";
      }
    }

    const membershipHistory = memberships.map((item) =>
      serializeMembership(item, now)
    );

    const membership = membershipHistory[0];

    // Benefits that are still outstanding for the latest membership.
    const pendingBenefits = getPendingBenefits(
      memberships[0],
      member
    );

    return NextResponse.json(
      {
        success: true,
        hasMembership: true,
        membership,
        membershipHistory,
        pendingBenefits,

        firstMembershipBenefitsGranted: Boolean(
          member?.firstMembershipBenefitsGrantedAt
        ),

        firstMembershipBenefitsGrantedAt:
          member?.firstMembershipBenefitsGrantedAt || null,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("MEMBERSHIP GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load membership",
      },
      { status: 500 }
    );
  }
}