import { NextResponse } from "next/server";

import { getDB } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const query =
      searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        cities: [],
      });
    }

    const db = await getDB();

    const cities = await db
      .collection("cities")
      .find(
        {
          city: {
            $regex: escapeRegex(query),
            $options: "i",
          },
        },
        {
          projection: {
            city: 1,
            state: 1,
          },
        }
      )
      .limit(10)
      .toArray();

    return NextResponse.json({
      success: true,

      cities: cities.map((item) => ({
        id: item._id.toString(),
        city: item.city,
        state: item.state || "",
      })),
    });
  } catch (error) {
    console.error(
      "CITY SEARCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search cities",
      },
      { status: 500 }
    );
  }
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}