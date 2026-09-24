"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText"; // Premium Plugin
import { useGSAP } from "@gsap/react";

export default function ScrollExperience() {
  const containerRef = useRef(null);
  const zoomContainerRef = useRef(null);
  const headingRef = useRef(null);
  const sectionStickRef = useRef(null);
  const textRef = useRef(null);

  useGSAP(() => {
    // 1. Safeguard to prevent "Invalid scope" before the DOM is fully ready
    if (!zoomContainerRef.current || !textRef.current) return;

    // 2. 3D Perspective Zoom Animation
    const zoomTl = gsap.timeline({
      scrollTrigger: {
        trigger: zoomContainerRef.current,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 1,
      },
    });

    zoomTl
      .to(".zoom-item[data-layer='3']", { opacity: 1, z: 800, ease: "power1.inOut" }, 0)
      .to(".zoom-item[data-layer='2']", { opacity: 1, z: 600, ease: "power1.inOut" }, 0)
      .to(".zoom-item[data-layer='1']", { opacity: 1, z: 400, ease: "power1.inOut" }, 0)
      .to(headingRef.current, { opacity: 1, z: 50, ease: "power1.inOut" }, 0);

    // 3. Split Text Reveal Animation
    const splitLetters = new SplitText(textRef.current, { type: "chars" });
    gsap.set(splitLetters.chars, { opacity: 0.2 });

    gsap.timeline({
      scrollTrigger: {
        trigger: sectionStickRef.current,
        pin: true,
        start: "center center",
        end: "+=1500",
        scrub: 1,
      },
    })
      .to(splitLetters.chars, {
        opacity: 1,
        duration: 1,
        ease: "none",
        stagger: 1, // Animates each character sequentially
      })
      .to({}, { duration: 10 }) // Spacer to hold text on screen
      .to(textRef.current, {
        opacity: 0,
        scale: 1.2,
        duration: 50,
      });

    // 4. CRITICAL: Cleanup function to prevent the "removeChild" React crash
    return () => {
      splitLetters.revert();
    };

  }, { scope: containerRef }); 

  return (
    <div ref={containerRef}>
      <main className="m-0 overflow-hidden bg-[#d4ff3f] font-sans">
        
        {/* Zoom Section */}
       <div ref={zoomContainerRef} className="zoom-container">
          <h3 ref={headingRef} className="heading-zoom zoom-item font-semibold">
  Every Sunday, a new story.<br/> Moments from the <span className="text-[#6b3fa0]">Purple Club.</span>
</h3>
          <div className="zoom-item" data-layer="2">
            <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop" alt="Person tying running shoes on a track" />
          </div>
          <div className="zoom-item" data-layer="2">
            <img src="https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=800&auto=format&fit=crop" alt="Man running on an outdoor track" />
          </div>
          <div className="zoom-item" data-layer="1">
            <img src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop" alt="Person running up a mountain trail" />
          </div>
          <div className="zoom-item" data-layer="2">
            <img src="https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=800&auto=format&fit=crop" alt="Person running on an open road" />
          </div>
          <div className="zoom-item" data-layer="3">
            <img src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop" alt="Woman running by the water" />
          </div>
          <div className="zoom-item" data-layer="1">
            <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop" alt="Athlete sprinting" />
          </div>
          <div className="zoom-item" data-layer="3">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" alt="Close up of running shoes in motion" />
          </div>
          <div className="zoom-item" data-layer="3">
            <img src="https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=800&auto=format&fit=crop" alt="Man running in nature during sunset" />
          </div>
          <div className="zoom-item" data-layer="1">
            <img src="https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=800&auto=format&fit=crop" alt="Group of people running a marathon" />
          </div>
          <div className="zoom-item" data-layer="3">
            <img src="https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?q=80&w=800&auto=format&fit=crop" alt="Jogging through a forest trail" />
          </div>
          <div className="zoom-item" data-layer="2">
            <img src="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=800&auto=format&fit=crop" alt="Silhouette of a person running at sunrise" />
          </div>
          <div className="zoom-item" data-layer="1">
            <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop" alt="Runners on a city street" />
          </div>
        </div>

        {/* Text Reveal Section */}
        <section ref={sectionStickRef} className="section-stick min-h-screen bg-[#d4ff3f] flex justify-center items-center text-[#0a090a]">
          <p ref={textRef} className="opacity-reveal text-3xl sm:text-7xl text-center w-90 sm:w-3/5">
          Healthy, active living is contagious. Show up on a Sunday, move with your community, and let your lifestyle inspire others. Welcome to Purple Club.
          </p>
        </section>
        
      </main>
    </div>
  );
}