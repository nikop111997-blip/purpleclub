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
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Users,
  Verified,
  X,
} from "lucide-react";

/* =========================================================
   THEME
========================================================= */

const GLASS_LIGHT =
  "border border-white/70 bg-gradient-to-br from-white/75 via-white/45 to-white/30 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_12px_32px_-8px_rgba(106,63,158,0.15)]";

const GLASS_ROW =
  "border border-white/80 bg-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(106,63,158,0.05)] backdrop-blur-md";

const GLASS_ON_PURPLE =
  "border border-white/30 bg-gradient-to-br from-white/30 via-white/10 to-white/5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_6px_18px_rgba(40,15,70,0.25)]";

const ICON_TILE =
  "flex shrink-0 items-center justify-center rounded-xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5 text-[#4B176B]";

const LIME_TILE =
  "flex shrink-0 items-center justify-center rounded-xl border border-white/60 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_12px_rgba(185,214,59,0.3)]";

const LIME_BTN =
  "group relative inline-flex h-10 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-5 text-sm font-semibold text-[#1E2A00] shadow-[0_8px_24px_rgba(185,214,59,0.3)] transition hover:brightness-105 active:scale-[0.98]";

const SHINE =
  "pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent";

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
  const normalized = String(plan || "").toUpperCase();

  if (normalized === "PURPLE_MEMBERSHIP") {
    return "Purple Membership";
  }

  if (normalized === "CHARTER_MEMBERSHIP") {
    return "Charter Membership";
  }

  return (
    normalized.replaceAll("_", " ").replace(/\b\w/g, (char) =>
      char.toUpperCase()
    ) || "Purple Membership"
  );
}

/* =========================================================
   IMAGE WITH ICON FALLBACK
========================================================= */

