
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Heading3 } from "lucide-react";

export default function PurpleClub() {
  const containerRef = useRef(null);

  // High-quality running image from Unsplash
  const runnerImage = "run.png";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let mm = gsap.matchMedia();

    // DESKTOP ANIMATION
    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: 0.5,
          pin: true,
          start: "top top",
          end: "+=150%",
        },
      });

      tl.to(".image-slice", {
        force3D: true,
        duration: 1,
        xPercent: 100, // Moves the slices to the right side of the screen
        ease: "power1.inOut",
        stagger: { amount: 1 },
      })
        .to(".image-slice", { ease: "power1.out", duration: 1, rotation: "15deg" }, 0)
        .to(".image-slice", { ease: "power1.in", duration: 1, rotation: "0deg" }, 1);
    });

    // MOBILE ANIMATION
    mm.add("(max-width: 767px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: 0.5,
          pin: true,
          start: "top top",
          end: "+=150%",
        },
      });

      tl.to(".image-slice", {
        force3D: true,
        duration: 1,
        y: "50vh", // Slides the pieces from the top half down to the bottom half
        ease: "power1.inOut",
        stagger: { amount: 1, from: "start" }, 
      })
        .to(".image-slice", { ease: "power1.out", duration: 1, rotation: "5deg" }, 0) // Reduced rotation for mobile tightness
        .to(".image-slice", { ease: "power1.in", duration: 1, rotation: "0deg" }, 1);
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[100vh] overflow-hidden bg-[#0a0a0a] text-white font-sans"
    >
      {/* Dynamic CSS to handle slice sizes and offsets gracefully between Desktop & Mobile */}
      <style dangerouslySetInnerHTML={{
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
      `}} />

      {/* BACKGROUND CONTENT */}
      <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full z-0">
        
        {/* PANEL 1: Mobile Top / Desktop Left */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full flex flex-col justify-center items-center md:items-start text-center md:text-left px-6 md:px-12 lg:px-24 bg-[#d4ff3f]">
          <h3 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-purple-700 md:text-purple-300 mb-2 md:mb-4">
           Ready to Go<br className="hidden md:block" /> Purple
          </h3>
          <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 md:mb-6 text-gray-800 md:text-white">
            Your first Purple experience is on us.
          </h4>
          <p className="text-sm md:text-lg text-gray-700 md:text-purple-100/80 max-w-[300px] md:max-w-md leading-relaxed">
            Get Your Invitation
          </p>
          <button className="mt-4 md:mt-8 px-6 py-3 md:px-8 md:py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold uppercase tracking-widest w-max transition-colors text-sm md:text-base">
            Get Your Invitation
          </button>
        </div>

        {/* PANEL 2: Mobile Bottom / Desktop Right */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full flex flex-col justify-center md:pt-36 items-center px-6 md:px-12 text-center bg-[#d4ff3f] border-t-2 md:border-t-0 md:border-l border-black">
         <h3 className="text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tighter text-[#6b3fa0] mb-2 md:mb-4">
            Ready to Go<br className="hidden md:block"/>Purple
          </h3>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 md:mb-6 text-gray-800">
            Your first Purple experience is on us.
          </h2>
          <p className="text-sm md:text-lg text-gray-700 max-w-[300px] md:max-w-md leading-relaxed">
            Join us for a Sunday of movement, energy, fun and connection. Meet the Purple Tribe, experience the energy for yourself and see what it means to live Purple.

          </p>
          <button className="mt-4 md:mt-8 px-6 py-3 md:px-8 md:py-4 flex gap-1 items-center bg-purple-500 border border-black hover:bg-purple-400 rounded-full text-white font-bold w-max transition-colors text-sm md:text-base">
            Get Your Invitation <ArrowRight size={20}/>
          </button>
        </div>
      </div>

      {/* SLICE CONTAINER OVERLAY */}
      <div className="absolute top-0 left-0 w-full h-[full] z-10 pointer-events-none rounded-2xl flex flex-col md:block">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="image-slice block origin-center shadow-lg rounded-b-xl md:rounded-b-none md:rounded-r-2xl"
            style={{
              backgroundImage: `url(${runnerImage})`,
              backgroundRepeat: "no-repeat",
              // We pass the CSS variables based on the loop index to the style block above
              "--bg-pos-desktop": `center -${i}vh`,
              "--bg-pos-mobile": `center -${i * 0.5}vh`,
            }}
          ></div>
        ))}
      </div>
    </section>
  );
}