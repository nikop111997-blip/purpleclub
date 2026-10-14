
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Flag,
  Sparkles,
  X,
} from "lucide-react";

const CSS = `
@keyframes tourPulse {
  0%, 100% {
    box-shadow: 0 0 0 9999px rgba(36,17,47,.78),
      0 0 0 3px rgba(185,214,59,.95),
      0 0 0 3px rgba(185,214,59,.5);
  }
  50% {
    box-shadow: 0 0 0 9999px rgba(36,17,47,.78),
      0 0 0 3px rgba(185,214,59,.95),
      0 0 0 10px rgba(185,214,59,0);
  }
}
@keyframes tourIn {
  from { opacity: 0; transform: translateY(8px) scale(.98); }
  to { opacity: 1; transform: none; }
}
`;

const GLASS_CARD =
  "border border-white/85 bg-gradient-to-br from-white/97 to-[#f3ecfa]/97 shadow-[inset_0_1px_1px_#fff,0_30px_80px_rgba(53,16,77,0.45)] backdrop-blur-2xl";


function collectSteps(fallback = [], group = "member-dashboard") {
  if (typeof document === "undefined") return [];

  const elements = [
    ...document.querySelectorAll("[data-tg-tour]"),
  ].filter(
    (el) =>
      el.getAttribute("data-tg-group") === group &&
      el.getClientRects().length > 0
  );

  // Keep normal tour steps, but collapse all Invite buttons into one step.
  const inviteElements = elements.filter((el) =>
    el.getAttribute("data-tg-title")?.startsWith("Invite to ")
  );

  const normalSteps = elements
    .filter(
      (el) =>
        !el.getAttribute("data-tg-title")?.startsWith("Invite to ")
    )
    .map((el, i) => ({
      el,
      order: Number(el.getAttribute("data-tg-order")) || i + 1,
      title: el.getAttribute("data-tg-title") || "",
      content: el.getAttribute("data-tg-tour") || "",
    }));

  if (inviteElements.length > 0) {
    const firstInvite = inviteElements[0];

    normalSteps.push({
      el: firstInvite,
      order:
        Math.min(
          ...inviteElements.map(
            (el) => Number(el.getAttribute("data-tg-order")) || 9999
          )
        ),
      title: "Invite a Guest",
      content:
        "Use an Invite button on any event card to invite a guest. You only need to learn this action once.",
    });
  }

  const fromFallback = fallback
    .map((step, i) => ({
      el: document.querySelector(step.target),
      order: Number(step.order) || i + 1,
      title: step.title || "",
      content: step.content || "",
    }))
    .filter((step) => step.el && step.el.getClientRects().length > 0);

  const source = normalSteps.length ? normalSteps : fromFallback;

  return source
    .sort((a, b) => a.order - b.order)
    .map((step, i) => ({
      ...step,
      title: step.title || `Step ${i + 1}`,
    }));
}

