"use client";

import React, { useId, useRef, useState } from "react";
import Link from "next/link";

/**
 * Homepage 7: "One Sunday can be the beginning"
 *
 * Usage:
 *   <OneSundaySection />
 *   <OneSundaySection nextParty={{ href: "/purple-party", dateLabel: "Sun, 14 Dec" }} />
 *
 * IMAGES (put these files in /public, or change the paths below)
 *   LOGO_SRC            -> Purple Club logo shown top-left of every card
 *   card.image          -> picture shown in the middle of each card front
 * If an image is missing the card falls back to the text name / gradient emblem,
 * so nothing breaks while you are still adding assets.
 */

const LOGO_SRC = "/logo.png";

/* ---------- Tiny inline icon set (no extra dependency) ---------- */
const ICONS = {
  package: [
    "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
    "M12 22V12",
    "m3.3 7 8.7 5 8.7-5",
  ],
  calendar: [
    "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    "M8 2v4",
    "M16 2v4",
    "M3 10h18",
  ],
  activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  heartPulse: [
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
    "M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",
  ],
  users: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  crown: ["M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z", "M5 20h14"],
  check: ["M20 6 9 17l-5-5"],
  clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"],
  ticket: [
    "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
    "M13 5v2",
    "M13 17v2",
    "M13 11v2",
  ],
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* ---------- Card content ---------- */
const CARDS = [
  {
    id: "membership",
    number: "001",
    title: "Membership",
    tag: "Your regular Sunday",
    size: "lg",
    image: "/main.png", // <- middle image
    stops: ["#d4ff3f", "#ff5fa8", "#7a45c4"], // fallback emblem colours
    backTitle: "Enjoyed your first Sunday?",
    backBody: "Membership keeps a regular place for Purple in your week.",
    listTitle: "What's included",
    items: [
      { icon: "package", title: "Purple kit", sub: "T-shirt and shaker" },
      {
        icon: "calendar",
        title: "4 Sunday experiences",
        sub: "Guided community sessions",
      },
      {
        icon: "activity",
        title: "Body composition assessment",
        sub: "Know your starting point",
      },
      {
        icon: "heartPulse",
        title: "Purple health snapshot",
        sub: "Your health at a glance",
      },
      {
        icon: "users",
        title: "Community access",
        sub: "Join the Purple community",
      },
      {
        icon: "crown",
        title: "Inspirer to Icon journey",
        sub: "Grow and earn recognition",
      },
    ],
    cta: { label: "See membership", href: "/membership" },
  },
  {
    id: "charter",
    number: "002",
    title: "Charter Circle",
    tag: "Start a city",
    size: "sm",
    image: "/charter.png",
    stops: ["#5b8cff", "#c77dff", "#ff7a59"],
    backTitle: "Help your city come alive.",
    backBody:
      "Charter Members and Coaches help start Purple Club in new cities. Our dream is a hundred cities, each with its own Purple Sunday.",
    listTitle: "What's included",
    items: [
      { icon: "check", title: "Everything in Membership" },
      { icon: "clock", title: "1 year validity" },
      { icon: "ticket", title: "Community event access" },
    ],
    cta: { label: "Explore the Charter Circle", href: "/charter-circle" },
  },
  {
    id: "party",
    number: "003",
    title: "Purple Party",
    tag: "Once a month",
    size: "sm",
    image: "/dancee.png",
    stops: ["#ff9f43", "#ff4f81", "#7a45c4"],
    backTitle: "GET HIGH ON LIFE.",
    backBody:
      "Once a month, the whole community and their families come together for dance fitness, music, games and stories. Bring the kids, your parents and the uncle who swears he does not dance.",
    items: [],
    // cta is supplied at render time from the `nextParty` prop
    cta: null,
  },
];

/* ---------- Fallback emblem (used only if the card image is missing) ---------- */
function Emblem({ stops, className = "" }) {
  const gid = "g" + useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="50%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </linearGradient>
      </defs>
      <g fill={`url(#${gid})`}>
        <circle cx="68" cy="68" r="44" />
        <circle cx="132" cy="68" r="44" />
        <circle cx="68" cy="132" r="44" />
        <circle cx="132" cy="132" r="44" />
        <rect x="60" y="60" width="80" height="80" rx="30" />
      </g>
      <path
        d="M100 70 C103 90 110 97 130 100 C110 103 103 110 100 130 C97 110 90 103 70 100 C90 97 97 90 100 70 Z"
        fill="#140b22"
      />
    </svg>
  );
}

