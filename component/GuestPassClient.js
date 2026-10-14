"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  Phone,
  QrCode,
  Search,
  Share2,
  Tag,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   THEME TOKENS  (light, solid surfaces, no blur)
   lime   #B9D63B  primary action / progress
   purple #6a3f9e  brand
   ink    #24112f  text
   line   #ECE6F3  borders
   tint   #F7F3FB  soft purple wash
========================================================= */

const CARD =
  "rounded-3xl border border-[#ECE6F3] bg-white shadow-[0_1px_2px_rgba(36,17,47,0.04),0_8px_24px_-12px_rgba(106,63,158,0.12)]";

const SOFT_BOX = "rounded-2xl border border-[#ECE6F3] bg-[#FAF8FD]";

const ICON_TILE =
  "flex shrink-0 items-center justify-center rounded-xl bg-[#F1EAF8] text-[#6a3f9e]";

const LIME_TILE =
  "flex shrink-0 items-center justify-center rounded-xl bg-[#B9D63B] text-[#1E2A00]";

const LIME_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#B9D63B] px-6 py-3 text-sm font-semibold text-[#1E2A00] shadow-[0_1px_2px_rgba(88,112,0,0.25)] transition hover:bg-[#c6e04a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B9D63B]/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

const OUTLINE_BTN =
  "flex items-center justify-center gap-1.5 rounded-full border border-[#E3DAEE] bg-white font-semibold transition hover:bg-[#F7F3FB] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6a3f9e]/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const STATUS_CONFIG = {
  INVITED: {
    label: "Invited",
    className: "bg-[#F1EAF8] text-[#5a3a80]",
    dot: "bg-[#9a86ab]",
  },
  REGISTERED: {
    label: "Registered",
    className: "bg-[#E6D9F3] text-[#4B176B]",
    dot: "bg-[#6a3f9e]",
  },
  ATTENDED: {
    label: "Attended",
    className: "bg-[#EDF5C8] text-[#44590d]",
    dot: "bg-[#769000]",
  },
  MEMBER: {
    label: "Member",
    className: "bg-[#B9D63B] text-[#1E2A00]",
    dot: "bg-[#1E2A00]",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600",
    dot: "bg-red-400",
  },
};

