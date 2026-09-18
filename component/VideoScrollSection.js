"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function VideoScrollSection() {
  const sectionRef = useRef(null);
  const videoBoxRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Small → Fullscreen
      tl.to(
        videoBoxRef.current,
        {
          width: "100vw",
          height: "100vh",
          borderRadius: 0,
          ease: "none",
          duration: 0.6,
        },
        0
      );

      // Slight video zoom for cinematic feel
      tl.to(
        videoRef.current,
        {
          scale: 1.08,
          ease: "none",
          duration: 0.6,
        },
        0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[300vh] bg-[#d4ff3f]"
    >
      {/* Fixed viewport while scrolling */}
      <div className="absolute inset-0 w-full h-screen flex items-center justify-center">

        {/* Video Container */}
        <div
          ref={videoBoxRef}
          className="
            relative
            w-[65vw]
            h-[60vh]
            rounded-[30px]
            overflow-hidden
            bg-black
            will-change-[width,height,border-radius]
          "
        >
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              pointer-events-none
              select-none
              will-change-transform
            "
          >
            <source
              src="https://www.pexels.com/download/video/12510400/"
              type="video/mp4"
            />
          </video>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* SVG */}
          <div
            className="
              absolute
              bottom-8
              left-1/2
              -translate-x-1/2
              z-10
              pointer-events-none
            "
          >
            <img
              src="/purple-club.svg"
              alt=""
              draggable="false"
              className="
                block
                w-[100px]
                md:w-[130px]
                lg:w-[150px]
                h-auto
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}