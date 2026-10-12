"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Crown,
  HeartPulse,
  Loader2,
  Package,
  ShieldCheck,
  Users,
  VerifiedIcon,
  X,
} from "lucide-react";

/* =========================================================
   THEME TOKENS
   lime   #B9D63B  (highlight / primary action)
   purple #6a3f9e  (brand)
========================================================= */

const GLASS_LIGHT =
  "border border-white/70 bg-gradient-to-br from-white/75 via-white/45 to-white/30 backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_0_20px_rgba(255,255,255,0.25),0_12px_32px_-8px_rgba(106,63,158,0.15)]";

const GLASS_ROW =
  "border border-white/80 bg-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(106,63,158,0.05)] backdrop-blur-md";

const GLASS_ON_PURPLE =
  "border border-white/30 bg-gradient-to-br from-white/30 via-white/10 to-white/5 backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_0_12px_rgba(255,255,255,0.1),0_6px_18px_rgba(40,15,70,0.25)]";

const ICON_TILE =
  "flex shrink-0 items-center justify-center rounded-xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 text-[#4B176B] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]";

const LIME_TILE =
  "flex shrink-0 items-center justify-center rounded-xl border border-white/60 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_12px_rgba(185,214,59,0.4)]";

const LIME_BTN =
  "group/btn relative inline-flex h-10 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-5 text-sm font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.4)] transition duration-300 hover:brightness-105 active:scale-[0.98]";

const SHINE =
  "pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPlan(plan) {
  switch (plan) {
    case "PURPLE_MEMBERSHIP":
      return "Purple Membership";
    case "CHARTER_MEMBERSHIP":
      return "Charter Membership";
    default:
      return (
        plan
          ?.replaceAll("_", " ")
          ?.replace(/\b\w/g, (char) => char.toUpperCase()) ||
        "Purple Membership"
      );
  }
}

/* =========================================================
   PNG IMAGE WITH ICON FALLBACK
   Drop the PNG files into /public/images/...
   If a file is missing, the icon is shown instead.
========================================================= */

function PngImage({ src, alt, icon: Icon, className = "", iconSize = 30 }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          className="relative z-10 h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#8a5cc4] to-[#6a3f9e] text-white shadow-[0_6px_16px_rgba(106,63,158,0.4)]">
          <Icon size={iconSize * 0.75} />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STATUS BADGE (on purple)
========================================================= */

function StatusBadge({ status }) {
  const isActive = String(status).toUpperCase() === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${
        isActive
          ? "border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
          : `text-white ${GLASS_ON_PURPLE}`
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isActive ? "Active" : status || "Inactive"}
    </span>
  );
}

/* =========================================================
   CARD SHELL (with PNG image on top)
========================================================= */

