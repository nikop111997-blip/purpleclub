"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Share,
  UserPlus,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  X,
  Filter,
  Crown,
  Link2,
} from "lucide-react";

const MEMBERSHIP_URL = "/dashboard/membership";

/* =========================================================
   THEME TOKENS
   lime   #B9D63B  (primary action)
   purple #6a3f9e  (brand)
   Light glass for the page, poster cards for events.
========================================================= */

const GLASS_LIGHT =
  "border border-white/70 bg-gradient-to-br from-white/75 via-white/45 to-white/30 backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_0_20px_rgba(255,255,255,0.25),0_12px_32px_-8px_rgba(106,63,158,0.15)]";

const GLASS_ROW =
  "border border-white/80 bg-white/55 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(106,63,158,0.05)] backdrop-blur-md";

// Glass on the dark poster cards
const GLASS =
  "border border-white/25 bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]";

const LIME_BTN =
  "group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/40 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] py-3 text-sm font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.35)] transition duration-300 ease-out hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

const SHINE =
  "pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70";

const FIELD =
  "h-10 w-full rounded-xl border border-white/80 bg-white/60 px-3 text-sm text-[#24112f] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] outline-none transition focus:border-[#6a3f9e]/50 focus:bg-white/80 focus:ring-4 focus:ring-[#6a3f9e]/10";

