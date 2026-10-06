"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Ticket,
  ArrowRight,
  X,
  UserRound,
  UserPlus,
  CheckCircle2,
  Loader2,
  Share,
  Merge as MergeIcon,
  Link2,
} from "lucide-react";

/* =========================================================
   THEME TOKENS
   lime   #B9D63B  (primary action)
   purple #6a3f9e  (atmosphere)
   ink    #120d1a  (dark surfaces)
========================================================= */

const FALLBACK_IMAGE = "/cheer.png"; // place cheer.png inside /public

// Reusable liquid-glass surface
const GLASS =
  "border border-white/25 bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]";

// Dark glass for panels / inputs inside the modal
const GLASS_DARK =
  "border border-white/10 bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]";

// Solid lime primary button
const LIME_BTN =
  "group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/40 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] py-3.5 text-sm font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.35)] transition duration-300 ease-out hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

// Purple primary button (used when registering with the free pass)
const PURPLE_BTN =
  "group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/30 bg-gradient-to-b from-[#8a5cc4] to-[#6a3f9e] py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(40,15,70,0.35),0_8px_24px_rgba(106,63,158,0.4)] transition duration-300 ease-out hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   REGISTRATION HELPERS
========================================================= */

const forEvent = (registrations, eventId) =>
  registrations.filter((r) => r.eventId === eventId);

const getMembershipRegistration = (registrations, eventId) =>
  registrations.find((r) => r.eventId === eventId && r.passUsage === null);

const getGuestRegistration = (registrations, eventId) =>
  registrations.find((r) => r.eventId === eventId && r.passUsage === "GUEST");

const getSelfPassRegistration = (registrations, eventId) =>
  registrations.find((r) => r.eventId === eventId && r.passUsage === "SELF");

/* =========================================================
   PAGE
========================================================= */

