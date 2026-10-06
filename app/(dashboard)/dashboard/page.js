import {
  CalendarDays,
  Ticket,
  QrCode,
  ArrowRight,
  Sparkles,
  Clock3,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();

  const memberId = session?.user?.memberId;

  let member = null;
  let guestPass = null;
  let upcomingEvents = [];
  let registrations = [];

  if (memberId && ObjectId.isValid(memberId)) {
    const db = await getDB();

    const memberObjectId = new ObjectId(memberId);

    member = await db.collection("members").findOne({
      _id: memberObjectId,
    });

    guestPass = await db
      .collection("guest_passes")
      .findOne({
        memberId: memberObjectId,
        type: "FREE",
      });

    upcomingEvents = await db
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
      .limit(3)
      .toArray();

    registrations = await db
      .collection("event_registrations")
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
  }

  return (
    <div className="mx-auto font-sans space-y-6">


<section
  className="
    relative
    overflow-hidden
    rounded-[26px]
    bg-[#6a3f9e]
    px-6
    sm:px-8
    lg:px-10
  "
>
  {/* Base gradient */}
  <div
    className="
      pointer-events-none
      absolute
      inset-0
      bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.10),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(185,214,59,0.08),transparent_30%),linear-gradient(135deg,#603493_0%,#6a3f9e_50%,#5b318c_100%)]
    "
  />

  {/* Nano grain texture */}
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-overlay"
    style={{
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.28'/%3E%3C/svg%3E")
      `,
      backgroundRepeat: "repeat",
      backgroundSize: "180px 180px",
    }}
  />

  {/* Fine micro texture */}
  <div
    className="
      pointer-events-none
      absolute
      inset-0
      opacity-[0.045]
      bg-[radial-gradient(circle,white_0.45px,transparent_0.6px)]
      bg-[length:4px_4px]
    "
  />

  {/* Subtle top light */}
  <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#B9D63B]/10 blur-3xl" />

  {/* Subtle bottom light */}
  <div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/[0.05] blur-3xl" />

  {/* Two-column layout: items-end so the image sits on the card's bottom edge */}
  <div className="relative z-10 grid items-end gap-0 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
    {/* LEFT: Content (carries its own vertical padding) */}
    <div className="max-w-[650px] pt-6 sm:pt-8 lg:self-center lg:py-10">
      <div
        className="
          mb-4
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-white/10
          bg-white/10
          px-3
          py-1.5
          backdrop-blur-sm
        "
      >
        <Sparkles size={14} className="text-[#B9D63B]" />

        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">
          Purple Club
        </span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Welcome back,{" "}
        <span className="text-[#B9D63B]">
          {member?.name?.split(" ")[0] ||
            session?.user?.name?.split(" ")[0] ||
            "Member"}
          .
        </span>
      </h1>

      <p className="mt-3 max-w-[540px] text-sm leading-6 text-white/65">
        Your Purple journey starts here. Discover experiences, manage your
        passes and stay connected with the community.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/events"
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-[#B9D63B]
            px-5
            py-3
            text-sm
            font-bold
            text-[#35104D]
            transition
            hover:bg-[#c9e34d]
          "
        >
          Explore events
          <ArrowRight size={16} />
        </Link>

        <Link
          href="/dashboard/guest-pass"
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/15
            bg-white/10
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            backdrop-blur-sm
            transition
            hover:bg-white/15
          "
        >
          <QrCode size={16} />
          Guest pass
        </Link>
      </div>
    </div>

    {/* RIGHT: PNG image, anchored to the bottom */}
    <div className="relative mx-auto h-[180px] w-full max-w-[620px] self-end sm:h-[360px] lg:h-[300px] lg:max-w-none">
      {/* Glow behind image */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B9D63B]/15 blur-3xl" />

      <Image
        src="/cheer.png"
        alt="Purple community illustration"
        fill
        priority
        sizes="(min-width: 1024px) 560px, 100vw"
        className="object-contain object-bottom drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)]"
      />
    </div>
  </div>
</section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <DashboardStat
          icon={Ticket}
          label="Membership"
          value="Not active"
          description="₹1,499 membership"
          href="/dashboard/profile"
        />

        <DashboardStat
          icon={QrCode}
          label="Guest Pass"
          value={
            guestPass?.status === "AVAILABLE"
              ? "Available"
              : guestPass?.status === "RESERVED"
              ? "Reserved"
              : "Used"
          }
          description="Your free pass"
          href="/dashboard/guest-pass"
          highlight={
            guestPass?.status === "AVAILABLE"
          }
        />

        <DashboardStat
          icon={CalendarDays}
          label="Registrations"
          value={registrations.length}
          description="Recent registrations"
          href="/dashboard/registrations"
        />

        <DashboardStat
          icon={Clock3}
          label="Experiences"
          value="0 / 4"
          description="Sunday experiences"
          href="/dashboard/attendance"
        />

      </section>

      {/* =========================================
          MAIN GRID
      ========================================== */}

      <div className="grid gap-6 lg:grid-cols-[1.8fr_0.7fr]">

        {/* EVENTS */}

        <section className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B939E]">
                Discover
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#2D2631]">
                Upcoming experiences
              </h2>
            </div>

            <Link
              href="/dashboard/events"
              className="text-xs font-semibold text-[#4B176B] hover:underline"
            >
              View all
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming events"
              description="New Purple experiences will appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event._id.toString()}
                  event={event}
                />
              ))}
            </div>
          )}
        </section>

        {/* GUEST PASS */}




<section className="relative mx-auto w-full max-w-[250px] lg:max-w-none">
  {/* Lanyard ring */} 
  {/* Outer bezel */}
  <div className="relative rounded-[30px] bg-[#2b0d40]/20 p-1 shadow-[0_30px_60px_-24px_rgba(53,16,77,0.8)] ring-1 ring-white/10">
    {/* Card */}
    <div className="relative h-[460px] overflow-hidden rounded-[26px] bg-[#6a3f9e]">
      {/* Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_85%_90%,rgba(185,214,59,0.12),transparent_35%),linear-gradient(160deg,#7a4cb0_0%,#6a3f9e_45%,#4b2272_100%)]" />
 
      {/* Nano grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />
 
      {/* Vertical light streaks */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_46px,rgba(255,255,255,0.035)_46px,rgba(255,255,255,0.035)_48px)]" />
 
      {/* Lanyard slot */}
      <div className="absolute left-1/2 text-[9px] text-center py-1 text-white/80 top-4 z-20 h-5 w-[46%] -translate-x-1/2 rounded-full bg-[#2b0d40] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" >
      You are Choosen One
      </div>
 
      {/* Top row */}
      <Link
        href="/dashboard/guest-pass"
        aria-label="Open guest pass"
        className="absolute left-4 top-[14px] z-20 text-white/80 transition hover:text-white"
      >
        <ArrowUpRight size={15} className="-scale-x-100" />
      </Link>
 
      <span className="absolute right-4 top-[16px] z-20 text-[9px] font-medium text-white/80">
        Guest Pass
      </span>
 
      {/* Title + status pill */}
   
      <div className="relative z-20 px-4 pt-14 text-center">
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-white">
          Free Guest Pass
        </h2>
 
        <span className="mt-2.5 inline-flex items-center rounded-full bg-[#B9D63B]/30 border border-[#B9D63B] px-4 py-1 text-[10px] font-bold text-[#B9D63B] ">
          {guestPass?.status === "AVAILABLE"
            ? "Available"
            : guestPass?.status === "RESERVED"
            ? "Reserved"
            : guestPass?.status === "USED"
            ? "Used"
            : "Not available"}
        </span>
      </div>
 
      {/* Circle glow behind image */}
      <div className="pointer-events-none absolute bottom-[100px] left-1/2 z-10 h-[190px] w-[190px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(185,214,59,0.35)_0%,rgba(185,214,59,0.08)_60%,transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-[104px] left-1/2 z-10 h-[160px] w-[160px] -translate-x-1/2 rounded-full bg-white/[0.08]" />
 
      {/* PNG sits just above the coupon */}
      <div className="absolute inset-x-0 bottom-[84px] z-10 h-[52%]">
        <Image
          src="/front.png"
          alt="Guest pass illustration"
          fill
          sizes="250px"
          className="object-contain object-bottom drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)]"
        />
      </div>
 
      {/* COUPON STUB */}
      <div className="absolute inset-x-3 bottom-3 z-20 flex h-[74px] items-stretch rounded-2xl bg-white/10 backdrop-blur-xs border border-white/50 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)]">
        {/* Left: label + code */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#e9e1f2]">
            Free pass coupon
          </p>
 
          <p className="mt-1 truncate font-mono text-[17px] font-extrabold tracking-[0.12em] text-[#fcf9ff]">
            {guestPass?.code || "NO CODE"}
          </p>
        </div>
 
        {/* Perforated divider with notches */}
        <div className="relative my-2 w-px border-l-2 border-dashed border-[#6a3f9e]/30">
          <span className="absolute -left-[9px] -top-[17px] h-[18px] w-[18px] rounded-full bg-[#4f2578]" />
          <span className="absolute -bottom-[17px] -left-[9px] h-[18px] w-[18px] rounded-full bg-[#4f2578]" />
        </div>
 
        {/* Right: QR action */}
        <Link
          href="/dashboard/guest-pass"
          aria-label="View guest pass"
          className="flex w-[64px] items-center justify-center"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6a3f9e]/60 text-white transition hover:bg-[#35104D]">
            <QrCode size={18} />
          </span>
        </Link>
      </div>
    </div>
  </div>
</section>
      </div>

      {/* =========================================
          RECENT REGISTRATIONS
      ========================================== */}

      <section className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B939E]">
              Activity
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#2D2631]">
              My registrations
            </h2>
          </div>

          <Link
            href="/dashboard/registrations"
            className="text-xs font-semibold text-[#4B176B] hover:underline"
          >
            View all
          </Link>
        </div>

        {registrations.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No registrations yet"
            description="Register for your first Purple experience."
            action={
              <Link
                href="/dashboard/events"
                className="text-xs font-bold text-[#4B176B]"
              >
                Explore events →
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <div
                key={registration._id.toString()}
                className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EAF4]">
                    <CalendarDays
                      size={19}
                      className="text-[#4B176B]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#302934]">
                      {registration.event?.name ||
                        "Purple Experience"}
                    </p>

                    <p className="mt-1 text-xs text-[#958D98]">
                      {registration.event?.location ||
                        "Location to be announced"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      registration.status ===
                      "ATTENDED"
                        ? "bg-[#EEF6DD] text-[#5B761E]"
                        : "bg-[#F0EAF4] text-[#4B176B]"
                    }`}
                  >
                    {registration.status}
                  </span>

                  <Link
                    href="/dashboard/registrations"
                    className="text-[#4B176B]"
                  >
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   STAT
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
      className="group rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-[#B9D63B]"
              : "bg-[#F0EAF4]"
          }`}
        >
          <Icon
            size={18}
            className={
              highlight
                ? "text-[#35104D]"
                : "text-[#4B176B]"
            }
          />
        </div>

        <ArrowRight
          size={16}
          className="text-[#C1BAC4] transition group-hover:translate-x-1 group-hover:text-[#4B176B]"
        />
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9A929D]">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-[#302934]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#9A929D]">
        {description}
      </p>
    </Link>
  );
}

/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({ event }) {
  const date = event.date
    ? new Date(event.date)
    : null;

  return (
    <Link
      href={`/dashboard/events/${event._id.toString()}`}
      className="group flex items-center gap-4 rounded-2xl border border-black/[0.05] p-4 transition hover:border-[#B9D63B] hover:bg-[#FBFDF4]"
    >
      <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#F0EAF4]">
        <span className="text-[10px] font-bold uppercase text-[#6B3FA0]">
          {date
            ? date.toLocaleDateString("en-IN", {
                month: "short",
              })
            : "TBA"}
        </span>

        <span className="text-xl font-bold leading-5 text-[#35104D]">
          {date ? date.getDate() : "--"}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#302934]">
          {event.name}
        </p>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {event.startTime && (
            <span className="flex items-center gap-1 text-[11px] text-[#958D98]">
              <Clock3 size={12} />
              {event.startTime}
            </span>
          )}

          {event.location && (
            <span className="flex items-center gap-1 text-[11px] text-[#958D98]">
              <MapPin size={12} />
              {event.location}
            </span>
          )}
        </div>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-[#B4ACB7] transition group-hover:translate-x-1 group-hover:text-[#4B176B]"
      />
    </Link>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EAF4]">
        <Icon
          size={20}
          className="text-[#4B176B]"
        />
      </div>

      <p className="mt-4 text-sm font-bold text-[#302934]">
        {title}
      </p>

      <p className="mt-1 max-w-[300px] text-xs leading-5 text-[#99919C]">
        {description}
      </p>

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}