"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// Replace with your own images and text.
const DEFAULT_SLIDES = [
  { src: "/main.png", title: "Welcome to Club", text: "Walk in as you are. Everyone here started on day one." },
  { src: "/runn.png", title: "Move with Us", text: "Run, stretch and warm up together, at your own pace." },
  { src: "/medi.png", title: "Meditate with Us", text: "A quiet few minutes to breathe before the day begins." },
  { src: "/push.png", title: "Sweat with Us", text: "Games and workouts that feel more like play." },
  { src: "/dancee.png", title: "Enjoy With Us", text: "Music, laughter and a lot of high-fives." },
  { src: "/talking.png", title: "Share With Us", text: "Coffee, conversation and friends you were glad to meet." },
];

const GAP = 20; // px between cards
const SCROLL_PER_SLIDE = 500; // px of scrolling for each image change

export default function ScrollSlider({ slides = DEFAULT_SLIDES }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const N = slides.length;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const fill = fillRef.current;
      if (!section || !track || !fill || N < 2) return;

      const cards = gsap.utils.toArray(".slide-card", section);
      const setScale = cards.map((c) => gsap.quickSetter(c, "scale"));
      const setOpacity = cards.map((c) => gsap.quickSetter(c, "opacity"));
      const setFill = gsap.quickSetter(fill, "scaleX");

      const cardW = () => cards[0].offsetWidth;
      const pitch = () => cardW() + GAP;
      // x that puts card i exactly in the middle of the screen
      const xFor = (i) => section.clientWidth / 2 - cardW() / 2 - i * pitch();

      // Updates card sizes and caption for a given scroll position
      const update = (progress) => {
        const p = progress * (N - 1);
        for (let i = 0; i < N; i++) {
          const d = Math.min(1, Math.abs(i - p));
          setScale[i](1 - 0.14 * d);
          setOpacity[i](1 - 0.55 * d);
        }
        setFill(progress);

        const idx = Math.round(p);
        if (idx !== activeRef.current) {
          activeRef.current = idx;
          setActive(idx);
        }
      };

      gsap.fromTo(
        track,
        { x: () => xFor(0) },
        {
          x: () => xFor(N - 1),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + (N - 1) * SCROLL_PER_SLIDE,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // Refresh after other pinned sections (e.g. the hero) so the
            // start position accounts for their pin spacing.
            refreshPriority: -1,
            // Settle on the nearest image when scrolling stops
            snap: {
              snapTo: 1 / (N - 1),
              duration: { min: 0.2, max: 0.5 },
              ease: "power1.inOut",
            },
            onUpdate: (self) => update(self.progress),
            onRefresh: (self) => update(self.progress),
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [N] }
  );

  // Re-measure once everything (images, fonts, other sections) has loaded,
  // so the sections after the slider are positioned correctly.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      const t = setTimeout(refresh, 100);
      return () => clearTimeout(t);
    }
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  const current = slides[active] ?? slides[0];

  return (
    // Wrapper owned by React: GSAP's pin-spacer is created inside it, so
    // sections before/after the slider are never affected.
    <div className="relative w-full font-sans">
    <section
      ref={sectionRef}
      className="relative h-[100svh] min-h-[540px] w-full overflow-hidden bg-[#6b3fa0]"
    >
      {/* Heading */}
      <div className="absolute inset-x-0 top-[clamp(4.5rem,10svh,8rem)] z-10 px-5 text-center">
        <h2 className="text-[clamp(1.4rem,min(6vw,5svh),2.75rem)] font-bold leading-[1] tracking-[-0.04em] text-[#f1f3ea]">
          One Sunday, many ways to come alive
        </h2>
      </div>

      {/* Slider track */}
      <div className="pointer-events-none absolute inset-x-0 top-[clamp(9rem,24svh,14rem)] z-10 h-[min(48svh,520px)]">
        <div
          ref={trackRef}
          className="absolute left-0 top-0 flex h-full will-change-transform"
          style={{ columnGap: GAP }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="slide-card relative h-full w-[min(72vw,380px)] shrink-0 overflow-hidden rounded-3xl "
            >
              <img
                src={s.src}
                alt={s.title}
                draggable="false"
                decoding="async"
                loading="eager"
                className="h-full w-full select-none object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Caption: changes with the active image */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(3.5rem,env(safe-area-inset-bottom))] z-20 px-6 text-center">
        <div key={active} className="mx-auto max-w-xl animate-[slideCaption_0.45s_ease-out]">
          <p className="text-xs font-semibold tabular-nums text-white/60">
            {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </p>
          <h3 className="mt-1 text-[clamp(1.1rem,4.5vw,1.75rem)] font-bold tracking-[-0.03em] text-white">
            {current.title}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-white/80 sm:text-base">
            {current.text}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[12%] right-[12%] z-20 h-[2px] bg-[#2b1553]/30 md:left-[28%] md:right-[28%]">
        <div
          ref={fillRef}
          className="h-full origin-left bg-[#ccff00]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <style>{`
        @keyframes slideCaption {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
    </div>
  );
}