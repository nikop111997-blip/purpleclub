import {
CalendarDays,
Ticket,
QrCode,
ArrowRight,
Sparkles,
Clock3,
MapPin,
ArrowUpRight,
ShieldCheck,
Crown,
Trophy,
CheckCircle2,
UserRound,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import PandaQRCode from "@/component/PandaQRCode";
import MemberQrCard from "@/component/MemberQrCard";
import EventCalendar from "@/component/Eventcalendar";
import AttendanceMilestones from "@/component/AttendanceMilestones";
import MemberDashboardTour from "@/component/MemberDashboardTour";
/* =========================================================
THEME
========================================================= */
const GLASS_LIGHT =
"border border-white/70 bg-gradient-to-br from-white/75 via-white/45 to-white/30 backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_0_20px_rgba(255,255,255,0.25),0_12px_32px_-8px_rgba(106,63,158,0.15)]";
const GLASS_ROW =
"border border-white/80 bg-white/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(106,63,158,0.05)] backdrop-blur-md";
const GLASS_DARK =
"border border-white/25 bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]";
const LIME_BTN =
"group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/40 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-5 py-3 text-sm font-bold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.35)] transition duration-300 hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.5)] active:scale-[0.98]";
const SHINE =
"pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70";
const ATTENDANCE_MILESTONES = [10, 25, 50, 75, 100];
/* =========================================================
HELPERS
========================================================= */
function formatDate(value) {
if (!value) return "Not available";
// Keep YYYY-MM-DD dates from shifting to the previous day.
if (
typeof value === "string" &&
/^\d{4}-\d{2}-\d{2}$/.test(value)
) {
const [year, month, day] = value.split("-").map(Number);
return new Date(year, month - 1, day).toLocaleDateString(
"en-IN",
{
day: "numeric",
month: "short",
year: "numeric",
}
);
}
const date = new Date(value);
if (Number.isNaN(date.getTime())) {
return String(value);
}
return date.toLocaleDateString("en-IN", {
day: "numeric",
month: "short",
year: "numeric",
});
}
function getMemberRole(member) {
const roles = [
member?.role,
member?.profile,
...(Array.isArray(member?.roles) ? member.roles : []),
]
.filter(Boolean)
.map((role) => String(role).toUpperCase());
return roles.includes("SUPERCOACH")
? "SUPERCOACH"
: roles.includes("CHARTER_COACH")
? "CHARTER_COACH"
: roles.includes("COACH")
? "COACH"
: roles.includes("CHARTER_MEMBER")
? "CHARTER_MEMBER"
: "USER";
}
function isMembershipActive(membership, now) {
if (!membership || membership.status !== "ACTIVE") {
return false;
}
// Legacy active membership records may not have an endDate.
if (!membership.endDate) {
return true;
}
const endDate = new Date(membership.endDate);
return (
!Number.isNaN(endDate.getTime()) &&
endDate > now
);
}
/* =========================================================
PAGE
========================================================= */
export default async function DashboardPage() {
const session = await auth();
const memberId = session?.user?.memberId;
let member = null;
let upcomingEvents = [];
let registrations = [];
let activeMembership = null;
let superCoachClubs = [];
let attendanceCount = 0;
if (memberId && ObjectId.isValid(memberId)) {
const db = await getDB();
const membersCollection = db.collection("members");
const membershipsCollection = db.collection("memberships");
const eventsCollection = db.collection("events");
const registrationsCollection = db.collection(
"event_registrations"
);
const clubsCollection = db.collection("clubs");
const memberObjectId = new ObjectId(memberId);
/* -----------------------------------------------------
MEMBER
----------------------------------------------------- */
member = await membersCollection.findOne({
_id: memberObjectId,
});
/*
* Create a permanent member QR if the member does not
* already have one. Existing QR values are preserved.
*
* This QR identifies the member; it is not proof of
* an active membership.
*/
if (member && !member.qrCode && !member.qrToken) {
const newQrCode = randomUUID();
await membersCollection.updateOne(
{
_id: memberObjectId,
$and: [
{
$or: [
{ qrCode: { $exists: false } },
{ qrCode: null },
{ qrCode: "" },
],
},
{
$or: [
{ qrToken: { $exists: false } },
{ qrToken: null },
{ qrToken: "" },
],
},
],
},
{
$set: {
qrCode: newQrCode,
},
}
);
// Re-read so a concurrent request cannot overwrite the QR.
member = await membersCollection.findOne({
_id: memberObjectId,
});
}
/* -----------------------------------------------------
MEMBERSHIP STATUS
----------------------------------------------------- */
const membershipHistory = await membershipsCollection
.find({
memberId: memberObjectId,
})
.sort({
createdAt: -1,
})
.toArray();
const now = new Date();
activeMembership =
membershipHistory.find((membership) =>
isMembershipActive(membership, now)
) || null;
/* -----------------------------------------------------
UPCOMING EVENTS
Event dates are expected to be YYYY-MM-DD strings.
----------------------------------------------------- */
const today = [
now.getFullYear(),
String(now.getMonth() + 1).padStart(2, "0"),
String(now.getDate()).padStart(2, "0"),
].join("-");
const eventList = await eventsCollection
.find({
status: "PUBLISHED",
date: { $gte: today },
})
.sort({
date: 1,
})
.limit(3)
.toArray();
/*
* Attach club names to events. Supports clubId stored
* as either an ObjectId or a valid ObjectId string.
*/
const clubIds = [
...new Set(
eventList
.map((event) => event.clubId?.toString())
.filter((id) => id && ObjectId.isValid(id))
),
];
const eventClubObjectIds = clubIds.map(
(id) => new ObjectId(id)
);
const eventClubs = eventClubObjectIds.length
? await clubsCollection
.find({
_id: { $in: eventClubObjectIds },
})
.project({
name: 1,
})
.toArray()
: [];
const eventClubMap = new Map(
eventClubs.map((club) => [
club._id.toString(),
club.name,
])
);

upcomingEvents = eventList.map((event) => ({
  ...event,

  // Convert MongoDB ObjectIds into plain strings.
  _id: event._id.toString(),
  clubId: event.clubId?.toString() ?? null,
  createdBy: event.createdBy?.toString() ?? null,

  // Convert Date objects into serializable strings.
  createdAt:
    event.createdAt instanceof Date
      ? event.createdAt.toISOString()
      : event.createdAt ?? null,

  updatedAt:
    event.updatedAt instanceof Date
      ? event.updatedAt.toISOString()
      : event.updatedAt ?? null,

  clubName: event.clubId
    ? eventClubMap.get(event.clubId.toString()) || null
    : null,
}));

registrations = await registrationsCollection
.aggregate([
{
$match: {
memberId: memberObjectId,
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
{
$limit: 3,
},
])
.toArray();
/* -----------------------------------------------------
SUPERCOACH CLUB ASSIGNMENTS
This query assumes clubs store the assignment in
superCoachId, superCoachMemberId, or superCoachIds.
If your schema uses a different field, update this
query to match that field.
----------------------------------------------------- */
const role = getMemberRole(member);
if (role === "SUPERCOACH") {
superCoachClubs = await clubsCollection
.find({
$or: [
{ superCoachId: memberObjectId },
{ superCoachId: memberObjectId.toString() },
{ superCoachMemberId: memberObjectId },
{ superCoachMemberId: memberObjectId.toString() },
{ superCoachIds: memberObjectId },
{ superCoachIds: memberObjectId.toString() },
],
})
.project({
name: 1,
city: 1,
cityName: 1,
location: 1,
})
.toArray();
}
/* -----------------------------------------------------
ATTENDANCE COUNT
Count this member's recorded check-ins only.
----------------------------------------------------- */
attendanceCount = await db.collection("attendance").countDocuments({
  memberId: memberObjectId,
});
}
const memberRole = getMemberRole(member);
const isSuperCoach = memberRole === "SUPERCOACH";
const memberQrCode = member?.qrCode || member?.qrToken || null;
const latestRegistration = registrations[0] || null;
const membershipStatus = activeMembership
? "Active"
: "Inactive";
const membershipPlan = activeMembership?.plan
? String(activeMembership.plan).replaceAll("_", " ")
: "No active plan";
const membershipEndDate = activeMembership?.endDate
? formatDate(activeMembership.endDate)
: "Not set";
const nextMilestone =
ATTENDANCE_MILESTONES.find(
(milestone) => attendanceCount < milestone
) || null;
const previousMilestone =
[...ATTENDANCE_MILESTONES]
.reverse()
.find((milestone) => attendanceCount >= milestone) || 0;
const milestoneProgress = nextMilestone
? Math.min(
100,
Math.round(
((attendanceCount - previousMilestone) /
(nextMilestone - previousMilestone)) *
100
)
)
: 100;
const roleLabel = isSuperCoach
? "SuperCoach"
: memberRole === "CHARTER_COACH"
? "Charter Coach"
: memberRole === "COACH"
? "Coach"
: memberRole === "CHARTER_MEMBER"
? "Charter Member"
: "Purple Member";
return (
<div className="relative isolate mx-auto space-y-4 font-sans">
{/* Ambient background */}
<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
<div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#B9D63B]/15 blur-3xl" />
<div className="absolute -right-32 top-72 h-96 w-96 rounded-full bg-[#6a3f9e]/15 blur-3xl" />
</div>
{/* ===================================================
HERO
=================================================== */}
<section
data-tg-tour="Welcome to your Purple Club dashboard. Use this page to explore your membership and club activities."
data-tg-title="Welcome to Purple Club"
data-tg-group="member-dashboard"
data-tg-order="1"
className={`relative overflow-hidden rounded-[1.5rem] px-5 shadow-[0_20px_48px_-20px_rgba(106,63,158,0.6)] sm:px-6 lg:px-8 ${
isSuperCoach
? "bg-[#31205f]"
: "bg-[#6a3f9e]"
}`}
>
<div
className={`pointer-events-none absolute inset-0 ${
isSuperCoach
? "bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(129,140,248,0.28),transparent_32%),linear-gradient(135deg,#241744_0%,#49327d_50%,#31205f_100%)]"
: "bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(185,214,59,0.14),transparent_32%),linear-gradient(135deg,#5a2f8c_0%,#6a3f9e_50%,#4b2272_100%)]"
}`}
/>
<div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#B9D63B]/20 blur-3xl" />
<div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
<div className="relative z-10 grid items-end gap-0 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
<div className="max-w-[650px] pt-5 sm:pt-6 lg:self-center lg:py-8">
<div
className={`relative mb-4 inline-flex items-center gap-2 overflow-hidden rounded-full px-3.5 py-1.5 ${GLASS_DARK}`}
>
{isSuperCoach ? (
<Crown
size={14}
className="relative text-indigo-200"
/>
) : (
<Sparkles
size={14}
className="relative text-[#B9D63B]"
/>
)}
<span className="relative text-[11px] font-semibold text-white">
{roleLabel} · Purple Club
</span>
</div>
<h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
Welcome back,{" "}
<span
className={
isSuperCoach
? "text-indigo-200"
: "text-[#B9D63B]"
}
>
{member?.name?.split(" ")[0] ||
session?.user?.name?.split(" ")[0] ||
"Member"}
.
</span>
</h1>
<p className="mt-3 max-w-[540px] text-sm leading-6 text-white/70">
{isSuperCoach
? "Lead your club, connect with your community and keep your Purple experiences organised."
: "Your Purple journey starts here. Discover experiences, manage your membership and stay connected with the community."}
</p>
<div className="mt-6 flex flex-wrap gap-3">
<Link href="/dashboard/events" className={LIME_BTN}>
<span className={SHINE} />
<span className="relative">Explore events</span>
<ArrowRight
size={16}
className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
/>
</Link>
<Link
href="/dashboard/attendance"
className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.03] active:scale-95 ${GLASS_DARK}`}
>
<span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent opacity-60" />
<QrCode size={16} className="relative" />
<span className="relative">Attendance</span>
</Link>
<MemberDashboardTour />
</div>
</div>
<div className="relative mx-auto h-[180px] w-full max-w-[620px] self-end sm:h-[360px] lg:h-[300px] lg:max-w-none">
<div className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B9D63B]/20 blur-3xl" />
<Image
src="/cheer.png"
alt="Purple Club community illustration"
fill
priority
sizes="(min-width: 1024px) 560px, 100vw"
className="object-contain object-bottom drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)]"
/>
</div>
</div>
</section>
<div className="grid grid-cols-1 sm:grid-cols-[70%_30%]">
<div className="flex flex-col gap-4" 
data-tg-tour="Check your membership status, Upcoming Events Calendar and Registration information"
data-tg-title="Your Dashboard Overview"
data-tg-group="member-dashboard"
data-tg-order="2"
>
<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<DashboardStat
icon={ShieldCheck}
label="Membership"
value={membershipStatus}
description={
activeMembership
? `${membershipPlan} · Renewal ${membershipEndDate}`
: "Activate a membership to access member benefits"
}
href="/dashboard/profile"
highlight={Boolean(activeMembership)}
/>
<DashboardStat
icon={QrCode}
label="Member QR"
value={memberQrCode ? "Available" : "Not available"}
description="Your permanent member identification"
href="/dashboard/registrations"
highlight={Boolean(memberQrCode)}
/>
{/* ROLE-BASED REGISTRATION CARD */}
{isSuperCoach ? (
<SuperCoachRegistrationCard clubs={superCoachClubs} />
) : (
<RegistrationRequiredCard
registrationCount={registrations.length}
/>
)}
<DashboardStat
icon={CalendarDays}
label="Registrations"
value={registrations.length}
description="Your recent event registrations"
href="/dashboard/registrations"
/>
</section>
<section className={`rounded-[1.5rem] p-4 sm:p-5 ${GLASS_LIGHT}`}>
<div className="mb-5 flex items-center justify-between">
<div>
<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B939E]">
Discover
</p>
<h2 className="mt-1 text-lg font-bold text-[#24112f]">
Upcoming experiences
</h2>
</div>
<Link
href="/dashboard/events"
className="rounded-full border border-white/80 bg-white/50 px-3.5 py-1.5 text-xs font-semibold text-[#4B176B] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] transition hover:bg-white/80"
>
View all
</Link>
</div>
{upcomingEvents.length === 0 ? (
<EmptyState
icon={CalendarDays}
title="No upcoming events"
description="New Purple experiences will appear here."
action={
<Link
href="/dashboard/events"
className="text-xs font-bold text-[#4B176B] hover:underline"
>
Explore events →
</Link>
}
/>
) : (
<div className="space-y-3">
<EventCalendar events={upcomingEvents} />
</div>
)}
</section>
</div>
{/* UPCOMING EVENTS */}

<section className="flex flex-col items-center" 
data-tg-tour="Find your personal membership card and QR code here. Your QR identifies you; membership validity is shown separately."
data-tg-title="Your Membership Card"
data-tg-group="member-dashboard"
data-tg-order="3"
>
<div className="mb-4 w-full text-center">
<h2 className="text-lg font-bold text-[#24112f]">
Your membership card
</h2>
<p className="mt-1 text-sm text-[#6f6577]">
Your personal identification and membership QR code.
</p>
</div>
<MemberQrCard
name={
member?.name ||
session?.user?.name ||
"Purple Member"
}
profession={roleLabel}
memberQrCode={memberQrCode}
photo={
member?.profileImage ||
member?.image ||
member?.photo ||
"/cheering.png"
}
expiryDate={membershipEndDate}
brand="purple"
/>
</section>
</div>
{/* ===================================================
ATTENDANCE MILESTONES
=================================================== */}
<div
  data-tg-tour="Track your recorded check-ins and progress toward attendance milestones."
  data-tg-title="Attendance Milestones"
  data-tg-group="member-dashboard"
  data-tg-order="5"
>
<AttendanceMilestones attendanceCount={attendanceCount} />
</div>
</div>
);
}

/* =========================================================
STAT CARD
========================================================= */
function DashboardStat({
icon: Icon,
label,
value,
description,
href,
highlight = false,
}) {
return (
<Link
href={href}
className={`group relative overflow-hidden rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_18px_40px_-10px_rgba(106,63,158,0.3)] ${GLASS_LIGHT}`}
>
{highlight && (
<div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#B9D63B]/40 blur-2xl" />
)}
<div className="relative flex items-start justify-between">
<div
className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border ${
highlight
? "border-white/60 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_6px_16px_rgba(185,214,59,0.4)]"
: "border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 text-[#4B176B] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
}`}
>
<Icon size={18} />
</div>
<ArrowRight
size={16}
className="text-[#6f6577]/50 transition group-hover:translate-x-1 group-hover:text-[#4B176B]"
/>
</div>
<p className="relative mt-3 text-xs font-semibold text-[#6f6577]">
{label}
</p>
<p className="relative mt-1 text-xl font-bold capitalize text-[#24112f]">
{value}
</p>
<p className="relative mt-1 line-clamp-2 text-xs leading-5 text-[#6f6577]/80">
{description}
</p>
</Link>
);
}
/* =========================================================
SUPERCOACH REGISTRATION CARD
========================================================= */
function SuperCoachRegistrationCard({ clubs }) {
return (
<div className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-violet-100 via-white/85 to-indigo-100 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(79,70,229,0.16)] transition duration-300 hover:-translate-y-1">
<div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-300/30 blur-2xl" />
<div className="relative flex items-start justify-between gap-2">
<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
<Crown size={18} />
</div>
<span className="rounded-full border border-indigo-200 bg-white/70 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-indigo-800">
SuperCoach
</span>
</div>
<p className="relative mt-5 text-xs font-semibold text-indigo-700">
Club assignment
</p>
<p className="relative mt-1 text-xl font-bold text-indigo-950">
{clubs.length > 0
? `${clubs.length} ${clubs.length === 1 ? "Club" : "Clubs"}`
: "Not assigned"}
</p>
{clubs.length > 0 ? (
<div className="relative mt-3 space-y-2">
{clubs.slice(0, 2).map((club) => (
<div
key={club._id.toString()}
className="rounded-xl border border-indigo-200/80 bg-white/75 px-3 py-2"
>
<p className="text-[10px] font-medium text-indigo-600">
SuperCoach of
</p>
<p className="mt-0.5 truncate text-xs font-bold text-indigo-950">
{club.name || "Unnamed club"}
</p>
{(club.cityName || club.city || club.location) && (
<p className="mt-1 truncate text-[10px] text-indigo-700/75">
{club.cityName || club.city || club.location}
</p>
)}
</div>
))}
{clubs.length > 2 && (
<p className="text-[10px] font-semibold text-indigo-700">
+{clubs.length - 2} more clubs
</p>
)}
</div>
) : (
<p className="relative mt-3 text-xs leading-5 text-indigo-800">
No club assignment was found for your SuperCoach profile. Contact
your administrator to verify the club assignment.
</p>
)}
</div>
);
}
/* =========================================================
NORMAL MEMBER REGISTRATION CARD
========================================================= */
function RegistrationRequiredCard({ registrationCount }) {
return (
<div className="group relative overflow-hidden rounded-3xl border border-lime-200 bg-gradient-to-br from-white/85 via-white/70 to-lime-50 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(185,214,59,0.18)] transition duration-300 hover:-translate-y-1">
<div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-200/40 blur-2xl" />
<div className="relative flex items-start justify-between gap-2">
<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-200 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#35460A] shadow-sm">
<CalendarDays size={18} />
</div>
<span className="rounded-full border border-lime-300 bg-lime-100/80 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-lime-900">
Action required
</span>
</div>
<p className="relative mt-3 text-xs font-semibold text-[#6f6577]">
Event registration
</p>
<p className="relative mt-1 text-xl font-bold text-[#24112f]">
Registration Required
</p>
<p className="relative mt-1 line-clamp-2 text-xs leading-5 text-[#6f6577]">
Select an upcoming event and reserve your place before attending.
</p>
<Link
href="/dashboard/events"
className="relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-3 py-2.5 text-xs font-extrabold text-[#1E2A00] shadow-sm transition hover:brightness-105 active:scale-[0.98]"
>
Register for an event
<ArrowRight
size={14}
className="transition-transform group-hover:translate-x-0.5"
/>
</Link>
<p className="relative mt-2 text-[10px] text-[#6f6577]">
{registrationCount} recent registration
{registrationCount === 1 ? "" : "s"}
</p>
</div>
);
}
/* =========================================================
EVENT CARD
========================================================= */
function EventCard({ event }) {
const eventDate = event.date
? new Date(`${event.date}T12:00:00`)
: null;
return (
<Link
href={`/dashboard/events/${event._id.toString()}`}
className={`group flex items-center gap-4 rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#B9D63B] hover:bg-white/70 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_24px_-8px_rgba(185,214,59,0.5)] ${GLASS_ROW}`}
>
<div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
<span className="text-[10px] font-bold uppercase text-[#6B3FA0]">
{eventDate && !Number.isNaN(eventDate.getTime())
? eventDate.toLocaleDateString("en-IN", {
month: "short",
})
: "TBA"}
</span>
<span className="text-xl font-bold leading-5 text-[#35104D]">
{eventDate && !Number.isNaN(eventDate.getTime())
? eventDate.getDate()
: "--"}
</span>
</div>
<div className="min-w-0 flex-1">
<p className="truncate text-sm font-bold text-[#24112f]">
{event.name || "Purple Experience"}
</p>
<div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
{event.startTime && (
<span className="flex items-center gap-1 text-[11px] text-[#6f6577]">
<Clock3 size={12} />
{event.startTime}
</span>
)}
{event.location && (
<span className="flex items-center gap-1 text-[11px] text-[#6f6577]">
<MapPin size={12} />
{event.location}
</span>
)}
</div>
{event.clubName && (
<p className="mt-1 truncate text-[11px] font-semibold text-[#6a3f9e]">
Club: {event.clubName}
</p>
)}
</div>
<ArrowRight
size={17}
className="shrink-0 text-[#6f6577]/50 transition group-hover:translate-x-1 group-hover:text-[#4B176B]"
/>
</Link>
);
}
/* =========================================================
EMPTY STATE
========================================================= */
function EmptyState({ icon: Icon, title, description, action }) {
return (
<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#6a3f9e]/25 bg-white/30 px-6 py-10 text-center backdrop-blur-md">
<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
<Icon size={20} className="text-[#4B176B]" />
</div>
<p className="mt-4 text-sm font-bold text-[#24112f]">
{title}
</p>
<p className="mt-1 max-w-[300px] text-xs leading-5 text-[#6f6577]">
{description}
</p>
{action && <div className="mt-4">{action}</div>}
</div>
);
}
