// app/dashboard/events/page.jsx

import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import EventsClient from "@/component/EventsClient";

function toDateString(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  return String(value).slice(0, 10);
}

export default async function EventsPage() {
  const session = await auth();

  if (!session?.user?.memberId) {
    redirect("/auth?mode=login");
  }

  if (!ObjectId.isValid(session.user.memberId)) {
    redirect("/auth?mode=login");
  }

  const db = await getDB();
  const memberId = new ObjectId(session.user.memberId);

  const today = toDateString(new Date());
  const now = new Date();

  // Clubs provide the club name and city for event filters.
  const clubs = await db
    .collection("clubs")
    .find({})
    .project({
      name: 1,
      city: 1,
      location: 1,
      area: 1,
    })
    .toArray();

  const clubMap = new Map(
    clubs.map((club) => [
      club._id.toString(),
      {
        id: club._id.toString(),
        name: club.name || "Purple Club",
        city: club.city || "",
        area: club.area || "",
        location: club.location || "",
      },
    ])
  );

  // Load published events.
  const allEvents = await db
    .collection("events")
    .find({ status: "PUBLISHED" })
    .sort({ date: 1 })
    .toArray();

  // Compare YYYY-MM-DD strings so today's date is not
  // accidentally excluded because its time is midnight.
  const upcomingEvents = allEvents.filter((event) => {
    const eventDate = toDateString(event.date);
    return eventDate && eventDate >= today;
  });

  const formattedEvents = upcomingEvents.map((event) => {
    const club = event.clubId
      ? clubMap.get(event.clubId.toString())
      : null;

    return {
      id: event._id.toString(),
      name: event.name || event.title || "Purple Experience",
      description: event.description || "",
      date: toDateString(event.date),
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location || event.venue || "",
      city: event.city || club?.city || "",
      clubId: event.clubId?.toString() || "",
      clubName: club?.name || event.clubName || "Purple Club",
      capacity: event.capacity || 0,
      image: event.image || "/cheer.png",
    };
  });

  // Find the member's latest membership.
  const memberships = await db
    .collection("memberships")
    .find({ memberId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(20)
    .toArray();

  const activeMembership = memberships.find((membership) => {
    if (membership.status !== "ACTIVE") return false;

    // Legacy active records without an endDate remain valid.
    if (!membership.endDate) return true;

    return new Date(membership.endDate) > now;
  });

  return (
    <EventsClient
      events={formattedEvents}
      hasActiveMembership={Boolean(activeMembership)}
      membershipPlan={activeMembership?.plan || ""}
      membershipEndDate={
        activeMembership?.endDate
          ? new Date(activeMembership.endDate).toISOString()
          : null
      }
      membershipPurchaseUrl="/dashboard/membership"
    />
  );
}