// Dark glass input for the invite popup
const DARK_INPUT =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] outline-none transition placeholder:text-white/35 focus:border-[#B9D63B]/70 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#B9D63B]/10";

function parseDay(value) {
  if (!value) return null;

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDay(value);

  if (!date) return "";

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventsClient({
  events = [],
  hasActiveMembership = false,
  membershipPlan = "",
  membershipEndDate = null,
  membershipPurchaseUrl = MEMBERSHIP_URL,
}) {
  const [clubFilter, setClubFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [inviteEvent, setInviteEvent] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestMobile, setGuestMobile] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteResult, setInviteResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  // The portal needs the browser's document, so wait until mounted.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // While the popup is open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!inviteEvent) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e) {
      if (e.key === "Escape" && !inviteLoading) {
        setInviteEvent(null);
        setInviteError("");
        setInviteResult(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inviteEvent, inviteLoading]);

  const clubs = useMemo(() => {
    const map = new Map();

    events.forEach((event) => {
      if (event.clubId && event.clubName) {
        map.set(event.clubId, event.clubName);
      }
    });

    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [events]);

  const cities = useMemo(
    () =>
      [...new Set(events.map((event) => event.city).filter(Boolean))].sort(),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (clubFilter !== "all" && event.clubId !== clubFilter) {
        return false;
      }

      if (cityFilter !== "all" && event.city !== cityFilter) {
        return false;
      }

      const date = String(event.date || "").slice(0, 10);

      if (dateFrom && date < dateFrom) return false;
      if (dateTo && date > dateTo) return false;

      return true;
    });
  }, [events, clubFilter, cityFilter, dateFrom, dateTo]);

  const hasFilters =
    clubFilter !== "all" || cityFilter !== "all" || dateFrom || dateTo;

  function resetFilters() {
    setClubFilter("all");
    setCityFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  async function handleShare(event) {
    const url = `${window.location.origin}/dashboard/events/${event.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: `Check out ${event.name} at Purple Club.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Event link copied");
        setTimeout(() => setToast(""), 2000);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("SHARE ERROR:", error);
      }
    }
  }

  function openInvite(event) {
    setInviteEvent(event);
    setGuestName("");
    setGuestMobile("");
    setInviteError("");
    setInviteResult(null);
    setCopied(false);
  }

  function closeInvite() {
    if (inviteLoading) return;

    setInviteEvent(null);
    setInviteError("");
    setInviteResult(null);
  }

  async function handleCreateInvite(e) {
    e.preventDefault();

    if (!inviteEvent) return;

    const name = guestName.trim();
    const mobile = guestMobile.replace(/\D/g, "").slice(0, 10);

    setInviteError("");
    setInviteResult(null);

    if (!name) {
      setInviteError("Please enter your guest's name.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setInviteError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setInviteLoading(true);

      const response = await fetch("/api/auth/user/guest-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventId: inviteEvent.id,
          guestName: name,
          guestMobile: mobile,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Unable to create invitation."
        );
      }

      setInviteResult(data.invite);
    } catch (error) {
      setInviteError(error.message || "Unable to create invitation.");
    } finally {
      setInviteLoading(false);
    }
  }

  async function copyInvite() {
    if (!inviteResult?.inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteResult.inviteUrl);
      setCopied(true);
    } catch {
      setInviteError("Unable to copy the invitation link.");
    }
  }

  function shareInviteWhatsApp() {
    if (!inviteResult?.inviteUrl) return;

    const message = [
      `Hey ${inviteResult.guestName}! 💜`,
      `I'd love to invite you to ${inviteEvent.name}.`,
      `📅 ${formatDate(inviteEvent.date)}`,
      inviteEvent.location ? `📍 ${inviteEvent.location}` : "",
      `Accept your invitation: ${inviteResult.inviteUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    const mobile = String(inviteResult.guestMobile || guestMobile).replace(
      /\D/g,
      ""
    );

    const url =
      mobile.length === 10
        ? `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="relative isolate font-sans">
      {/* ================= HEADER + MEMBERSHIP ================= */}

      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <header className="mb-5 flex items-center gap-3">
          <img
            src="/calender.png"
            alt="Purple Club"
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a0f24] sm:text-3xl">
              Upcoming events
            </h1>

            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Find your next Purple experience by club, city or date.
            </p>
          </div>
        </header>

        <section className="mb-4 flex flex-col gap-3 rounded-3xl p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#24112f]">
                {hasActiveMembership
                  ? "Your membership is active"
                  : "Membership required to participate"}
              </h2>

              <p className="truncate text-xs text-[#6f6577]">
                {hasActiveMembership
                  ? `Use your Member QR at check-in${
                      membershipPlan ? ` · ${membershipPlan}` : ""
                    }${
                      membershipEndDate
                        ? ` · Valid until ${new Date(
                            membershipEndDate
                          ).toLocaleDateString("en-IN")}`
                        : ""
                    }`
                  : "Buy or renew your membership to access Purple experiences."}
              </p>
            </div>
          </div>

          {!hasActiveMembership && (
            <Link
              href={membershipPurchaseUrl}
              className={`${LIME_BTN} !w-auto shrink-0 px-5`}
            >
              <span className={SHINE} />
              <span className="relative">Buy membership</span>
            </Link>
          )}
        </section>
      </div>

      {/* ================= FILTERS ================= */}

      <section className="mb-6 rounded-3xl p-3.5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <div className="grid flex-1 grid-cols-2 gap-2.5 xl:grid-cols-4">
            <FilterField label="Club">
              <select
                value={clubFilter}
                onChange={(e) => setClubFilter(e.target.value)}
                className={FIELD}
              >
                <option value="all">All clubs</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="City">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className={FIELD}
              >
                <option value="all">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="From">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={FIELD}
              />
            </FilterField>

            <FilterField label="To">
              <input
                type="date"
                min={dateFrom || undefined}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={FIELD}
              />
            </FilterField>
          </div>

          <div className="flex items-center justify-between gap-3 xl:justify-end">
            <p className="flex items-center gap-1.5 text-xs text-[#6f6577]">
              <Filter size={13} className="text-[#6a3f9e]" />
              {filteredEvents.length} of {events.length}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold text-[#4B176B] transition hover:bg-white/80 ${GLASS_ROW}`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ================= EVENT CARDS ================= */}

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-[#6a3f9e]/25 bg-white/40 p-10 text-center backdrop-blur-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 text-[#4B176B] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            <CalendarDays size={26} />
          </div>

          <h2 className="mt-4 font-bold text-[#24112f]">
            No matching experiences
          </h2>

          <p className="mt-1 text-sm text-[#6f6577]">
            Try changing the club, city or date filters.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className={`${LIME_BTN} mt-4 !w-auto px-6`}
          >
            <span className={SHINE} />
            <span className="relative">Clear filters</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filteredEvents.map((event) => {
            const d = parseDay(event.date);

            return (
              <article
                key={event.id}
                className="group relative flex min-h-[430px] flex-col justify-end overflow-hidden rounded-[2rem] bg-black shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
              >
                {/* Image with its own fade to black */}
                <div className="absolute inset-x-0 top-0 h-[290px] overflow-hidden">
                  <img
                    src={event.image || "/cheer.png"}
                    alt={event.name}
                    className="h-full w-full scale-105 object-cover blur-[2px] transition duration-500 group-hover:scale-110 group-hover:blur-0"
                  />

                  <div className="absolute inset-0 bg-gradient-to-br from-[#6a3f9e]/30 via-transparent to-pink-300/20 mix-blend-soft-light" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent from-25% via-black/70 via-70% to-black" />
                </div>

                {/* Date badge */}
                {d && (
                  <div
                    className={`absolute left-4 top-4 w-14 overflow-hidden rounded-2xl text-center ${GLASS}`}
                  >
                    <div className="bg-[#B9D63B] py-1 text-[10px] font-bold tracking-wider text-[#1E2A00]">
                      {d
                        .toLocaleString("en-US", { month: "short" })
                        .toUpperCase()}
                    </div>
                    <div className="pt-1 text-lg font-bold leading-none text-white">
                      {d.getDate()}
                    </div>
                    <div className="pb-1.5 text-[10px] font-medium text-white/70">
                      {d.toLocaleString("en-US", { weekday: "short" })}
                    </div>
                  </div>
                )}

                {/* Share */}
                <button
                  type="button"
                  onClick={() => handleShare(event)}
                  aria-label={`Share ${event.name}`}
                  className={`absolute right-4 top-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.1rem] text-white transition duration-300 hover:scale-105 active:scale-95 ${GLASS}`}
                >
                  <span className="pointer-events-none absolute inset-x-1.5 top-0.5 h-1/2 rounded-t-[0.9rem] bg-gradient-to-b from-white/50 to-transparent opacity-60" />
                  <Share size={18} className="relative" />
                </button>

                {/* Content */}
                <div className="relative p-5 pt-40">
                  {(event.clubName || event.city) && (
                    <span
                      className={`relative mb-2.5 inline-flex max-w-full items-center overflow-hidden rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ${GLASS}`}
                    >
                      <span className="pointer-events-none absolute inset-x-1 top-px h-1/2 rounded-t-full bg-gradient-to-b from-[#B9D63B]/50 to-transparent opacity-60" />
                      <span className="relative truncate">
                        {event.clubName}
                        {event.city ? ` · ${event.city}` : ""}
                      </span>
                    </span>
                  )}

                  <h2 className="line-clamp-2 text-2xl font-bold leading-[1.1] text-white">
                    {event.name}
                  </h2>

                  {event.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/60">
                      {event.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/70">
                    {event.startTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock3 size={13} className="text-white/50" />
                        {event.startTime}
                        {event.endTime ? ` – ${event.endTime}` : ""}
                      </span>
                    )}

                    {event.location && (
                      <span className="flex min-w-0 items-center gap-1.5">
                        <MapPin size={13} className="shrink-0 text-white/50" />
                        <span className="line-clamp-1">{event.location}</span>
                      </span>
                    )}

                    {event.capacity > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Users size={13} className="text-white/50" />
                        {event.capacity}
                      </span>
                    )}
                  </div>

                  {/* No event registration action: the member uses their
                      permanent QR, and membership is checked at check-in. */}
                  <div className="mt-4 flex gap-2">
                    {hasActiveMembership ? (
                      <div className="relative flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-[#B9D63B]/50 bg-gradient-to-br from-[#B9D63B]/40 via-[#B9D63B]/15 to-[#B9D63B]/10 px-3 py-3 text-xs font-semibold text-[#DDF27A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_0_12px_rgba(185,214,59,0.2)] backdrop-blur-xl">
                        <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/30 to-transparent opacity-60" />
                        <CheckCircle2 size={15} className="relative shrink-0" />
                        <span className="relative truncate">
                          Use your Member QR
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={membershipPurchaseUrl}
                        className={`${LIME_BTN} min-w-0 flex-1 !py-3 text-xs`}
                      >
                        <span className={SHINE} />
                        <span className="relative truncate">
                          Buy membership
                        </span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => openInvite(event)}
                      className={`relative flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full px-4 py-3 text-xs font-semibold text-white transition hover:brightness-125 active:scale-[0.98] ${GLASS}`}
                    >
                      <UserPlus size={15} className="text-[#B9D63B]" />
                      Invite
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ================= TOAST (portal) ================= */}

      {mounted &&
        toast &&
        createPortal(
          <div
            className={`fixed bottom-5 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm font-medium text-white ${GLASS} bg-black/60`}
          >
            <Link2 size={15} className="text-[#B9D63B]" />
            {toast}
          </div>,
          document.body
        )}

      {/* ================= GUEST INVITATION POPUP (dark, portal) =================
          Rendered into document.body so it always sits above the sidebar and
          any parent stacking context. */}

      {mounted &&
        inviteEvent &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Guest invitation"
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 font-sans backdrop-blur-md"
            onClick={closeInvite}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/10 bg-[#120d1a] text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeInvite}
                disabled={inviteLoading}
                aria-label="Close invitation"
                className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95 disabled:opacity-50 ${GLASS}`}
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="relative overflow-hidden p-6 pb-5">
                <div className="pointer-events-none absolute -left-10 -top-16 h-52 w-52 rounded-full bg-[#6a3f9e]/70 blur-3xl" />
                <div className="pointer-events-none absolute -right-12 top-4 h-40 w-40 rounded-full bg-[#B9D63B]/20 blur-3xl" />

                <div className="relative">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-white ${GLASS}`}
                  >
                    Guest invitation
                  </span>

                  <h2 className="mt-4 pr-12 text-2xl font-bold leading-[1.05] tracking-tight">
                    Invite someone to Purple
                  </h2>

                  <p className="mt-2 text-sm text-white/60">
                    {inviteEvent.name} · {formatDate(inviteEvent.date)}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6">
                {!inviteResult ? (
                  <form onSubmit={handleCreateInvite} className="space-y-4">
                    <label className="block text-xs font-semibold text-white/60">
                      Guest name
                      <input
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter guest name"
                        className={`${DARK_INPUT} mt-1.5`}
                      />
                    </label>

                    <label className="block text-xs font-semibold text-white/60">
                      Guest mobile number
                      <div className="mt-1.5 flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] focus-within:border-[#B9D63B]/70 focus-within:ring-4 focus-within:ring-[#B9D63B]/10">
                        <span className="flex items-center border-r border-white/10 px-4 text-sm font-semibold text-[#B9D63B]">
                          +91
                        </span>

                        <input
                          required
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={guestMobile}
                          onChange={(e) =>
                            setGuestMobile(
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          placeholder="10-digit number"
                          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35"
                        />
                      </div>
                    </label>

                    <p className="text-[11px] leading-5 text-white/45">
                      Existing members cannot be invited as new guests.
                      Duplicate invitations for the same event will be blocked.
                    </p>

                    {inviteError && (
                      <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                        {inviteError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className={LIME_BTN}
                    >
                      <span className={SHINE} />

                      {inviteLoading ? (
                        <>
                          <Loader2
                            size={17}
                            className="relative animate-spin"
                          />
                          <span className="relative">
                            Checking number and creating invite...
                          </span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={17} className="relative" />
                          <span className="relative">
                            Create guest invitation
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-3xl border border-[#B9D63B]/30 bg-gradient-to-br from-[#B9D63B]/20 via-[#B9D63B]/[0.06] to-transparent p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <p className="flex items-center gap-2 text-sm font-bold text-[#DDF27A]">
                        <CheckCircle2 size={17} />
                        Invitation created
                      </p>

                      <p className="mt-2 break-all text-xs text-white/75">
                        {inviteResult.inviteUrl}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={copyInvite}
                      className={`relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3 text-sm font-semibold text-white transition hover:brightness-125 active:scale-[0.98] ${GLASS}`}
                    >
                      {copied ? (
                        <Check size={16} className="text-[#B9D63B]" />
                      ) : (
                        <Copy size={16} />
                      )}
                      {copied ? "Copied" : "Copy invitation link"}
                    </button>

                    <button
                      type="button"
                      onClick={shareInviteWhatsApp}
                      className={LIME_BTN}
                    >
                      <span className={SHINE} />
                      <span className="relative">Share on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={closeInvite}
                      className="w-full rounded-full py-2.5 text-sm font-medium text-white/60 transition hover:text-white"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}

function FilterField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-[#6f6577]">
        {label}
      </span>

      {children}
    </label>
  );
}