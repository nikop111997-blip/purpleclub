"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ProofSection from "@/component/ProofSection";

gsap.registerPlugin(ScrollTrigger);
// Stops the mobile URL-bar show/hide from re-measuring and jittering the pin
ScrollTrigger.config({ ignoreMobileResize: true });

const PANDA_SRC = "/main.png";

// Scroll distance (px) per unit of timeline.
const PX_PER_UNIT_SIDE = 600;
const PX_PER_UNIT_STACK = 300;

// SIDE  = wide landscape screens: text on the left, panda on the right.
// STACK = everything else: panda on top, text underneath.
// These two are exact opposites, so only ONE timeline is ever built.
const SIDE_QUERY = "(min-width: 900px) and (min-aspect-ratio: 5/4)";
const STACK_QUERY = "not all and (min-width: 900px) and (min-aspect-ratio: 5/4)";

export default function HomePage({ session }) {
  const animationSectionRef = useRef(null);
  const heroTextRef = useRef(null);
  const sideWrapRef = useRef(null);
  const sideTextRef = useRef(null);
  const characterRef = useRef(null);
  const pandaImgRef = useRef(null);
  const logosRef = useRef(null);
  const refreshedRef = useRef(false);

  // Refresh ScrollTrigger once after the panda image is known (covers the
  // case where the image was cached and onLoad fired before hydration).
  const refreshOnce = () => {
    if (refreshedRef.current) return;
    refreshedRef.current = true;
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  useEffect(() => {
    const img = pandaImgRef.current;
    if (img && img.complete && img.naturalWidth) refreshOnce();
  }, []);

  useGSAP(
    () => {
      const section = animationSectionRef.current;
      const heroText = heroTextRef.current;
      const sideWrap = sideWrapRef.current;
      const sideText = sideTextRef.current;
      const character = characterRef.current;
      const pandaImg = pandaImgRef.current;

      if (!section || !heroText || !sideWrap || !sideText || !character || !pandaImg) {
        return;
      }

      // Keep the first frame visible if an animation cannot be initialized.
      gsap.set(heroText, { autoAlpha: 1, y: 0 });
      gsap.set(character, { autoAlpha: 1 });
      gsap.set(sideText, { autoAlpha: 0 });

      // Everything that depends on screen size lives here and is recomputed
      // on every ScrollTrigger refresh (resize / rotate).
      // Panda start (frame 1) and end (frame 2) poses, all in section px
      const S = {
        start: { x: 0, y: 0, scale: 1 },
        end: { x: 0, y: 0, scale: 1 },
      };

      const measure = (isSide) => {
        const vw = section.clientWidth;
        const vh = section.clientHeight;
        const clamp = gsap.utils.clamp;

        // Image shape (height / width). Falls back to 1 until the image loads.
        const ratio =
          pandaImg.naturalWidth && pandaImg.naturalHeight
            ? pandaImg.naturalHeight / pandaImg.naturalWidth
            : 1;

        // Panda base size
        const baseW = isSide ? Math.min(vw * 0.42, 640) : Math.min(vw * 0.8, 440);
        const baseH = baseW * ratio;
        gsap.set(character, { width: baseW });

        // ---- Frame 1: panda sits right under the hero text, centred
        const heroBottom = heroText.offsetTop + heroText.offsetHeight;
        const top0 = heroBottom + 12;
        const availH0 = Math.max(120, vh - top0);
        const maxS0 = Math.min(1.15, (vw * 0.95) / baseW);
        const s0 = clamp(0.35, Math.max(0.35, maxS0), (availH0 * 1.1) / baseH);
        S.start = { x: vw / 2, y: top0 + (baseH * s0) / 2, scale: s0 };

        // ---- Frame 2: where the panda parks next to / above the text
        let targetH;
        let cx;
        let cy;
        if (isSide) {
          const regionW = vw * 0.44;
          targetH = Math.min(vh * 0.68, regionW * ratio);
          cx = vw * 0.5 + vw * 0.04 + regionW / 2;
          cy = vh * 0.54;
        } else {
          const sideH = sideText.offsetHeight;
          const topPad = Math.max(64, vh * 0.09);
          const availH = Math.max(110, vh - sideH - 16 - topPad);
          targetH = Math.min(availH, vh * 0.42, vw * 0.7 * ratio);
          cx = vw / 2;
          cy = topPad + (availH - targetH) / 2 + targetH / 2;
        }
        S.end = { x: cx, y: cy, scale: targetH / baseH };
      };

      // One builder for every screen size; only the numbers differ.
      const build = (isSide) => {
        sideWrap.dataset.layout = isSide ? "side" : "stack";

        gsap.set(heroText, { opacity: 1, y: 0 });
        gsap.set(sideText, { opacity: 0, x: 0, y: 0 });
        gsap.set(character, {
          left: 0,
          top: 0,
          xPercent: -50,
          yPercent: -50,
          opacity: 1,
          transformOrigin: "50% 50%",
        });

        measure(isSide);
        gsap.set(character, {
          x: S.start.x,
          y: S.start.y,
          scale: S.start.scale,
        });

        const onRefreshInit = () => {
          measure(isSide);
          gsap.set(character, {
            x: S.start.x,
            y: S.start.y,
            scale: S.start.scale,
          });
        };
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);

        const pxPerUnit = isSide ? PX_PER_UNIT_SIDE : PX_PER_UNIT_STACK;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + tl.duration() * pxPerUnit,
            // Slightly snappier scrub on phones = less work per frame
            scrub: isSide ? 1.5 : 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Frame 1 -> 2
        tl.to(
          heroText,
          { opacity: 0, y: isSide ? -90 : -50, duration: 1, ease: "power2.inOut" },
          0
        );
        tl.fromTo(
          character,
          {
            x: () => S.start.x,
            y: () => S.start.y,
            scale: () => S.start.scale,
          },
          {
            x: () => S.end.x,
            y: () => S.end.y,
            scale: () => S.end.scale,
            duration: 1.5,
            ease: "power3.inOut",
          },
          0
        );
        tl.fromTo(
          sideText,
          { opacity: 0, x: isSide ? -70 : 0, y: isSide ? 0 : 30 },
          { opacity: 1, x: 0, y: 0, duration: 1, ease: "power2.out" },
          0.55
        );
        // Short hold so frame 2 can be read before the section unpins
        tl.to({}, { duration: 0.7 });

        return () =>
          ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      };

      const mm = gsap.matchMedia();
      mm.add(SIDE_QUERY, () => build(true));
      mm.add(STACK_QUERY, () => build(false));

      return () => {
        mm.revert();
      };
    },
    { scope: animationSectionRef }
  );

  return (
    // overflow-x-clip (not hidden) so the pinned section is not inside a
    // scroll container, which breaks pinning on iOS Safari.
    <main className="w-full overflow-x-clip bg-[#6b3fa0] font-sans text-black">
      <section
        ref={animationSectionRef}
        className="relative h-[100svh] min-h-[540px] w-full overflow-hidden bg-[#6b3fa0]"
      >
        {/* FRAME 1 HERO */}
        <div
          ref={heroTextRef}
          className="absolute inset-x-0 top-[clamp(4.5rem,11svh,8rem)] z-[99] flex justify-center px-4 text-center sm:px-6"
        >
          <div className="mx-auto w-full max-w-[1000px] text-center">
            <div className="mx-auto mt-4 flex w-fit max-w-full flex-col items-center justify-center gap-1 rounded-full border border-[#d4ff3f] px-3 pb-2 sm:flex-row sm:gap-2 sm:px-0 sm:pb-0 sm:pr-4">
              <p className="rounded-full bg-[#d4ff3f] px-2 text-[11px] font-semibold uppercase text-[#6b3fa0] sm:text-sm">
                PURPLE CLUB. COME ALIVE.
              </p>
              <p className="text-[11px] font-semibold uppercase text-white/70 sm:text-sm">
                India&apos;s Active Lifestyle Movement
              </p>
            </div>

            <h1 className="mt-[clamp(0.75rem,2.2svh,1.25rem)] text-[clamp(1.5rem,min(7vw,6svh),3rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[#d4ff3f]">
              What if Sunday became your favourite day?
            </h1>

            <p className="mx-auto mt-[clamp(0.75rem,2.2svh,1.25rem)] max-w-2xl text-[13px] font-medium leading-relaxed text-white/90 sm:text-base md:text-lg">
              Movement, laughter and people you will be glad you met. Come and
              see what a Purple Sunday feels like.
            </p>

            <div className="mt-[clamp(0.9rem,2.8svh,1.75rem)] flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={session ? "/dashboard" : "/auth"}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d4ff3f] bg-[#d4ff3f] px-6 py-2 text-sm font-bold text-black shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b8e02a] sm:px-8 sm:text-base"
              >
                Book My First Sunday
                <span aria-hidden="true" className="ml-2 text-lg">
                  ↗
                </span>
              </a>

              <p className="flex max-w-xs flex-row gap-2 text-xs leading-relaxed text-white/70 sm:flex-col sm:gap-0 sm:text-left">
                Your first experience is on us.
                <span className="block font-semibold text-white/90">
                  Come as you are.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* FRAME 2 SIDE TEXT
            The wrapper only positions the text (no transforms), GSAP animates
            the inner div. Layout switches via data-layout set from JS so it
            always matches the matchMedia queries. */}
        <div
          ref={sideWrapRef}
          data-layout="stack"
          className="group pointer-events-none absolute inset-x-0 bottom-0 z-30 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:px-10
            data-[layout=side]:inset-y-0 data-[layout=side]:right-auto data-[layout=side]:flex data-[layout=side]:w-1/2 data-[layout=side]:items-center
            data-[layout=side]:px-0 data-[layout=side]:pb-0 data-[layout=side]:pl-[6%] data-[layout=side]:pr-[3%] data-[layout=side]:text-left"
        >
          <div
            ref={sideTextRef}
            style={{ opacity: 0 }}
            className="mx-auto w-full max-w-[720px] group-data-[layout=side]:mx-0"
          >
            <h2 className="mb-[1.2vh] text-[clamp(1.3rem,min(6vw,4.4svh),2.5rem)] font-bold uppercase leading-[0.98] tracking-[-0.04em] text-[#d4ff3f]">
              A little less routine. A little more life
            </h2>
            <h2 className="text-[clamp(0.85rem,min(3.6vw,2.4svh),1.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
              A game you have not played in years. A moment to breathe. A
              conversation that turns into a friendship. Sometimes, coming alive
              starts with showing up.
            </h2>
            <p className="mt-[1.6vh] text-[clamp(0.7rem,min(3vw,2svh),1.25rem)] font-medium uppercase leading-tight text-[#ccff00]">
              The world celebrates comfort. We celebrate a good stretch, a sweaty
              high-five and a Sunday that leaves you buzzing.
            </p>
          </div>
        </div>

        {/* PANDA: size and position are set from JS (measure), so it adapts
            to any screen. The width here is only the pre-JS fallback. */}
        <div
          ref={characterRef}
          className="pointer-events-none absolute left-0 top-0 z-20 w-[min(80vw,420px)] max-w-none will-change-transform"
        >
          <img
            ref={pandaImgRef}
            src={PANDA_SRC}
            alt=""
            draggable="false"
            decoding="async"
            loading="eager"
            onLoad={refreshOnce}
            onError={() => {
              // Keep the rest of the page usable if the panda asset is missing.
              gsap.set(characterRef.current, { autoAlpha: 0 });
            }}
            className="block h-auto w-full select-none"
          />
        </div>
      </section>

      <section ref={logosRef} className="relative z-10 w-full bg-[#6b3fa0]">
        <ProofSection session={session} />
      </section>
    </main>
  );
}