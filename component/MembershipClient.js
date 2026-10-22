"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Check,
  Copy,
  Crown,
  HeartPulse,
  Loader2,
  Lock,
  MapPin,
  MoreHorizontal,
  Package,
  Search,
  Shirt,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   TOKENS
========================================================= */

const CARD =
  "rounded-[1.5rem] border border-[#ece3f4] bg-white shadow-[0_1px_2px_rgba(75,23,107,0.04)]";

const BTN_DARK =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#3a1054] px-4 text-[13px] font-semibold text-white transition hover:bg-[#4B176B] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B176B] disabled:cursor-not-allowed disabled:opacity-45";

const BTN_LIME =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#C4E04A] px-4 text-[13px] font-bold text-[#1E2A00] transition hover:bg-[#B9D63B] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2A00] disabled:cursor-not-allowed disabled:opacity-45";

const BTN_OUTLINE =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#3a1054]/30 bg-white px-4 text-[13px] font-semibold text-[#3a1054] transition hover:bg-[#f6f0fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B176B] disabled:opacity-50";

const ICON_TILE =
  "flex shrink-0 items-center justify-center rounded-full border border-[#ece3f4] bg-white text-[#3a1054]";

/* =========================================================
   HELPERS
========================================================= */

const DAY = 86400000;

function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatPlan(plan) {
  const p = String(plan || "").toUpperCase();
  if (p === "PURPLE_MEMBERSHIP") return "Purple Membership";
  if (p === "CHARTER_MEMBERSHIP") return "Charter Membership";
  return (
    p.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Purple Membership"
  );
}

function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

function effectiveStatus(m, now = Date.now()) {
  if (!m) return "INACTIVE";
  const s = String(m.status || "").toUpperCase();
  if (s === "ACTIVE" && m.endDate && new Date(m.endDate).getTime() <= now) return "EXPIRED";
  return s || "INACTIVE";
}


const BENEFIT_DEFS = [
  {
    key: "tshirt",
    title: "Purple T-shirt",
    note: "Tick once you have it in hand",
    icon: Shirt,
    included: (m) =>
      (m.purpleKit?.included === true && m.purpleKit?.tshirtIncluded !== false) ||
      m.firstMembershipBenefits?.tshirt === true,
    collected: (m) => m.purpleKit?.tshirt === true,
  },
  {
    key: "shaker",
    title: "Purple shaker",
    note: "Tick once you have it in hand",
    icon: Package,
    included: (m) => m.purpleKit?.included === true && m.purpleKit?.shakerIncluded !== false,
    collected: (m) => m.purpleKit?.shaker === true,
  },
  {
    key: "bodyAssessment",
    title: "Body assessment",
    note: "Tick once it has been done",
    icon: HeartPulse,
    included: (m) =>
      m.bodyAssessment?.included === true || m.firstMembershipBenefits?.bodyAssessment === true,
    collected: (m) => m.bodyAssessment?.completed === true,
  },
];

function receiptFor(m, key) {
  return m.receiptConfirmations?.[key] || m.benefitReceipts?.[key] || null;
}

function resolveBenefits(history) {
  const ordered = [...history].sort(
    (a, b) =>
      new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0)
  );

  return BENEFIT_DEFS.map((def) => {
    const sources = ordered.filter((m) => def.included(m));
    if (!sources.length) return { ...def, included: false, received: false, ownerId: null };

    const done = sources.find(
      (m) => receiptFor(m, def.key)?.received === true || def.collected(m)
    );
    if (done) {
      return {
        ...def,
        included: true,
        received: true,
        confirmedAt: receiptFor(done, def.key)?.confirmedAt || null,
        ownerId: String(done._id ?? done.id),
      };
    }

    const owner = sources[0];
    return {
      ...def,
      included: true,
      received: false,
      ownerId: String(owner._id ?? owner.id),
      fromFirst: owner.isFirstMembership === true,
    };
  });
}

/* =========================================================
   SMALL PIECES
========================================================= */