/* ---------- "What's included" list ---------- */
function Inclusions({ card, flipped }) {
  const compact = card.size === "sm";
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ${
        compact ? "px-3 py-1" : "px-4 py-2 sm:px-5"
      }`}
    >
      <ul className="divide-y divide-[#2b1553]/10">
        {card.items.map((item) => (
          <li
            key={item.title}
            className={`flex items-center ${
              compact ? "gap-2.5 py-2" : "gap-3.5 py-3"
            }`}
          >
            <span
              className={`grid shrink-0 place-items-center rounded-full bg-[#efe8f8] text-[#6b3fa0] ${
                compact ? "h-7 w-7" : "h-10 w-10"
              }`}
            >
              <Icon
                name={item.icon}
                className={compact ? "h-3.5 w-3.5" : "h-[18px] w-[18px]"}
              />
            </span>
            <span className="min-w-0">
              <span
                className={`block font-bold leading-tight text-[#1f1233] ${
                  compact ? "text-[13px]" : "text-[15px]"
                }`}
              >
                {item.title}
              </span>
              {item.sub && !compact && (
                <span className="mt-0.5 block text-[13px] leading-tight text-[#2b1553]/60">
                  {item.sub}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- One flip card ---------- */
function FlipCard({ card, nextParty, session }) {
  const [flipped, setFlipped] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const [logoOk, setLogoOk] = useState(true);
  const pointerType = useRef("mouse");
  const keyboardFocus = useRef(false);
  const isLg = card.size === "lg";
  const hasList = card.items.length > 0;

  // Purple Party only gets a button when a date is confirmed
  let cta = card.cta;
  if (card.id === "party") {
    cta = nextParty
      ? { label: "See the next Purple Party", href: nextParty.href }
      : null;
  }

  const ctaEl = cta && (
    <a
      href={`${session?"/dashboard/membership":'/auth'}`}
      tabIndex={flipped ? 0 : -1}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2b1553] px-6 py-2 text-sm font-bold text-[#d4ff3f] transition hover:-translate-y-0.5 hover:bg-[#3b1d73] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b1553]"
    >
      {cta.label}
      <span aria-hidden="true" className="ml-2">
        ↗
      </span>
    </a>
  );

  const textBlock = (
    <div>
      <p className="text-xs font-bold text-[#6b3fa0]/70">{card.number}</p>
      <h3
        className={`mt-1 font-extrabold leading-[1.02] tracking-[-0.03em] ${
          isLg ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl"
        }`}
      >
        {card.backTitle}
      </h3>
      <p
        className={`mt-3 font-medium leading-snug text-[#2b1553]/85 ${
          isLg ? "max-w-md text-base sm:text-lg" : "text-sm"
        }`}
      >
        {card.backBody}
      </p>
      {card.id === "party" && nextParty?.dateLabel && (
        <p className="mt-3 inline-block rounded-full bg-[#2b1553] px-3 py-1 text-xs font-bold text-[#d4ff3f]">
          Next: {nextParty.dateLabel}
        </p>
      )}
    </div>
  );

  const flipHint = (
    <p className="mt-3 text-[11px] font-semibold text-[#2b1553]/60 [@media(hover:hover)]:hidden">
      Tap the card to flip back
    </p>
  );

  return (
    <div
      className="relative h-full w-full [perspective:1400px]"
      onPointerDown={(e) => {
        pointerType.current = e.pointerType;
      }}
      onPointerEnter={(e) => {
        pointerType.current = e.pointerType;
        if (e.pointerType === "mouse") setFlipped(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setFlipped(false);
      }}
      onClick={() => {
        // Touch / pen: tap toggles. Mouse is handled by hover.
        if (pointerType.current !== "mouse") setFlipped((f) => !f);
      }}
      onFocus={(e) => {
        if (e.target.matches?.(":focus-visible")) {
          keyboardFocus.current = true;
          setFlipped(true);
        }
      }}
      onBlur={(e) => {
        if (
          keyboardFocus.current &&
          !e.currentTarget.contains(e.relatedTarget)
        ) {
          keyboardFocus.current = false;
          setFlipped(false);
        }
      }}
    >
      <div
        className={`relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d] motion-reduce:duration-0 ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* ================= FRONT ================= */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#6b3fa0] to-[#301857] p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] [backface-visibility:hidden] sm:p-6"
          aria-hidden={flipped}
        >
          {/* lanyard slot */}
          <span className="absolute left-1/2 top-2.5 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/10" />

          {/* header: logo */}
          <div className="mt-3 flex h-8 items-center">
            {logoOk ? (
              <img
                src={LOGO_SRC}
                alt="Purple Club"
                draggable="false"
                onError={() => setLogoOk(false)}
                className="h-full w-auto max-w-[160px] select-none object-contain object-left"
              />
            ) : (
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                Purple <span className="font-medium text-white/70">Club</span>
              </span>
            )}
          </div>

          {/* middle image */}
          <div className="flex min-h-0 flex-1 items-center justify-center py-3">
            {card.image && imgOk ? (
              <img
                src={card.image}
                alt=""
                draggable="false"
                onError={() => setImgOk(false)}
                className="h-full w-full select-none object-contain"
              />
            ) : (
              <Emblem
                stops={card.stops}
                className={
                  isLg
                    ? "h-full max-h-[240px] w-auto lg:max-h-[300px]"
                    : "h-full max-h-[150px] w-auto"
                }
              />
            )}
          </div>

          {/* title block */}
          <div className="text-white">
            <h3
              className={`font-bold leading-none tracking-[-0.03em] ${
                isLg ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl"
              }`}
            >
              {card.title}
            </h3>
            <div className="mt-2 flex items-end justify-between text-xs font-semibold sm:text-sm">
              <span className="text-white/90">{card.tag}</span>
              <span className="text-white/35">{card.number}</span>
            </div>
          </div>

          {/* hint message */}
          <p className="mt-3 rounded-full bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-[#d4ff3f]">
            <span className="[@media(hover:hover)]:hidden">
              Tap to know details
            </span>
            <span className="hidden [@media(hover:hover)]:inline">
              Hover to know details
            </span>
          </p>

          {/* full-card button for keyboard / screen-reader users */}
          <button
            type="button"
            className="absolute inset-0 rounded-[28px] focus:outline-none"
            aria-label={`Show details about ${card.title}`}
            aria-expanded={flipped}
            tabIndex={flipped ? -1 : 0}
          />
        </div>

        {/* ================= BACK ================= */}
        <div
          className={`absolute inset-0 overflow-hidden rounded-[28px] bg-[#d4ff3f] text-[#2b1553] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] [backface-visibility:hidden] [transform:rotateY(180deg)] ${
            flipped ? "" : "pointer-events-none"
          }`}
          aria-hidden={!flipped}
        >
          {isLg && hasList ? (
            /* Membership: text + button on the left, inclusions on the right (desktop);
               everything stacked and scrollable on phones */
            <div className="grid h-full grid-cols-1 content-start gap-4 overflow-y-auto p-5 sm:p-7 lg:grid-cols-2 lg:grid-rows-[0.8fr_auto] lg:gap-x-8 lg:overflow-visible">
              <div className="lg:col-start-1 lg:row-start-1">{textBlock}</div>
              <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
                <p className="mb-2 text-sm font-bold">{card.listTitle}</p>
                <Inclusions card={card} />
              </div>
              <div className="lg:col-start-1 lg:row-start-2">
                {ctaEl}
                {flipHint}
              </div>
            </div>
          ) : (
            /* Small cards */
            <div className="flex h-full flex-col justify-between p-5 sm:p-6">
              <div className="min-h-0 space-y-3 overflow-y-auto">
                {textBlock}
                {hasList && <Inclusions card={card} />}
              </div>
              <div className="mt-3">
                {ctaEl}
                {flipHint}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Section ---------- */
export default function OneSundaySection({session, nextParty = null }) {
  const [membership, charter, party] = CARDS;

  return (
    <section className="w-full bg-[#d4ff3f] px-4 py-16 font-sans sm:px-6 md:py-48">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="max-w-3xl text-[clamp(1.9rem,6vw,2.5rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[#0b0b0b]">
          One Sunday can be the beginning.
        </h2>

        {/* Mobile / tablet: single column. Desktop: big panel + two small. */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:gap-6 md:mt-14 lg:h-[700px] lg:grid-cols-3 lg:grid-rows-2">
          <div className="h-[640px] sm:h-[600px] lg:col-span-2 lg:row-span-2 lg:h-auto">
            <FlipCard card={membership} session={session} />
          </div>
          <div className="h-[460px] lg:h-auto">
            <FlipCard card={charter} session={session} />
          </div>
          <div className="h-[440px] lg:h-auto">
            <FlipCard card={party} nextParty={nextParty} session={session} />
          </div>
        </div>
      </div>
    </section>
  );
}