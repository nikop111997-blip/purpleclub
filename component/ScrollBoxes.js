
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function PurpleClub({ session }) {
  const containerRef = useRef(null);
  const runnerImage = "/run.png";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP ONLY: pinned full-screen slice animation
      mm.add("(min-width: 768px)", () => {
        const slices = gsap.utils.toArray(".image-slice");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=150%",
            scrub: 0.5,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(slices, {
          xPercent: 100,
          rotation: 15,
          duration: 1,
          ease: "power1.inOut",
          stagger: { amount: 1 },
        });

        tl.to(
          slices,
          {
            rotation: 0,
            duration: 1,
            ease: "power1.in",
          },
          1
        );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      // No GSAP animation or pinning on mobile
    }, container);

    const refresh = () => ScrollTrigger.refresh();

    window.addEventListener("load", refresh);
    const timer = window.setTimeout(refresh, 300);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const bookingHref = session ? "/dashboard" : "#membership";
  const slices = Array.from({ length: 100 }, (_, i) => i);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#d4ff3f] text-gray-900 font-sans border-t border-gray-950 md:h-screen md:min-h-screen"
    >
      <style jsx global>{`
        .image-slice {
          display: block;
          flex: 0 0 auto;
          width: 50vw;
          height: 1vh;
          background-size: 50vw 100vh;
          background-position: center var(--bg-pos-desktop);
          background-repeat: no-repeat;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .image-slice {
            will-change: auto;
          }
        }
      `}</style>

      {/* CONTENT LAYOUT */}
      <div className="relative flex w-full flex-col md:absolute md:inset-0 md:flex-row">

        {/* PANEL 2 — FIRST ON MOBILE, RIGHT ON DESKTOP */}
        
<div className="order-1 flex w-full flex-col items-center justify-center border-b-2 border-black bg-[#d4ff3f] px-5 py-6 text-center sm:px-8 md:order-2 md:h-full md:w-1/2 md:border-b-0 md:border-l md:px-8 md:py-5">
 

  <h3 className="mb-1.5 max-w-xl text-xl font-bold uppercase leading-tight tracking-tight text-[#6b3fa0] sm:text-2xl">
    What Happens on a Purple Sunday?
  </h3>

  <h4 className="mb-2 text-sm font-bold text-gray-900 sm:text-base">
    90 minutes that make your whole week feel better.
  </h4>

  <p className="mb-4 max-w-md text-xs leading-relaxed text-gray-800 sm:text-sm">
    No machines. No mirrors. No judgement.
    <br />
    Just fresh air, good company and four ways to come alive.
  </p>

  <div className="w-full max-w-md space-y-3 text-left sm:space-y-3.5">
    <div className="border-l-2 border-[#6b3fa0] pl-3">
      <h5 className="text-xs font-extrabold uppercase tracking-wide text-[#6b3fa0] sm:text-sm">
        MOVE <span className="font-semibold normal-case tracking-normal">: Move Your Body. Free Your Mind.</span>
      </h5>
      <p className="mt-0.5 text-xs leading-snug text-gray-800 sm:text-sm">
        Fun, joyful movement for every body. Everyone belongs, and nobody gets left behind.
      </p>
    </div>

    <div className="border-l-2 border-[#6b3fa0] pl-3">
      <h5 className="text-xs font-extrabold uppercase tracking-wide text-[#6b3fa0] sm:text-sm">
        MEDITATE <span className="font-semibold normal-case tracking-normal">: Pause. Breathe. Reconnect.</span>
      </h5>
      <p className="mt-0.5 text-xs leading-snug text-gray-800 sm:text-sm">
        Slow down, quiet your mind and reconnect with yourself.
      </p>
    </div>

    <div className="border-l-2 border-[#6b3fa0] pl-3">
      <h5 className="text-xs font-extrabold uppercase tracking-wide text-[#6b3fa0] sm:text-sm">
        FUEL <span className="font-semibold normal-case tracking-normal">: Nourish to Flourish.</span>
      </h5>
      <p className="mt-0.5 text-xs leading-snug text-gray-800 sm:text-sm">
        Recharge with a delicious, protein-rich Purple Fuel shake.
      </p>
    </div>

    <div className="border-l-2 border-[#6b3fa0] pl-3">
      <h5 className="text-xs font-extrabold uppercase tracking-wide text-[#6b3fa0] sm:text-sm">
        CONNECT <span className="font-semibold normal-case tracking-normal">: Find Your Tribe.</span>
      </h5>
      <p className="mt-0.5 text-xs leading-snug text-gray-800 sm:text-sm">
        Share a laugh, make a friend and discover the joy of belonging.
      </p>
    </div>
  </div>

  <p className="mt-4 text-xs font-black tracking-wide text-[#6b3fa0] sm:text-sm">
    Come as you are. Leave a little more alive.
  </p>

  <a
    href={bookingHref}
    className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#6b3fa0] bg-[#6b3fa0] px-5 py-2.5 text-xs font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#552d87] sm:text-sm"
  >
    Book Your Free Purple Experience
    <ArrowRight size={16} />
  </a>
</div>


        {/* STATIC IMAGE — SECOND ON MOBILE ONLY */}
        <div
          className="order-2 relative block h-[50vh] min-h-[300px] w-full shrink-0 bg-cover bg-center bg-no-repeat md:hidden"
          style={{ backgroundImage: `url("${runnerImage}")` }}
          role="img"
          aria-label="Purple Club runner"
        />

        {/* PANEL 1 — THIRD ON MOBILE, LEFT ON DESKTOP */}
        <div className="order-3 flex min-h-[50vh] w-full flex-col items-start justify-center bg-[#d4ff3f] px-6 py-12 sm:px-10 md:order-1 md:h-full md:w-1/2 md:min-h-0 md:px-12 md:py-0 lg:px-24">
          <h3 className="mb-3 max-w-2xl text-3xl font-bold uppercase tracking-tighter text-[#6b3fa0] sm:text-4xl md:mb-4 md:text-5xl">
            Your first Sunday starts with a hello
          </h3>

          <h2 className="mb-3 text-lg font-bold text-gray-800 sm:text-xl md:mb-6 md:text-2xl">
            Your first Purple experience is on us.
          </h2>

          <p className="max-w-[300px] text-sm leading-relaxed text-gray-700 sm:text-base md:max-w-md md:text-lg">
            We will welcome you, help you find your pace and introduce you
            to the people around you. Move together, pause together, refuel,
            and leave with a few more familiar faces.
          </p>

          <a
            href={bookingHref}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-black bg-purple-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-400 md:mt-8 md:px-8 md:py-4 md:text-base"
          >
           Book your free purple experience
            <ArrowRight size={20} />
          </a>
        </div>
      </div>

      {/* DESKTOP ANIMATED IMAGE SLICES */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden flex-col overflow-hidden md:flex">
        {slices.map((i) => (
          <div
            key={i}
            className="image-slice origin-center shadow-lg rounded-r-2xl"
            style={{
              backgroundImage: `url("${runnerImage}")`,
              "--bg-pos-desktop": `-${i}vh`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
