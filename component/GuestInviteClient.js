"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserPlus,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

/* =========================================================
   THEME TOKENS
   page   #6a3f9e  (purple background)
   lime   #B9D63B  (primary action)
   ink    #120d1a  (image fade)
========================================================= */

// Liquid glass on the purple background
const GLASS =
  "border border-white/25 bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(40,15,70,0.25)]";

// Large glass panel
const GLASS_PANEL =
  "border border-white/25 bg-gradient-to-br from-white/[0.18] via-white/[0.07] to-white/[0.04] backdrop-blur-2xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_0_30px_rgba(255,255,255,0.05),0_30px_80px_rgba(40,15,70,0.45)]";

// Lime button
const LIME_BTN =
  "group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-5 py-4 text-sm font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.4)] transition duration-300 ease-out hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.55)] active:scale-[0.98]";

const SHINE =
  "pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70";

/* Shared page shell: purple background with soft light */
function Shell({ children, center = true }) {
  return (
    <main
      className={`relative isolate min-h-screen overflow-hidden bg-[#6a3f9e] px-4 py-8 font-sans sm:px-6 sm:py-12 ${
        center ? "flex items-center justify-center" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.22),transparent_38%),radial-gradient(circle_at_85%_90%,rgba(185,214,59,0.22),transparent_38%),linear-gradient(160deg,#7a4cb0_0%,#6a3f9e_45%,#5a2f8c_100%)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#B9D63B]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      {children}
    </main>
  );
}

export default function GuestInviteClient({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [invite, setInvite] = useState(null);
  const [event, setEvent] = useState(null);
  const [inviter, setInviter] = useState(null);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  async function loadInvitation() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/invite/${token}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "This invitation is not available.");
      }

      setInvite(data.invite);
      setEvent(data.event);
      setInviter(data.inviter);
    } catch (err) {
      console.error("LOAD INVITATION ERROR:", err);

      setError(err?.message || "Unable to load invitation.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <Shell>
        <div className="text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-[#E4F58C] ${GLASS}`}
          >
            <Loader2 size={24} className="animate-spin" />
          </div>

          <p className="mt-4 text-sm text-white/75">
            Loading your invitation...
          </p>
        </div>
      </Shell>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error) {
    return (
      <Shell>
        <div className={`w-full max-w-md rounded-[2rem] p-8 text-center ${GLASS_PANEL}`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/40 bg-red-500/20 text-red-100">
            <AlertCircle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Invitation unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">{error}</p>
        </div>
      </Shell>
    );
  }

  if (!event || !invite) {
    return null;
  }

  /* ---------------- ALREADY ACCEPTED ---------------- */

  if (invite.status === "REGISTERED" || invite.status === "ATTENDED") {
    return (
      <Shell>
        <div className={`w-full max-w-md rounded-[2rem] p-8 text-center ${GLASS_PANEL}`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[0_8px_24px_rgba(185,214,59,0.45)]">
            <CheckCircle2 size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Invitation already accepted
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            This invitation has already been registered. Please log in to your
            Purple account to view your experience.
          </p>

          <a href="/auth?mode=login" className={`mt-6 ${LIME_BTN}`}>
            <span className={SHINE} />
            <span className="relative">Login to Purple</span>
            <ArrowRight
              size={17}
              className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
            />
          </a>
        </div>
      </Shell>
    );
  }

  /* ---------------- INVITATION ---------------- */

  const d = event.date ? new Date(event.date) : null;
  const validDate = d && !Number.isNaN(d.getTime());

  const month = validDate
    ? d.toLocaleString("en-US", { month: "short" }).toUpperCase()
    : "";
  const day = validDate ? d.getDate() : "";
  const weekday = validDate
    ? d.toLocaleString("en-US", { weekday: "short" })
    : "";

  const inviterName = inviter?.name || "A Purple member";
  const inviterInitial = inviterName.trim().charAt(0).toUpperCase();

  return (
    <Shell>
      <div className="w-full max-w-5xl">
        {/* Brand */}
     

        {/* Card */}
        <div className={`grid gap-3 rounded-[2.25rem] p-3 md:grid-cols-[1fr_1.05fr] ${GLASS_PANEL}`}>
          {/* ---------- Poster ---------- */}
          <div className="relative min-h-[320px] overflow-hidden rounded-[1.75rem]  md:min-h-[520px]">
            <img
              src={"/join.png"}
              alt={event.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-35% via-[#6a3f9e]/70 via-70% to-[#6a3f9e]" />

            {/* Date badge */}
            {validDate && (
              <div
                className={`absolute left-4 top-4 w-14 overflow-hidden rounded-2xl text-center ${GLASS}`}
              >
                <div className="bg-[#B9D63B] py-1 text-[10px] font-bold tracking-wider text-[#1E2A00]">
                  {month}
                </div>
                <div className="pt-1 text-lg font-bold leading-none text-white">
                  {day}
                </div>
                <div className="pb-1.5 text-[10px] font-medium text-white/70">
                  {weekday}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span
                className={`relative mb-3 inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white ${GLASS}`}
              >
                <Sparkles size={12} className="text-[#B9D63B]" />
                Purple Experience
              </span>

              <h2 className="text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl">
                {event.name}
              </h2>
            </div>
          </div>

          {/* ---------- Content ---------- */}
          <div className="flex flex-col p-4 sm:p-6 lg:p-8">
            {/* Inviter */}
            <div className={`flex items-center gap-3 rounded-2xl p-3 ${GLASS}`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-base font-bold text-[#1E2A00] shadow-[0_6px_16px_rgba(185,214,59,0.4)]">
                {inviterInitial}
              </div>

              <div className="min-w-0">
                <p className="text-xs text-white/65">You've been invited by</p>

                <p className="truncate text-base font-bold text-white">
                  {inviterName}
                </p>
              </div>
            </div>

            <h1 className="mt-7 text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl">
              You're invited to experience Purple.
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Register to reserve your place and get your personal event QR.
            </p>

            {/* Details */}
            <div className="mt-6 space-y-2.5">
              <EventDetail icon={CalendarDays} text={formatDate(event.date)} />

              {event.startTime && (
                <EventDetail
                  icon={Clock3}
                  text={`${event.startTime}${
                    event.endTime ? ` - ${event.endTime}` : ""
                  }`}
                />
              )}

              {event.location && (
                <EventDetail icon={MapPin} text={event.location} />
              )}
            </div>

            {/* CTA */}
            <div className="mt-auto pt-8">
              <a href={`/invite/${token}/register`} className={LIME_BTN}>
                <span className={SHINE} />
                <span className="relative">Accept invitation</span>
                <ArrowRight
                  size={18}
                  className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
                />
              </a>

              <p className="mt-3 text-center text-[11px] leading-5 text-white/60">
                You'll create a Purple account using your mobile number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* =========================================================
   EVENT DETAIL ROW
========================================================= */

function EventDetail({ icon: Icon, text }) {
  if (!text) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] px-3.5 py-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00]">
        <Icon size={16} />
      </div>

      <span className="text-sm font-medium text-white/90">{text}</span>
    </div>
  );
}