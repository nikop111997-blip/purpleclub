"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Trophy,
  Users,
  Loader2,
  Sparkles,
  VerifiedIcon,
} from "lucide-react";

/* =========================================================
   THEME TOKENS
   lime   #B9D63B  (banner / highlight)
   purple #6a3f9e  (brand)
   ink    #120d1a  (avatar + status pill)
========================================================= */

// Light liquid glass (panels)
const GLASS_LIGHT =
  "border border-white/70 bg-gradient-to-br from-white/75 via-white/45 to-white/30 backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_0_20px_rgba(255,255,255,0.25),0_12px_32px_-8px_rgba(106,63,158,0.15)]";

// Glass on the lime banner
const GLASS_ON_LIME =
  "border border-white/60 bg-gradient-to-br from-white/60 via-white/25 to-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_6px_18px_rgba(88,112,0,0.15)]";

// Tinted purple icon tile
const ICON_TILE =
  "flex shrink-0 items-center justify-center rounded-xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 text-[#4B176B] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]";

function formatDate(date) {
  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function AttendanceClient() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    attended: 0,
    reserved: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/user/attendance", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load attendance");
      }

      setAttendance(data.history || []);

      setSummary({
        total: data.summary?.total || 0,
        attended: data.summary?.attended || 0,
        reserved: data.summary?.reserved || 0,
      });
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to load attendance");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#6a3f9e]" />
          <span>Loading attendance...</span>
        </div>
      </div>
    );
  }

  const progress = summary.total
    ? Math.min(100, (summary.attended / summary.total) * 100)
    : 0;

  return (
    <main className="relative isolate min-h-screen  px-4 py-6 font-sans sm:px-6 lg:px-8">
  
      <div className="">
        {/* ================= HEADER ================= */}

        <header className="mb-8">
        

          <h1 className="mt-0 text-4xl font-bold leading-[1.05] tracking-tight text-[#1a0f24] sm:text-3xl">
            Attendance
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Keep track of your Purple experiences and attendance.
          </p>
        </header>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md">
            {error}
          </div>
        )}

        {/* ================= SUMMARY ================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Total experiences"
            value={summary.total}
          />

          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Attended"
            value={summary.attended}
            highlight
          />

          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Reserved"
            value={summary.reserved}
          />
        </div>

        {/* ================= PROGRESS ================= */}

        {summary.total > 0 && (
          <div className={`mt-5 rounded-[2rem] p-5 sm:p-6 ${GLASS_LIGHT}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#24112f]">
                  Experience progress
                </h2>

                <p className="mt-1 text-sm text-[#6f6577]">
                  {summary.attended} of {summary.total} experiences attended
                </p>
              </div>

              <div className={`h-11 w-11 ${ICON_TILE}`}>
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            {/* Glass track + lime fill */}
            <div className="h-3 overflow-hidden rounded-full border border-white/80 bg-white/50 p-[2px] shadow-[inset_0_1px_2px_rgba(106,63,158,0.15)]">
              <div
                className="relative h-full min-w-[8px] overflow-hidden rounded-full bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] shadow-[0_0_14px_rgba(185,214,59,0.7)] transition-all duration-700"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute inset-x-1 top-0 h-1/2 rounded-full bg-gradient-to-b from-white/70 to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* ================= ATTENDANCE ================= */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-[#24112f]">
              Your attendance
            </h2>

            <p className="mt-1 text-sm text-[#6f6577]">
              Your Purple experience history
            </p>
          </div>

          {attendance.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {attendance.map((item) => (
                <AttendanceCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ icon, title, value, highlight = false }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl p-5 ${GLASS_LIGHT}`}>
      {highlight && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-xl bg-[#B9D63B]/40 blur-2xl" />
      )}

      <div className="relative flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
            highlight
              ? "border-white/60 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_6px_16px_rgba(185,214,59,0.4)]"
              : "border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 text-[#4B176B] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
          }`}
        >
          {icon}
        </div>

        <span className="text-3xl font-bold text-[#24112f]">{value}</span>
      </div>

      <p className="relative mt-4 text-sm font-semibold text-[#6f6577]">
        {title}
      </p>
    </div>
  );
}


function AttendanceCard({ item }) {
  const attended = item.status === "Attended";
  const isGuest = item.type === "Guest";
  const guest = item.guest;

  return (
    <article
      className="
        group relative h-fit self-start overflow-hidden
        rounded-[1.25rem]
        border border-white/80
        bg-white/70
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_16px_40px_-12px_rgba(106,63,158,0.25)]
        backdrop-blur-xl
        transition duration-300
        hover:-translate-y-1
        hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_24px_50px_-12px_rgba(106,63,158,0.35)]
      "
    >
      {/* =========================
          TOP LIME BANNER
      ========================== */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#CBE75A] via-[#B9D63B] to-[#A9C92E] px-5 pt-5">
        {/* Glow */}
        <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-white/40 blur-2xl" />

        {/* Decorative lines */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 130"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d="M 230 -10 C 260 40 300 60 420 70"
            fill="none"
            stroke="#1E2A00"
            strokeOpacity="0.14"
            strokeWidth="1.2"
          />

          <path
            d="M 270 -10 C 300 30 340 45 420 52"
            fill="none"
            stroke="#1E2A00"
            strokeOpacity="0.1"
            strokeWidth="1.2"
          />
        </svg>

        {/* Heading */}
        <h3 className="relative max-w-[72%] text-[22px] font-extrabold leading-[1.05] tracking-tight text-[#14200a]">
          {isGuest
            ? attended
              ? "Your guest were there."
              : "Your guest spot is saved."
            : attended
            ? "You were there."
            : "Your spot is saved."}
        </h3>

        {/* Date */}
        <span
          className="
            absolute right-4 top-4
            inline-flex items-center gap-1.5
            rounded-full
            px-3 py-1.5
            text-[11px]
            font-semibold
            text-[#1E2A00]
          "
        >
          <CalendarDays size={12} />

          {formatDate(item.eventDate)}
        </span>
      </div>

      {/* =========================
          AVATAR / ICON
      ========================== */}
      <div className="relative px-5">
        <div
          className="
            -mt-9
            flex h-[72px] w-[72px]
            items-center justify-center
            rounded-full
            bg-[#7144b9]
            text-[#f8faf1]
            shadow-[0_10px_24px_rgba(18,13,26,0.35)]
            ring-2 ring-white
          "
        >
          {attended ? (
            <VerifiedIcon size={30} />
          ) : (
            <Users size={28} />
          )}
        </div>
      </div>

      {/* =========================
          CARD CONTENT
      ========================== */}
      <div className="px-5 pb-5 pt-3">
        {/* Event heading + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-xl font-bold tracking-tight text-[#24112f]">
              {item.eventName}
            </h4>

            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8a8190]">
              <Sparkles
                size={12}
                className="text-[#6a3f9e]"
              />

              {item.type}
            </p>
          </div>

          {/* Status */}
          <span
            className="
              relative inline-flex shrink-0
              items-center gap-2
              overflow-hidden
              rounded-full
              border border-white/10
              bg-[#120d1a]
              px-4 py-2
              text-xs font-semibold
              text-white
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_16px_rgba(18,13,26,0.3)]
            "
          >
            <span
              className="
                pointer-events-none absolute
                inset-x-3 top-px
                h-1/2
                rounded-t-full
                bg-gradient-to-b
                from-white/25
                to-transparent
              "
            />

            <span
              className={`
                relative h-1.5 w-1.5 rounded-full
                ${
                  attended
                    ? "bg-[#B9D63B] shadow-[0_0_8px_#B9D63B]"
                    : "bg-[#b58be6] shadow-[0_0_8px_#b58be6]"
                }
              `}
            />

            <span className="relative">
              {item.status}
            </span>
          </span>
        </div>

        {/* =========================
            DESCRIPTION
        ========================== */}
        <p className="mt-4 text-sm leading-6 text-[#4a4150]">
          {isGuest
            ? attended
              ? "You attended this Purple experience with your guest."
              : "Your registration is confirmed. Your guest is included in this experience."
            : attended && item.attendedAt
            ? `Checked in ${formatDateTime(item.attendedAt)}.`
            : item.status === "Registered"
            ? "Registration confirmed. See you at the experience."
            : "Your Purple experience."}
        </p>

        {/* =========================
            GUEST DETAILS
        ========================== */}
        {isGuest && guest && (
          <div
            className="
              mt-5
              overflow-hidden
              rounded-2xl
              border border-[#6a3f9e]/10
              bg-gradient-to-br
              from-[#faf7fd]
              via-white
              to-[#f5effa]
            "
          >
            {/* Guest header */}
            <div
              className="
                flex items-center gap-3
                border-b border-[#6a3f9e]/10
                px-4 py-3
              "
            >
              <div
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-[#6a3f9e]/10
                "
              >
                <Users
                  size={17}
                  className="text-[#6a3f9e]"
                />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-[#8a8190]
                  "
                >
                  Guest details
                </p>

                <p className="text-sm font-bold text-[#24112f]">
                  Your guest
                </p>
              </div>
            </div>

            {/* Guest information */}
            <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2">
              {/* Name */}
              <div>
                <p className="text-[11px] font-medium text-[#8a8190]">
                  Name
                </p>

                <p className="mt-1 text-sm font-bold text-[#24112f]">
                  {guest.name || "Not provided"}
                </p>
              </div>

              {/* Mobile */}
              <div>
                <p className="text-[11px] font-medium text-[#8a8190]">
                  Mobile
                </p>

                <p className="mt-1 text-sm font-bold text-[#24112f]">
                  {guest.mobile || "Not provided"}
                </p>
              </div>

              {/* Guest status */}
              {guest.status && (
                <div className="sm:col-span-2">
                  <p className="text-[11px] font-medium text-[#8a8190]">
                    Guest status
                  </p>

                  <div
                    className="
                      mt-1
                      inline-flex items-center gap-2
                      rounded-full
                      bg-[#B9D63B]/20
                      px-3 py-1.5
                      text-xs
                      font-semibold
                      text-[#425000]
                    "
                  >
                    <span
                      className="
                        h-1.5 w-1.5
                        rounded-full
                        bg-[#8ca900]
                      "
                    />

                    {guest.status === "ATTENDED"
                      ? "Guest attended"
                      : guest.status === "RESERVED"
                      ? "Guest reserved"
                      : guest.status}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================
            BOTTOM STATS
        ========================== */}
        <div
          className="
            mt-4
            flex flex-wrap
            items-center
            gap-x-5
            gap-y-2
            border-t
            border-[#6a3f9e]/10
            pt-4
            text-xs
            text-[#6f6577]
          "
        >
          {/* Date */}
          <span className="flex items-center gap-1.5">
            <CalendarDays
              size={14}
              className="text-[#6a3f9e]"
            />

            {formatDate(item.eventDate)}
          </span>

          {/* Location */}
          {item.location && (
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin
                size={14}
                className="shrink-0 text-[#6a3f9e]"
              />

              <span className="truncate">
                {item.location}
              </span>
            </span>
          )}

          {/* Reserved */}
          {!attended && item.status === "Registered" && (
            <span className="flex items-center gap-1.5">
              <Clock3
                size={14}
                className="text-[#6a3f9e]"
              />

              Reserved
            </span>
          )}
        </div>
      </div>
    </article>
  );
}


function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#6a3f9e]/25 bg-white/40 px-6 py-14 text-center backdrop-blur-md">
      <div className={`h-14 w-14 rounded-2xl ${ICON_TILE}`}>
        <CalendarDays className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-bold text-[#24112f]">No attendance yet</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-[#6f6577]">
        Your Purple experiences will appear here once you register for an
        event.
      </p>
    </div>
  );
}