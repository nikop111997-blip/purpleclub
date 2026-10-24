
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/db";

export const runtime = "nodejs";

const COLLECTION_NAME = "city_launch_notifications";

function normalizeEmail(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function normalizeMobile(value) {
  if (typeof value !== "string") return "";

  // Compare digits only, so spaces and hyphens don't bypass validation.
  return value.replace(/\D/g, "");
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email = normalizeEmail(body.email);

    const mobile =
      typeof body.mobile === "string" ? body.mobile.trim() : "";

    const mobileDigits = normalizeMobile(mobile);

    const cityId =
      typeof body.cityId === "string" ? body.cityId.trim() : "";

    // 1. Validate required fields.
    if (!name || !email || !mobile || !cityId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    // 2. Validate name.
    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must not exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    // 3. Validate email.
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // 4. Validate mobile number.
    if (mobileDigits.length < 10 || mobileDigits.length > 15) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid mobile number.",
        },
        { status: 400 }
      );
    }

    // 5. Validate city ObjectId.
    if (!ObjectId.isValid(cityId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid city.",
        },
        { status: 400 }
      );
    }

    const db = await getDB();

    const notifications = db.collection(COLLECTION_NAME);

    // 6. Verify the city exists in the database.
    const cityObjectId = new ObjectId(cityId);

    const city = await db.collection("cities").findOne(
      { _id: cityObjectId },
      {
        projection: {
          city: 1,
          state: 1,
        },
      }
    );

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected city could not be found.",
        },
        { status: 400 }
      );
    }

    // 7. Find existing records by email OR normalized mobile.
    // This applies across all cities.
    const existing = await notifications.findOne({
      $or: [
        { email },
        { mobileDigits },
        // Supports older records created before mobileDigits was added.
        {
          mobileDigits: { $exists: false },
          mobile: { $exists: true },
          $expr: {
            $eq: [
              {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: "$mobile",
                          find: " ",
                          replacement: "",
                        },
                      },
                      find: "-",
                      replacement: "",
                    },
                  },
                  find: "+",
                  replacement: "",
                },
              },
              mobileDigits,
            ],
          },
        },
      ],
    });

    if (existing) {
      const sameEmail = existing.email === email;

      // Legacy comparison is handled separately below in the index
      // migration notes. New records use mobileDigits.
      const sameMobile =
        existing.mobileDigits === mobileDigits;

      let message;

      if (sameEmail && sameMobile) {
        message =
          "This email address and mobile number are already registered.";
      } else if (sameEmail) {
        message = "This email address is already registered.";
      } else {
        message = "This mobile number is already registered.";
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 409 }
      );
    }

    // 8. Insert the notification request.
    const now = new Date();

    const result = await notifications.insertOne({
      name,
      email,
      mobile,
      mobileDigits,
      cityId: cityObjectId,
      city: city.city,
      state: city.state || "",
      status: "pending",
      source: "purple-club-city-launch",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        message: "You've joined the city launch notification list!",
        id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    // 9. Handle duplicate-key errors from unique indexes.
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This email address or mobile number is already registered.",
        },
        { status: 409 }
      );
    }

    console.error("CITY NOTIFICATION SUBMISSION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save your details. Please try again.",
      },
      { status: 500 }
    );
  }
}