function PngImage({
  src,
  alt,
  icon: Icon,
  className = "",
  iconSize = 30,
}) {
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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#8a5cc4] to-[#6a3f9e] text-white shadow-lg">
          <Icon size={iconSize * 0.75} />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CARD
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
      className={`flex flex-col rounded-[2rem] p-5 font-sans ${GLASS_LIGHT} ${className}`}
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

          {hint && (
            <p className="truncate text-xs text-[#8b8190]">{hint}</p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const isActive = String(status).toUpperCase() === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${
        isActive
          ? "border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00]"
          : `text-white ${GLASS_ON_PURPLE}`
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isActive ? "Active" : status || "Inactive"}
    </span>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function Legend({ dot, label, value }) {
  return (
    <div className={`rounded-2xl px-1.5 py-2.5 text-center ${GLASS_ROW}`}>
      <p className="text-lg font-bold leading-none text-[#24112f]">
        {value}
      </p>

      <p className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-medium text-[#75677d]">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </p>
    </div>
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

  const usedPct =
    total > 0 ? Math.min((used / total) * 100, 100) : 0;

  const reservedPct =
    total > 0
      ? Math.min((reserved / total) * 100, 100 - usedPct)
      : 0;

  return (
    <Card
      icon={CalendarDays}
      title="Sunday experiences"
      hint="Included with your plan"
      image="/sunday.png"
    >
    </Card>
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
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          completed ? LIME_TILE : ICON_TILE
        }`}
      >
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
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                completed ? LIME_TILE : ICON_TILE
              }`}
            >
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
            className={`mt-4 w-fit rounded-full border px-3 py-1.5 text-[11px] font-bold ${
              completed
                ? "border-[#B9D63B]/60 bg-[#B9D63B]/20 text-[#44590d]"
                : "border-[#6a3f9e]/20 bg-[#6a3f9e]/10 text-[#4B176B]"
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
        <div className={`flex h-10 w-10 items-center justify-center ${ICON_TILE}`}>
          <ShieldCheck size={18} />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#24112f]">
            Benefits
          </h2>
          <p className="text-xs text-[#8b8190]">
            Included with your membership
          </p>
        </div>
      </div>

      <ol className="relative grid gap-5 lg:grid-cols-6 lg:gap-4">
        <span className="pointer-events-none absolute left-[8%] right-[8%] top-[5.75rem] hidden h-0.5 rounded-full bg-gradient-to-r from-[#6a3f9e]/30 via-[#B9D63B] to-[#6a3f9e]/30 lg:block" />

        {BENEFITS.map(({ title, desc, icon: Icon, image }, index) => (
          <li
            key={title}
            className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
          >
            {index < BENEFITS.length - 1 && (
              <span className="pointer-events-none absolute bottom-[-1.25rem] left-[2.75rem] top-[5.5rem] w-0.5 rounded-full bg-gradient-to-b from-[#B9D63B] to-[#6a3f9e]/30 lg:hidden" />
            )}

            <PngImage
              src={image}
              alt={title}
              icon={Icon}
              className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-3xl lg:h-24 lg:w-full"
            />

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
   CHARTER UPGRADE BANNER
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
          <span className="relative">Explore Charter Clubs</span>
          <ArrowUpRight
            size={15}
            className="relative transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   CHARTER CLUB SELECTOR MODAL
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

      const response = await fetch("/api/clubs/charter-availability", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to load available Charter clubs."
        );
      }

      const list = Array.isArray(data.clubs) ? data.clubs : [];

      const available = list.filter((club) => {
        const availablePlaces = Number(club.availablePlaces ?? 0);

        return (
          club.isCharterMembershipAvailable === true &&
          availablePlaces > 0
        );
      });

      setClubs(available);

      if (
        selectedClub &&
        !available.some(
          (club) => String(club._id ?? club.id) === selectedClub
        )
      ) {
        setSelectedClub("");
      }
    } catch (err) {
      console.error("CHARTER CLUB LOAD ERROR:", err);
      setError(
        err?.message || "Unable to load available Charter clubs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClubs();
    // Load the current availability once when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const filteredClubs = clubs.filter((club) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      club.name,
      club.city,
      club.area,
      club.state,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  const selected = clubs.find(
    (club) => String(club._id ?? club.id) === selectedClub
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#24112f]/50 p-4 font-sans backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="charter-modal-title"
        className="my-auto w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-white/95 via-white/90 to-[#f3ecfa]/95 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_30px_80px_rgba(53,16,77,0.35)] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="border-b border-[#6a3f9e]/10 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className={`flex h-12 w-12 items-center justify-center ${ICON_TILE}`}>
              <Crown size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                id="charter-modal-title"
                className="text-lg font-bold text-[#24112f]"
              >
                Upgrade to Charter
              </h3>

              <p className="mt-1 text-sm leading-5 text-[#7d7184]">
                Explore clubs with available Charter Membership places.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#4B176B] ${GLASS_ROW}`}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#6a3f9e]/5 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-[#7d7184]">
                Charter Membership
              </p>
              <p className="mt-1 text-xl font-bold text-[#24112f]">
                ₹15,999
                <span className="ml-1 text-xs font-medium text-[#8b8190]">
                  / year
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-white/80 px-3 py-2 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8b8190]">
                Available clubs
              </p>

              <p className="text-lg font-bold text-[#6a3f9e]">
                {loading ? "—" : clubs.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search and dropdown */}
        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <label
              htmlFor="charter-club-search"
              className="mb-2 block text-sm font-bold text-[#2b1836]"
            >
              Search clubs
            </label>

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8190]"
              />

              <input
                id="charter-club-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by club, city or area..."
                className="h-11 w-full rounded-xl border border-[#6a3f9e]/15 bg-white/80 pl-10 pr-4 text-sm text-[#24112f] outline-none transition placeholder:text-[#a49aaa] focus:border-[#6a3f9e]/50 focus:ring-2 focus:ring-[#6a3f9e]/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="charter-club-select"
              className="mb-2 block text-sm font-bold text-[#2b1836]"
            >
              Select your preferred club
            </label>

            <select
              id="charter-club-select"
              value={selectedClub}
              onChange={(event) => setSelectedClub(event.target.value)}
              disabled={loading || filteredClubs.length === 0}
              className="h-12 w-full rounded-xl border border-[#6a3f9e]/15 bg-white/80 px-3 text-sm text-[#24112f] outline-none focus:border-[#6a3f9e]/50 focus:ring-2 focus:ring-[#6a3f9e]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loading
                  ? "Loading available clubs..."
                  : filteredClubs.length > 0
                    ? "Choose a club"
                    : "No available clubs found"}
              </option>

              {filteredClubs.map((club) => {
                const id = String(club._id ?? club.id);
                const places = Number(club.availablePlaces ?? 0);

                return (
                  <option key={id} value={id}>
                    {club.name}
                    {club.city ? ` — ${club.city}` : ""}
                    {club.area ? `, ${club.area}` : ""}
                    {` (${places} ${places === 1 ? "place" : "places"} available)`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className={`flex items-center gap-2 rounded-xl p-3 ${GLASS_ROW}`}>
              <Loader2
                size={16}
                className="animate-spin text-[#6a3f9e]"
              />
              <p className="text-xs text-[#7d7184]">
                Checking Charter club availability...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={loadClubs}
                className="mt-2 text-xs font-bold text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* No available clubs */}
          {!loading && !error && clubs.length === 0 && (
            <div className={`rounded-xl p-4 text-center ${GLASS_ROW}`}>
              <Users
                size={22}
                className="mx-auto text-[#8b8190]"
              />

              <p className="mt-2 text-sm font-bold text-[#3b2a45]">
                No places currently available
              </p>

              <p className="mt-1 text-xs text-[#8b8190]">
                Please check again later.
              </p>
            </div>
          )}

          {/* Search has no matches */}
          {!loading &&
            !error &&
            clubs.length > 0 &&
            filteredClubs.length === 0 && (
              <div className={`rounded-xl p-4 text-center ${GLASS_ROW}`}>
                <Search
                  size={20}
                  className="mx-auto text-[#8b8190]"
                />

                <p className="mt-2 text-sm font-bold text-[#3b2a45]">
                  No matching clubs
                </p>

                <p className="mt-1 text-xs text-[#8b8190]">
                  Try a different club name, city or area.
                </p>
              </div>
            )}

          {/* Selected club */}
          {selected && (
            <div className="rounded-2xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/10 to-white/70 p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center ${ICON_TILE}`}>
                  <MapPin size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#24112f]">
                    {selected.name}
                  </p>

                  <p className="mt-1 text-xs text-[#7d7184]">
                    {[selected.area, selected.city, selected.state]
                      .filter(Boolean)
                      .join(", ") || "Location not specified"}
                  </p>

                  <p className="mt-2 text-xs font-bold text-[#526600]">
                    {selected.availablePlaces}{" "}
                    {Number(selected.availablePlaces) === 1
                      ? "place"
                      : "places"}{" "}
                    available
                  </p>
                </div>

                <Check size={17} className="text-[#6a3f9e]" />
              </div>
            </div>
          )}

          {/* Disabled until Charter upgrades launch */}
          <button
            type="button"
            disabled
            className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-[#6a3f9e]/10 bg-[#6a3f9e]/10 px-5 text-sm font-bold text-[#6a3f9e]/60"
          >
            <Clock3 size={16} />
            Charter Upgrade — Coming Soon
          </button>

          <p className="text-center text-[11px] leading-5 text-[#8b8190]">
            Selecting a club does not reserve a place. Upgrade and
            payment will be enabled when the feature launches.
          </p>
        </div>
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
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${ICON_TILE}`}>
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

/* =========================================================
   DATE CHIP
========================================================= */

function DateChip({ label, value }) {
  return (
    <div className={`rounded-2xl px-4 py-2.5 ${GLASS_ON_PURPLE}`}>
      <p className="text-[11px] font-semibold text-white/65">
        {label}
      </p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

/* =========================================================
   MAIN MEMBERSHIP CLIENT
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
        throw new Error(
          data?.message || "Failed to load membership"
        );
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
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 font-sans text-sm text-red-700">
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

  const isCharter =
    String(plan).toUpperCase() === "CHARTER_MEMBERSHIP";

  return (
    <>
      {/* Membership summary */}
      <div className="relative overflow-hidden rounded-[2rem] bg-[#6a3f9e] p-5 font-sans text-white shadow-[0_24px_60px_-20px_rgba(106,63,158,0.6)] sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.2),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(185,214,59,0.22),transparent_40%)]" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[#E4F58C] ${GLASS_ON_PURPLE}`}
            >
              <Verified size={24} />
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
            <DateChip
              label="Started"
              value={formatDate(startDate)}
            />

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

      {/* Membership cards */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ExperienceCard experiences={sundayExperiences} />
        <PurpleKitCard kit={purpleKit} />
        <BodyAssessmentCard assessment={bodyAssessment} />
      </div>

      {/* Benefits */}
      <div className="mt-6">
        <BenefitsTimeline />
      </div>

      {/* Charter upgrade */}
      <div className="mt-6">
        {!isCharter ? (
          <CharterUpgradeCard
            onUpgrade={() => setShowUpgrade(true)}
          />
        ) : (
          <div
            className={`flex items-center gap-4 rounded-[2rem] p-5 ${GLASS_LIGHT}`}
          >
            <div className={`flex h-11 w-11 items-center justify-center ${LIME_TILE}`}>
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

      {/* Charter club selection modal */}
      {showUpgrade && (
        <CharterClubModal
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}