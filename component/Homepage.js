"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ProofSection from "@/component/ProofSection";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

// Card 1 uses the same image as the hero panda (/main.png). The panda is
// swapped for card 1 at the exact same size and position, then card 1 grows
// and glides, so it is one continuous image, never a second copy.
const POSES = [
  { src: "/main.png", caption: "Welcome to Club", bg: "transparent", ink: "#2b1553" },
  { src: "/runn.png", caption: "Move with Us", bg: "transparent", ink: "#2b1553" },
  { src: "/medi.png", caption: "Meditate with Us", bg: "transparent", ink: "#2b1553" },
  { src: "/push.png", caption: "Sweat with Us", bg: "transparent", ink: "#2b1553" },
  { src: "/dancee.png", caption: "Enjoy With Us", bg: "transparent", ink: "#2b1553" },
  { src: "/talking.png", caption: "Share With Us", bg: "transparent", ink: "#2b1553" },
];

// Scroll distance (px) per unit of timeline. Higher = slower, more cinematic.
const PX_PER_UNIT_DESKTOP = 600;
const PX_PER_UNIT_MOBILE = 260;

// How far the background drifts left (fraction of viewport width).
// The bg image is 112% wide, so this must stay <= 0.12.
const BG_SHIFT = 0.12;

export default function HomePage() {
  const animationSectionRef = useRef(null);
  const heroTextRef = useRef(null);
  const sideTextRef = useRef(null);
  const characterRef = useRef(null);
  const logosRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const progressFillRef = useRef(null);
  const bgRef = useRef(null);

  useGSAP(
    () => {
      const section = animationSectionRef.current;
      const heroText = heroTextRef.current;
      const sideText = sideTextRef.current;
      const character = characterRef.current;
      const logos = logosRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      const progressFill = progressFillRef.current;
      const bg = bgRef.current;

      if (
        !section || !heroText || !sideText || !character || !logos ||
        !stage || !track || !progress || !progressFill || !bg
      ) {
        return;
      }

      const cards = gsap.utils.toArray(".pose-card", section);
      const inners = gsap.utils.toArray(".pose-inner", section);
      const imgs = gsap.utils.toArray(".pose-img", section);
      const N = cards.length;

      // Keep everything on the GPU for smoother scrolling
      gsap.set([track, ...cards], { force3D: true });

      // quickSetters keep the per-frame focus pull cheap
      const setInnerScale = inners.map((el) => gsap.quickSetter(el, "scale"));
      const setImgX = imgs.map((el) => gsap.quickSetter(el, "x", "px"));
      const setProgress = gsap.quickSetter(progressFill, "scaleX");
      const setBgX = gsap.quickSetter(bg, "x", "px");

      // Layout numbers shared by the whole frame-3 sequence.
      const L = {
        vw: 0, vh: 0, cardW: 0, cardH: 0, gap: 0, pitch: 0,
        cx: 0, cy: 0, topY: 0, centerY: 0,
        startX: 0, // strip position when card 1 sits exactly on the panda
        anchorX: 0, // strip position when card 1 is centred in the viewport
        endX: 0, // strip position when the last card is centred
        margin: 0,
        k: 1, // scale at which card 1 exactly covers the panda
      };

      // Strip position when card i is centred in the viewport.
      const stepX = (i) => L.anchorX - i * L.pitch;

      // Measures where the panda sits at the end of frame 2 and sizes the
      // cards (same aspect ratio as the panda) so card 1 matches it exactly.
      const measure = (pandaState, isMobile) => {
        L.vw = section.clientWidth;
        L.vh = section.clientHeight;

        const saved = {
          x: gsap.getProperty(character, "x"),
          y: gsap.getProperty(character, "y"),
          scale: gsap.getProperty(character, "scale"),
        };
        gsap.set(character, pandaState);
        const r = character.getBoundingClientRect();
        const s = section.getBoundingClientRect();
        gsap.set(character, saved);

        L.cx = r.left + r.width / 2 - s.left;
        L.cy = r.top + r.height / 2 - s.top;

        // Cards share the panda's aspect ratio so card 1 is the same picture
        const aspect = r.width / r.height;
        let cardH = L.vh * (isMobile ? 0.52 : 0.68);
        let cardW = cardH * aspect;
        if (cardW > L.vw * 0.78) {
          cardW = L.vw * 0.78;
          cardH = cardW / aspect;
        }
        L.gap = isMobile ? 14 : 28;
        L.cardW = cardW;
        L.cardH = cardH;
        L.pitch = cardW + L.gap;
        L.margin = L.vw * (isMobile ? 0.06 : 0.08);
        L.k = r.width / cardW;

        // No clamp, so card 1 sits exactly on the panda
        L.topY = L.cy - cardH / 2;
        L.centerY = (L.vh - cardH) / 2;
        L.startX = L.cx - cardW / 2;
        L.anchorX = L.vw / 2 - cardW / 2;
        L.endX = L.anchorX - (N - 1) * L.pitch;

        track.style.columnGap = L.gap + "px";
        gsap.set(cards, { width: cardW, height: cardH });
      };

      // Focus pull: the active card is full size, neighbours shrink slightly
      // (opacity always stays 100%), and each image drifts slower than its
      // card so one pose seems to melt into the next.
      const applyFocus = () => {
        const x = gsap.getProperty(track, "x");

        // Card-steps travelled past "card 1 centred". Never below 0.
        const p = Math.max(0, (L.anchorX - x) / L.pitch);

        for (let i = 0; i < N; i++) {
          const d = i - p; // 0 = this card is the active one
          const a = gsap.utils.clamp(0, 1, Math.abs(d));

          setInnerScale[i](1 - 0.08 * a);
          setImgX[i](-d * 28);
        }

        const progressValue = gsap.utils.clamp(0, 1, p / (N - 1));
        setProgress(progressValue);

        // Background drifts left as you move through the cards (parallax)
        setBgX(-progressValue * L.vw * BG_SHIFT);
      };

      // =====================================================
      // FRAME 3
      // 1. panda holds its place in frame 2, side text leaves
      // 2. background fades in, panda is swapped for card 1
      //    (same image, same size, same spot)
      // 3. card 1 grows and glides to the right
      // 4. strip scrolls card to card with a focus pull
      // =====================================================
      const addFrame3 = (tl, isMobile) => {
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
            x: isMobile ? 0 : -80,
            y: isMobile ? 40 : 0,
            duration: 1.4,
            ease: "sine.inOut",
          },
          ">0.1"
        );

        // 2. Background fades in, then the panda IS swapped for card 1
        tl.addLabel("handoff", ">-0.4");
        tl.to(bg, { opacity: 1, duration: 1.8, ease: "sine.inOut" }, "handoff");
        tl.set(cards[0], { opacity: 1, scale: () => L.k }, "handoff+=0.6");
        tl.set(character, { opacity: 0 }, "handoff+=0.6");
        tl.to({}, { duration: 0.5 }); // let it settle

        // 3. Card 1 grows and glides right: same element, no new image
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

        // Bring the other poses into the strip
        tl.set(cards.slice(1), { opacity: 1 }, "glide+=0.6");
        tl.fromTo(
          cards.slice(1),
          { scale: 0.92 },
          { scale: 1, duration: 1.6, ease: "power2.out", stagger: 0.12 },
          "glide+=0.6"
        );
        tl.to(progress, { opacity: 1, duration: 0.8, ease: "power1.out" }, "glide+=1.6");
        tl.to({}, { duration: 0.3 });

        // 4. Scroll right-to-left. Card 1 returns to centre and stays active.
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
        tl.to({}, { duration: 0.5 }); // dwell on card 1

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
          tl.to({}, { duration: 0.6 }); // dwell so each pose reads
        }
        tl.to({}, { duration: 0.8 }); // hold on the last card before unpinning
      };

      let mm = gsap.matchMedia();

      // =====================================================
      // DESKTOP
      // =====================================================
      mm.add("(min-width: 768px)", () => {
        const pandaState = { x: 350, y: -80, scale: 0.55 };

        gsap.set(heroText, { opacity: 1, y: 0 });
        gsap.set(sideText, { opacity: 0, x: 0, y: 0 });
        gsap.set(character, {
          xPercent: -50,
          yPercent: -40,
          x: 40,
          y: 380,
          scale: 1.15,
          opacity: 1,
          transformOrigin: "50% 50%",
        });

        const onRefreshInit = () => measure(pandaState, false);
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
        measure(pandaState, false);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + tl.duration() * PX_PER_UNIT_DESKTOP,
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Frame 1 -> 2
        tl.to(heroText, { opacity: 0, y: -90, duration: 1, ease: "power2.inOut" }, 0);
        tl.to(
          character,
          { x: pandaState.x, y: pandaState.y, scale: pandaState.scale, duration: 1.5, ease: "power3.inOut" },
          0
        );
        tl.fromTo(
          sideText,
          { opacity: 0, x: -70, y: 0 },
          { opacity: 1, x: 0, y: 0, duration: 1, ease: "power2.out" },
          0.55
        );
        tl.to({}, { duration: 0.7 });

        addFrame3(tl, false);

        return () => ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      });

      // =====================================================
      // MOBILE
      // =====================================================
      mm.add("(max-width: 767px)", () => {
        const pandaState = { x: 0, y: -120, scale: 0.6 };

        gsap.set(heroText, { opacity: 1, y: 0 });
        gsap.set(sideText, { opacity: 0, y: 0 });
        gsap.set(character, {
          xPercent: -50,
          yPercent: -40,
          x: 0,
          y: 250,
          scale: 1,
          opacity: 1,
          transformOrigin: "50% 50%",
        });

        const onRefreshInit = () => measure(pandaState, true);
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
        measure(pandaState, true);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + tl.duration() * PX_PER_UNIT_MOBILE,
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Frame 1 -> 2
        tl.to(heroText, { opacity: 0, y: -50, duration: 1, ease: "power2.inOut" }, 0);
        tl.to(character, { y: pandaState.y, scale: pandaState.scale, duration: 1.5, ease: "power3.inOut" }, 0);
        tl.fromTo(sideText, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 0.55);
        tl.to({}, { duration: 0.7 });

        addFrame3(tl, true);

        return () => ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      });

      return () => {
        mm.revert();
      };
    },
    {
      scope: animationSectionRef,
    }
  );

  return (
    <main className="w-full overflow-x-hidden bg-[#6b3fa0] text-black font-sans">
      <section
        ref={animationSectionRef}
        className="relative h-[100svh] min-h-[620px] md:min-h-[700px] w-full overflow-hidden bg-[#6b3fa0]"
      >
        {/* FRAME 1 HERO */}
        <div
          ref={heroTextRef}
          className="absolute inset-x-0 top-28 md:top-36 z-[99] flex justify-center px-5 md:px-6 text-center"
        >
          
<div className="mx-auto max-w-[1000px] text-center">
  {/* Identity */}
  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 border border-[#d4ff3f] w-fit mx-auto rounded-full px-4 sm:px-0 pb-2 sm:pb-0 sm:pr-4">
  <p className="text-xs sm:text-sm font-semibold px-2 rounded-full uppercase text-[#6b3fa0] bg-[#d4ff3f]">
    PURPLE CLUB. COME ALIVE.
  </p>

  {/* Descriptor */}
  <p className=" text-xs sm:text-sm font-semibold uppercase text-white/70">
    India's Active Lifestyle Movement
  </p>
</div>
  {/* Headline */}
  <h1 className="mt-5 text-[clamp(1.5rem,7vw,3rem)] font-bold leading-[0.95] tracking-[-0.05em] text-[#d4ff3f]">
    What if Sunday became your favourite day?
  </h1>

  {/* Supporting copy */}
  <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-relaxed text-white/90 sm:text-base md:text-lg">
    Movement, laughter and people you will be glad you met.
    Come and see what a Purple Sunday feels like.
  </p>

  {/* Primary CTA */}
  <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
    <a
      href="/auth"
      className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d4ff3f] bg-[#d4ff3f] px-7 py-2 text-sm font-bold text-black shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b8e02a] sm:px-8 sm:text-base"
    >
      Book My First Sunday
      <span aria-hidden="true" className="ml-2 text-lg">↗</span>
    </a>

    <p className="max-w-xs text-xs flex flex-row sm:flex-col gap-2 sm:gap-0 leading-relaxed text-white/70 sm:text-left">
      Your first experience is on us.
      <span className="block font-semibold text-white/90">
        Come as you are.
      </span>
    </p>
  </div>

</div>

        </div>

        {/* FRAME 2 SIDE TEXT */}
        <div
          ref={sideTextRef}
          className="absolute top-[66%] md:top-[46%] lg-top-[36%] left-[24%] md:left-[10%] lg:left-[20%] md:top-1/2 z-30 w-[90%] md:w-[52%] max-w-[720px] -translate-x-1/2 md:translate-x-0 -translate-y-1/2 md:pr-12 text-center md:text-left"
        >
          <h2 className="text-[clamp(1.8rem,6vw,2.5rem)] uppercase mb-3 font-bold leading-[0.95] tracking-[-0.05em] text-[#d4ff3f]">
            A little less routine. A little more life
          </h2>
          <h2 className="text-base sm:text-lg md:text-2xl font-bold leading-[1.12] tracking-[-0.025em] text-white">
            A game you have not played in years. A moment to breathe. A conversation that turns into a friendship. Sometimes, coming alive starts with showing up.
          </h2>
          <p className="mt-4 md:mt-10 text-sm sm:text-base md:text-2xl uppercase font-medium leading-tight text-[#ccff00]">
             The world celebrates comfort. We celebrate a good stretch, a sweaty high-five and a Sunday that leaves you buzzing.

          </p>
        </div>

        {/* FRAME 3 BACKGROUND (sits under the cards and the panda) */}
        <div
          ref={bgRef}
          className="absolute -left-[6%] top-0 z-[5] h-full w-[112%] overflow-hidden pointer-events-none will-change-transform"
          
        />

        {/* FRAME 3 CARD STRIP */}
        <div
          ref={stageRef}
          className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
        >
          <div ref={trackRef} className="absolute left-0 top-20 flex will-change-transform">
            {POSES.map((pose, i) => (
              <div key={i} className="pose-card shrink-0 will-change-transform">
                <div
                  className="pose-inner relative h-full w-full overflow-hidden will-change-transform"
                  style={{ background: pose.bg }}
                >
                  <img
                    src={pose.src}
                    alt=""
                    draggable="false"
                    className={`pose-img absolute inset-0 h-full  ${i === 0 ? "90" : ""} ${i === 3 || i===5 ? "top-10" : ""} select-none object-contain will-change-transform [backface-visibility:hidden]`}
                  />                  <p
                    className="absolute top-0 left-6 text-xl md:text-2xl font-bold tracking-[-0.03em] text-lime-300"
                  >
                    {pose.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll progress for the strip */}
          <div
            ref={progressRef}
            className="absolute bottom-6 md:bottom-8 left-[6%] md:left-[18%] right-[16%] md:right-[18%] h-[2px] bg-[#2b1553]/20"
          >
            <div
              ref={progressFillRef}
              className="h-full origin-left bg-[#ccff00]"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>

        {/* PANDA */}
        <div
          ref={characterRef}
          className="absolute left-1/2 top-[55%] md:top-1/2 z-20 w-[min(108vw,420px)] sm:w-[min(90vw,460px)] md:w-[660px] max-w-none -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <img
            src="/main.png"
            alt=""
            draggable="false"
            className="block h-auto w-full select-none"
          />
        </div>
      </section>

      <section
        ref={logosRef}
        className="relative z-10 min-h-screen w-full bg-[#6b3fa0]"
      >
        <ProofSection />
      </section>
    </main>
  );
}