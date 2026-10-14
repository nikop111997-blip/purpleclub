import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CHARTER_CAPACITY = 25;

const normalizePlan = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const normalizeId = (value) =>
  value == null ? "" : String(value);

export async function GET() {
  try {
    // Require an authenticated user.
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const db = await getDB();

    // Load only clubs where Charter Membership is enabled.
    const clubs = await db
      .collection("clubs")
      .find(
        {
          isCharterMembershipAvailable: true,
        },
        {
          projection: {
            name: 1,
            city: 1,
            area: 1,
            state: 1,
            location: 1,
            isCharterMembershipAvailable: 1,
          },
        }
      )
      .sort({ name: 1 })
      .toArray();

    if (clubs.length === 0) {
      return NextResponse.json({
        success: true,
        clubs: [],
        totalClubs: 0,
      });
    }

    // Count active Charter memberships per club.
    // $toString allows ObjectId and string club IDs to be compared
    // consistently.
    const membershipCounts = await db
      .collection("memberships")
      .aggregate([
        {
          $match: {
            status: "ACTIVE",
            $or: [
              { plan: "CHARTER_MEMBERSHIP" },
              { membershipPlan: "CHARTER_MEMBERSHIP" },
            ],
            clubId: { $exists: true, $ne: null },
          },
        },
        {
          $project: {
            clubKey: {
              $toString: "$clubId",
            },
          },
        },
        {
          $group: {
            _id: "$clubKey",
            activeCharterMembers: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const countByClub = new Map(
      membershipCounts.map((item) => [
        normalizeId(item._id),
        Number(item.activeCharterMembers || 0),
      ])
    );

    const availableClubs = clubs
      .map((club) => {
        const id = normalizeId(club._id);
        const activeCharterMembers = countByClub.get(id) || 0;

        const availablePlaces = Math.max(
          0,
          CHARTER_CAPACITY - activeCharterMembers
        );

        return {
          _id: id,
          name: club.name || "Unnamed Club",
          city: club.city || "",
          area: club.area || "",
          state: club.state || "",
          location: club.location || "",
          isCharterMembershipAvailable:
            club.isCharterMembershipAvailable === true,
          capacity: CHARTER_CAPACITY,
          activeCharterMembers,
          availablePlaces,
        };
      })
      // Do not display clubs that have reached capacity.
      .filter(
        (club) =>
          club.isCharterMembershipAvailable &&
          club.availablePlaces > 0
      );

    return NextResponse.json(
      {
        success: true,
        clubs: availableClubs,
        totalClubs: availableClubs.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("CHARTER AVAILABILITY API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load Charter club availability.",
      },
      { status: 500 }
    );
  }
}