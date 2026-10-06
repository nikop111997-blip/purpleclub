"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  QrCode,
  UserRound,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Download,
  Loader2
} from "lucide-react";
import { toPng } from "html-to-image";
import PandaQRCode from "./PandaQRCode";

/* =========================================================
   THEME TOKENS (same as the events page)
   lime   #B9D63B  (primary action)
   purple #6a3f9e  (atmosphere)
   ink    #120d1a  (dark surfaces)
========================================================= */

// Glass on dark surfaces
const GLASS =
  "border border-white/25 bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]";

// Dark glass for panels inside dark surfaces
const GLASS_DARK =
  "border border-white/10 bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]";

// Glass on the light page background
const GLASS_LIGHT =
  "border border-white/70 bg-gradient-to-br from-white/75 via-white/45 to-white/30 backdrop-blur-xl ";

const FALLBACK_IMAGE = "/cheer.png"; // place cheer.png inside /public

// Lime primary button
const LIME_BTN =
  "group/btn relative flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/40 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-sm font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.35)] transition duration-300 ease-out hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.5)] active:scale-[0.98]";

function formatDate(date) {
  if (!date) return "Date TBA";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getRegistrationStatus(status) {
  switch (status) {
    case "ATTENDED":
      return {
        label: "Attended",
        icon: CheckCircle2,
        className:
          "border-[#B9D63B]/50 bg-gradient-to-br from-[#B9D63B]/40 via-[#B9D63B]/15 to-[#B9D63B]/10 text-[#DDF27A]",
      };

    case "CANCELLED":
      return {
        label: "Cancelled",
        icon: XCircle,
        className:
          "border-red-400/40 bg-gradient-to-br from-red-500/30 via-red-500/10 to-red-500/5 text-red-300",
      };

    case "REGISTERED":
    default:
      return {
        label: "Registered",
        icon: CheckCircle2,
        className:
          "border-white/30 bg-gradient-to-br from-white/25 via-white/10 to-white/5 text-white",
      };
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function RegistrationsClient({ registrations }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const now = new Date();

  const upcoming = registrations.filter((item) => {
    if (!item.event?.date) return false;

    return new Date(item.event.date) >= now && item.status !== "CANCELLED";
  });

  const past = registrations.filter((item) => {
    if (!item.event?.date) return true;

    return (
      new Date(item.event.date) < now ||
      item.status === "ATTENDED" ||
      item.status === "CANCELLED"
    );
  });

  const visibleRegistrations = activeTab === "upcoming" ? upcoming : past;

  return (
    <div className="relative isolate">

      {/* ================= HEADER ================= */}

      <header className="mb-8 font-sans">

        <h1 className="mt-4 text-3xl font-bold leading-[1.05] tracking-tight text-[#1a0f24] sm:text-4xl">
          My registrations
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
          Manage your upcoming experiences and view your previous Purple
          events.
        </p>
      </header>

      {/* ================= STATS ================= */}

      <div className="mb-7 grid grid-cols-2 gap-3 font-sans sm:grid-cols-3">
        <StatCard icon={Ticket} label="Total" value={registrations.length} />

        <StatCard icon={CalendarDays} label="Upcoming" value={upcoming.length} />

        <StatCard
          icon={CheckCircle2}
          label="Attended"
          value={registrations.filter((i) => i.status === "ATTENDED").length}
        />
      </div>

      {/* ================= TABS (sliding glass drop) ================= */}

      <div
        className={`relative mb-6 w-fit rounded-full p-1.5 font-sans ${GLASS_LIGHT}`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 w-[calc(50%-6px)] overflow-hidden rounded-full border border-white/20 bg-gradient-to-b from-[#2a1a3d] to-[#120d1a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_20px_rgba(18,13,26,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
            activeTab === "past" ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <span className="absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/30 to-transparent opacity-60" />
        </div>

        <div className="relative grid grid-cols-2">
          {[
            { id: "upcoming", label: "Upcoming", count: upcoming.length },
            { id: "past", label: "Past", count: past.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-[#6f6577] hover:text-[#4B176B]"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 text-xs ${
                    activeTab === tab.id ? "text-[#B9D63B]" : "opacity-70"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================= REGISTRATIONS ================= */}

      {visibleRegistrations.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <div className="grid gap-6 md:grid-cols-5 xl:grid-cols-5">
          {visibleRegistrations.map((registration) => (
            <RegistrationCard
              key={registration.id}
              registration={registration}
              onView={() => setSelectedRegistration(registration)}
            />
          ))}
        </div>
      )}

      {/* ================= DETAILS MODAL ================= */}

      {selectedRegistration && (
        <RegistrationModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   REGISTRATION CARD
========================================================= */

function RegistrationCard({ registration, onView }) {
  const event = registration.event;
  const status = getRegistrationStatus(registration.status);
  const StatusIcon = status.icon;
  const hasGuest = registration.guest?.enabled;

  const d = event?.date ? new Date(event.date) : null;
  const month = d?.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = d?.getDate();
  const weekday = d?.toLocaleString("en-US", { weekday: "short" });

  const time = event?.startTime
    ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
    : null;

  return (
    <article className="group relative aspect-[5/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-black font-sans shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <img
        src={event?.image || FALLBACK_IMAGE}
        alt={event?.name || ""}
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

      {/* Status pill (glass) */}
      <span
        className={`absolute right-4 top-4 inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_18px_rgba(0,0,0,0.25)] backdrop-blur-xl ${status.className}`}
      >
        <span className="pointer-events-none absolute inset-x-2 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/30 to-transparent opacity-60" />
        <StatusIcon size={13} className="relative" />
        <span className="relative">{status.label}</span>
      </span>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h2 className="line-clamp-2 text-xl font-semibold leading-[1.05] text-white">
          {event?.name || "Purple Experience"}
        </h2>

        {/* Details */}
        <div className=" flex justify-between">
<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
          {time && (
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} className="text-white/50" />
              {time}
            </span>
          )}

          {event?.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-white/50" />
              <span className="line-clamp-1">{event.location}</span>
            </span>
          )}
        </div>
        {(registration.passUsage || hasGuest) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {registration.passUsage === "SELF" && (
              <Badge icon={Ticket} text="Free pass: myself" />
            )}

            {registration.passUsage === "GUEST" && (
              <Badge icon={UserPlus} text="Free pass: guest" />
            )}

            {hasGuest && (
              <Badge
                icon={UserRound}
                text={`Guest: ${registration.guest.name}`}
              />
            )}
          </div>
        )}

        </div>
        

        {/* Pass / guest badges */}
        
        {/* View QR */}
        <button
          type="button"
          onClick={onView}
          className={`${LIME_BTN} mt-5 w-full py-3.5`}
        >
          <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70" />
          <span className="relative">View QR</span>
          <QrCode
            size={16}
            className="relative transition-transform duration-300 group-hover/btn:scale-110"
          />
        </button>
      </div>
    </article>
  );
}

function TicketRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[13px]">
      <span className="shrink-0 text-white/55">{label}</span>
      <span className="text-right font-semibold text-white">{children}</span>
    </div>
  );
}

// Cuts a half-circle notch out of the two corners that touch the tear line
const notchMask = (position) => {
  const y = position === "bottom" ? "100%" : "0";
  const mask = `radial-gradient(circle 12px at 0 ${y}, transparent 98%, #000), radial-gradient(circle 12px at 100% ${y}, transparent 98%, #000)`;
  return {
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskComposite: "source-in",
    maskComposite: "intersect",
  };
};

function RegistrationModal({ registration, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  const event = registration.event;
  const status = getRegistrationStatus(registration.status);

  const time = event?.startTime
    ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
    : "TBA";

  useEffect(() => {
    setMounted(true);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleDownload = useCallback(async () => {
    if (!ticketRef.current || downloading) return;
    setDownloading(true);

    try {
      const options = {
        pixelRatio: 3, // sharp enough to print or share
        cacheBust: true,
        // leave out anything marked data-no-capture (e.g. the X button)
        filter: (node) => !(node instanceof HTMLElement && node.dataset.noCapture !== undefined),
      };

      // Safari sometimes returns a blank image on the first pass, so warm up once
      await toPng(ticketRef.current, options);
      const dataUrl = await toPng(ticketRef.current, options);

      const safeName = (event?.name || "ticket")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const link = document.createElement("a");
      link.download = `${safeName}-ticket.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download ticket image:", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading, event?.name]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 p-4 font-sans backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto"
      >
        {/* ================= TICKET (captured as image) ================= */}
        <div ref={ticketRef}>
          {/* ---- Top: details ---- */}
          <div
            style={notchMask("bottom")}
            className="relative overflow-hidden rounded-t-[1.75rem] bg-[#120d1a] px-6 pb-6 pt-6 text-white"
          >
            <div className="pointer-events-none absolute -left-10 -top-16 h-44 w-44 rounded-full bg-[#6a3f9e]/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-2 h-36 w-36 rounded-full bg-[#B9D63B]/15 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-3 pr-12">
                <h2 className="truncate text-base font-bold tracking-tight">
                  {event?.name || "Purple Experience"}
                </h2>
              </div>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-white ${GLASS}`}
              >
                {status.label}
              </span>

              <div className="mt-5 space-y-3">
                <TicketRow label="Date">{formatDate(event?.date)}</TicketRow>
                <TicketRow label="Time">{time}</TicketRow>
                <TicketRow label="Location">
                  {event?.location || "TBA"}
                </TicketRow>

                {registration.guest?.enabled && (
                  <TicketRow label="Guest">
                    {registration.guest.name}
                    {registration.guest.mobile && (
                      <span className="block text-[11px] font-normal text-white/55">
                        {registration.guest.mobile}
                      </span>
                    )}
                  </TicketRow>
                )}

                {registration.passUsage && (
                  <TicketRow label="Free pass">
                    <span className="inline-flex items-center gap-1.5">
                      <Ticket size={13} className="text-[#B9D63B]" />
                      {registration.passUsage === "SELF"
                        ? "Used for yourself"
                        : "Used for your guest"}
                    </span>
                  </TicketRow>
                )}
              </div>
            </div>

            {/* Close (top right), hidden from the downloaded image */}
            <button
              type="button"
              data-no-capture
              onClick={onClose}
              aria-label="Close"
              className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95 ${GLASS}`}
            >
              <X size={16} />
            </button>
          </div>

          {/* ---- Tear line ---- */}
          <div className="relative h-0 bg-[#120d1a]">
            <div className="absolute inset-x-5 top-0 border-t border-dashed border-white/25" />
          </div>

          {/* ---- Bottom: QR stub ---- */}
          <div
            style={notchMask("top")}
            className="flex justify-center rounded-b-[1.75rem] bg-[#fefdff] px-2 pb-0 pt-3"
          >
            {registration.qrCode ? (
              <PandaQRCode value={registration.qrCode} size={280} />
            ) : (
              <p className="py-10 text-xs text-white/50">
                QR not available yet
              </p>
            )}
          </div>
        </div>

        {/* ================= ACTIONS (not captured) ================= */}
        <div className="mt-4 flex gap-3">
          {registration.qrCode && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60 ${GLASS}`}
            >
              {downloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {downloading ? "Saving..." : "Download"}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`${LIME_BTN} flex-1 py-3.5`}
          >
            <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70" />
            <span className="relative">Close</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className={`rounded-xl p-4 ${GLASS_LIGHT}`}>
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 ">
          <Icon size={17} className="text-[#4B176B]" />
        </div>

        <span className="text-2xl font-bold text-[#24112f]">{value}</span>
      </div>

      <p className="mt-3 text-xs font-semibold text-[#6f6577]">{label}</p>
    </div>
  );
}

function Badge({ icon: Icon, text }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium text-white/80 ${GLASS_DARK}`}
    >
      <Icon size={12} className="text-[#B9D63B]" />
      {text}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl p-3 ${GLASS_DARK}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
        <Icon size={16} className="text-[#B9D63B]" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-white/45">{label}</p>

        <p className="mt-0.5 truncate text-sm font-medium text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ type }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#120d1a] p-12 text-center font-sans shadow-xl">
      <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#6a3f9e]/60 blur-3xl" />

      <div
        className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-[#B9D63B] ${GLASS}`}
      >
        {type === "upcoming" ? <CalendarDays size={28} /> : <Clock size={28} />}
      </div>

      <h2 className="relative mt-5 text-xl font-bold text-white">
        {type === "upcoming"
          ? "No upcoming registrations"
          : "No past registrations"}
      </h2>

      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-white/60">
        {type === "upcoming"
          ? "Explore upcoming Purple experiences and register for your next Sunday."
          : "Your previous event registrations will appear here."}
      </p>
    </div>
  );
}