function formatDate(date) {
  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date not available";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMilestone(successfulReferrals) {
  if (successfulReferrals >= 100) {
    return {
      title: "Purple Ambassador",
      icon: "👑",
      target: 100,
      description: "You've reached the Purple Ambassador level.",
    };
  }

  if (successfulReferrals >= 10) {
    return {
      title: "Purple Icon",
      icon: "✦",
      target: 100,
      description: "You've become a Purple Icon. Keep growing the community.",
    };
  }

  if (successfulReferrals >= 1) {
    return {
      title: "Purple Inspirer",
      icon: "✦",
      target: 10,
      description: "Your first successful membership referral.",
    };
  }

  return {
    title: "Start Inspiring",
    icon: "✦",
    target: 1,
    description: "Invite your first person to Purple.",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function GuestPassClient() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");

  // The popup renders into document.body, so wait until mounted.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock page scroll and close on Escape while the popup is open.
  useEffect(() => {
    if (!selectedInvite) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e) {
      if (e.key === "Escape") setSelectedInvite(null);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedInvite]);

  // ---------------- LOAD ----------------

  async function loadInvites() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/user/guest-pass", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to load referrals.");
      }

      setData(result);
    } catch (err) {
      console.error("LOAD REFERRALS ERROR:", err);
      setError(err?.message || "Unable to load your referrals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvites();
  }, []);

  // ---------------- SUMMARY ----------------

  const summary = data?.summary || {
    totalInvites: 0,
    registeredGuests: 0,
    attendedGuests: 0,
    successfulReferrals: 0,
    pendingInvites: 0,
  };

  const invites = data?.invites || [];
  const successful = summary.successfulReferrals || 0;

  const milestone = useMemo(() => getMilestone(successful), [successful]);

  const progress = useMemo(() => {
    if (successful >= 100) {
      return { percentage: 100, target: 100, remaining: 0 };
    }

    if (successful >= 10) {
      return {
        percentage: Math.min(100, ((successful - 10) / 90) * 100),
        target: 100,
        remaining: 100 - successful,
      };
    }

    if (successful >= 1) {
      return {
        percentage: Math.min(100, ((successful - 1) / 9) * 100),
        target: 10,
        remaining: 10 - successful,
      };
    }

    return { percentage: 0, target: 1, remaining: 1 };
  }, [successful]);

  const filteredInvites = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invites;

    return invites.filter(
      (invite) =>
        invite.guestName?.toLowerCase().includes(q) ||
        invite.guestMobile?.includes(q) ||
        invite.event?.name?.toLowerCase().includes(q)
    );
  }, [invites, query]);

  // ---------------- COPY ----------------

  async function copyInvite(invite) {
    if (!invite?.inviteUrl) return;

    try {
      await navigator.clipboard.writeText(invite.inviteUrl);
      setCopied(invite.id);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error(err);
    }
  }

  // ---------------- WHATSAPP ----------------

  function shareWhatsApp(invite) {
    if (!invite?.inviteUrl) return;

    const message =
      `Hey ${invite.guestName}, I’ve invited you to a Purple experience.\n\n` +
      `Register here:\n${invite.inviteUrl}`;

    // wa.me needs the country code: add 91 to a 10-digit Indian number
    const digits = String(invite.guestMobile || "").replace(/\D/g, "");
    const number = digits.length === 10 ? `91${digits}` : digits;

    const url =
      `https://wa.me/${number}` + `?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ---------------- NATIVE SHARE ----------------

  async function shareInvite(invite) {
    if (!invite?.inviteUrl) return;

    const shareData = {
      title: "Purple Invitation",
      text: `You're invited to a Purple experience by ${invite.guestName}.`,
      url: invite.inviteUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    await copyInvite(invite);
  }

  // ---------------- DOWNLOAD QR ----------------

  function downloadQR(invite) {
    if (!invite?.inviteUrl) return;

    const svg = document.getElementById(`invite-qr-${invite.id}`);
    if (!svg) return;

    const source = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1200;

      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 100, 100, 1000, 1000);

      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `purple-invite-${invite.guestName
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    image.src = url;
  }

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#6a3f9e]" />
          <p className="text-sm text-[#6f6577]">
            Loading your Purple community...
          </p>
        </div>
      </div>
    );
  }

  // ---------------- MAIN ----------------

  return (
    <div className="space-y-6 font-sans text-[#24112f]">
      {/* ================= HEADER ================= */}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a0f24] sm:text-4xl">
            Your Purple Circle
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f6577] sm:text-base">
            Invite people, help them experience Purple, and grow your journey
            from Inspirer to Icon to Ambassador.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/dashboard/events";
          }}
          className={LIME_BTN}
        >
          <UserPlus size={16} />
          Invite someone
        </button>
      </header>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <X size={16} />
          {error}
        </div>
      )}

      {/* ================= OVERVIEW ================= */}

      <section className={`${CARD} p-6 sm:p-8`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Level */}
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 text-2xl ${LIME_TILE}`}>
              {milestone.icon}
            </div>

            <div>
              <p className="text-xs font-medium text-[#6a3f9e]">
                Current journey
              </p>

              <h2 className="text-2xl font-bold tracking-tight text-[#24112f]">
                {milestone.title}
              </h2>

              <p className="mt-0.5 text-xs text-[#6f6577]">
                {milestone.description}
              </p>
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <SummaryItem value={summary.totalInvites} label="Invited" />
            <SummaryItem value={summary.attendedGuests} label="Experienced" />
            <SummaryItem
              value={summary.successfulReferrals}
              label="Members"
              highlight
            />
          </div>
        </div>

        {/* Progress */}
        <div className="mt-8 border-t border-[#ECE6F3] pt-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#24112f]">
                Referral journey
              </p>

              <p className="text-xs text-[#6f6577]">
                {successful >= 100
                  ? "Purple Ambassador achieved"
                  : `${progress.remaining} more successful ${
                      progress.remaining === 1 ? "referral" : "referrals"
                    } to reach ${progress.target}.`}
              </p>
            </div>

            <span className="text-sm font-bold text-[#4B176B]">
              {successful}/100
            </span>
          </div>

          <div
            className="h-2.5 overflow-hidden rounded-full bg-[#F1EAF8]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.percentage)}
          >
            <div
              className="h-full min-w-[8px] rounded-full bg-[#B9D63B] transition-all duration-700"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 text-[11px] text-[#9a929d]">
            <span className={successful >= 1 ? "font-semibold text-[#4B176B]" : ""}>
              1 · Inspirer
            </span>
            <span
              className={`text-center ${
                successful >= 10 ? "font-semibold text-[#4B176B]" : ""
              }`}
            >
              10 · Icon
            </span>
            <span
              className={`text-right ${
                successful >= 100 ? "font-semibold text-[#4B176B]" : ""
              }`}
            >
              100 · Ambassador
            </span>
          </div>
        </div>
      </section>

      {/* ================= INVITES TABLE ================= */}

      <section className={`${CARD} overflow-hidden`}>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[#ECE6F3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-[#24112f]">My invitations</h2>

            <span className="rounded-full bg-[#F1EAF8] px-2.5 py-0.5 text-[11px] font-semibold text-[#6a3f9e]">
              {invites.length}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b7898]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, mobile or experience"
              aria-label="Search invitations"
              className="w-full rounded-full border border-[#E3DAEE] bg-[#FAF8FD] py-2 pl-9 pr-4 text-xs text-[#24112f] outline-none transition placeholder:text-[#aaa0b0] focus:border-[#6a3f9e]/50 focus:bg-white focus:ring-4 focus:ring-[#6a3f9e]/10"
            />
          </div>
        </div>

        {invites.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className={`mx-auto h-16 w-16 rounded-2xl ${ICON_TILE}`}>
              <Users size={26} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-[#24112f]">
              No invitations yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-[#6f6577]">
              Invite someone to your next Purple experience and start your
              Inspirer journey.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#ECE6F3] bg-[#FAF8FD] text-[11px] font-medium text-[#8a8190]">
                  <Th icon={UserRound}>Name</Th>
                  <Th icon={Tag}>Status</Th>
                  <Th icon={Phone}>Mobile</Th>
                  <Th icon={CalendarDays}>Experience</Th>
                  <Th icon={Clock3}>Invited</Th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>

              <tbody>
                {filteredInvites.map((invite) => (
                  <InviteRow
                    key={invite.id}
                    invite={invite}
                    copied={copied === invite.id}
                    onCopy={copyInvite}
                    onWhatsApp={shareWhatsApp}
                    onDownload={downloadQR}
                    onOpen={() => setSelectedInvite(invite)}
                  />
                ))}

                {filteredInvites.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-xs text-[#8a8190]"
                    >
                      No invitations match “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {invites.length > 0 && (
          <div className="border-t border-[#ECE6F3] px-5 py-3 text-[11px] text-[#9a929d] sm:px-6">
            {filteredInvites.length}{" "}
            {filteredInvites.length === 1 ? "invitation" : "invitations"}
          </div>
        )}
      </section>

      {/* Hidden QR codes used for PNG download */}
      <div className="pointer-events-none fixed -left-[9999px] top-0">
        {invites
          .filter((invite) => invite.inviteUrl)
          .map((invite) => (
            <QRCodeSVG
              key={invite.id}
              id={`invite-qr-${invite.id}`}
              value={invite.inviteUrl}
              size={1000}
            />
          ))}
      </div>

      {/* ================= DETAIL POPUP (portal) ================= */}

      {mounted &&
        selectedInvite &&
        createPortal(
          <InviteModal
            invite={selectedInvite}
            copied={copied === selectedInvite.id}
            onCopy={copyInvite}
            onWhatsApp={shareWhatsApp}
            onShare={shareInvite}
            onDownload={downloadQR}
            onClose={() => setSelectedInvite(null)}
          />,
          document.body
        )}
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function SummaryItem({ value, label, highlight = false }) {
  return (
    <div
      className={`min-w-[90px] rounded-2xl px-4 py-3 ${
        highlight
          ? "border border-[#B9D63B]/50 bg-[#F4F9DC]"
          : "border border-[#ECE6F3] bg-[#FAF8FD]"
      }`}
    >
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-[#44590d]" : "text-[#24112f]"
        }`}
      >
        {value}
      </p>

      <p className="mt-0.5 text-[11px] font-semibold text-[#6f6577]">{label}</p>
    </div>
  );
}

function Th({ icon: Icon, children }) {
  return (
    <th className="px-4 py-2.5 font-medium first:pl-5 sm:first:pl-6">
      <span className="flex items-center gap-1.5">
        <Icon size={13} className="text-[#8b7898]" />
        {children}
      </span>
    </th>
  );
}

function StatusTag({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.INVITED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

/* =========================================================
   TABLE ROW
========================================================= */

function InviteRow({ invite, copied, onCopy, onWhatsApp, onDownload, onOpen }) {
  return (
    <tr
      onClick={onOpen}
      className="group cursor-pointer border-b border-[#F1ECF6] text-xs transition last:border-b-0 hover:bg-[#FAF8FD]"
    >
      {/* Name */}
      <td className="py-3 pl-5 pr-4 sm:pl-6">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-8 w-8 rounded-lg ${
              invite.isMember ? LIME_TILE : ICON_TILE
            }`}
          >
            {invite.isMember ? <Check size={15} /> : <UserPlus size={14} />}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#24112f]">
              {invite.guestName}
            </p>

            {invite.isMember && (
              <p className="text-[10px] font-semibold text-[#5a7000]">
                Purple Inspirer
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusTag status={invite.status} />
      </td>

      {/* Mobile */}
      <td className="px-4 py-3 text-[#4a4150] tabular-nums">
        {invite.guestMobile || "—"}
      </td>

      {/* Experience */}
      <td className="px-4 py-3 text-[#4a4150]">
        {invite.event?.name || "Purple Experience"}
      </td>

      {/* Invited */}
      <td className="whitespace-nowrap px-4 py-3 text-[#8a8190]">
        {formatDate(invite.createdAt)}
      </td>

      {/* Actions */}
      <td
        className="px-4 py-3 pr-5 sm:pr-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1.5">
          {invite.inviteUrl && (
            <>
              <button
                type="button"
                onClick={() => onCopy(invite)}
                className={`${OUTLINE_BTN} h-8 px-3 text-[11px] text-[#4B176B]`}
              >
                {copied ? (
                  <Check size={13} className="text-[#5a7000]" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                type="button"
                onClick={() => onWhatsApp(invite)}
                className={`${OUTLINE_BTN} h-8 px-3 text-[11px] text-[#1b8a4a]`}
              >
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => onDownload(invite)}
                title="Download QR"
                aria-label="Download QR"
                className={`${OUTLINE_BTN} h-8 w-8 text-[#4B176B]`}
              >
                <QrCode size={14} />
              </button>
            </>
          )}

          <ChevronRight
            size={16}
            className="ml-1 text-[#b8afbd] transition group-hover:translate-x-0.5 group-hover:text-[#4B176B]"
          />
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   MODAL
========================================================= */

function InviteModal({
  invite,
  copied,
  onCopy,
  onWhatsApp,
  onShare,
  onDownload,
  onClose,
}) {
  const hasLink = Boolean(invite.inviteUrl);

  const details = [
    formatDate(invite.event?.date),
    invite.event?.startTime,
    invite.event?.location,
  ].filter(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Purple invitation"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#24112f]/35 p-4 font-sans"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-[#ECE6F3] bg-white text-[#24112f] shadow-[0_24px_60px_rgba(36,17,47,0.25)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#F1ECF6] px-5 pb-4 pt-5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#6a3f9e]">
              Purple invitation
            </p>

            <h2 className="mt-1 truncate text-lg font-bold leading-tight tracking-tight text-[#1a0f24]">
              {invite.guestName}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusTag status={invite.status} />

              {invite.isMember && (
                <span className="rounded-full bg-[#EDF5C8] px-2.5 py-0.5 text-[11px] font-semibold text-[#44590d]">
                  Purple Inspirer
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`${OUTLINE_BTN} h-8 w-8 shrink-0 text-[#4B176B]`}
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {/* Event */}
          <div className={`${SOFT_BOX} px-3.5 py-3`}>
            <div className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-[#6a3f9e]" />
              <span className="truncate text-xs font-semibold text-[#24112f]">
                {invite.event?.name || "Purple Experience"}
              </span>
            </div>

            {details.length > 0 && (
              <p className="mt-1 text-[11px] leading-4 text-[#6f6577]">
                {details.join(" · ")}
              </p>
            )}
          </div>

          {hasLink ? (
            <div className="flex items-stretch gap-3">
              {/* QR */}
              <div className="flex shrink-0 flex-col items-center rounded-2xl border border-[#ECE6F3] bg-[#FAF8FD] p-2.5">
                <div className="rounded-xl border border-[#ECE6F3] bg-white p-1.5">
                  <QRCodeSVG
                    value={invite.inviteUrl}
                    size={104}
                    level="H"
                    fgColor="#24112f"
                    bgColor="#ffffff"
                  />
                </div>

                <a
                  href={invite.inviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#4B176B] hover:underline"
                >
                  Open page
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* Actions */}
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onShare(invite)}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[#B9D63B] px-3 py-2 text-xs font-semibold text-[#1E2A00] transition hover:bg-[#c6e04a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B9D63B]/40 active:scale-[0.98]"
                >
                  <Share2 size={14} />
                  Share
                </button>

                <ModalButton
                  onClick={() => onWhatsApp(invite)}
                  label="WhatsApp"
                  green
                />

                <ModalButton
                  onClick={() => onCopy(invite)}
                  icon={copied ? Check : Copy}
                  label={copied ? "Copied" : "Copy link"}
                />

                <ModalButton
                  onClick={() => onDownload(invite)}
                  icon={QrCode}
                  label="Download QR"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-4 text-amber-800">
              This invitation was created before share links were enabled.
              Create a new invitation to get a link and QR code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalButton({ onClick, disabled, icon: Icon, label, green = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${OUTLINE_BTN} px-3 py-2 text-xs ${
        green ? "text-[#1b8a4a]" : "text-[#4B176B]"
      }`}
    >
      {Icon && <Icon size={14} className={green ? "" : "text-[#6a3f9e]"} />}
      {label}
    </button>
  );
}