import Image from "next/image";
import { CalendarDays, CheckCircle2, Lock, Sparkles } from "lucide-react";

const GLASS_LIGHT =
  "border border-white/70 bg-gradient-to-br from-white/75 via-white/45 to-white/30 backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_0_20px_rgba(255,255,255,0.25),0_12px_32px_-8px_rgba(106,63,158,0.15)]";

/** Badge names + images (files live in /public: 1.png … 5.png) */
export const MILESTONE_BADGES = [
  { count: 10, name: "Spark", tagline: "First 10 check-ins", image: "/1.png" },
  { count: 25, name: "Momentum", tagline: "You're on a roll", image: "/2.png" },
  { count: 50, name: "Pillar", tagline: "Pillar of the club", image: "/3.png" },
  { count: 75, name: "Champion", tagline: "Truly committed", image: "/4.png" },
  { count: 100, name: "Century Legend", tagline: "100 check-ins", image: "/5.png" },
];

/* White tile that holds the badge image. Locked badges are greyed out. */
function BadgeImage({ badge, achieved, className = "" }) {
  return (
    <div
      className={`relative mx-auto aspect-square overflow-hidden rounded-2xl bg-white shadow-[inset_0_0_0_1px_rgba(106,63,158,0.08)] ${className}`}
    >
      <Image
        src={badge.image}
        alt={`${badge.name} badge`}
        fill
        sizes="(min-width: 1024px) 160px, 96px"
        className={`object-contain p-2 transition ${
          achieved ? "" : "opacity-40 grayscale"
        }`}
      />
      {!achieved && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6f6577] shadow">
            <Lock size={13} />
          </span>
        </span>
      )}
    </div>
  );
}

export default function AttendanceMilestones({ attendanceCount = 0 }) {
  const badges = MILESTONE_BADGES;
  const top = badges[badges.length - 1].count;
  const achievedBadges = badges.filter((b) => attendanceCount >= b.count);
  const current = achievedBadges[achievedBadges.length - 1] || null;
  const next = badges.find((b) => attendanceCount < b.count) || null;
  const prevCount = current?.count ?? 0;
  const progress = next
    ? Math.min(100, Math.round(((attendanceCount - prevCount) / (next.count - prevCount)) * 100))
    : 100;
  const hero = current || badges[0];

  return (
    <section className={`rounded-[1.5rem] p-4 sm:p-5 ${GLASS_LIGHT}`}>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B939E]">Your Purple journey</p>
          <h2 className="mt-1 text-base font-bold text-[#24112f] sm:text-lg">Attendance milestones</h2>
          <p className="mt-0.5 text-xs text-[#6f6577]">Earn a badge at every milestone you reach.</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#6a3f9e]/10 bg-white/55 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6a3f9e]/10 text-[#4B176B]">
              <CalendarDays size={16} />
            </div>
            <div>
              <p className="text-[11px] text-[#6f6577]">Events attended</p>
              <p className="text-lg font-bold leading-5 text-[#24112f]">{attendanceCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#6a3f9e]/10 bg-white/55 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B9D63B]/25 text-[#35460A]">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-[11px] text-[#6f6577]">Badges earned</p>
              <p className="text-lg font-bold leading-5 text-[#24112f]">
                {achievedBadges.length}<span className="text-xs font-semibold text-[#9B939E]">/{badges.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Current badge spotlight */}
        <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/45 p-4 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B939E]">
            {current ? "Current badge" : "First badge"}
          </p>
          <BadgeImage badge={hero} achieved={!!current} className="mt-2 w-40" />
          <h3 className="mt-2.5 text-base font-bold text-[#24112f]">{hero.name}</h3>
          <p className="mt-0.5 text-[11px] text-[#6f6577]">
            {current ? hero.tagline : "Attend your first events to unlock"}
          </p>

          <div className="mt-3 text-left">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#4B176B]">
                {next ? `Next: ${next.name}` : "All badges earned"}
              </span>
              <span className="font-bold text-[#24112f]">{attendanceCount}/{next ? next.count : top}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#6a3f9e]/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#B9D63B] to-[#D6ED7B] transition-all"
                style={{ width: `${progress}%` }} />
            </div>
            {next && (
              <p className="mt-1.5 text-[11px] text-[#6f6577]">
                {next.count - attendanceCount} more check-in{next.count - attendanceCount === 1 ? "" : "s"} to unlock
              </p>
            )}
          </div>
        </div>

        {/* All badges */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {badges.map((b) => {
            const achieved = attendanceCount >= b.count;
            const isNext = next?.count === b.count;
            return (
              <div key={b.count}
                className={`relative flex flex-col items-center rounded-2xl border px-2.5 py-3 text-center transition ${
                  achieved
                    ? "border-[#B9D63B]/60 bg-gradient-to-b from-white/70 to-[#B9D63B]/10 shadow-[0_8px_20px_-10px_rgba(185,214,59,0.7)]"
                    : isNext
                    ? "border-dashed border-[#6a3f9e]/30 bg-white/40"
                    : "border-white/80 bg-white/35"
                }`}>
                {achieved && (
                  <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#B9D63B] text-[#1E2A00]">
                    <CheckCircle2 size={12} />
                  </span>
                )}
                <BadgeImage badge={b} achieved={achieved} className="w-full max-w-[96px]" />
                <p className={`mt-2 text-xs font-extrabold ${achieved ? "text-[#24112f]" : "text-[#6f6577]"}`}>{b.name}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-[#6f6577]">{b.count} check-ins</p>
                <span className={`mt-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                  achieved ? "bg-[#B9D63B]/30 text-[#35460A]"
                    : isNext ? "bg-[#6a3f9e]/10 text-[#4B176B]" : "bg-transparent text-[#9B939E]"}`}>
                  {achieved ? "Earned" : isNext ? "Up next" : "Locked"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-4 text-[#6f6577]">
        Only recorded member check-ins count toward your attendance milestones. Guest check-ins and referrals are excluded.
      </p>
    </section>
  );
}