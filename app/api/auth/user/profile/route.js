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

    // User must be logged in
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user session",
        },
        {
          status: 400,
        }
      );
    }

    const db = await getDB();

    const user = await db
      .collection("members")
      .findOne({
        _id: new ObjectId(userId),
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      profile: {
        id: user._id.toString(),

        name: user.name || "",

        age:
          user.age ??
          "",

        gender:
          user.gender ||
          "",

        city:
          user.city ||
          "",

        mobile:
          user.mobile ||
          user.phone ||
          "",

        email:
          user.email ||
          "",

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

        invitedBy:
          user.invitedBy ||
          user.inspirer ||
          user.referrerName ||
          "",

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
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH PROFILE
========================================================= */

export async function PATCH(request) {
  try {
    const session = await auth();

    // User must be logged in
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user session",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const db = await getDB();

    const users = db.collection("members");

    /*
      IMPORTANT:
      Mobile is intentionally NOT accepted
      from the request.

      The frontend cannot change mobile.
    */

    const updateData = {};

    /* =========================
       NAME
    ========================== */

    if (typeof body.name === "string") {
      updateData.name =
        body.name.trim();
    }

    /* =========================
       AGE
    ========================== */

    if (
      body.age === null ||
      body.age === "" ||
      typeof body.age === "number"
    ) {
      updateData.age =
        body.age === ""
          ? null
          : body.age;
    }

    /* =========================
       GENDER
    ========================== */

    if (
      typeof body.gender === "string"
    ) {
      updateData.gender =
        body.gender.trim();
    }

    /* =========================
       CITY
    ========================== */

    if (
      typeof body.city === "string"
    ) {
      updateData.city =
        body.city.trim();
    }

    /* =========================
       EMAIL
    ========================== */

    if (
      typeof body.email === "string"
    ) {
      updateData.email =
        body.email
          .trim()
          .toLowerCase();
    }

    /* =========================
       INSTAGRAM
    ========================== */

    if (
      typeof body.instagram === "string"
    ) {
      updateData.instagram =
        body.instagram.trim();
    }

    /* =========================
       OCCUPATION
    ========================== */

    if (
      typeof body.occupation === "string"
    ) {
      updateData.occupation =
        body.occupation.trim();
    }

    /* =========================
       HEALTH GOAL
    ========================== */

    if (
      typeof body.healthGoal === "string"
    ) {
      updateData.healthGoal =
        body.healthGoal.trim();
    }

    /* =========================
       INVITED BY
    ========================== */

    if (
      typeof body.invitedBy === "string"
    ) {
      updateData.invitedBy =
        body.invitedBy.trim();
    }

    /* =========================
       COACH NAME
    ========================== */

    if (
      typeof body.coachName === "string"
    ) {
      updateData.coachName =
        body.coachName.trim();
    }

    /* =========================
       CONSENT
    ========================= */

    if (
      typeof body.consent === "boolean"
    ) {
      updateData.consent =
        body.consent;
    }

    /* =========================
       UPDATED AT
    ========================== */

    updateData.updatedAt =
      new Date();

    /* =========================
       UPDATE USER
    ========================== */

    await users.updateOne(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: updateData,
      }
    );

    /* =========================
       GET UPDATED USER
    ========================== */

    const updatedUser =
      await users.findOne({
        _id: new ObjectId(userId),
      });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    /* =========================
       RESPONSE
    ========================== */

    return NextResponse.json({
      success: true,

      message:
        "Profile updated successfully",

      profile: {
        id: updatedUser._id.toString(),

        name:
          updatedUser.name || "",

        age:
          updatedUser.age ??
          "",

        gender:
          updatedUser.gender ||
          "",

        city:
          updatedUser.city ||
          "",

        /*
          Mobile comes directly
          from database.
        */
        mobile:
          updatedUser.mobile ||
          updatedUser.phone ||
          "",

        email:
          updatedUser.email ||
          "",

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
          updatedUser.invitedBy ||
          updatedUser.inspirer ||
          updatedUser.referrerName ||
          "",

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
        message: "Failed to update profile",
      },
      {
        status: 500,
      }
    );
  }
}