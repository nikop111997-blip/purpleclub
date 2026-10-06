import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import crypto from "crypto";

import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";

// =====================================================
// QR CODE
// =====================================================

function generateQRCode() {
  return `ER-${crypto
    .randomBytes(8)
    .toString("hex")
    .toUpperCase()}`;
}

// =====================================================
// POST
// =====================================================

export async function POST(request, { params }) {
  try {
    // =====================================================
    // AUTH
    // =====================================================

    const session = await auth();

    if (!session?.user?.memberId) {
      return NextResponse.json(
        {
          error: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // EVENT ID
    // =====================================================

    const { id: eventId } = await params;

    if (!eventId || !ObjectId.isValid(eventId)) {
      return NextResponse.json(
        {
          error: "Invalid event.",
        },
        {
          status: 400,
        }
      );
    }

    const memberId = new ObjectId(
      session.user.memberId
    );

    const eventObjectId = new ObjectId(eventId);

    // =====================================================
    // REQUEST BODY
    // =====================================================

    const body = await request.json();

    const useGuestPass = Boolean(
      body?.useGuestPass
    );

    /*
      passFor:

      GUEST
      -> Member is registering another person
         using the free pass.

      SELF
      -> Member is using the free pass
         for themselves.

      null
      -> Normal membership registration.
    */

    const passFor =
      body?.passFor === "GUEST"
        ? "GUEST"
        : body?.passFor === "SELF"
          ? "SELF"
          : null;

    const guest =
      body?.guest || null;

    // =====================================================
    // DATABASE
    // =====================================================

    const db = await getDB();

    const eventsCollection =
      db.collection("events");

    const registrationsCollection =
      db.collection("event_registrations");

    const guestPassesCollection =
      db.collection("guest_passes");

    const membershipsCollection =
      db.collection("memberships");

    // =====================================================
    // GET EVENT
    // =====================================================

    const event =
      await eventsCollection.findOne({
        _id: eventObjectId,
        status: "PUBLISHED",
      });

    if (!event) {
      return NextResponse.json(
        {
          error:
            "Event not found or is no longer available.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // CHECK MEMBERSHIP
    // =====================================================

    const activeMembership =
      await membershipsCollection.findOne({
        memberId,
        plan: "PURPLE_MEMBERSHIP",
        status: "ACTIVE",
      });

    const hasMembership =
      Boolean(activeMembership);

    // =====================================================
    // DETERMINE REGISTRATION TYPE
    // =====================================================

    /*
      There are only 3 registration types:

      MEMBERSHIP
      -> Normal membership registration

      SELF_PASS
      -> Free pass used by member

      GUEST
      -> Free pass used for another person
    */

    let registrationType;

    if (!useGuestPass) {
      registrationType = "MEMBERSHIP";
    } else if (passFor === "SELF") {
      registrationType = "SELF_PASS";
    } else if (passFor === "GUEST") {
      registrationType = "GUEST";
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid guest pass usage.",
          code: "INVALID_PASS_USAGE",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // MEMBERSHIP REQUIRED
    // =====================================================

    if (
      registrationType === "MEMBERSHIP" &&
      !hasMembership
    ) {
      return NextResponse.json(
        {
          error:
            "An active Purple Membership is required to register for this event. You can use your free pass instead.",
          code: "MEMBERSHIP_REQUIRED",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // GET EXISTING REGISTRATIONS
    // =====================================================

    const existingRegistrations =
      await registrationsCollection
        .find({
          eventId: eventObjectId,
          memberId,
          status: {
            $in: [
              "REGISTERED",
              "ATTENDED",
            ],
          },
        })
        .toArray();

    // =====================================================
    // CHECK DUPLICATE REGISTRATION TYPE
    // =====================================================

    const existingSameType =
      existingRegistrations.some(
        (registration) => {
          /*
            New records use registrationType.

            Old records may not have it, so we
            fall back to passUsage for compatibility.
          */

          if (
            registration.registrationType
          ) {
            return (
              registration.registrationType ===
              registrationType
            );
          }

          if (
            registrationType ===
            "GUEST"
          ) {
            return (
              registration.passUsage ===
              "GUEST"
            );
          }

          if (
            registrationType ===
            "SELF_PASS"
          ) {
            return (
              registration.passUsage ===
              "SELF"
            );
          }

          return (
            !registration.passUsage
          );
        }
      );

    if (existingSameType) {
      if (
        registrationType ===
        "GUEST"
      ) {
        return NextResponse.json(
          {
            error:
              "You have already registered a guest for this event.",
            code:
              "GUEST_ALREADY_REGISTERED",
          },
          {
            status: 409,
          }
        );
      }

      if (
        registrationType ===
        "SELF_PASS"
      ) {
        return NextResponse.json(
          {
            error:
              "You have already registered yourself using the free pass for this event.",
            code:
              "SELF_PASS_ALREADY_REGISTERED",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "You are already registered using your membership for this event.",
          code:
            "MEMBERSHIP_ALREADY_REGISTERED",
        },
        {
          status: 409,
        }
      );
    }

    // =====================================================
    // GET FREE PASS
    // =====================================================

    let guestPass = null;

    if (useGuestPass) {
      guestPass =
        await guestPassesCollection.findOne(
          {
            memberId,
            type: "FREE",
            status: "AVAILABLE",
          }
        );

      if (!guestPass) {
        return NextResponse.json(
          {
            error:
              "Your free guest pass is no longer available.",
            code:
              "PASS_NOT_AVAILABLE",
          },
          {
            status: 409,
          }
        );
      }
    }

    // =====================================================
    // VALIDATE GUEST
    // =====================================================

    let guestName = null;
    let guestMobile = null;

    if (
      registrationType === "GUEST"
    ) {
      guestName =
        typeof guest?.name ===
        "string"
          ? guest.name.trim()
          : "";

      guestMobile =
        typeof guest?.mobile ===
        "string"
          ? guest.mobile.trim()
          : "";

      if (!guestName) {
        return NextResponse.json(
          {
            error:
              "Please enter the guest name.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !/^[0-9]{10}$/.test(
          guestMobile
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Please enter a valid 10 digit guest mobile number.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // SUNDAY EXPERIENCE RESERVATION
    // =====================================================

    /*
      IMPORTANT BUSINESS RULE:

      Membership registration does NOT immediately
      consume the experience.

      Instead it RESERVES one experience.

      Example:

      total    = 4
      used     = 0
      reserved = 1

      available = 4 - 0 - 1 = 3

      When QR is scanned:

      reserved = 0
      used     = 1

      This prevents users from booking unlimited
      future events while still making check-in
      the actual consumption point.
    */

    let experienceTotal = 0;
    let experienceUsed = 0;
    let experienceReserved = 0;
    let experienceAvailable = 0;

    if (
      registrationType ===
      "MEMBERSHIP"
    ) {
      experienceTotal =
        Number(
          activeMembership
            ?.sundayExperiences
            ?.total
        ) || 4;

      experienceUsed =
        Number(
          activeMembership
            ?.sundayExperiences
            ?.used
        ) || 0;

      experienceReserved =
        Number(
          activeMembership
            ?.sundayExperiences
            ?.reserved
        ) || 0;

      experienceAvailable =
        Math.max(
          experienceTotal -
            experienceUsed -
            experienceReserved,
          0
        );

      if (
        experienceAvailable <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "You have no Sunday experiences available for a new booking.",
            code:
              "SUNDAY_EXPERIENCES_EXHAUSTED",

            sundayExperiences: {
              total:
                experienceTotal,

              used:
                experienceUsed,

              reserved:
                experienceReserved,

              available:
                experienceAvailable,
            },
          },
          {
            status: 409,
          }
        );
      }
    }

    // =====================================================
    // CALCULATE SEATS
    // =====================================================

    /*
      MEMBERSHIP
      = 1 seat

      SELF_PASS
      = 1 seat

      GUEST
      = 2 seats
        member + guest
    */

    const seatsRequired =
      registrationType ===
      "GUEST"
        ? 2
        : 1;

    // =====================================================
    // CURRENT EVENT USAGE
    // =====================================================

    const registeredCount =
      await registrationsCollection.countDocuments(
        {
          eventId:
            eventObjectId,

          status: {
            $in: [
              "REGISTERED",
              "ATTENDED",
            ],
          },
        }
      );

    const guestCount =
      await registrationsCollection.countDocuments(
        {
          eventId:
            eventObjectId,

          status: {
            $in: [
              "REGISTERED",
              "ATTENDED",
            ],
          },

          "guest.enabled": true,
        }
      );

    /*
      Example:

      10 normal registrations
      2 guest registrations

      Seats:
      10 + 2 = 12
    */

    const totalSeatsUsed =
      registeredCount +
      guestCount;

    const eventCapacity =
      Number(event.capacity || 0);

    const availableSeats =
      Math.max(
        eventCapacity -
          totalSeatsUsed,
        0
      );

    if (
      availableSeats <
      seatsRequired
    ) {
      return NextResponse.json(
        {
          error:
            seatsRequired === 2
              ? "There are not enough seats for you and your guest."
              : "This event is full.",

          code: "EVENT_FULL",

          capacity:
            eventCapacity,

          availableSeats,
        },
        {
          status: 409,
        }
      );
    }

    // =====================================================
    // CREATE REGISTRATION
    // =====================================================

    const now = new Date();

    const registration = {
      eventId:
        eventObjectId,

      memberId,

      /*
        IMPORTANT:

        This is required for the new
        event + member + registrationType
        unique index.
      */

      registrationType,

      status:
        "REGISTERED",

      // Every registration gets its own QR.
      qrCode:
        generateQRCode(),

      registeredAt:
        now,

      attendedAt:
        null,

      /*
        Membership
        -> null

        Self pass
        -> SELF

        Guest
        -> GUEST
      */

      passUsage:
        registrationType ===
        "MEMBERSHIP"
          ? null
          : passFor,

      /*
        Sunday experience state.

        Only membership registrations
        reserve an experience.
      */

      experienceStatus:
        registrationType ===
        "MEMBERSHIP"
          ? "RESERVED"
          : null,

      guest: {
        enabled:
          registrationType ===
          "GUEST",

        guestPassId:
          useGuestPass
            ? guestPass?._id ||
              null
            : null,

        name:
          registrationType ===
          "GUEST"
            ? guestName
            : null,

        mobile:
          registrationType ===
          "GUEST"
            ? guestMobile
            : null,

        /*
          Guest pass remains RESERVED
          until QR check-in.

          For SELF we also store the
          pass information, but guest.enabled
          remains false.
        */

        status:
          useGuestPass
            ? "RESERVED"
            : null,
      },

      createdAt:
        now,

      updatedAt:
        now,
    };

    // =====================================================
    // INSERT REGISTRATION
    // =====================================================

    let insertResult;

    try {
      insertResult =
        await registrationsCollection.insertOne(
          registration
        );
    } catch (error) {
      console.error(
        "REGISTRATION INSERT ERROR:",
        error
      );

      /*
        Duplicate index protection.

        This can happen if two requests arrive
        at almost exactly the same time.
      */

      if (
        error?.code === 11000
      ) {
        return NextResponse.json(
          {
            error:
              "You already have this type of registration for this event.",
            code:
              "DUPLICATE_REGISTRATION",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Unable to create event registration.",
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // RESERVE SUNDAY EXPERIENCE
    // =====================================================

    /*
      IMPORTANT:

      We reserve the experience AFTER the
      registration has been inserted.

      MongoDB is standalone, so we don't use
      transactions.

      If reservation fails, we delete the
      registration as a rollback.
    */

    if (
      registrationType ===
      "MEMBERSHIP"
    ) {
      const membershipUpdate =
        await membershipsCollection.updateOne(
          {
            _id:
              activeMembership._id,

            status:
              "ACTIVE",

            /*
              This prevents the reservation
              from exceeding the total.

              available =
                total - used - reserved

              Therefore:

              used + reserved < total
            */

            $expr: {
              $lt: [
                {
                  $add: [
                    {
                      $ifNull: [
                        "$sundayExperiences.used",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$sundayExperiences.reserved",
                        0,
                      ],
                    },
                  ],
                },

                {
                  $ifNull: [
                    "$sundayExperiences.total",
                    4,
                  ],
                },
              ],
            },
          },
          {
            $inc: {
              "sundayExperiences.reserved":
                1,
            },

            $set: {
              updatedAt:
                now,
            },
          }
        );

      if (
        membershipUpdate.modifiedCount !==
        1
      ) {
        /*
          Roll back registration because
          we could not reserve the experience.
        */

        await registrationsCollection.deleteOne(
          {
            _id:
              insertResult.insertedId,
          }
        );

        return NextResponse.json(
          {
            error:
              "You no longer have a Sunday experience available. Please try again.",
            code:
              "SUNDAY_EXPERIENCES_EXHAUSTED",
          },
          {
            status: 409,
          }
        );
      }
    }

    // =====================================================
    // RESERVE FREE PASS
    // =====================================================

    if (
      useGuestPass &&
      guestPass
    ) {
      const passUpdate =
        await guestPassesCollection.updateOne(
          {
            _id:
              guestPass._id,

            memberId,

            type:
              "FREE",

            status:
              "AVAILABLE",
          },
          {
            $set: {
              status:
                "RESERVED",

              eventId:
                eventObjectId,

              reservedAt:
                now,

              reservedBy:
                memberId,

              reservedFor:
                passFor,

              /*
                SELF:
                member uses own pass.

                GUEST:
                another person uses the pass.
              */

              usedBy:
                passFor ===
                "SELF"
                  ? memberId
                  : null,

              updatedAt:
                now,
            },
          }
        );

      /*
        Someone else could have consumed
        the pass between findOne() and
        updateOne().
      */

      if (
        passUpdate.modifiedCount !==
        1
      ) {
        // ---------------------------------------------
        // Roll back registration
        // ---------------------------------------------

        await registrationsCollection.deleteOne(
          {
            _id:
              insertResult.insertedId,
          }
        );

        // ---------------------------------------------
        // Membership registration rollback
        // ---------------------------------------------

        if (
          registrationType ===
          "MEMBERSHIP"
        ) {
          await membershipsCollection.updateOne(
            {
              _id:
                activeMembership._id,

              "sundayExperiences.reserved":
                {
                  $gt: 0,
                },
            },
            {
              $inc: {
                "sundayExperiences.reserved":
                  -1,
              },

              $set: {
                updatedAt:
                  new Date(),
              },
            }
          );
        }

        return NextResponse.json(
          {
            error:
              "Your free pass is no longer available. Please try again.",
            code:
              "PASS_ALREADY_USED",
          },
          {
            status: 409,
          }
        );
      }
    }

    // =====================================================
    // FINAL EXPERIENCE VALUES
    // =====================================================

    let finalExperience = null;

    if (
      registrationType ===
      "MEMBERSHIP"
    ) {
      finalExperience = {
        total:
          experienceTotal,

        used:
          experienceUsed,

        reserved:
          experienceReserved + 1,

        available:
          Math.max(
            experienceTotal -
              experienceUsed -
              (experienceReserved +
                1),
            0
          ),
      };
    }

    // =====================================================
    // RESPONSE MESSAGE
    // =====================================================

    let message =
      "You have successfully registered for the event.";

    if (
      registrationType ===
      "MEMBERSHIP"
    ) {
      message =
        "You have successfully registered for the event. One Sunday experience has been reserved.";
    }

    if (
      registrationType ===
      "SELF_PASS"
    ) {
      message =
        "You have successfully registered using your free pass.";
    }

    if (
      registrationType ===
      "GUEST"
    ) {
      message =
        "You and your guest have been successfully registered.";
    }

    /*
      If guest registration already exists,
      membership registration is still allowed.
    */

    const hadGuestRegistration =
      existingRegistrations.some(
        (registration) =>
          registration.registrationType ===
            "GUEST" ||
          registration.passUsage ===
            "GUEST"
      );

    if (
      registrationType ===
        "MEMBERSHIP" &&
      hadGuestRegistration
    ) {
      message =
        "You have successfully registered yourself using your membership. Your guest registration remains separate.";
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message,

        registration: {
          id:
            insertResult.insertedId.toString(),

          eventId,

          memberId:
            memberId.toString(),

          registrationType,

          status:
            registration.status,

          qrCode:
            registration.qrCode,

          passUsage:
            registration.passUsage,

          experienceStatus:
            registration.experienceStatus,

          guest:
            registration.guest,
        },

        membership: {
          required:
            registrationType ===
            "MEMBERSHIP",

          active:
            hasMembership,

          /*
            Membership registration reserves
            one experience.

            It is NOT marked USED yet.
          */

          sundayExperienceReserved:
            registrationType ===
            "MEMBERSHIP",

          sundayExperienceConsumed:
            false,

          sundayExperiences:
            finalExperience,
        },

        pass: {
          used: false,

          status:
            useGuestPass
              ? "RESERVED"
              : null,

          usage:
            useGuestPass
              ? passFor
              : null,
        },

        capacity: {
          capacity:
            eventCapacity,

          previouslyUsed:
            totalSeatsUsed,

          seatsUsed:
            seatsRequired,

          remaining:
            Math.max(
              availableSeats -
                seatsRequired,
              0
            ),
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "EVENT REGISTRATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to register for this event.",
      },
      {
        status: 500,
      }
    );
  }
}