export default function EventsClient({
  events = [],
  registrations = [],
  guestPass = null,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [useGuestPass, setUseGuestPass] = useState(false);
  const [passFor, setPassFor] = useState("guest");

  const [guestName, setGuestName] = useState("");
  const [guestMobile, setGuestMobile] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const availableGuestPass = guestPass?.status === "AVAILABLE";

  function resetForm() {
    setUseGuestPass(false);
    setPassFor("guest");
    setGuestName("");
    setGuestMobile("");
    setError("");
    setSuccess("");
  }

  function openRegistration(event) {
    setSelectedEvent(event);
    resetForm();
  }

  function closeRegistration() {
    if (loading) return;

    setSelectedEvent(null);
    resetForm();
  }

  const selectedState = useMemo(() => {
    if (!selectedEvent) return { membership: null, guest: null, selfPass: null };

    return {
      membership: getMembershipRegistration(registrations, selectedEvent.id),
      guest: getGuestRegistration(registrations, selectedEvent.id),
      selfPass: getSelfPassRegistration(registrations, selectedEvent.id),
    };
  }, [registrations, selectedEvent]);

  async function handleShare(event) {
    const url = `${window.location.origin}/dashboard/events/${event.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: `Join me for ${event.name}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Link copied");
        setTimeout(() => setToast(""), 2000);
      }
    } catch (err) {
      if (err?.name !== "AbortError") console.error("SHARE ERROR:", err);
    }
  }

  async function handleRegister() {
    if (!selectedEvent) return;

    setError("");
    setSuccess("");

    // ---- Guest pass validation ----
    if (useGuestPass) {
      if (!availableGuestPass) {
        setError("Your free guest pass is not available.");
        return;
      }

      if (!["guest", "self"].includes(passFor)) {
        setError("Please select how you want to use the free pass.");
        return;
      }

      if (passFor === "guest") {
        if (!guestName.trim()) {
          setError("Please enter the guest name.");
          return;
        }

        if (!/^[0-9]{10}$/.test(guestMobile.trim())) {
          setError("Please enter a valid 10 digit mobile number.");
          return;
        }
      }
    }

    // ---- Duplicate protection ----
    if (!useGuestPass && selectedState.membership) {
      setError("You are already registered using your membership for this event.");
      return;
    }

    if (useGuestPass && passFor === "guest" && selectedState.guest) {
      setError("You have already registered a guest for this event.");
      return;
    }

    if (useGuestPass && passFor === "self" && selectedState.selfPass) {
      setError(
        "You have already registered yourself using the free pass for this event."
      );
      return;
    }

    // ---- API ----
    try {
      setLoading(true);

      const response = await fetch(`/api/events/${selectedEvent.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          useGuestPass,
          passFor: useGuestPass ? passFor.toUpperCase() : null,
          guest:
            useGuestPass && passFor === "guest"
              ? { name: guestName.trim(), mobile: guestMobile.trim() }
              : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to register for this event.");
      }

      setSuccess(data?.message || "Your registration is confirmed.");

      // Reload so the server data shows the new registration
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error("EVENT REGISTRATION ERROR:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const submitDisabled =
    loading ||
    (!useGuestPass && Boolean(selectedState.membership)) ||
    (useGuestPass && !availableGuestPass) ||
    (useGuestPass && passFor === "guest" && Boolean(selectedState.guest)) ||
    (useGuestPass && passFor === "self" && Boolean(selectedState.selfPass));

  return (
    <>
      {/* ================= HEADER ================= */}

      <header className="mb-10 flex items-center font-sans">
        <img
          src="/calender.png"
          alt="Purple Club"
          width={120}
          height={50}
          className="mr-4 rounded-full"
        />

        <div>
          <h1 className="text-2xl font-bold leading-[1.05] tracking-tight text-[#1a0f24] sm:text-4xl">
            Upcoming events
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Join our Sunday experiences, meet the community and make
            your Purple journey memorable.
          </p>

          {guestPass && (
            <span
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                availableGuestPass
                  ? "bg-[#B9D63B]/25 text-[#4d6000]"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <Ticket size={14} />
              Free guest pass: {availableGuestPass ? "Available" : "Used"}
            </span>
          )}
        </div>
      </header>

      {/* ================= EVENTS ================= */}

      {events.length === 0 ? (
        <div className="relative overflow-hidden rounded-[2rem] bg-[#120d1a] p-12 text-center font-sans shadow-xl">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#6a3f9e]/60 blur-3xl" />

          <div
            className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-[#B9D63B] ${GLASS}`}
          >
            <CalendarDays size={28} />
          </div>

          <h2 className="relative mt-5 text-xl font-bold text-white">
            No upcoming events
          </h2>

          <p className="relative mx-auto mt-2 max-w-md text-sm text-white/60">
            There are no published Purple experiences right now.
            Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              membership={getMembershipRegistration(registrations, event.id)}
              guest={getGuestRegistration(registrations, event.id)}
              selfPass={getSelfPassRegistration(registrations, event.id)}
              onRegister={() => openRegistration(event)}
              onShare={() => handleShare(event)}
            />
          ))}
        </div>
      )}

      {/* ================= TOAST ================= */}

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2.5 font-sans text-sm font-medium text-white ${GLASS} bg-black/60`}
        >
          <Link2 size={15} className="text-[#B9D63B]" />
          {toast}
        </div>
      )}

      {/* ================= REGISTRATION MODAL ================= */}

      {selectedEvent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 font-sans backdrop-blur-md"
          onClick={closeRegistration}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/10 bg-[#120d1a] text-white shadow-2xl"
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeRegistration}
              disabled={loading}
              aria-label="Close"
              className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95 disabled:opacity-50 ${GLASS}`}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="relative overflow-hidden p-6 pb-7">
              <div className="pointer-events-none absolute -left-10 -top-16 h-52 w-52 rounded-full bg-[#6a3f9e]/70 blur-3xl" />
              <div className="pointer-events-none absolute -right-12 top-4 h-40 w-40 rounded-full bg-[#B9D63B]/20 blur-3xl" />

              <div className="relative">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-white ${GLASS}`}
                >
                  Register
                </span>

                <h2 className="mt-4 pr-12 text-2xl font-bold leading-[1.05] tracking-tight">
                  {selectedEvent.name}
                </h2>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-white/50" />
                    {formatDate(selectedEvent.date)}
                  </span>

                  {selectedEvent.startTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={14} className="text-white/50" />
                      {selectedEvent.startTime}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 pb-6">
              {success ? (
                <div className="py-8 text-center">
                  <img
                    src="/cheering.png"
                    alt="Purple Club"
                    width={108}
                    height={96}
                    className="mx-auto"
                  />

                  <h3 className="mt-5 text-xl font-bold">You're in</h3>

                  <p className="mt-2 text-sm text-white/60">{success}</p>
                </div>
              ) : (
                <>
                  {/* Event details */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoBox
                      icon={MapPin}
                      label="Location"
                      value={selectedEvent.location || "TBA"}
                    />
                    <InfoBox
                      icon={Users}
                      label="Capacity"
                      value={
                        selectedEvent.capacity
                          ? `${selectedEvent.capacity} people`
                          : "Limited seats"
                      }
                    />
                  </div>

                  {/* Existing registrations */}
                  {(selectedState.membership ||
                    selectedState.guest ||
                    selectedState.selfPass) && (
                    <div
                      className={`space-y-2 rounded-2xl p-4 ${GLASS_DARK}`}
                    >
                      <p className="text-xs font-semibold text-[#DDF27A]">
                        Your registrations
                      </p>

                      {selectedState.membership && (
                        <InfoLine icon={CheckCircle2}>
                          You are registered through membership.
                        </InfoLine>
                      )}
                      {selectedState.guest && (
                        <InfoLine icon={UserPlus}>
                          Your guest is already registered.
                        </InfoLine>
                      )}
                      {selectedState.selfPass && (
                        <InfoLine icon={Ticket}>
                          You are registered using your free pass.
                        </InfoLine>
                      )}
                    </div>
                  )}

                  {/* Registration method */}
                  <div>
                    <p className="mb-3 text-sm font-semibold text-white">
                      How do you want to register?
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <PassToggle
                        active={!useGuestPass}
                        disabled={Boolean(selectedState.membership)}
                        onClick={() => setUseGuestPass(false)}
                        icon={UserRound}
                        label="Membership"
                      />
                      <PassToggle
                        active={useGuestPass}
                        disabled={!availableGuestPass}
                        onClick={() => setUseGuestPass(true)}
                        icon={Ticket}
                        label="Free pass"
                      />
                    </div>

                    {selectedState.membership && (
                      <p className="mt-2 text-xs text-white/45">
                        Membership already registered for this event.
                      </p>
                    )}
                    {!availableGuestPass && (
                      <p className="mt-2 text-xs text-white/45">
                        Your free guest pass is not available.
                      </p>
                    )}
                  </div>

                  {/* Free pass options */}
                  {useGuestPass && (
                    <div className="rounded-3xl border border-[#B9D63B]/30 bg-gradient-to-br from-[#B9D63B]/20 via-[#B9D63B]/[0.06] to-transparent p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00]">
                          <Ticket size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            Who is using the free pass?
                          </p>

                          <p className="mt-1 text-xs leading-5 text-white/60">
                            It won't use up one of your 4 membership
                            experiences.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <PassToggle
                          active={passFor === "self"}
                          disabled={Boolean(selectedState.selfPass)}
                          onClick={() => setPassFor("self")}
                          icon={UserRound}
                          label="Myself"
                        />
                        <PassToggle
                          active={passFor === "guest"}
                          disabled={Boolean(selectedState.guest)}
                          onClick={() => setPassFor("guest")}
                          icon={UserPlus}
                          label="Guest"
                        />
                      </div>

                      {passFor === "guest" && (
                        <div className="mt-3 space-y-3">
                          <input
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Guest name"
                            disabled={loading}
                            className={`w-full rounded-2xl px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#B9D63B]/70 disabled:opacity-50 ${GLASS_DARK}`}
                          />

                          <input
                            value={guestMobile}
                            onChange={(e) =>
                              setGuestMobile(
                                e.target.value.replace(/\D/g, "").slice(0, 10)
                              )
                            }
                            placeholder="Guest mobile number"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            disabled={loading}
                            className={`w-full rounded-2xl px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#B9D63B]/70 disabled:opacity-50 ${GLASS_DARK}`}
                          />

                          <p className="text-[11px] leading-5 text-white/45">
                            Your pass is reserved now and marked as used when
                            the guest checks in.
                          </p>
                        </div>
                      )}

                      {passFor === "self" && (
                        <p className="mt-3 text-[11px] leading-5 text-white/45">
                          Your pass is reserved now for you.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  {/* Confirm */}
                  <button
                    type="button"
                    disabled={submitDisabled}
                    onClick={handleRegister}
                    className={useGuestPass ? PURPLE_BTN : LIME_BTN}
                  >
                    <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70" />

                    {loading ? (
                      <>
                        <Loader2 size={18} className="relative animate-spin" />
                        <span className="relative">Registering...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative">
                          {useGuestPass
                            ? passFor === "guest"
                              ? "Register guest"
                              : "Use free pass"
                            : "Register with membership"}
                        </span>
                        <ArrowRight
                          size={17}
                          className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] leading-5 text-white/40">
                    Each registration gets its own QR code.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({
  event,
  membership,
  guest,
  selfPass,
  onRegister,
  onShare,
}) {
  const d = event.date ? new Date(event.date) : null;
  const month = d?.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = d?.getDate();
  const weekday = d?.toLocaleString("en-US", { weekday: "short" });

  const time = event.startTime
    ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
    : null;

  const seats = event.capacity ? `${event.capacity} seats` : "Limited seats";

  const hasAny = Boolean(membership || guest || selfPass);

  return (
    <article className="group relative flex min-h-[28rem] w-full max-w-sm flex-col justify-end overflow-hidden rounded-[2rem] bg-black font-sans shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <img
        src={event.image || FALLBACK_IMAGE}
        alt={event.name || ""}
        className="absolute inset-0 h-3/4 w-full scale-105 object-cover blur-[3px] transition duration-500 group-hover:scale-110 group-hover:blur-0"
      />

      {/* Colour wash */}
      <div className="absolute inset-0 h-3/4 bg-gradient-to-br from-[#6a3f9e]/30 via-transparent to-pink-300/20 mix-blend-soft-light" />

      {/* Fade to black */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-black/70 via-60% to-black to-85%" />

      {/* Date badge (glass) */}
      {d && (
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

      {/* Share button */}
      <button
        type="button"
        onClick={onShare}
        aria-label="Share"
        className={`absolute right-4 top-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.25rem] text-white transition duration-300 ease-out hover:scale-105 active:scale-95 ${GLASS}`}
      >
        <span className="pointer-events-none absolute inset-x-1.5 top-0.5 h-1/2 rounded-t-[1rem] bg-gradient-to-b from-white/50 to-transparent opacity-60" />
        <Share
          size={20}
          strokeWidth={2}
          className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
        />
      </button>

      {/* Bottom content */}
      <div className="relative p-5">
        <span
          className={`relative mb-3 inline-flex items-center overflow-hidden rounded-full px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ${GLASS}`}
        >
          <span className="pointer-events-none absolute inset-x-1 top-px h-1/3 rounded-t-full bg-gradient-to-b from-[#B9D63B]/50 to-transparent opacity-60" />
          <span className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
            Sunday Experience
          </span>
        </span>

        <h2 className="line-clamp-2 text-xl font-bold leading-[1.05] text-white">
          {event.name}
        </h2>

        {event.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/60">
            {event.description}
          </p>
        )}

        {/* Details */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
          {time && (
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} className="text-white/50" />
              {time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-white/50" />
              <span className="line-clamp-1">{event.location}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-white/50" />
            {seats}
          </span>
        </div>

       

        {/* Action */}
        {membership ? (
          <div className="relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-[#B9D63B]/50 bg-gradient-to-br from-[#B9D63B]/40 via-[#B9D63B]/15 to-[#B9D63B]/10 py-3.5 text-sm font-semibold text-[#DDF27A] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_0_12px_rgba(185,214,59,0.2),0_6px_20px_rgba(185,214,59,0.15)]">
            <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/30 to-transparent opacity-60" />
            <CheckCircle2 size={16} className="relative" />
            <span className="relative">Registered</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRegister}
            className={`mt-5 ${LIME_BTN}`}
          >
            <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70" />
            <span className="relative">
              {guest || selfPass ? "Join yourself" : "Join the Run"}
            </span>
            <MergeIcon
              size={16}
              className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
            />
          </button>
        )}

        {/* Extra pass actions once the member is in */}
        {membership && !(guest && selfPass) && (
          <button
            type="button"
            onClick={onRegister}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold text-white transition hover:brightness-125 active:scale-[0.98] ${GLASS}`}
          >
            <Ticket size={14} className="text-[#B9D63B]" />
            Use free pass
          </button>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatusRow({ icon: Icon, label, status }) {
  const attended = status === "ATTENDED";

  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 ${GLASS}`}
    >
      <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-white/80">
        <span className="truncate">{label}</span>
      </span>

      <span
        className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
          attended
            ? "bg-[#B9D63B] text-[#1E2A00]"
            : "bg-white/15 text-white/70"
        }`}
      >
        {attended ? "Attended" : "Registered"}
      </span>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className={`rounded-2xl p-3.5 ${GLASS_DARK}`}>
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-[#B9D63B]" />

        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
          {label}
        </span>
      </div>

      <p className="mt-1.5 truncate text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function InfoLine({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/65">
      <Icon size={14} className="shrink-0 text-[#B9D63B]" />
      {children}
    </div>
  );
}

function PassToggle({ active, onClick, icon: Icon, label, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-[#B9D63B] bg-[#B9D63B] text-[#1E2A00] shadow-[0_4px_16px_rgba(185,214,59,0.35)]"
          : "border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/10"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}