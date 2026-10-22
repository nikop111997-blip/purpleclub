"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ProofSection from "@/component/ProofSection";

gsap.registerPlugin(ScrollTrigger);
// Stops the mobile URL-bar show/hide from re-measuring and jittering the pin
ScrollTrigger.config({ ignoreMobileResize: true });

const POSES = [
  { src: "/main.png", caption: "Welcome to Club" },
  { src: "/runn.png", caption: "Move with Us" },
  { src: "/medi.png", caption: "Meditate with Us" },
  { src: "/push.png", caption: "Sweat with Us", pad: true },
  { src: "/dancee.png", caption: "Enjoy With Us" },
  { src: "/talking.png", caption: "Share With Us", pad: true },
];

// Scroll distance (px) per unit of timeline.
const PX_PER_UNIT_SIDE = 600;
const PX_PER_UNIT_STACK = 300;

// Background drift (fraction of viewport width). bg is 112% wide, so <= 0.12.
const BG_SHIFT = 0.12;

// SIDE  = wide landscape screens (laptop / desktop / landscape tablet):
//         text on the left, panda on the right.
// STACK = phones, portrait tablets, small windows:
//         panda on top, text underneath.
const SIDE_QUERY = "(min-width: 900px) and (min-aspect-ratio: 5/4)";
const STACK_QUERY = "(max-width: 899px), (max-aspect-ratio: 5/4)";