function StatusPill({ status }) {
  const s = String(status || "").toUpperCase();
  const active = s === "ACTIVE";
  const label = active ? "Active" : s === "EXPIRED" ? "Expired" : s ? s[0] + s.slice(1).toLowerCase() : "Inactive";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        active ? "bg-[#C4E04A] text-[#1E2A00]" : "bg-[#efe7f6] text-[#6b5a7a]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function CardHeader({ icon: Icon, title, right }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className={`h-9 w-9 ${ICON_TILE}`}>
          <Icon size={16} />
        </div>
        <h2 className="truncate text-sm font-bold text-[#24112f]">{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* =========================================================
   CHARTER UPSELL (top strip)
========================================================= */

function CharterStrip({ onOpen, image = "/charter.png" }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="relative max-w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-[#cfade4] via-[#450374] to-[#1d0830] text-white shadow-[0_20px_40px_-20px_rgba(132,52,183,0.7)]">
      {/* Image */}
      <div className="relative h-56">
        {!imgFailed && (
          <img
            src={image}
            alt="Purple Club Charter"
            className="h-full w-full object-cover object-top pt-4"
            onError={() => setImgFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#5a1f85] via-[#1d0830]/60 " />
      </div>

      {/* Content */}
      <div className="-mt-6 px-5 pb-5">
        <h2 className="relative text-xl font-extrabold leading-tight tracking-tight">
          Bring Purple Club to your city/area, become a Charter member
        </h2>
        <p className="mt-2 text-sm text-white/75">
          Get a chance to become a coach operator for {money(15999)} a year.
        </p>

        <button type="button" onClick={onOpen} className={`${BTN_LIME} mt-5 w-full`}>
          Explore Open Locations
          <ArrowUpRight size={14} />
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   PASS CARD (primary, wide)
========================================================= */

function PlanSwitch({ isCharter, onCharter }) {
  const base = "rounded-full px-3.5 py-1.5 text-xs font-bold transition";
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-[#f3ecf9] p-1">
      <span
        className={`${base} ${
          !isCharter ? "bg-white text-[#3a1054] shadow-sm" : "text-[#8b7a99]"
        }`}
      >
        Purple
      </span>
      {isCharter ? (
        <span className={`${base} bg-white text-[#3a1054] shadow-sm`}>Charter</span>
      ) : (
        <button
          type="button"
          onClick={onCharter}
          className={`${base} text-[#8b7a99] hover:text-[#3a1054] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4B176B]`}
        >
          Charter
        </button>
      )}
    </div>
  );
}

function MemberId({ id }) {
  const [copied, setCopied] = useState(false);
  if (!id) return null;
  const short = String(id).slice(-8).toUpperCase();

  async function copy() {
    try {
      await navigator.clipboard.writeText(String(id));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="text-right">
      <p className="text-[11px] text-[#8b8190]">Member ID</p>
      <button
        type="button"
        onClick={copy}
        className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-bold tracking-wide text-[#24112f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4B176B]"
        aria-label="Copy member ID"
      >
        {short}
        {copied ? <Check size={13} className="text-[#526600]" /> : <Copy size={13} className="text-[#8b8190]" />}
      </button>
    </div>
  );
}

function PassCard({ membership, status, isCharter, onCharter, onJumpHistory }) {
  const active = status === "ACTIVE";
  const end = membership.endDate ? new Date(membership.endDate).getTime() : null;
  const daysLeft = end ? Math.max(Math.ceil((end - Date.now()) / DAY), 0) : null;

  return (
    <section className={`${CARD} flex flex-col p-4 sm:p-5 lg:col-span-2`}>
      <div className="flex items-start justify-between gap-3">
        <PlanSwitch isCharter={isCharter} onCharter={onCharter} />
        <MemberId id={membership.memberId} />
      </div>

      <div className="mt-5">
        <p className="text-xs text-[#8b8190]">{active ? "Active membership" : "Previous membership"}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {active && daysLeft !== null ? (
            <p className="text-4xl font-bold tracking-tight text-[#1a0f24] sm:text-5xl">
              {daysLeft}
              <span className="ml-2 text-lg font-semibold text-[#8b8190]">
                {daysLeft === 1 ? "day left" : "days left"}
              </span>
            </p>
          ) : (
            <p className="text-4xl font-bold tracking-tight text-[#1a0f24] sm:text-5xl">
              {active ? "No expiry" : "Expired"}
            </p>
          )}
          <StatusPill status={status} />
        </div>
        <p className="mt-1.5 text-sm font-semibold text-[#3a1054]">{formatPlan(membership.plan)}</p>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Started", formatDate(membership.startDate)],
          [active ? "Ends" : "Ended", membership.endDate ? formatDate(membership.endDate) : "No expiry"],
          ["Paid", money(membership.amount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[#faf6fd] px-3 py-2">
            <dt className="text-[11px] text-[#8b8190]">{label}</dt>
            <dd className="mt-0.5 truncate text-[13px] font-bold text-[#24112f]">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {active ? (
          !isCharter && (
            <button type="button" className={BTN_DARK} onClick={onCharter}>
              <Crown size={14} /> Upgrade to Charter
            </button>
          )
        ) : (
          <button type="button" className={BTN_DARK} onClick={() => window.location.assign("/membership/plans")}>
            <ShoppingCart size={14} /> Renew membership
          </button>
        )}
        <button type="button" className={BTN_OUTLINE} onClick={onJumpHistory}>
          View history
        </button>
        <MoreHorizontal size={16} className="mx-1 text-[#b3a6bf]" aria-hidden />

        <button
          type="button"
          onClick={active ? onCharter : () => window.location.assign("/membership/plans")}
          aria-label={active ? "Explore Charter" : "Renew membership"}
          className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C4E04A] text-[#1E2A00] transition hover:bg-[#B9D63B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2A00]"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   BENEFITS CARD (lime, with permanent receipt confirmation)
========================================================= */

function BenefitsCard({ benefits, onSubmit, saving, error }) {
  const [draft, setDraft] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const shown = benefits.filter((b) => b.included);
  const pending = shown.filter((b) => !b.received);
  const selected = pending.filter((b) => draft[b.key]);

  async function confirm() {
    try {
      await onSubmit(selected);
      setConfirmOpen(false);
      setDraft({});
    } catch {
      /* keep dialog open for retry */
    }
  }

  return (
    <>
      <section className="relative flex flex-col overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#CFE95F] to-[#B9D63B] p-4 text-[#1E2A00] sm:p-5">
        <Sparkles
          size={150}
          strokeWidth={1}
          className="pointer-events-none absolute -right-10 -top-8 text-white/25"
          aria-hidden
        />

        <div className="relative flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#3a1054] py-1 pl-3.5 pr-1 text-xs font-semibold text-white">
            Your benefits
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#3a1054]">
              <Package size={13} />
            </span>
          </span>
        </div>

        <div className="relative mt-4">
          <p className="text-xs font-medium text-[#1E2A00]/70">
            {shown.length ? (pending.length ? "Waiting for your confirmation" : "All confirmed") : "Nothing included"}
          </p>
          <p className="mt-1 flex items-baseline gap-2 text-4xl font-bold tracking-tight">
            {pending.length}
            <span className="text-base font-semibold text-[#1E2A00]/70">to confirm</span>
          </p>
        </div>

        <ul className="relative mt-4 space-y-2">
          {!shown.length && (
            <li className="rounded-2xl bg-white/45 p-3 text-xs font-medium">
              No kit or assessment is included with your memberships.
            </li>
          )}

          {shown.map((b) => {
            const Icon = b.icon;
            const checked = b.received || Boolean(draft[b.key]);
            return (
              <li key={b.key}>
                <label
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
                    b.received
                      ? "bg-white/35"
                      : checked
                        ? "bg-white/80 ring-2 ring-[#3a1054]"
                        : "cursor-pointer bg-white/55 hover:bg-white/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    disabled={b.received || saving}
                    onChange={(e) => setDraft((d) => ({ ...d, [b.key]: e.target.checked }))}
                  />
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#3a1054]">
                    <Icon size={15} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{b.title}</span>
                    <span className="block truncate text-[11px] text-[#1E2A00]/70">
                      {b.received
                        ? b.confirmedAt
                          ? `Confirmed ${formatDate(b.confirmedAt)}`
                          : "Received"
                        : b.fromFirst
                          ? "From your first membership"
                          : b.note}
                    </span>
                  </span>

                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#3a1054] ${
                      b.received
                        ? "border-transparent bg-[#3a1054] text-white"
                        : checked
                          ? "border-[#3a1054] bg-[#3a1054] text-white"
                          : "border-[#1E2A00]/40 bg-white/60 text-transparent"
                    }`}
                  >
                    {b.received ? <Lock size={11} /> : <Check size={13} strokeWidth={3} />}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        {pending.length > 0 && (
          <div className="relative mt-4">
            <button
              type="button"
              className={`${BTN_DARK} w-full`}
              disabled={!selected.length || saving}
              onClick={() => setConfirmOpen(true)}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Confirm {selected.length ? `${selected.length} selected` : "receipt"}
            </button>
            <p className="mt-2 text-center text-[11px] text-[#1E2A00]/70">
              Confirmed items are locked permanently.
            </p>
          </div>
        )}

        {error && !confirmOpen && (
          <p role="alert" className="relative mt-2 text-xs font-semibold text-red-800">
            {error}
          </p>
        )}
      </section>

      {confirmOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#24112f]/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-title"
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
          >
            <h3 id="receipt-title" className="text-base font-bold text-[#24112f]">
              Confirm you received these?
            </h3>
            <p className="mt-1.5 text-sm text-[#75677d]">This can't be changed once confirmed.</p>

            <ul className="mt-3 space-y-1.5">
              {selected.map((b) => (
                <li key={b.key} className="flex items-center gap-2 text-sm font-semibold text-[#2b1836]">
                  <Check size={15} className="text-[#6a3f9e]" />
                  {b.title}
                </li>
              ))}
            </ul>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button type="button" className={`${BTN_OUTLINE} flex-1`} disabled={saving} onClick={() => setConfirmOpen(false)}>
                Go back
              </button>
              <button type="button" className={`${BTN_DARK} flex-1`} disabled={saving || !selected.length} onClick={confirm}>
                {saving ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   VALIDITY (donut)
========================================================= */

function ValidityCard({ membership, status }) {
  const active = status === "ACTIVE";
  const start = new Date(membership.startDate).getTime();
  const end = membership.endDate ? new Date(membership.endDate).getTime() : null;
  const now = Date.now();

  const totalDays = end ? Math.max(Math.round((end - start) / DAY), 1) : null;
  const daysLeft = end ? Math.max(Math.ceil((end - now) / DAY), 0) : null;
  const pct = end ? (active ? Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100) : 100) : 0;

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <section className={`${CARD} p-4`}>
      <CardHeader
        icon={CalendarDays}
        title="Validity"
        right={
          totalDays && (
            <span className="rounded-full border border-[#ece3f4] px-3 py-1 text-xs font-semibold text-[#3a1054]">
              {totalDays} days
            </span>
          )
        }
      />

      <div className="flex flex-col items-center py-1">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" role="img" aria-label={`${Math.round(pct)} percent of membership elapsed`}>
            <circle cx="64" cy="64" r={R} fill="none" stroke="#ece3f4" strokeWidth="11" />
            <circle
              cx="64"
              cy="64"
              r={R}
              fill="none"
              stroke={active ? "#B9D63B" : "#cdb9e0"}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (C * pct) / 100}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-[#24112f]">{active && daysLeft !== null ? daysLeft : "0"}</p>
            <p className="text-[11px] text-[#8b8190]">days left</p>
          </div>
        </div>

        <p className="mt-2 rounded-full border border-[#ece3f4] px-3 py-1.5 text-xs text-[#75677d]">
          {Math.round(pct)}% of your period used
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[#75677d]">
        <span>{formatDate(membership.startDate)}</span>
        <span className="font-semibold text-[#24112f]">
          {membership.endDate ? formatDate(membership.endDate) : "No expiry"}
        </span>
      </div>
    </section>
  );
}

/* =========================================================
   INCLUDED
========================================================= */

const INCLUDED = [
  { title: "Purple kit", desc: "T-shirt and shaker", icon: Package },
  { title: "4 Sunday experiences", desc: "Guided community sessions", icon: CalendarDays },
  { title: "Body composition assessment", desc: "Know your starting point", icon: Activity },
  { title: "Purple health snapshot", desc: "Your health at a glance", icon: HeartPulse },
  { title: "Community access", desc: "Join the Purple community", icon: Users },
  { title: "Inspirer to Icon journey", desc: "Grow and earn recognition", icon: Crown },
];

function IncludedCard({ sunday }) {
  const total = Number(sunday?.total || 0);
  const used = Number(sunday?.used || 0);
  const reserved = Number(sunday?.reserved || 0);
  const usedPct = total ? Math.min((used / total) * 100, 100) : 0;
  const reservedPct = total ? Math.min((reserved / total) * 100, 100 - usedPct) : 0;

  return (
    <section className={`${CARD} p-4`}>
      <CardHeader icon={ShieldCheck} title="What's included" />

      {total > 0 && (
        <div className="mb-3 rounded-xl bg-[#faf6fd] p-3">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-[#24112f]">Sunday experiences</span>
            <span className="text-[#75677d]">
              {used} used, {reserved} reserved of {total}
            </span>
          </div>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-[#ece3f4]">
            <div className="h-full bg-[#6a3f9e]" style={{ width: `${usedPct}%` }} />
            <div className="h-full bg-[#B9D63B]" style={{ width: `${reservedPct}%` }} />
          </div>
        </div>
      )}

      <ul className="divide-y divide-[#f3ecf9]">
        {INCLUDED.map(({ title, desc, icon: Icon }) => (
          <li key={title} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3ecf9] text-[#4B176B]">
              <Icon size={14} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-[#2b1836]">{title}</span>
              <span className="block truncate text-[11px] text-[#8b8190]">{desc}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* =========================================================
   HISTORY (transactions style)
========================================================= */

function HistoryCard({ history, sectionRef }) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? history : history.slice(0, 4);

  return (
    <section ref={sectionRef} id="membership-history" className={`${CARD} scroll-mt-4 p-4`}>
      <CardHeader
        icon={ShoppingCart}
        title="Membership history"
        right={
          history.length > 4 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full border border-[#ece3f4] px-3 py-1 text-xs font-semibold text-[#3a1054] hover:bg-[#f6f0fb]"
            >
              {expanded ? "Show less" : "View all"}
            </button>
          )
        }
      />

      {!history.length ? (
        <p className="rounded-xl bg-[#faf6fd] p-4 text-center text-xs text-[#7d7184]">No memberships yet.</p>
      ) : (
        <ul className="divide-y divide-[#f3ecf9]">
          {rows.map((m, i) => {
            const status = effectiveStatus(m);
            const charter = String(m.plan || "").toUpperCase() === "CHARTER_MEMBERSHIP";
            const Icon = charter ? Crown : ShieldCheck;
            return (
              <li key={String(m._id || m.id || i)} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className={`h-9 w-9 ${ICON_TILE}`}>
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-[#2b1836]">
                    {formatPlan(m.plan)}
                  </span>
                  <span className="block truncate text-[11px] text-[#8b8190]">
                    {formatDate(m.startDate)}
                    {m.isFirstMembership ? ", first membership" : ""}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-[13px] font-bold text-[#24112f]">{money(m.amount)}</span>
                  <span
                    className={`block text-[11px] font-semibold ${
                      status === "ACTIVE" ? "text-[#526600]" : "text-[#8b8190]"
                    }`}
                  >
                    {status === "ACTIVE" ? "Active" : status === "EXPIRED" ? "Expired" : status.toLowerCase()}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* =========================================================
   CHARTER CLUB MODAL
========================================================= */

function CharterClubModal({ onClose }) {
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadClubs() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/clubs/charter-availability", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Unable to load available Charter clubs.");
      }
      const list = Array.isArray(data.clubs) ? data.clubs : [];
      setClubs(
        list.filter((c) => c.isCharterMembershipAvailable === true && Number(c.availablePlaces ?? 0) > 0)
      );
    } catch (err) {
      console.error("CHARTER CLUB LOAD ERROR:", err);
      setError(err?.message || "Unable to load available Charter clubs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter((c) =>
      [c.name, c.city, c.area, c.state].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [clubs, search]);

  const selected = clubs.find((c) => String(c._id ?? c.id) === selectedClub);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#24112f]/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="charter-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start gap-3 border-b border-[#f3ecf9] p-5">
          <div className={`h-10 w-10 ${ICON_TILE}`}>
            <Crown size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="charter-title" className="text-base font-bold text-[#24112f]">
              Upgrade to Charter
            </h3>
            <p className="mt-0.5 text-xs text-[#7d7184]">
              {money(15999)} a year. {loading ? "Checking clubs…" : `${clubs.length} clubs have places.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#4B176B] hover:bg-[#f6f0fb]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3.5 p-5">
          <div className="relative">
            <label htmlFor="club-search" className="sr-only">
              Search clubs
            </label>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8190]" />
            <input
              id="club-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by club, city or area"
              className="h-10 w-full rounded-xl border border-[#e0d3ec] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#6a3f9e] focus:ring-2 focus:ring-[#6a3f9e]/15"
            />
          </div>

          <div>
            <label htmlFor="club-select" className="mb-1.5 block text-xs font-bold text-[#2b1836]">
              Preferred club
            </label>
            <select
              id="club-select"
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              disabled={loading || !filtered.length}
              className="h-11 w-full rounded-xl border border-[#e0d3ec] bg-white px-3 text-sm outline-none focus:border-[#6a3f9e] focus:ring-2 focus:ring-[#6a3f9e]/15 disabled:opacity-60"
            >
              <option value="">
                {loading ? "Loading clubs…" : filtered.length ? "Choose a club" : "No clubs found"}
              </option>
              {filtered.map((c) => {
                const id = String(c._id ?? c.id);
                const places = Number(c.availablePlaces ?? 0);
                return (
                  <option key={id} value={id}>
                    {c.name}
                    {c.city ? ` — ${c.city}` : ""}
                    {c.area ? `, ${c.area}` : ""} ({places} {places === 1 ? "place" : "places"})
                  </option>
                );
              })}
            </select>
          </div>

          {loading && (
            <p className="flex items-center gap-2 text-xs text-[#7d7184]">
              <Loader2 size={14} className="animate-spin text-[#6a3f9e]" /> Checking availability…
            </p>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
              <button type="button" onClick={loadClubs} className="ml-2 font-bold underline">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && clubs.length === 0 && (
            <p className="rounded-xl bg-[#faf6fd] p-3 text-center text-sm text-[#7d7184]">
              No Charter places are open right now. Check back later.
            </p>
          )}

          {selected && (
            <div className="flex items-start gap-3 rounded-2xl bg-[#f6f0fb] p-3.5">
              <MapPin size={16} className="mt-0.5 text-[#6a3f9e]" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#24112f]">{selected.name}</p>
                <p className="mt-0.5 text-xs text-[#7d7184]">
                  {[selected.area, selected.city, selected.state].filter(Boolean).join(", ") || "Location not specified"}
                </p>
                <p className="mt-1 text-xs font-bold text-[#526600]">
                  {selected.availablePlaces} {Number(selected.availablePlaces) === 1 ? "place" : "places"} available
                </p>
              </div>
            </div>
          )}

          <button type="button" disabled className={`${BTN_OUTLINE} h-10 w-full`}>
            Charter upgrade opens soon
          </button>
          <p className="text-center text-[11px] text-[#8b8190]">
            Choosing a club doesn't reserve a place. Payment opens when upgrades launch.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function MembershipClient() {
  const [membership, setMembership] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function loadMembership(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const res = await fetch("/api/auth/user/membership", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to load membership");

      const current = data.membership
        ? { ...data.membership, benefitReceipts: data.benefitReceipts || data.membership.benefitReceipts || {} }
        : null;

      let list = Array.isArray(data.membershipHistory) ? data.membershipHistory : current ? [current] : [];
      if (current) {
        list = list.map((m) => (String(m._id ?? m.id) === String(current._id) ? { ...m, ...current } : m));
      }

      setMembership(current);
      setHistory(list);
    } catch (err) {
      console.error("MEMBERSHIP LOAD ERROR:", err);
      setError(err?.message || "Failed to load membership");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadMembership();
  }, []);

  const benefits = useMemo(() => resolveBenefits(history), [history]);

  // Each benefit is posted against the membership that actually granted it (may be an older one).
  async function submitReceipts(selected) {
    try {
      setSaving(true);
      setReceiptError("");

      const byMembership = selected.reduce((acc, b) => {
        (acc[b.ownerId] ||= []).push(b.key);
        return acc;
      }, {});

      for (const [membershipId, items] of Object.entries(byMembership)) {
        const res = await fetch("/api/auth/user/membership/receipts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ membershipId, items }),
        });
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error(data?.message || "Could not save your confirmation.");
      }

      await loadMembership(false);
    } catch (err) {
      console.error("RECEIPT CONFIRMATION ERROR:", err);
      setReceiptError(err?.message || "Could not save your confirmation.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  function jumpToHistory() {
    document.getElementById("membership-history")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3 text-sm font-semibold text-[#6a3f9e]">
        <Loader2 size={18} className="animate-spin" /> Loading membership…
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p>{error}</p>
        <button type="button" onClick={() => loadMembership()} className="mt-2 font-bold underline">
          Retry
        </button>
      </div>
    );
  }

  const status = effectiveStatus(membership);
  const isCharter = String(membership?.plan || "").toUpperCase() === "CHARTER_MEMBERSHIP";
  const isFirstPurchase = history.length === 0 || membership?.isFirstMembership === true;
  const purchaseAmount = isFirstPurchase ? 1499 : 999;

  return (
    <div className="space-y-4 font-sans">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1a0f24]">Membership</h1>
          <p className="text-xs text-[#7d7184]">Your plan, benefits and past purchases.</p>
        </div>
      </header>

      {/* Charter upsell sits first */}
      <div className="grid grid-cols-1 sm:grid-cols-2"></div>
      
{membership && (
  <>
        <div className="grid gap-4 lg:grid-cols-4">
          {membership && !isCharter && <CharterStrip onOpen={() => setShowUpgrade(true)} />}
          <PassCard
            membership={membership}
            status={status}
            isCharter={isCharter}
            onCharter={() => setShowUpgrade(true)}
            onJumpHistory={jumpToHistory}
          />
          <BenefitsCard benefits={benefits} onSubmit={submitReceipts} saving={saving} error={receiptError} />

         
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
           <ValidityCard membership={membership} status={status} />
          <IncludedCard sunday={membership.sundayExperiences} />
          <HistoryCard history={history} />
        </div>
        </>
      )}
      {!membership && (
        <section className={`${CARD} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <h2 className="text-lg font-bold text-[#24112f]">Start your Purple journey</h2>
            <p className="mt-1 text-sm text-[#75677d]">Buy a membership to unlock your Purple Club benefits.</p>
            <p className="mt-2 text-sm font-bold text-[#6a3f9e]">{money(purchaseAmount)}</p>
          </div>
          <button type="button" onClick={() => window.location.assign("/membership/plans")} className={BTN_DARK}>
            <ShoppingCart size={14} /> Buy membership
          </button>
        </section>
      )}

      

      {!membership && <HistoryCard history={history} />}

      {showUpgrade && <CharterClubModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}