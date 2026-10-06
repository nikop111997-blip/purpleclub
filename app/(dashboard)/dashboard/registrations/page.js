import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import RegistrationsClient from "@/component/RegistrationsClient";

export default async function RegistrationsPage() {
  const session = await auth();

  if (!session?.user?.memberId) {
    redirect("/auth?mode=login");
  }

  const db = await getDB();

  const memberId = new ObjectId(
    session.user.memberId
  );

  const registrations =
    await db
      .collection("event_registrations")
      .aggregate([
        {
          $match: {
            memberId,
          },
        },

        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "event",
          },
        },

        {
          $unwind: {
            path: "$event",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            registeredAt: -1,
          },
        },
      ])
      .toArray();

  const formattedRegistrations =
    registrations.map((registration) => ({
      id: registration._id.toString(),

      eventId:
        registration.eventId?.toString(),

      status:
        registration.status,

      qrCode:
        registration.qrCode,

      registeredAt:
        registration.registeredAt,

      attendedAt:
        registration.attendedAt,

      passUsage:
        registration.passUsage || null,

      guest: registration.guest
        ? {
            enabled:
              Boolean(
                registration.guest.enabled
              ),

            name:
              registration.guest.name ||
              null,

            mobile:
              registration.guest.mobile ||
              null,

            status:
              registration.guest.status ||
              null,

            guestPassId:
              registration.guest
                .guestPassId
                ?.toString() || null,
          }
        : null,

      event: registration.event
        ? {
            id:
              registration.event._id.toString(),

            name:
              registration.event.name,

            description:
              registration.event.description ||
              "",

            date:
              registration.event.date,

            startTime:
              registration.event.startTime ||
              "",

            endTime:
              registration.event.endTime ||
              "",

            location:
              registration.event.location ||
              "",

            status:
              registration.event.status ||
              "",
          }
        : null,
    }));

  return (
    <RegistrationsClient
      registrations={
        formattedRegistrations
      }
    />
  );
}