export default function HomePage({session}) {
  const animationSectionRef = useRef(null);
  const heroTextRef = useRef(null);
  const sideWrapRef = useRef(null);
  const sideTextRef = useRef(null);
  const characterRef = useRef(null);
  const pandaImgRef = useRef(null);
  const logosRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const progressFillRef = useRef(null);
  const bgRef = useRef(null);

  useGSAP(
    () => {
      const section = animationSectionRef.current;
      const heroText = heroTextRef.current;
      const sideWrap = sideWrapRef.current;
      const sideText = sideTextRef.current;
      const character = characterRef.current;
      const pandaImg = pandaImgRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      const progressFill = progressFillRef.current;
      const bg = bgRef.current;

      if (
        !section || !heroText || !sideWrap || !sideText || !character ||
        !pandaImg || !track || !progress || !progressFill || !bg
      ) {
        return;
      }

      // Keep the first frame visible if an animation cannot be initialized.
      gsap.set(heroText, { autoAlpha: 1, y: 0 });
      gsap.set(character, { autoAlpha: 1 });
      gsap.set(sideText, { autoAlpha: 0 });
      gsap.set(track, { clearProps: "transform" });
      gsap.set(progress, { autoAlpha: 0 });

      const cards = gsap.utils.toArray(".pose-card", section);
      const inners = gsap.utils.toArray(".pose-inner", section);
      const imgs = gsap.utils.toArray(".pose-img", section);
      const N = cards.length;

      gsap.set([track, ...cards], { force3D: true });

      const setInnerScale = inners.map((el) => gsap.quickSetter(el, "scale"));
      const setImgX = imgs.map((el) => gsap.quickSetter(el, "x", "px"));
      const setProgress = gsap.quickSetter(progressFill, "scaleX");
      const setBgX = gsap.quickSetter(bg, "x", "px");

      // Everything that depends on screen size lives here and is recomputed
      // on every ScrollTrigger refresh (resize / rotate).
      const L = {
        vw: 0, vh: 0, cardW: 0, cardH: 0, gap: 0, pitch: 0,
        cx: 0, cy: 0, topY: 0, centerY: 0,
        startX: 0, anchorX: 0, endX: 0, margin: 0, k: 1,
        parallax: 28,
      };
      // Panda start (frame 1) and end (frame 2) poses, all in section px
      const S = {
        start: { x: 0, y: 0, scale: 1 },
        end: { x: 0, y: 0, scale: 1 },
      };

      const stepX = (i) => L.anchorX - i * L.pitch;

      const measure = (isSide) => {
        const vw = (L.vw = section.clientWidth);
        const vh = (L.vh = section.clientHeight);
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
        const sEnd = targetH / baseH;
        S.end = { x: cx, y: cy, scale: sEnd };

        // Cards share the panda's aspect so card 1 is the same picture
        L.cx = cx;
        L.cy = cy;
        const endW = baseW * sEnd;
        let cardH = vh * (isSide ? 0.68 : 0.5);
        let cardW = cardH / ratio;
        if (cardW > vw * 0.86) {
          cardW = vw * 0.86;
          cardH = cardW * ratio;
        }
        L.gap = isSide ? 28 : 14;
        L.cardW = cardW;
        L.cardH = cardH;
        L.pitch = cardW + L.gap;
        L.margin = vw * (isSide ? 0.08 : 0.06);
        L.k = endW / cardW;
        L.parallax = Math.min(28, cardW * 0.08);

        L.topY = L.cy - cardH / 2;
        L.centerY = (vh - cardH) / 2;
        L.startX = L.cx - cardW / 2;
        L.anchorX = vw / 2 - cardW / 2;
        L.endX = L.anchorX - (N - 1) * L.pitch;

        track.style.columnGap = L.gap + "px";
        gsap.set(cards, { width: cardW, height: cardH });
      };

      const applyFocus = () => {
        const x = gsap.getProperty(track, "x");
        const p = Math.max(0, (L.anchorX - x) / L.pitch);

        for (let i = 0; i < N; i++) {
          const d = i - p;
          const a = gsap.utils.clamp(0, 1, Math.abs(d));
          setInnerScale[i](1 - 0.08 * a);
          setImgX[i](-d * L.parallax);
        }

        const progressValue = gsap.utils.clamp(0, 1, p / (N - 1));
        setProgress(progressValue);
        setBgX(-progressValue * L.vw * BG_SHIFT);
      };

      const addFrame3 = (tl, isSide) => {
        gsap.set(imgs, { scale: 1 });
        gsap.set(inners, { opacity: 1 });
        gsap.set(cards, { opacity: 0, scale: 1 });
        gsap.set(track, { x: () => L.startX, y: () => L.topY });
        gsap.set(progress, { opacity: 0 });
        gsap.set(bg, { opacity: 0 });
        applyFocus();

        // 1. Side text leaves
        tl.to(
          sideText,
          {
            opacity: 0,
            x: isSide ? -80 : 0,
            y: isSide ? 0 : 40,
            duration: 1.4,
            ease: "sine.inOut",
          },
          ">0.1"
        );

        // 2. Background fades in, panda is swapped for card 1
        tl.addLabel("handoff", ">-0.4");
        tl.to(bg, { opacity: 1, duration: 1.8, ease: "sine.inOut" }, "handoff");
        tl.set(cards[0], { opacity: 1, scale: () => L.k }, "handoff+=0.6");
        tl.set(character, { opacity: 0 }, "handoff+=0.6");
        tl.to({}, { duration: 0.5 });

        // 3. Card 1 grows and glides right
        const rightStartX = () =>
          Math.max(L.anchorX + 1, L.vw - L.margin - L.cardW);

        tl.addLabel("glide");
        tl.fromTo(
          cards[0],
          { scale: () => L.k },
          { scale: 1, duration: 2.4, ease: "power3.inOut", immediateRender: false },
          "glide"
        );
        tl.fromTo(
          track,
          { x: () => L.startX, y: () => L.topY },
          {
            x: rightStartX,
            y: () => L.centerY,
            duration: 2.4,
            ease: "power3.inOut",
            onUpdate: applyFocus,
            immediateRender: false,
          },
          "glide"
        );

        tl.set(cards.slice(1), { opacity: 1 }, "glide+=0.6");
        tl.fromTo(
          cards.slice(1),
          { scale: 0.92 },
          { scale: 1, duration: 1.6, ease: "power2.out", stagger: 0.12 },
          "glide+=0.6"
        );
        tl.to(progress, { opacity: 1, duration: 0.8, ease: "power1.out" }, "glide+=1.6");
        tl.to({}, { duration: 0.3 });

        // 4. Scroll the strip card to card
        tl.fromTo(
          track,
          { x: rightStartX },
          {
            x: () => stepX(0),
            duration: 1.8,
            ease: "power2.inOut",
            onUpdate: applyFocus,
            immediateRender: false,
          },
          ">"
        );
        tl.to({}, { duration: 0.5 });

        for (let i = 1; i < N; i++) {
          tl.fromTo(
            track,
            { x: () => stepX(i - 1) },
            {
              x: () => stepX(i),
              duration: 2.4,
              ease: "power2.inOut",
              onUpdate: applyFocus,
              immediateRender: false,
            },
            ">"
          );
          // pause so each pose reads, but not after the last one:
          // the section unpins as soon as the last card lands
          if (i < N - 1) tl.to({}, { duration: 0.6 });
        }
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
            scrub: 1.5,
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
        tl.to({}, { duration: 0.7 });

        addFrame3(tl, isSide);

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
    <main className="w-full overflow-x-hidden bg-[#6b3fa0] font-sans text-black">
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
                href={`${session?"/dashboard":'/auth'}`}
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
            className="mx-auto w-full max-w-[720px] data-[layout=side]:mx-0"
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

        {/* FRAME 3 BACKGROUND */}
        <div
          ref={bgRef}
          className="pointer-events-none absolute -left-[6%] top-0 z-[5] h-full w-[112%] overflow-hidden will-change-transform"
        />

        {/* FRAME 3 CARD STRIP */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <div
            ref={trackRef}
            className="absolute left-0 top-0 flex will-change-transform"
          >
            {POSES.map((pose, i) => (
              <div key={i} className="pose-card shrink-0 will-change-transform">
                <div className="pose-inner relative h-full w-full overflow-hidden will-change-transform">
                  <img
                    src={pose.src}
                    alt=""
                    draggable="false"
                    className={`pose-img absolute inset-0 box-border h-full w-full select-none object-contain will-change-transform [backface-visibility:hidden] ${
                      pose.pad ? "pt-8 md:pt-10" : ""
                    }`}
                  />
                  <p className="absolute left-3 top-0 text-base font-bold tracking-[-0.03em] text-lime-300 sm:left-6 sm:text-xl md:text-2xl">
                    {pose.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll progress for the strip */}
          <div
            ref={progressRef}
            className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-[8%] right-[8%] h-[2px] bg-[#2b1553]/20 md:left-[18%] md:right-[18%]"
          >
            <div
              ref={progressFillRef}
              className="h-full origin-left bg-[#ccff00]"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>

        {/* PANDA: size and position are set from JS (measure), so it adapts
            to any screen. The width here is only the pre-JS fallback. */}
        <div
          ref={characterRef}
          className="pointer-events-none absolute left-0 top-0 z-20 w-[min(80vw,420px)] max-w-none"
        >
          <img
            ref={pandaImgRef}
            src="/main.png"
            alt=""
            draggable="false"
            onLoad={() => {
              // The image's natural dimensions are needed by measure().
              requestAnimationFrame(() => ScrollTrigger.refresh());
            }}
            onError={() => {
              // Keep the rest of the page usable if the panda asset is missing.
              gsap.set(characterRef.current, { autoAlpha: 0 });
            }}
            className="block h-auto w-full select-none"
          />
        </div>
      </section>

      {/* No min-h-screen here: that was adding the blank area after the last section */}
      <section ref={logosRef} className="relative z-10 w-full bg-[#6b3fa0]">
        <ProofSection session={session} />
      </section>
    </main>
  );
}