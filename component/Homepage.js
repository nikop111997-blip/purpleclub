"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ProofSection from "@/component/ProofSection";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const animationSectionRef = useRef(null);
  const heroTextRef = useRef(null);
  const sideTextRef = useRef(null);
  const characterRef = useRef(null);
  const logosRef = useRef(null);

  useGSAP(
    () => {
      const section = animationSectionRef.current;
      const heroText = heroTextRef.current;
      const sideText = sideTextRef.current;
      const character = characterRef.current;
      const logos = logosRef.current;

      if (!section || !heroText || !sideText || !character || !logos) {
        return;
      }

      let mm = gsap.matchMedia();

      // =====================================================
      // DESKTOP ANIMATION (Untouched)
      // =====================================================
      mm.add("(min-width: 768px)", () => {
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

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=1500",
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(heroText, { opacity: 0, y: -90, duration: 1, ease: "power2.inOut" }, 0);
        tl.to(character, { x: 350, y: -80, scale: 0.55, duration: 1.5, ease: "power3.inOut" }, 0);
        
        tl.fromTo(sideText, { opacity: 0, x: -70, y: 0 }, { opacity: 1, x: 0, y: 0, duration: 1, ease: "power2.out" }, 0.55);
        tl.to({}, { duration: 0.7 });
        tl.to([character, sideText], { y: -280, duration: 1.5, ease: "power2.inOut" }, "+=0.1");
        tl.to(character, { x: -150, y: -390, scale: 0.42, duration: 1.3, ease: "power3.inOut" }, "+=0.1");
        tl.to(sideText, { x: -150, y: -390, opacity: 0, duration: 1.3, ease: "power3.inOut" }, "<");
        tl.to(character, { x: -500, y: -250, scale: 0.23, duration: 1.2, ease: "power3.inOut" }, "+=0.1");
      });

      // =====================================================
      // MOBILE ANIMATION (Optimized for small screens)
      // =====================================================
      mm.add("(max-width: 767px)", () => {
        gsap.set(heroText, { opacity: 1, y: 0 });
        gsap.set(sideText, { opacity: 0, y: 0 });
        gsap.set(character, {
          xPercent: -50,
          yPercent: -40,
          x: 0,
          y: 250, // lower on mobile to fit under text
          scale: 1, 
          opacity: 1,
          transformOrigin: "50% 50%",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=1200", 
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1. Hero fades, Character moves to center-top and shrinks
        tl.to(heroText, { opacity: 0, y: -50, duration: 1, ease: "power2.inOut" }, 0);
        tl.to(character, { y: -120, scale: 0.6, duration: 1.5, ease: "power3.inOut" }, 0);
        
        // 2. Mobile text appears below the character
        tl.fromTo(sideText, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 0.55);
        tl.to({}, { duration: 0.7 }); // hold

        // 3. Move both up
        tl.to([character, sideText], { y: "-=150", duration: 1.5, ease: "power2.inOut" }, "+=0.1");
        
        // 4. Fade out text, character shrinks further and exits upwards
        tl.to(character, { y: "-=250", opacity: 0, scale: 0.4, duration: 1.3, ease: "power3.inOut" }, "+=0.1");
        tl.to(sideText, { y: "-=100", opacity: 0, duration: 1.3, ease: "power3.inOut" }, "<");
      });

      return () => {
        mm.revert(); // Automatically cleans up all ScrollTriggers and MatchMedia contexts
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
        className="relative h-screen w-full overflow-hidden bg-[#6b3fa0]"
      >
        {/* =================================================
            FRAME 1 HERO
            Added md: prefixes to keep desktop exact, scaled mobile down.
            ================================================= */}
        <div
          ref={heroTextRef}
          className="inset-0 mt-36 md:mt-36 z-[99] flex justify-center px-4 md:px-6 text-center"
        >
          <div className="max-w-[1000px]">
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] md:text-[clamp(2.6rem,5vw,4rem)] font-bold leading-[0.9] tracking-[-0.05em] text-[#d4ff3f]">
              Get High on Life
            </h1>
            <p className="mt-6 md:mt-8 text-base md:text-2xl font-medium text-white">
              A community-powered active lifestyle movement where movement, energy and real connection come together.
            </p>
            <div>
          <Link 
            href="/contact" 
            className="inline-flex mt-4 items-center justify-center bg-[#d4ff3f] text-black border border-gray-600 shadow-sm font-semibold text-[15px] sm:px-8 sm:py-3.5 px-5 py-2.5 rounded-full hover:bg-[#b8e02a] transition-colors"
          >
            Join the Pueple Club
          </Link>
        </div>
          </div>
        </div>

        {/* =================================================
            FRAME 2 TEXT
            Mobile: Centered, lower down. Desktop: left-[20%]
            ================================================= */}
        <div
          ref={sideTextRef}
          className="absolute left-[5%] md:left-[20%] top-[60%] md:top-1/2 z-30 w-[90%] md:w-[42%] max-w-[520px] -translate-y-1/2 md:pr-8 text-center md:text-left"
        > 
        <h2 className="text-[clamp(2.2rem,5vw,4rem)] md:text-[clamp(2.6rem,5vw,3rem)] uppercase mb-3 font-bold leading-[0.9] tracking-[-0.05em] text-[#d4ff3f]">
              Your Sundays Are About to Get Better.
            </h2>
          <h2 className="text-2xl md:text-2xl font-bold leading-[1.04] tracking-[-0.035em] text-white">
            Move, sweat, laugh, connect and start your week feeling different. Purple Club brings people together every Sunday for fun, guided experiences that make healthy living social, exciting and easier to stick with.
          </h2>
          <p className="mt-6 md:mt-10 text-lg md:text-2xl lg:text-2xl uppercase font-medium leading-tight text-[#ccff00]">
            Come for the experience. Stay for the tribe.

          </p>
        </div>

        {/* =================================================
            SVG CHARACTER
            Mobile: Reduced width. Desktop: 760px
            ================================================= */}
        <div
          ref={characterRef}
          className="absolute left-1/2 top-1/3 md:top-1/2 z-20 w-[420px] md:w-[760px] -ml-[30px] md:-ml-12 max-w-none pointer-events-none"
        >
          <img
            src="/retail-character.svg"
            alt=""
            draggable="false"
            className="block h-auto w-full select-none"
          />
        </div>
      </section>

      <section
        ref={logosRef}
        className="relative z-10 -mt-[48vh] md:-mt-[18vh] lg:-mt-[52vh] min-h-screen w-full bg-[#6b3fa0]"
      >
        <ProofSection />
      </section>
    </main>
  );
}

function LogoBox({ text }) {
  return (
    <div className="flex h-28 items-center justify-center border border-black text-xl font-bold">
      {text}
    </div>
  );
}