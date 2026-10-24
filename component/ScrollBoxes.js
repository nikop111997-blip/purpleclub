"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function PurpleClub({ session }) {
  const containerRef = useRef(null);
  const runnerImage = "/run.png"; // leading slash: file must be in /public

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      const build = (vars) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            scrub: 0.5,
            pin: true,
            pinSpacing: true,       // keeps space so next section waits
            anticipatePin: 1,
            start: "top top",
            end: "+=150%",
            invalidateOnRefresh: true,
          },
        });

        tl.to(".image-slice", {
          force3D: true,
          duration: 1,
          ease: "power1.inOut",
          stagger: { amount: 1 },
          ...vars.move,
        })
          .to(".image-slice", { ease: "power1.out", duration: 1, rotation: vars.rot }, 0)
          .to(".image-slice", { ease: "power1.in", duration: 1, rotation: "0deg" }, 1);
      };

      // DESKTOP
      mm.add("(min-width: 768px)", () => {
        build({ move: { xPercent: 100 }, rot: "15deg" });
      });

      // MOBILE
      mm.add("(max-width: 767px)", () => {
        build({ move: { y: "50vh", stagger: { amount: 1, from: "start" } }, rot: "5deg" });
      });
    }, containerRef);

    // Recalculate after images/fonts load
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 300);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans border border-gray-950"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .image-slice {
          width: 100vw;
          height: 0.5vh;
          background-size: 100vw 50vh;
          background-position: var(--bg-pos-mobile);
        }
        @media (min-width: 768px) {
          .image-slice {
            width: 50vw;
            height: 1vh;
            background-size: 50vw 100vh;
            background-position: var(--bg-pos-desktop);
          }
        }
      `,
        }}
      />

      {/* BACKGROUND CONTENT */}
      <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full z-0">
        {/* PANEL 1 */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full flex flex-col justify-center items-start md:items-start text-center md:text-left px-6 md:px-12 lg:px-24 bg-[#d4ff3f]">
           <h3 className="text-3xl sm:text-4xl md:text-5xl max-w-2xl font-bold uppercase tracking-tighter text-[#6b3fa0] mb-2 md:mb-4">
            Your first Sunday starts with a hello
          </h3>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 md:mb-6 text-gray-800">
            Your first Purple experience is on us.
          </h2>
          <p className="text-sm md:text-lg text-gray-700 max-w-[300px] md:max-w-md leading-relaxed">
            We will welcome you, help you find your pace and introduce you to the people around you. Move together, pause together, refuel, and leave with a few more familiar faces
          </p>
          <a
            href={session ? "/dashboard" : "#membership"}
            className="mt-4 md:mt-8 px-6 py-3 md:px-8 md:py-4 flex gap-1 items-center bg-purple-500 border border-black hover:bg-purple-400 rounded-full text-white font-bold w-max transition-colors text-sm md:text-base"
          >
            Book My First Sunday <ArrowRight size={20} />
          </a>
        </div>

        {/* PANEL 2 */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full flex flex-col justify-center md:pt-18 items-center px-6 md:px-12 text-center bg-[#d4ff3f] border-t-2 md:border-t-0 md:border-l border-black">
        <h3 className="text-2xl sm:text-2xl md:text-3xl max-w-2xl font-bold uppercase tracking-tighter text-[#6b3fa0] mb-2 md:mb-4">
  What happens on a Purple Sunday
</h3>

<h4 className="text-base sm:text-xl md:text-2xl font-bold mb-2 md:mb-5 text-gray-800">
  90 minutes that change your week.
</h4>

<p className="text-xs sm:text-base md:text-sm text-gray-700 max-w-[380px] sm:max-w-xl leading-relaxed mb-4 md:mb-5">
  No machines. No mirrors. No judgement. Just people, open sky and four simple things:
</p>

<div className="space-y-1 md:space-y-5 max-w-md">
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
  href={session ? "/dashboard" : "#membership"}
  className="mt-5 md:mt-8 px-5 py-2.5 md:px-8 md:py-4 inline-flex gap-2 items-center bg-purple-500 border border-black hover:bg-purple-400 rounded-full text-white font-bold w-max transition-colors text-xs sm:text-base"
>
  Book My Free Sunday <ArrowRight size={18} />
</a>
        </div>
      </div>

      {/* SLICE OVERLAY */}
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none flex flex-col md:block">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="image-slice block origin-center shadow-lg rounded-b-xl md:rounded-b-none md:rounded-r-2xl"
            style={{
              backgroundImage: `url(${runnerImage})`,
              backgroundRepeat: "no-repeat",
              "--bg-pos-desktop": `center -${i}vh`,
              "--bg-pos-mobile": `center -${i * 0.5}vh`,
            }}
          />
        ))}
      </div>
    </section>
  );
}