
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
        <div className="order-1 flex w-full flex-col items-center justify-center border-b-2 border-black bg-[#d4ff3f] px-6 py-12 text-center sm:px-10 md:order-2 md:h-full md:w-1/2 md:border-b-0 md:border-l md:px-12 md:py-0">
          <h3 className="mb-3 max-w-2xl text-2xl font-bold uppercase tracking-tighter text-[#6b3fa0] sm:text-3xl md:mb-4 md:text-3xl">
            What happens on a Purple Sunday
          </h3>

          <h4 className="mb-3 text-base font-bold text-gray-800 sm:text-xl md:mb-5 md:text-2xl">
            90 minutes that change your week.
          </h4>

          <p className="mb-5 max-w-[380px] text-sm leading-relaxed text-gray-700 sm:max-w-xl sm:text-base md:text-sm">
            No machines. No mirrors. No judgement. Just people, open sky
            and four simple things:
          </p>

          <div className="max-w-md space-y-4 md:space-y-5">
            <div>
              <h5 className="text-sm font-extrabold tracking-wide text-[#6b3fa0] sm:text-sm">
                MOVE — Joyful movement for every body
              </h5>
              <p className="text-sm leading-relaxed text-gray-700 sm:text-sm">
                Walk, jog, play, laugh. Every activity has an easier option.
                Someone always walks with the last person.
              </p>
            </div>

            <div>
              <h5 className="text-sm font-extrabold tracking-wide text-[#6b3fa0] sm:text-sm">
                MEDITATE — Breathe. Slow down. Reset.
              </h5>
              <p className="text-sm leading-relaxed text-gray-700 sm:text-sm">
                A few quiet minutes to notice how good your body feels.
              </p>
            </div>

            <div>
              <h5 className="text-sm font-extrabold tracking-wide text-[#6b3fa0] sm:text-sm">
                FUEL — Nourish to flourish
              </h5>
              <p className="text-sm leading-relaxed text-gray-700 sm:text-sm">
                A protein-rich Purple Fuel shake after every session.
              </p>
            </div>

            <div>
              <h5 className="text-sm font-extrabold tracking-wide text-[#6b3fa0] sm:text-sm">
                CONNECT — Find your tribe
              </h5>
              <p className="text-sm leading-relaxed text-gray-700 sm:text-sm">
                Partner games, a Purple Band from the friend who brought you,
                and a group photo you'll want to keep.
              </p>
            </div>
          </div>

          <a
            href={bookingHref}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-black bg-purple-500 px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-purple-400 sm:text-base md:mt-8 md:px-8 md:py-4"
          >
            Book your free purple experience
            <ArrowRight size={18} />
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
