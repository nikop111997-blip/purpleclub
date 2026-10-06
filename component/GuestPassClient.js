"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   THEME TOKENS
   lime   #B9D63B  (primary action)
   purple #6a3f9e  (brand)
   Compact ticket on a light page with light glass panels.
========================================================= */

const GLASS_LIGHT =
  "border border-white/70 bg-gradient-to-br from-white/75 via-white/45 to-white/30 backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_0_20px_rgba(255,255,255,0.25),0_12px_32px_-8px_rgba(106,63,158,0.15)]";

const GLASS_ROW =
  "border border-white/80 bg-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(106,63,158,0.05)] backdrop-blur-md";

const GLASS_ON_PURPLE =
  "border border-white/30 bg-gradient-to-br from-white/30 via-white/10 to-white/5 backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_0_12px_rgba(255,255,255,0.1),0_6px_18px_rgba(40,15,70,0.25)]";

const LIME_BTN =
  "group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] py-3 text-sm font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.4)] transition duration-300 ease-out hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const GLASS_BTN =
  "group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3 text-sm font-semibold text-[#4B176B] transition duration-300 ease-out hover:bg-white/80 active:scale-[0.98]";

const INPUT =
  "w-full rounded-2xl border border-white/80 bg-white/60 px-4 py-2.5 text-sm text-[#24112f] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(106,63,158,0.06)] outline-none transition placeholder:text-[#6f6577]/60 focus:border-[#6a3f9e]/50 focus:bg-white/80 focus:ring-4 focus:ring-[#6a3f9e]/10 disabled:opacity-50";

const ICON_TILE =
  "flex shrink-0 items-center justify-center rounded-xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 text-[#4B176B] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]";

const LIME_TILE =
  "flex shrink-0 items-center justify-center rounded-xl border border-white/60 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_6px_16px_rgba(185,214,59,0.4)]";

const SHINE =
  "pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70";

/* Ticket notches: real transparent cut-outs, so they work on any page colour */
const NOTCH = "radial-gradient(circle 11px at";
const topMask = {
  WebkitMaskImage: `${NOTCH} 0 100%, #0000 98%, #000), ${NOTCH} 100% 100%, #0000 98%, #000)`,
  maskImage: `${NOTCH} 0 100%, #0000 98%, #000), ${NOTCH} 100% 100%, #0000 98%, #000)`,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};
