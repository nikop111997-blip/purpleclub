import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

/* =========================================================
   GET PROFILE
========================================================= */

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
          message: "Invalid user session",
        },
        { status: 400 }
      );
    }

    const db = await getDB();

    const user = await db.collection("members").findOne({
      _id: new ObjectId(memberId),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // FIND INSPIRER AUTOMATICALLY
    // =====================================================

    let inspirerName = "";

    /*
     * Priority:
     * 1. guest_invites
     * 2. referral
     * 3. existing invitedBy fields
     */

    const invite = await db
      .collection("guest_invites")
      .findOne(
        {
          guestUserId: user._id,
        },
        {
          sort: {
            registeredAt: 1,
            createdAt: 1,
          },
        }
      );

    if (invite?.inviterMemberId) {
      const inviter = await db
        .collection("members")
        .findOne(
          {
            _id: invite.inviterMemberId,
          },
          {
            projection: {
              name: 1,
            },
          }
        );

      if (inviter?.name) {
        inspirerName = inviter.name;
      }
    }

    /*
     * Fallback to existing database value
     */

    if (!inspirerName) {
      inspirerName =
        user.invitedBy ||
        user.inspirer ||
        user.referrerName ||
        "";
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      profile: {
        id: user._id.toString(),

        name: user.name || "",

        age: user.age ?? "",

        gender: user.gender || "",

        city: user.city || "",

        mobile:
          user.mobile ||
          user.phone ||
          "",

        email: user.email || "",

        instagram:
          user.instagram ||
          user.instagramHandle ||
          user.socialHandle ||
          "",

        occupation:
          user.occupation ||
          "",

        healthGoal:
          user.healthGoal ||
          user.healthFitnessGoal ||
          "",

        // Automatically determined
        invitedBy: inspirerName,

        coachName:
          user.coachName ||
          "",

        consent:
          Boolean(user.consent),
      },
    });
  } catch (error) {
    console.error(
      "GET USER PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH PROFILE
========================================================= */

export async function PATCH(request) {
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
          message: "Invalid user session",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const db = await getDB();

    const users = db.collection("members");

    const userObjectId = new ObjectId(memberId);

    // =====================================================
    // GET EXISTING USER
    // =====================================================

    const existingUser = await users.findOne({
      _id: userObjectId,
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const updateData = {};

    // =====================================================
    // NAME
    // =====================================================

    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (name.length < 2) {
        return NextResponse.json(
          {
            success: false,
            message: "Name must be at least 2 characters",
          },
          { status: 400 }
        );
      }

      updateData.name = name;
    }

    // =====================================================
    // AGE
    // =====================================================

    if (
      body.age === null ||
      body.age === "" ||
      typeof body.age === "number"
    ) {
      if (
        body.age !== null &&
        body.age !== "" &&
        (
          body.age < 1 ||
          body.age > 120
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Enter a valid age",
          },
          { status: 400 }
        );
      }

      updateData.age =
        body.age === ""
          ? null
          : body.age;
    }

    // =====================================================
    // GENDER
    // =====================================================

    if (typeof body.gender === "string") {
      updateData.gender =
        body.gender.trim();
    }

    // =====================================================
    // CITY
    // =====================================================

    if (typeof body.city === "string") {
      const city = body.city.trim();

      if (city) {
        /*
         * IMPORTANT:
         * Validate city against our cities collection.
         */

        const cityRecord =
          await db.collection("cities").findOne({
            city: {
              $regex: `^${escapeRegex(city)}$`,
              $options: "i",
            },
          });

        if (!cityRecord) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Please select a city from the list",
            },
            { status: 400 }
          );
        }

        // Save the canonical city name
        updateData.city =
          cityRecord.city;
      } else {
        updateData.city = "";
      }
    }

    // =====================================================
    // EMAIL
    // =====================================================

    if (typeof body.email === "string") {
      updateData.email =
        body.email
          .trim()
          .toLowerCase();
    }

    // =====================================================
    // INSTAGRAM
    // =====================================================

    if (
      typeof body.instagram === "string"
    ) {
      updateData.instagram =
        body.instagram.trim();
    }

    // =====================================================
    // OCCUPATION
    // =====================================================

    if (
      typeof body.occupation === "string"
    ) {
      updateData.occupation =
        body.occupation.trim();
    }

    // =====================================================
    // HEALTH GOAL
    // =====================================================

    if (
      typeof body.healthGoal === "string"
    ) {
      updateData.healthGoal =
        body.healthGoal.trim();
    }

    // =====================================================
    // DO NOT ACCEPT invitedBy FROM CLIENT
    // =====================================================
    //
    // invitedBy is controlled by the invitation/referral
    // system.
    //
    // Do NOT do:
    //
    // updateData.invitedBy = body.invitedBy
    //
    // =====================================================

    // =====================================================
    // COACH NAME
    // =====================================================

    if (
      typeof body.coachName === "string"
    ) {
      updateData.coachName =
        body.coachName.trim();
    }

    // =====================================================
    // CONSENT
    // =====================================================

    if (
      typeof body.consent === "boolean"
    ) {
      updateData.consent =
        body.consent;
    }

    // =====================================================
    // UPDATED AT
    // =====================================================

    updateData.updatedAt = new Date();

    // =====================================================
    // UPDATE
    // =====================================================

    await users.updateOne(
      {
        _id: userObjectId,
      },
      {
        $set: updateData,
      }
    );

    // =====================================================
    // GET UPDATED USER
    // =====================================================

    const updatedUser =
      await users.findOne({
        _id: userObjectId,
      });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // GET AUTOMATIC INSPIRER
    // =====================================================

    let inspirerName = "";

    const invite = await db
      .collection("guest_invites")
      .findOne(
        {
          guestUserId: updatedUser._id,
        },
        {
          sort: {
            registeredAt: 1,
            createdAt: 1,
          },
        }
      );

    if (invite?.inviterMemberId) {
      const inviter = await db
        .collection("members")
        .findOne(
          {
            _id: invite.inviterMemberId,
          },
          {
            projection: {
              name: 1,
            },
          }
        );

      if (inviter?.name) {
        inspirerName = inviter.name;
      }
    }

    if (!inspirerName) {
      inspirerName =
        updatedUser.invitedBy ||
        updatedUser.inspirer ||
        updatedUser.referrerName ||
        "";
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      message:
        "Profile updated successfully",

      profile: {
        id:
          updatedUser._id.toString(),

        name:
          updatedUser.name || "",

        age:
          updatedUser.age ?? "",

        gender:
          updatedUser.gender || "",

        city:
          updatedUser.city || "",

        mobile:
          updatedUser.mobile ||
          updatedUser.phone ||
          "",

        email:
          updatedUser.email || "",

        instagram:
          updatedUser.instagram ||
          updatedUser.instagramHandle ||
          updatedUser.socialHandle ||
          "",

        occupation:
          updatedUser.occupation ||
          "",

        healthGoal:
          updatedUser.healthGoal ||
          updatedUser.healthFitnessGoal ||
          "",

        invitedBy:
          inspirerName,

        coachName:
          updatedUser.coachName ||
          "",

        consent:
          Boolean(updatedUser.consent),
      },
    });
  } catch (error) {
    console.error(
      "UPDATE USER PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update profile",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   ESCAPE REGEX
========================================================= */

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}