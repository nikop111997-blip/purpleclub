
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

      // DESKTOP: pinned full-screen slice animation
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

      // MOBILE: natural page height, no pinning.
      // Animate slices on scroll without restricting content height.
      mm.add("(max-width: 767px)", () => {
        const slices = gsap.utils.toArray(".image-slice");

        gsap.set(slices, {
          yPercent: 0,
          rotation: 0,
          transformOrigin: "center center",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        tl.to(slices, {
          y: "50vh",
          rotation: 5,
          duration: 1,
          ease: "power1.inOut",
          stagger: {
            amount: 0.8,
            from: "start",
          },
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
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
      className="relative w-full min-h-screen md:h-screen bg-[#d4ff3f] text-gray-900 font-sans border border-gray-950"
    >
      <style jsx global>{`
        .image-slice {
          display: block;
          flex: 0 0 auto;
          width: 100vw;
          height: 0.5vh;
          background-size: 100vw 50vh;
          background-position: center var(--bg-pos-mobile);
          background-repeat: no-repeat;
          will-change: transform;
        }

        @media (min-width: 768px) {
          .image-slice {
            width: 50vw;
            height: 1vh;
            background-size: 50vw 100vh;
            background-position: center var(--bg-pos-desktop);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .image-slice {
            will-change: auto;
          }
        }
      `}</style>

      {/* CONTENT PANELS */}
      <div className="relative md:absolute md:inset-0 z-0 flex flex-col md:flex-row w-full">
        {/* PANEL 1 */}
        <div className="w-full min-h-[50vh] md:min-h-0 md:w-1/2 md:h-full flex flex-col justify-center items-start px-6 py-12 sm:px-10 md:px-12 md:py-0 lg:px-24 bg-[#d4ff3f]">
          <h3 className="text-3xl sm:text-4xl md:text-5xl max-w-2xl font-bold uppercase tracking-tighter text-[#6b3fa0] mb-3 md:mb-4">
            Your first Sunday starts with a hello
          </h3>

          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-6 text-gray-800">
            Your first Purple experience is on us.
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-[300px] md:max-w-md leading-relaxed">
            We will welcome you, help you find your pace and introduce you
            to the people around you. Move together, pause together, refuel,
            and leave with a few more familiar faces.
          </p>

          <a
            href={bookingHref}
            className="mt-6 md:mt-8 px-6 py-3 md:px-8 md:py-4 inline-flex gap-2 items-center bg-purple-500 border border-black hover:bg-purple-400 rounded-full text-white font-bold transition-colors text-sm md:text-base"
          >
            Book My First Sunday
            <ArrowRight size={20} />
          </a>
        </div>

        {/* PANEL 2 */}
        <div className="w-full min-h-[50vh] md:min-h-0 md:w-1/2 md:h-full flex flex-col justify-center items-center px-6 py-12 sm:px-10 md:px-12 md:py-0 text-center bg-[#d4ff3f] border-t-2 md:border-t-0 md:border-l border-black">
          <h3 className="text-2xl sm:text-3xl md:text-3xl max-w-2xl font-bold uppercase tracking-tighter text-[#6b3fa0] mb-3 md:mb-4">
            What happens on a Purple Sunday
          </h3>

          <h4 className="text-base sm:text-xl md:text-2xl font-bold mb-3 md:mb-5 text-gray-800">
            90 minutes that change your week.
          </h4>

          <p className="text-sm sm:text-base md:text-sm text-gray-700 max-w-[380px] sm:max-w-xl leading-relaxed mb-5">
            No machines. No mirrors. No judgement. Just people, open sky
            and four simple things:
          </p>

          <div className="space-y-4 md:space-y-5 max-w-md">
            <div>
              <h5 className="text-xs sm:text-sm font-extrabold tracking-wide text-[#6b3fa0]">
                MOVE — Joyful movement for every body
              </h5>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                Walk, jog, play, laugh. Every activity has an easier option.
                Someone always walks with the last person.
              </p>
            </div>

            <div>
              <h5 className="text-xs sm:text-sm font-extrabold tracking-wide text-[#6b3fa0]">
                MEDITATE — Breathe. Slow down. Reset.
              </h5>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                A few quiet minutes to notice how good your body feels.
              </p>
            </div>

            <div>
              <h5 className="text-xs sm:text-sm font-extrabold tracking-wide text-[#6b3fa0]">
                FUEL — Nourish to flourish
              </h5>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                A protein-rich Purple Fuel shake after every session.
              </p>
            </div>

            <div>
              <h5 className="text-xs sm:text-sm font-extrabold tracking-wide text-[#6b3fa0]">
                CONNECT — Find your tribe
              </h5>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                Partner games, a Purple Band from the friend who brought you,
                and a group photo you'll want to keep.
              </p>
            </div>
          </div>

          <a
            href={bookingHref}
            className="mt-6 md:mt-8 px-5 py-3 md:px-8 md:py-4 inline-flex gap-2 items-center bg-purple-500 border border-black hover:bg-purple-400 rounded-full text-white font-bold transition-colors text-xs sm:text-base"
          >
            Book My Free Sunday
            <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {/* ANIMATED IMAGE SLICES */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col md:block overflow-hidden">
        {slices.map((i) => (
          <div
            key={i}
            className="image-slice origin-center shadow-lg rounded-b-xl md:rounded-b-none md:rounded-r-2xl"
            style={{
              backgroundImage: `url("${runnerImage}")`,
              "--bg-pos-desktop": `-${i}vh`,
              "--bg-pos-mobile": `-${i * 0.5}vh`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