const bottomMask = {
  WebkitMaskImage: `${NOTCH} 0 0, #0000 98%, #000), ${NOTCH} 100% 0, #0000 98%, #000)`,
  maskImage: `${NOTCH} 0 0, #0000 98%, #000), ${NOTCH} 100% 0, #0000 98%, #000)`,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function GuestPassClient() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pass, setPass] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [reservedEvent, setReservedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  const [mode, setMode] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestMobile, setGuestMobile] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  // ---------------- LOAD PASS ----------------

  async function loadGuestPass() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/user/guest-pass", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load guest pass.");
      }

      setPass(data.pass || null);
      setRegistration(data.registration || null);
      setReservedEvent(data.event || null);
      setEvents(data.events || []);
    } catch (err) {
      console.error("LOAD GUEST PASS ERROR:", err);
      setError(err?.message || "Unable to load your guest pass.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuestPass();
  }, []);

  // ---------------- COPY CODE ----------------

  async function copyCode() {
    if (!pass?.code) return;

    try {
      await navigator.clipboard.writeText(pass.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------- MODAL ----------------

  function openRegistration(type) {
    setError("");
    setSuccess("");

    if (pass?.status !== "AVAILABLE") return;

    setMode(type);
  }

  function closeModal() {
    if (submitting) return;

    setMode(null);
    setSelectedEvent("");
    setGuestName("");
    setGuestMobile("");
    setError("");
  }

  // ---------------- REGISTER PASS ----------------

  async function registerPass() {
    setError("");
    setSuccess("");

    if (!selectedEvent) {
      setError("Please select an event.");
      return;
    }

    if (mode === "GUEST") {
      if (!guestName.trim()) {
        setError("Please enter guest name.");
        return;
      }

      if (!/^[0-9]{10}$/.test(guestMobile.trim())) {
        setError("Please enter a valid 10 digit guest mobile number.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/events/${selectedEvent}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useGuestPass: true,
          passFor: mode === "GUEST" ? "GUEST" : "SELF",
          guest:
            mode === "GUEST"
              ? { name: guestName.trim(), mobile: guestMobile.trim() }
              : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Unable to reserve guest pass."
        );
      }

      setSuccess(
        mode === "GUEST"
          ? "Guest pass reserved successfully."
          : "Your pass has been reserved successfully."
      );

      setMode(null);
      setSelectedEvent("");
      setGuestName("");
      setGuestMobile("");

      await loadGuestPass();
    } catch (err) {
      console.error("REGISTER GUEST PASS ERROR:", err);
      setError(err?.message || "Unable to reserve guest pass.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------- STATUS ----------------

  const statusInfo = useMemo(() => {
    if (!pass) return { label: "Unavailable" };
    if (pass.status === "AVAILABLE") return { label: "Available" };
    if (pass.status === "RESERVED") return { label: "Reserved" };
    if (pass.status === "USED") return { label: "Used" };
    return { label: pass.status };
  }, [pass]);

  const modalEvent = events.find((item) => item.id === selectedEvent);

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#6a3f9e]" />
          <p className="text-sm text-gray-500">Loading your guest pass...</p>
        </div>
      </div>
    );
  }

  // ---------------- MAIN ----------------

  return (
    <div className="relative isolate font-sans">
     

      {/* ================= HEADER ================= */}

      <header className="mb-6 flex items-center gap-3">
        <img
          src="/join.png"
          alt="Purple Club Logo"
          className="h-12 w-12 shrink-0 object-contain"
        />

        <div>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-[#1a0f24] sm:text-2xl">
            Bring someone to Purple
          </h1>

          <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500 sm:text-sm">
            Use your free pass for yourself or invite someone special.
          </p>
        </div>
      </header>

      {/* ================= MESSAGES ================= */}

      {error && !mode && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && !mode && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#B9D63B]/60 bg-gradient-to-br from-[#B9D63B]/30 to-[#B9D63B]/10 px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4d6000]" />
          <p className="text-sm text-[#3f5000]">{success}</p>
        </div>
      )}

      {/* ================= CONTENT ================= */}

      <div className="grid items-start gap-6 md:grid-cols-[440px_minmax(0,1fr)]">
        {/* ---------- TICKET ---------- */}

        <section className="mx-auto w-full max-w-[440px] drop-shadow-[0_18px_28px_rgba(106,63,158,0.3)]">
          {/* Top: pass info */}
          <div
            style={topMask}
            className="relative overflow-hidden rounded-t-[1.75rem] bg-[#6a3f9e] px-5 pb-6 pt-5 text-white"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_90%_100%,rgba(185,214,59,0.25),transparent_40%),linear-gradient(160deg,#7a4cb0_0%,#6a3f9e_50%,#5a2f8c_100%)]" />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold text-white ${GLASS_ON_PURPLE}`}
                >
                  Free guest pass
                </span>

                <span
                  className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1 text-[11px] font-semibold ${
                    pass?.status === "AVAILABLE"
                      ? "border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_14px_rgba(185,214,59,0.4)]"
                      : `text-white ${GLASS_ON_PURPLE}`
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusInfo.label}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-bold leading-tight tracking-tight">
                Purple Guest Pass
              </h2>

              {reservedEvent ? (
                <div className="mt-3 space-y-1.5 text-xs text-white/80">
                  <p className="text-sm font-semibold text-white">
                    {reservedEvent.name}
                  </p>

                  <p className="flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-[#E4F58C]" />
                    {formatDate(reservedEvent.date)}
                  </p>

                  {reservedEvent.startTime && (
                    <p className="flex items-center gap-1.5">
                      <Clock3 size={13} className="text-[#E4F58C]" />
                      {reservedEvent.startTime}
                      {reservedEvent.endTime ? ` - ${reservedEvent.endTime}` : ""}
                    </p>
                  )}

                  {reservedEvent.location && (
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#E4F58C]" />
                      {reservedEvent.location}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs leading-5 text-white/75">
                  One free entry to any Purple experience.
                </p>
              )}
            </div>
          </div>

          {/* Bottom: stub with QR */}
          <div
            style={bottomMask}
            className="relative rounded-b-[1.75rem] bg-gradient-to-b from-white to-[#f6f0fc] px-5 pb-5 pt-6"
          >
            {/* Perforation */}
            <div className="pointer-events-none absolute inset-x-6 top-0 border-t-2 border-dashed border-[#6a3f9e]/25" />

            <div className="flex flex-col items-center">
              {pass?.code ? (
                <QRCodeSVG
                  value={pass.code}
                  size={140}
                  level="H"
                  includeMargin={false}
                  fgColor="#24112f"
                />
              ) : (
                <div className="flex h-[140px] w-[140px] items-center justify-center text-sm text-gray-400">
                  No QR
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <p className="font-mono text-base font-bold tracking-wider text-[#24112f]">
                  {pass?.code || "—"}
                </p>

                {pass?.code && (
                  <button
                    type="button"
                    onClick={copyCode}
                    title="Copy pass code"
                    aria-label="Copy pass code"
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[#4B176B] transition hover:scale-105 active:scale-95 ${GLASS_ROW}`}
                  >
                    {copied ? (
                      <Check size={14} className="text-[#5a7000]" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}
              </div>

              <p className="mt-1.5 text-[11px] font-medium text-[#6f6577]">
                Admit one · show at check-in
              </p>
            </div>
          </div>
        </section>

        {/* ---------- RIGHT COLUMN ---------- */}

        <div className="space-y-4">
          {/* AVAILABLE */}
          {pass?.status === "AVAILABLE" && (
            <>
              <div className={`rounded-3xl p-5 ${GLASS_LIGHT}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 ${LIME_TILE}`}>
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#24112f]">
                      Your pass is ready
                    </h3>

                    <p className="mt-0.5 text-xs leading-5 text-[#6f6577]">
                      One use only. Join an experience yourself or invite
                      someone.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openRegistration("SELF")}
                    className={LIME_BTN}
                  >
                    <span className={SHINE} />
                    <UserRound size={16} className="relative" />
                    <span className="relative">For myself</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openRegistration("GUEST")}
                    className={`${GLASS_BTN} ${GLASS_ROW}`}
                  >
                    <Users size={16} className="text-[#6a3f9e]" />
                    <span>Invite a guest</span>
                  </button>
                </div>
              </div>

              <div className={`rounded-3xl p-5 ${GLASS_LIGHT}`}>
                <h3 className="text-sm font-semibold text-[#24112f]">
                  How it works
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Step number="1" title="Choose" text="Pick an upcoming event." />
                  <Step number="2" title="Reserve" text="Your pass is held for it." />
                  <Step number="3" title="Show QR" text="Scan at check-in." />
                  <Step number="4" title="Enjoy" text="Pass is used after entry." />
                </div>
              </div>
            </>
          )}

          {/* RESERVED */}
          {pass?.status === "RESERVED" && (
            <div className={`rounded-3xl p-5 ${GLASS_LIGHT}`}>
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 ${LIME_TILE}`}>
                  <Check size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#24112f]">
                    Pass reserved
                  </h3>

                  <p className="mt-0.5 text-xs leading-5 text-[#6f6577]">
                    Show the QR code at the event check-in.
                  </p>
                </div>
              </div>

              {registration?.guest?.enabled && registration?.guest?.name && (
                <div className={`mt-4 flex items-center gap-3 rounded-2xl p-3 ${GLASS_ROW}`}>
                  <div className={`h-9 w-9 rounded-full ${LIME_TILE}`}>
                    <UserRound size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#6f6577]">Guest</p>

                    <p className="text-sm font-semibold text-[#24112f]">
                      {registration.guest.name}
                    </p>

                    <p className="text-xs text-[#6f6577]">
                      {registration.guest.mobile}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-3 rounded-2xl border border-[#B9D63B]/50 bg-gradient-to-br from-[#B9D63B]/30 via-[#B9D63B]/10 to-transparent p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                <p className="text-xs leading-5 text-[#3f5000]">
                  Your pass is marked as used only after successful check-in.
                </p>
              </div>
            </div>
          )}

          {/* USED */}
          {pass?.status === "USED" && (
            <div className={`rounded-3xl p-5 ${GLASS_LIGHT}`}>
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 ${ICON_TILE}`}>
                  <Check size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#24112f]">
                    Guest pass used
                  </h3>

                  <p className="mt-0.5 text-xs leading-5 text-[#6f6577]">
                    This free pass has already been used and can't be used
                    again.
                  </p>
                </div>
              </div>

              <div className={`mt-4 rounded-2xl p-3.5 ${GLASS_ROW}`}>
                <p className="text-xs leading-5 text-[#6f6577]">
                  Want to attend more experiences? Become a Purple Member to
                  unlock your membership benefits.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= REGISTRATION MODAL ================= */}

      {mode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#24112f]/40 p-4 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-white/95 via-white/85 to-[#f3ecfa]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_30px_80px_rgba(53,16,77,0.35)] backdrop-blur-2xl"
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              aria-label="Close"
              className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#4B176B] transition hover:scale-105 active:scale-95 disabled:opacity-50 ${GLASS_ROW}`}
            >
              <X size={17} />
            </button>

            <div className="relative overflow-hidden p-5 pb-4">
              <div className="pointer-events-none absolute -left-10 -top-16 h-44 w-44 rounded-full bg-[#6a3f9e]/25 blur-3xl" />
              <div className="pointer-events-none absolute -right-12 top-2 h-36 w-36 rounded-full bg-[#B9D63B]/35 blur-3xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#6a3f9e]/20 bg-[#6a3f9e]/10 px-3 py-1 text-[11px] font-semibold text-[#6a3f9e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B9D63B] shadow-[0_0_8px_#B9D63B]" />
                  Free guest pass
                </span>

                <h2 className="mt-3 pr-10 text-xl font-bold leading-tight tracking-tight text-[#1a0f24]">
                  {mode === "GUEST" ? "Invite a guest" : "Use for yourself"}
                </h2>
              </div>
            </div>

            <div className="space-y-4 px-5 pb-5">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6f6577]">
                  Select experience
                </label>

                <div className="relative">
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    disabled={submitting}
                    className={`${INPUT} appearance-none pr-11`}
                  >
                    <option value="">Select an upcoming experience</option>

                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name} — {formatDate(event.date)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6f6577]"
                  />
                </div>
              </div>

              {modalEvent && (
                <div className={`rounded-2xl p-3.5 ${GLASS_ROW}`}>
                  <p className="text-sm font-semibold text-[#24112f]">
                    {modalEvent.name}
                  </p>

                  <div className="mt-2.5 space-y-2">
                    <InfoRow icon={CalendarDays} text={formatDate(modalEvent.date)} />

                    {modalEvent.startTime && (
                      <InfoRow
                        icon={Clock3}
                        text={`${modalEvent.startTime}${
                          modalEvent.endTime ? ` - ${modalEvent.endTime}` : ""
                        }`}
                      />
                    )}

                    {modalEvent.location && (
                      <InfoRow icon={MapPin} text={modalEvent.location} />
                    )}
                  </div>
                </div>
              )}

              {mode === "GUEST" && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#6f6577]">
                      Guest name
                    </label>

                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      disabled={submitting}
                      placeholder="Guest name"
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#6f6577]">
                      Guest mobile
                    </label>

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={guestMobile}
                      onChange={(e) =>
                        setGuestMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      disabled={submitting}
                      placeholder="10 digit mobile number"
                      className={INPUT}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-2xl border border-[#B9D63B]/50 bg-gradient-to-br from-[#B9D63B]/30 via-[#B9D63B]/10 to-transparent p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                <div className={`h-8 w-8 ${LIME_TILE}`}>
                  <ShieldCheck size={16} />
                </div>

                <p className="text-xs leading-5 text-[#3f5000]">
                  Your pass is reserved for this experience and becomes used
                  only after the QR code is scanned at check-in.
                </p>
              </div>

              <button
                type="button"
                onClick={registerPass}
                disabled={submitting}
                className={LIME_BTN}
              >
                <span className={SHINE} />

                {submitting ? (
                  <>
                    <Loader2 size={17} className="relative animate-spin" />
                    <span className="relative">Reserving...</span>
                  </>
                ) : (
                  <>
                    <span className="relative">Reserve guest pass</span>
                    <ArrowRight
                      size={16}
                      className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Step({ number, title, text }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/60 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[11px] font-bold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_12px_rgba(185,214,59,0.35)]">
        {number}
      </div>

      <div>
        <p className="text-xs font-semibold text-[#24112f]">{title}</p>
        <p className="text-[11px] text-[#6f6577]">{text}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }) {
  if (!text) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-[#4a4150]">
      <Icon size={13} className="shrink-0 text-[#6a3f9e]" />
      <span>{text}</span>
    </div>
  );
}