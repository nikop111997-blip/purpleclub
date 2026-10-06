import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import EventsClient from "@/component/EventsClient";

export default async function EventsPage() {
  const session = await auth();

  if (!session?.user?.memberId) {
    redirect("/auth?mode=login");
  }

  const db = await getDB();

  const memberId = new ObjectId(
    session.user.memberId
  );

  // =====================================================
  // EVENTS
  // =====================================================

  const events = await db
    .collection("events")
    .find({
      status: "PUBLISHED",
      date: {
        $gte: new Date(),
      },
    })
    .sort({
      date: 1,
    })
    .toArray();

  // =====================================================
  // MEMBER REGISTRATIONS
  // =====================================================

  const registrations = await db
    .collection("event_registrations")
    .find({
      memberId,
      status: {
        $in: ["REGISTERED", "ATTENDED"],
      },
    })
    .toArray();

  /*
    We now send the actual registrations instead of
    only registeredEventIds.

    This allows the client to know:

    passUsage === "GUEST"
      -> guest registration

    passUsage === "SELF"
      -> free pass for member

    passUsage === null
      -> membership registration
  */

  const registrationData = registrations.map(
    (registration) => ({
      id: registration._id.toString(),

      eventId: registration.eventId.toString(),

      status: registration.status,

      qrCode: registration.qrCode || null,

      passUsage:
        registration.passUsage || null,

      guest: registration.guest
        ? {
            enabled:
              Boolean(
                registration.guest.enabled
              ),

            name:
              registration.guest.name || null,

            mobile:
              registration.guest.mobile || null,

            status:
              registration.guest.status || null,
          }
        : null,
    })
  );

  // =====================================================
  // FREE GUEST PASS
  // =====================================================

  const guestPass =
    await db.collection("guest_passes").findOne({
      memberId,
      type: "FREE",
    });

  // =====================================================
  // FORMAT EVENTS
  // =====================================================

  const formattedEvents = events.map(
    (event) => ({
      id: event._id.toString(),

      name: event.name,

      description:
        event.description || "",

      date: event.date,

      startTime:
        event.startTime || "",

      endTime:
        event.endTime || "",

      location:
        event.location || "",

      capacity:
        event.capacity || 0,

      image:
        event.image || "/cheer.png",

      registeredCount: 0,
    })
  );

  return (
    <EventsClient
      events={formattedEvents}
      registrations={registrationData}
      guestPass={
        guestPass
          ? {
              id:
                guestPass._id.toString(),

              status:
                guestPass.status,

              code:
                guestPass.code,
            }
          : null
      }
    />
  );
}