function Card({
  icon: Icon,
  title,
  hint,
  image,
  imageAlt,
  children,
  className = "",
}) {
  return (
    <section
      className={`flex flex-col rounded-[2rem] font-sans p-5 ${GLASS_LIGHT} ${className}`}
    >
      {image && (
        <PngImage
          src={image}
          alt={imageAlt || title}
          icon={Icon}
          className="mb-4 h-32 rounded-3xl"
        />
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className={`h-10 w-10 ${ICON_TILE}`}>
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-[#24112f]">
            {title}
          </h2>

          {hint && <p className="truncate text-xs text-[#8b8190]">{hint}</p>}
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   SUNDAY EXPERIENCES
========================================================= */

function ExperienceCard({ experiences }) {
  const total = Number(experiences?.total || 0);
  const used = Number(experiences?.used || 0);
  const reserved = Number(experiences?.reserved || 0);

  const remaining = Math.max(total - used - reserved, 0);
  const usedPct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const reservedPct =
    total > 0 ? Math.min((reserved / total) * 100, 100 - usedPct) : 0;

  return (
    <Card
      icon={CalendarDays}
      title="Sunday experiences"
      hint="Included with your plan"
      image="/sunday.png"
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="text-5xl font-bold leading-none text-[#24112f]">
            {remaining}
          </p>
          <p className="mt-2 text-xs font-medium text-[#8b8190]">remaining</p>
        </div>

        <p className="text-sm font-semibold text-[#6a3f9e]">of {total}</p>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full border border-white/80 bg-white/50 p-[1.5px] shadow-[inset_0_1px_2px_rgba(106,63,158,0.15)]">
        <div className="relative h-full overflow-hidden rounded-full">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-b from-[#8a5cc4] to-[#6a3f9e]"
            style={{ width: `${usedPct}%` }}
          />
          <div
            className="absolute top-0 h-full bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] shadow-[0_0_10px_rgba(185,214,59,0.7)]"
            style={{ left: `${usedPct}%`, width: `${reservedPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Legend dot="bg-[#6a3f9e]" label="Used" value={used} />
        <Legend dot="bg-[#B9D63B]" label="Reserved" value={reserved} />
        <Legend dot="bg-[#d9d2e0]" label="Available" value={remaining} />
      </div>
    </Card>
  );
}

function Legend({ dot, label, value }) {
  return (
    <div className={`rounded-2xl px-1.5 py-2.5 text-center ${GLASS_ROW}`}>
      <p className="text-lg font-bold leading-none text-[#24112f]">{value}</p>
      <p className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-medium text-[#75677d]">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   PURPLE KIT
========================================================= */

function KitItem({ name, completed }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${GLASS_ROW}`}
    >
      <div className={`h-8 w-8 rounded-lg ${completed ? LIME_TILE : ICON_TILE}`}>
        {completed ? <Check size={15} /> : <Clock3 size={15} />}
      </div>

      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#2b1836]">
        {name}
      </p>

      <span
        className={`text-[11px] font-bold ${
          completed ? "text-[#526600]" : "text-[#8b8190]"
        }`}
      >
        {completed ? "Collected" : "Pending"}
      </span>
    </div>
  );
}

function PurpleKitCard({ kit }) {
  const included = Boolean(kit?.included);
  const tshirt = Boolean(kit?.tshirt);
  const shaker = Boolean(kit?.shaker);

  return (
    <Card
      icon={Package}
      title="Purple kit"
      hint="T-shirt and shaker"
      image="/mer.png"
    >
      {included ? (
        <div className="space-y-2.5">
          <KitItem name="Purple T-shirt" completed={tshirt} />
          <KitItem name="Purple shaker" completed={shaker} />
        </div>
      ) : (
        <div
          className={`flex flex-1 flex-col items-center justify-center rounded-2xl p-4 text-center ${GLASS_ROW}`}
        >
          <Package size={22} className="text-[#8b8190]" />
          <p className="mt-2 text-sm font-bold text-[#3b2a45]">
            Kit not included
          </p>
        </div>
      )}
    </Card>
  );
}

/* =========================================================
   BODY ASSESSMENT
========================================================= */

function BodyAssessmentCard({ assessment }) {
  const included = Boolean(assessment?.included);
  const completed = Boolean(assessment?.completed);

  return (
    <Card
      icon={HeartPulse}
      title="Body assessment"
      hint="Body composition"
      image="/ass.png"
    >
      {!included ? (
        <div
          className={`flex flex-1 items-center justify-center rounded-2xl p-4 text-center ${GLASS_ROW}`}
        >
          <p className="text-xs font-semibold text-[#8b8190]">
            Not included in this membership
          </p>
        </div>
      ) : (
        <div
          className={`flex flex-1 flex-col justify-between rounded-3xl p-4 ${GLASS_ROW}`}
        >
          <div className="flex items-start gap-3">
            <div className={`h-11 w-11 ${completed ? LIME_TILE : ICON_TILE}`}>
              {completed ? <Check size={20} /> : <Activity size={20} />}
            </div>

            <div className="min-w-0">
              <p className="text-base font-bold text-[#2b1836]">
                {completed ? "Completed" : "Pending"}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8b8190]">
                {completed && assessment.completedAt
                  ? `Done on ${formatDate(assessment.completedAt)}`
                  : "Your included assessment is waiting to be completed."}
              </p>
            </div>
          </div>

          <span
            className={`mt-4 w-fit rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ${
              completed
                ? "border-[#B9D63B]/60 bg-gradient-to-br from-[#B9D63B]/40 to-[#B9D63B]/15 text-[#44590d]"
                : "border-[#6a3f9e]/20 bg-gradient-to-br from-[#6a3f9e]/15 to-[#6a3f9e]/5 text-[#4B176B]"
            }`}
          >
            {completed ? "Completed" : "Pending"}
          </span>
        </div>
      )}
    </Card>
  );
}

/* =========================================================
   BENEFITS TIMELINE
   Horizontal on desktop, vertical on mobile.
   Each step has its own PNG: /public/images/benefits/<file>.png
========================================================= */

const BENEFITS = [
  {
    title: "Purple Kit",
    desc: "T-shirt and shaker",
    icon: Package,
    image: "/images/benefits/purple-kit.png",
  },
  {
    title: "4 Sunday Experiences",
    desc: "Guided community sessions",
    icon: CalendarDays,
    image: "/images/benefits/sunday-experience.png",
  },
  {
    title: "Body Composition Assessment",
    desc: "Know your starting point",
    icon: Activity,
    image: "/images/benefits/body-assessment.png",
  },
  {
    title: "Purple Health Snapshot",
    desc: "Your health at a glance",
    icon: HeartPulse,
    image: "/images/benefits/health-snapshot.png",
  },
  {
    title: "Community Access",
    desc: "Join the Purple community",
    icon: Users,
    image: "/images/benefits/community.png",
  },
  {
    title: "Inspirer → Icon Journey",
    desc: "Grow and earn recognition",
    icon: Crown,
    image: "/images/benefits/journey.png",
  },
];

function BenefitsTimeline() {
  return (
    <section className={`rounded-[2rem] p-5 sm:p-6 ${GLASS_LIGHT}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className={`h-10 w-10 ${ICON_TILE}`}>
          <ShieldCheck size={18} />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-[#24112f]">
            Benefits
          </h2>
          <p className="truncate text-xs text-[#8b8190]">
            Included with your membership
          </p>
        </div>
      </div>

      <ol className="relative grid gap-5 lg:grid-cols-6 lg:gap-4">
        {/* horizontal line (desktop) */}
        <span className="pointer-events-none absolute left-[8%] right-[8%] top-[5.75rem] hidden h-0.5 rounded-full bg-gradient-to-r from-[#6a3f9e]/30 via-[#B9D63B] to-[#6a3f9e]/30 lg:block" />

        {BENEFITS.map(({ title, desc, icon: Icon, image }, index) => (
          <li
            key={title}
            className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
          >
            {/* vertical line (mobile) */}
            {index < BENEFITS.length - 1 && (
              <span className="pointer-events-none absolute bottom-[-1.25rem] left-[2.75rem] top-[5.5rem] w-0.5 rounded-full bg-gradient-to-b from-[#B9D63B] to-[#6a3f9e]/30 lg:hidden" />
            )}

            <PngImage
              src={image}
              alt={title}
              icon={Icon}
              className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-3xl lg:h-24 lg:w-full"
            />

            {/* node */}
            <span className="absolute left-[2.1rem] top-[5.1rem] z-10 hidden h-3 w-3 rounded-full border-2 border-white bg-[#B9D63B] shadow-[0_0_8px_rgba(185,214,59,0.8)] max-lg:block lg:static lg:mt-3 lg:block lg:h-3.5 lg:w-3.5" />

            <div className="min-w-0 self-center lg:mt-3 lg:self-auto">
              <div className="flex items-center gap-2 lg:justify-center">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/60 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00]">
                  <Icon size={12} strokeWidth={2.5} />
                </span>

                <p className="text-sm font-bold leading-tight text-[#2b1836]">
                  {title}
                </p>
              </div>

              <p className="mt-1 text-xs text-[#8b8190]">{desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* =========================================================
   CHARTER STRIP
========================================================= */

function CharterUpgradeCard({ onUpgrade }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#6a3f9e] p-5 text-white shadow-[0_20px_50px_-20px_rgba(106,63,158,0.6)] sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.2),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(185,214,59,0.22),transparent_40%),linear-gradient(160deg,#7a4cb0_0%,#6a3f9e_50%,#5a2f8c_100%)]" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[#E4F58C] ${GLASS_ON_PURPLE}`}
          >
            <Crown size={22} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold">Charter Membership</h2>
            <p className="mt-0.5 text-sm text-white/75">
              Exclusive benefits, premium experiences and Charter recognition.
            </p>
          </div>
        </div>

        <button type="button" onClick={onUpgrade} className={LIME_BTN}>
          <span className={SHINE} />
          <span className="relative">Upgrade to Charter</span>
          <ArrowUpRight
            size={15}
            className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
          />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   UPGRADE MODAL
========================================================= */

function UpgradeModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#24112f]/40 p-4 font-sans backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-white/95 via-white/85 to-[#f3ecfa]/90 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_30px_80px_rgba(53,16,77,0.35)] backdrop-blur-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`h-11 w-11 ${ICON_TILE}`}>
            <Crown size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#24112f]">
              Charter Membership
            </h3>
            <p className="mt-1 text-sm leading-5 text-[#7d7184]">
              Charter Membership upgrades will be available soon.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4B176B] ${GLASS_ROW}`}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div
          className={`mt-4 flex items-start gap-2.5 rounded-2xl p-3.5 ${GLASS_ROW}`}
        >
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#6a3f9e]" />

          <div>
            <p className="text-xs font-semibold text-[#4d3b57]">
              Charter is coming soon
            </p>
            <p className="mt-1 text-[11px] leading-4 text-[#8b8190]">
              We're preparing the Charter Membership experience. Upgrade and
              payment will be available here later.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`${LIME_BTN} mt-4 w-full`}
        >
          <span className={SHINE} />
          <span className="relative">Got it</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   NO MEMBERSHIP
========================================================= */

function NoMembership() {
  return (
    <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-[#6a3f9e]/25 bg-white/40 p-8 text-center backdrop-blur-md">
      <div className={`h-14 w-14 rounded-2xl ${ICON_TILE}`}>
        <ShieldCheck size={25} />
      </div>

      <h2 className="mt-4 text-lg font-bold text-[#24112f]">
        No active membership
      </h2>

      <p className="mx-auto mt-1 max-w-md text-sm leading-5 text-[#8b8190]">
        You don't currently have an active Purple membership.
      </p>
    </div>
  );
}

function DateChip({ label, value }) {
  return (
    <div className={`rounded-2xl px-4 py-2.5 ${GLASS_ON_PURPLE}`}>
      <p className="text-[11px] font-semibold text-white/65">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MembershipClient() {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function loadMembership() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/user/membership", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load membership");
      }

      setMembership(data.membership || null);
    } catch (err) {
      console.error("MEMBERSHIP LOAD ERROR:", err);
      setError(err?.message || "Failed to load membership");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembership();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#6a3f9e]">
          <Loader2 size={18} className="animate-spin" />
          Loading membership...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 font-sans text-sm text-red-700 backdrop-blur-md">
        <p>{error}</p>
        <button
          type="button"
          onClick={loadMembership}
          className="mt-2 font-bold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!membership) {
    return (
      <>
        <header className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#1a0f24]">
            Membership
          </h1>
          <p className="mt-1 text-xs text-[#8a8190]">
            View and manage your Purple membership
          </p>
        </header>

        <NoMembership />
      </>
    );
  }

  const {
    plan = "PURPLE_MEMBERSHIP",
    amount = 1499,
    status = "ACTIVE",
    startDate = null,
    endDate = null,
    sundayExperiences = {},
    bodyAssessment = {},
    purpleKit = {},
  } = membership;

  const isCharter = plan === "CHARTER_MEMBERSHIP";

  return (
    <>
      {/* ================= SUMMARY ================= */}
      <div className="relative overflow-hidden rounded-[2rem] bg-[#6a3f9e] p-5 font-sans text-white shadow-[0_24px_60px_-20px_rgba(106,63,158,0.6)] sm:p-7">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[#E4F58C] ${GLASS_ON_PURPLE}`}
            >
              <VerifiedIcon size={24} />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/70">
                Your membership
              </p>
              <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {formatPlan(plan)}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <DateChip label="Started" value={formatDate(startDate)} />
            <DateChip
              label="Ends"
              value={endDate ? formatDate(endDate) : "No expiry"}
            />

            <div className="ml-1 flex items-center gap-3">
              <p className="text-3xl font-bold">
                ₹{Number(amount).toLocaleString("en-IN")}
              </p>
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>

      {/* ============ ROW 1: THREE CARDS ============ */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ExperienceCard experiences={sundayExperiences} />
        <PurpleKitCard kit={purpleKit} />
        <BodyAssessmentCard assessment={bodyAssessment} />
      </div>

      {/* ============ ROW 2: BENEFITS TIMELINE ============ */}
      <div className="mt-6">
        <BenefitsTimeline />
      </div>

      {/* ================= CHARTER ================= */}
      <div className="mt-6">
        {!isCharter ? (
          <CharterUpgradeCard onUpgrade={() => setShowUpgrade(true)} />
        ) : (
          <div
            className={`flex items-center gap-4 rounded-[2rem] p-5 ${GLASS_LIGHT}`}
          >
            <div className={`h-11 w-11 ${LIME_TILE}`}>
              <Crown size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#24112f]">
                You're a Charter Member
              </p>
              <p className="text-[11px] text-[#667400]">
                Enjoy your Charter membership benefits.
              </p>
            </div>
          </div>
        )}
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}