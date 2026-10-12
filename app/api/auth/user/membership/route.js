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
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const memberId = session.user.memberId;

    if (!ObjectId.isValid(memberId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid member ID",
        },
        { status: 400 }
      );
    }

    const db = await getDB();

    const memberObjectId = new ObjectId(memberId);

    /*
     * Find latest membership.
     */
    const membership = await db
      .collection("memberships")
      .findOne(
        {
          memberId: memberObjectId,
        },
        {
          sort: {
            createdAt: -1,
          },
        }
      );

    /*
     * No membership.
     */
    if (!membership) {
      return NextResponse.json({
        success: true,
        hasMembership: false,
        membership: null,
      });
    }

    /*
     * Sunday experiences
     */
    const experiences =
      membership.sundayExperiences || {};

    const total = Number(
      experiences.total || 0
    );

    const used = Number(
      experiences.used || 0
    );

    const reserved = Number(
      experiences.reserved || 0
    );

    const remaining = Math.max(
      total - used - reserved,
      0
    );

    /*
     * Body assessment
     */
    const bodyAssessment =
      membership.bodyAssessment || {};

    /*
     * Purple kit
     */
    const purpleKit =
      membership.purpleKit || {};

    return NextResponse.json({
      success: true,

      hasMembership: true,

      membership: {
        id: membership._id.toString(),

        memberId:
          membership.memberId?.toString(),

        plan:
          membership.plan ||
          "PURPLE_MEMBERSHIP",

        amount:
          membership.amount ?? 1499,

        status:
          membership.status || "ACTIVE",

        startDate:
          membership.startDate || null,

        endDate:
          membership.endDate || null,

        sundayExperiences: {
          total,
          used,
          reserved,
          remaining,
        },

        bodyAssessment: {
          included:
            Boolean(bodyAssessment.included),

          completed:
            Boolean(bodyAssessment.completed),

          completedAt:
            bodyAssessment.completedAt ||
            null,
        },

        purpleKit: {
          included:
            Boolean(purpleKit.included),

          tshirt:
            Boolean(purpleKit.tshirt),

          shaker:
            Boolean(purpleKit.shaker),
        },
      },
    });
  } catch (error) {
    console.error(
      "MEMBERSHIP GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load membership",
      },
      { status: 500 }
    );
  }
}