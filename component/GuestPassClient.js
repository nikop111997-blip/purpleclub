"use client";

import { useEffect, useMemo, useState } from "react";
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
   THEME TOKENS
   lime   #B9D63B  (primary action)
   purple #6a3f9e  (atmosphere)
   ink    #120d1a  (dark surfaces)
========================================================= */

// Reusable liquid-glass surface
const GLASS =
  "border border-white/25 bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]";

// Dark glass for panels / inputs
const GLASS_DARK =
  "border border-white/10 bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]";

// Solid lime primary button
const LIME_BTN =
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/40 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-6 py-3.5 text-sm font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.35)] transition duration-300 ease-out hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

// Notion-style status tags (tuned for dark surfaces)
const STATUS_CONFIG = {
  INVITED: {
    label: "Invited",
    className: "bg-white/10 text-white/70",
    dot: "bg-white/50",
  },
  REGISTERED: {
    label: "Registered",
    className: "bg-[#6a3f9e]/40 text-[#e0c9f7]",
    dot: "bg-[#c79cf5]",
  },
  ATTENDED: {
    label: "Attended",
    className: "bg-sky-400/15 text-sky-200",
    dot: "bg-sky-300",
  },
  MEMBER: {
    label: "Member",
    className: "bg-[#B9D63B]/20 text-[#DDF27A]",
    dot: "bg-[#B9D63B]",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-400/15 text-red-300",
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

    const url =
      `https://wa.me/${invite.guestMobile || ""}` +
      `?text=${encodeURIComponent(message)}`;

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
          <p className="text-sm text-gray-500">
            Loading your Purple community...
          </p>
        </div>
      </div>
    );
  }

  // ---------------- MAIN ----------------

  return (
    <div className="space-y-6 font-sans">
      {/* ================= HEADER ================= */}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-[1.05] tracking-tight text-[#1a0f24] sm:text-4xl">
            Your Purple Circle
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
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
          <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70" />
          <UserPlus size={16} className="relative" />
          <span className="relative">Invite someone</span>
        </button>
      </header>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <X size={16} />
          {error}
        </div>
      )}

      {/* ================= OVERVIEW ================= */}

      <section className="relative overflow-hidden rounded-[2rem] bg-[#120d1a] p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -left-12 -top-16 h-60 w-60 rounded-full bg-[#6a3f9e]/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-14 top-4 h-48 w-48 rounded-full bg-[#B9D63B]/20 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Level */}
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-[#B9D63B] ${GLASS}`}
              >
                {milestone.icon}
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-white ${GLASS}`}
                >
                  Current journey
                </span>

                <h2 className="mt-2 text-2xl font-bold leading-[1.05] tracking-tight">
                  {milestone.title}
                </h2>

                <p className="mt-1 text-xs text-white/60">
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
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  Referral journey
                </p>

                <p className="text-xs text-white/55">
                  {successful >= 100
                    ? "Purple Ambassador achieved"
                    : `${progress.remaining} more successful ${
                        progress.remaining === 1 ? "referral" : "referrals"
                      } to reach ${progress.target}.`}
                </p>
              </div>

              <span className="text-sm font-bold text-[#DDF27A]">
                {successful}/100
              </span>
            </div>

            <div className={`h-2.5 overflow-hidden rounded-full ${GLASS_DARK}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#CBE75A] to-[#B9D63B] shadow-[0_0_12px_rgba(185,214,59,0.6)] transition-all duration-700"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 text-[11px] text-white/40">
              <span className={successful >= 1 ? "font-semibold text-[#DDF27A]" : ""}>
                1 · Inspirer
              </span>
              <span
                className={`text-center ${
                  successful >= 10 ? "font-semibold text-[#DDF27A]" : ""
                }`}
              >
                10 · Icon
              </span>
              <span
                className={`text-right ${
                  successful >= 100 ? "font-semibold text-[#DDF27A]" : ""
                }`}
              >
                100 · Ambassador
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INVITES TABLE ================= */}

      <section className="relative overflow-hidden rounded-[2rem] bg-[#120d1a] text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#6a3f9e]/40 blur-3xl" />

        {/* Toolbar */}
        <div className="relative flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white">My invitations</h2>

            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white ${GLASS}`}
            >
              {invites.length}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className={`w-full rounded-full py-2 pl-9 pr-4 text-xs text-white outline-none transition placeholder:text-white/35 focus:border-[#B9D63B]/70 ${GLASS_DARK}`}
            />
          </div>
        </div>

        {invites.length === 0 ? (
          <div className="relative px-6 py-16 text-center">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-[#B9D63B] ${GLASS}`}
            >
              <Users size={26} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">
              No invitations yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-white/60">
              Invite someone to your next Purple experience and start your
              Inspirer journey.
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-medium text-white/45">
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
                      className="px-6 py-10 text-center text-xs text-white/45"
                    >
                      No invitations match “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count, Notion style */}
        {invites.length > 0 && (
          <div className="relative border-t border-white/10 px-5 py-3 text-[11px] text-white/40 sm:px-6">
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

      {/* ================= DETAIL MODAL ================= */}

      {selectedInvite && (
        <InviteModal
          invite={selectedInvite}
          copied={copied === selectedInvite.id}
          onCopy={copyInvite}
          onWhatsApp={shareWhatsApp}
          onShare={shareInvite}
          onDownload={downloadQR}
          onClose={() => setSelectedInvite(null)}
        />
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
          ? "border border-[#B9D63B]/30 bg-gradient-to-br from-[#B9D63B]/20 via-[#B9D63B]/[0.06] to-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
          : GLASS_DARK
      }`}
    >
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-[#DDF27A]" : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </p>
    </div>
  );
}

function Th({ icon: Icon, children }) {
  return (
    <th className="px-4 py-2.5 font-medium first:pl-5 sm:first:pl-6">
      <span className="flex items-center gap-1.5">
        <Icon size={13} className="text-white/35" />
        {children}
      </span>
    </th>
  );
}

function StatusTag({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.INVITED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${config.className}`}
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
      className="group cursor-pointer border-b border-white/[0.07] text-xs transition last:border-b-0 hover:bg-white/[0.04]"
    >
      {/* Name */}
      <td className="py-3 pl-5 pr-4 sm:pl-6">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              invite.isMember
                ? "bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00]"
                : GLASS_DARK + " text-[#B9D63B]"
            }`}
          >
            {invite.isMember ? <Check size={14} /> : <UserPlus size={13} />}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {invite.guestName}
            </p>

            {invite.isMember && (
              <p className="text-[10px] font-semibold text-[#DDF27A]">
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
      <td className="px-4 py-3 font-mono text-white/70">
        {invite.guestMobile || "—"}
      </td>

      {/* Experience */}
      <td className="px-4 py-3 text-white/70">
        {invite.event?.name || "Purple Experience"}
      </td>

      {/* Invited */}
      <td className="whitespace-nowrap px-4 py-3 text-white/50">
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
                className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-white transition hover:brightness-125 active:scale-95 ${GLASS_DARK}`}
              >
                {copied ? (
                  <Check size={13} className="text-[#B9D63B]" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                type="button"
                onClick={() => onWhatsApp(invite)}
                className={`flex h-8 items-center rounded-full px-3 text-[11px] font-semibold text-[#5ee58f] transition hover:brightness-125 active:scale-95 ${GLASS_DARK}`}
              >
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => onDownload(invite)}
                title="Download QR"
                aria-label="Download QR"
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:brightness-125 active:scale-95 ${GLASS_DARK}`}
              >
                <QrCode size={14} />
              </button>
            </>
          )}

          <ChevronRight
            size={16}
            className="ml-1 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-[#B9D63B]"
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 font-sans backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-white/10 bg-[#120d1a] text-white shadow-2xl"
      >
        {/* Header */}
        <div className="relative overflow-hidden px-4 pb-4 pt-4">
          <div className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full bg-[#6a3f9e]/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-2 h-28 w-28 rounded-full bg-[#B9D63B]/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white ${GLASS}`}
              >
                Purple invitation
              </span>

              <h2 className="mt-2 truncate text-lg font-bold leading-tight tracking-tight">
                {invite.guestName}
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusTag status={invite.status} />

                {invite.isMember && (
                  <span className="rounded-md bg-[#B9D63B]/20 px-2 py-0.5 text-[11px] font-semibold text-[#DDF27A]">
                    Purple Inspirer
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95 ${GLASS}`}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="space-y-3 px-4 pb-4">
          {/* Event */}
          <div className={`rounded-2xl px-3.5 py-3 ${GLASS_DARK}`}>
            <div className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-[#B9D63B]" />
              <span className="truncate text-xs font-semibold text-white">
                {invite.event?.name || "Purple Experience"}
              </span>
            </div>

            {details.length > 0 && (
              <p className="mt-1 text-[11px] leading-4 text-white/55">
                {details.join(" · ")}
              </p>
            )}
          </div>

          {hasLink ? (
            <div className="flex items-stretch gap-3">
              {/* QR */}
              <div className="flex shrink-0 flex-col items-center rounded-2xl border border-[#B9D63B]/30 bg-gradient-to-br from-[#B9D63B]/20 via-[#B9D63B]/[0.06] to-transparent p-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <div className="rounded-xl bg-white p-1.5">
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
                  className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#DDF27A] hover:underline"
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
                  className="group/btn relative flex items-center justify-center gap-1.5 overflow-hidden rounded-full border border-white/40 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-3 py-2 text-xs font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_6px_16px_rgba(185,214,59,0.3)] transition hover:brightness-105 active:scale-[0.98]"
                >
                  <span className="pointer-events-none absolute inset-x-3 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70" />
                  <Share2 size={14} className="relative" />
                  <span className="relative">Share</span>
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
            <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-3 text-[11px] leading-4 text-amber-200">
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
      className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition hover:brightness-125 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${GLASS} ${
        green ? "text-[#5ee58f]" : "text-white"
      }`}
    >
      {Icon && <Icon size={14} className={green ? "" : "text-[#B9D63B]"} />}
      {label}
    </button>
  );
}