function Journey({ steps, index, onJump }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i < index;
        const current = i === index;

        return (
          <div key={`${step.title}-${i}`} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Go to ${step.title}`}
              title={step.title}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold transition ${
                done
                  ? "border-[#B9D63B] bg-[#B9D63B] text-[#1E2A00]"
                  : current
                    ? "border-[#6a3f9e] bg-[#6a3f9e] text-white ring-4 ring-[#6a3f9e]/15"
                    : "border-[#6a3f9e]/20 bg-white text-[#9B939E]"
              }`}
            >
              {done ? <Check size={11} strokeWidth={3} /> : i + 1}
            </button>

            {i < steps.length - 1 && (
              <span className="mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-[#6a3f9e]/10">
                <span
                  className="block h-full rounded-full bg-[#B9D63B] transition-all duration-500"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MemberDashboardTour({
  group = "member-dashboard",
  variant = "glass",
  label = "Take a Tour",
  steps: fallback = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState([]);
  const [index, setIndex] = useState(-1);
  const [rect, setRect] = useState(null);
  const [cardH, setCardH] = useState(260);
  const [notice, setNotice] = useState("");
  const cardRef = useRef(null);
  const startLock = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setIndex(-1);
    setRect(null);
    startLock.current = false;
  }, []);

  const start = useCallback(() => {
    if (startLock.current) return;

    startLock.current = true;

    const found = collectSteps(fallback, group);

    if (!found.length) {
      setNotice(`No visible tour steps found for "${group}".`);
      startLock.current = false;

      window.setTimeout(() => setNotice(""), 3500);
      console.warn(
        `[MemberDashboardTour] No visible steps found for group "${group}".`,
        "Check data-tg-group, data-tg-tour, and element visibility."
      );
      return;
    }

    setNotice("");
    setSteps(found);
    setIndex(-1);
    setOpen(true);
  }, [fallback, group]);

  const go = useCallback(
    (nextIndex) => {
      if (nextIndex >= steps.length) {
        close();
        return;
      }

      setIndex(Math.max(-1, nextIndex));
    },
    [steps.length, close]
  );

  const measure = useCallback(() => {
    const el = steps[index]?.el;

    if (!el || !el.isConnected) {
      setRect(null);
      return;
    }

    const r = el.getBoundingClientRect();

    setRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    });
  }, [steps, index]);

  // Reposition the spotlight on scroll and resize.
  useEffect(() => {
    if (!open || index < 0) {
      setRect(null);
      return;
    }

    const el = steps[index]?.el;

    if (!el || !el.isConnected) {
      setRect(null);
      return;
    }

    el.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });

    let raf;
    let startTime;

    const tick = (time) => {
      if (startTime === undefined) startTime = time;

      measure();

      if (time - startTime < 1000) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    const onScroll = () => measure();
    const onResize = () => measure();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, index, steps, measure]);

  // Keyboard controls.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();

      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(index + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, index, go, close]);

  useLayoutEffect(() => {
    if (cardRef.current) {
      setCardH(cardRef.current.offsetHeight);
    }
  }, [open, index, rect]);

  const base =
    "group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full px-4 text-sm font-semibold transition active:scale-95";

  const styles =
    variant === "lime"
      ? "border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[0_8px_24px_rgba(185,214,59,0.3)] hover:brightness-105"
      : "border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[0_8px_24px_rgba(185,214,59,0.3)] hover:brightness-105";

  let overlay = null;

  if (mounted && open) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(340, vw - 24);
    const step = steps[index];
    const last = index === steps.length - 1;

    let cardStyle;
    let spotlight = null;

    if (index >= 0 && rect) {
      const padding = 8;
      const gap = 14;

      spotlight = {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: Math.min(rect.width + padding * 2, vw),
        height: rect.height + padding * 2,
      };

      const below = vh - (spotlight.top + spotlight.height);
      const above = spotlight.top;

      const top =
        below >= cardH + gap
          ? spotlight.top + spotlight.height + gap
          : above >= cardH + gap
            ? spotlight.top - gap - cardH
            : Math.max(12, vh - cardH - 16);

      const left = Math.min(
        Math.max(
          spotlight.left + spotlight.width / 2 - width / 2,
          12
        ),
        vw - width - 12
      );

      cardStyle = {
        top: Math.max(12, Math.min(top, vh - cardH - 12)),
        left,
        width,
      };
    } else {
      cardStyle = {
        top: Math.max(12, (vh - cardH) / 2),
        left: Math.max(12, (vw - width) / 2),
        width,
      };
    }

    overlay = createPortal(
      <div
        className="fixed inset-0 z-[1000] font-sans"
        role="dialog"
        aria-modal="true"
        aria-label={`${group} tour`}
      >
        <style>{CSS}</style>

        {/* Dark backdrop; clicks outside the card close the tour. */}
        <button
          type="button"
          aria-label="Close tour"
          className="absolute inset-0 h-full w-full cursor-default border-0"
          style={{
            background: spotlight
              ? "transparent"
              : "rgba(36,17,47,.78)",
          }}
          onClick={close}
        />

        {/* Spotlight around the current element. */}
        {spotlight && (
          <div
            className="pointer-events-none absolute rounded-2xl"
            style={{
              ...spotlight,
              animation: "tourPulse 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Tour card */}
        <div
          ref={cardRef}
          key={index}
          style={{
            ...cardStyle,
            animation: "tourIn .3s ease-out",
            maxHeight: "calc(100vh - 24px)",
            overflowY: "auto",
          }}
          className={`absolute rounded-[1.5rem] p-4 text-[#24112f] ${GLASS_CARD}`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close tour"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/60 text-[#4B176B] hover:bg-white"
          >
            <X size={14} />
          </button>

          {index < 0 ? (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[0_6px_16px_rgba(185,214,59,0.35)]">
                <Compass size={20} />
              </div>

              <h3 className="mt-3 pr-7 text-base font-bold">
                Let&apos;s explore this page
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#6f6577]">
                {steps.length} quick stops. Use the arrow keys or the
                buttons to navigate.
              </p>

              <ol className="mt-3 space-y-1.5">
                {steps.map((item, i) => (
                  <li key={`${item.title}-${i}`}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-white/80 bg-white/55 px-2.5 py-2 text-left text-xs font-semibold text-[#2b1836] transition hover:border-[#B9D63B] hover:bg-white"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6a3f9e]/10 text-[10px] font-bold text-[#4B176B]">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                onClick={() => go(0)}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-sm font-bold text-[#1E2A00] shadow-[0_8px_24px_rgba(185,214,59,0.3)] transition hover:brightness-105"
              >
                Start the journey <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <>
              <p className="pr-8 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B939E]">
                Step {index + 1} of {steps.length}
              </p>

              <h3 className="mt-1 pr-8 text-base font-bold leading-snug">
                {step?.title}
              </h3>

              <p className="mt-1.5 text-[13px] leading-5 text-[#6f6577]">
                {step?.content}
              </p>

              <div className="mt-4">
                <Journey
                  steps={steps}
                  index={index}
                  onJump={go}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="text-xs font-semibold text-[#8b8190] hover:text-[#4B176B]"
                >
                  Skip
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => go(index - 1)}
                    disabled={index === 0}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#6a3f9e]/20 bg-[#6a3f9e]/10 px-3.5 text-xs font-bold text-[#4B176B] transition hover:bg-[#6a3f9e]/20 disabled:opacity-40"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>

                  <button
                    type="button"
                    onClick={() => go(index + 1)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-4 text-xs font-bold text-[#1E2A00] shadow-[0_6px_16px_rgba(185,214,59,0.35)] transition hover:brightness-105"
                  >
                    {last ? (
                      <>
                        Finish <Flag size={13} />
                      </>
                    ) : (
                      <>
                        Next <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={open}
        className={`${base} ${styles} disabled:opacity-60`}
      >
        <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/50 to-transparent opacity-60" />
        <Sparkles size={15} className="relative" />
        <span className="relative">
          {notice || (open ? "Tour in progress" : label)}
        </span>
      </button>

      {overlay}
    </>
  );
}
