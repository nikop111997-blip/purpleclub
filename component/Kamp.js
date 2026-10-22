"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText"; // Premium Plugin
import { useGSAP } from "@gsap/react";

const IMAGES = [
  { layer: 2, src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop", alt: "Person tying running shoes on a track" },
  { layer: 2, src: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=800&auto=format&fit=crop", alt: "Man running on an outdoor track" },
  { layer: 1, src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop", alt: "Person running up a mountain trail" },
  { layer: 2, src: "https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=800&auto=format&fit=crop", alt: "Person running on an open road" },
  { layer: 3, src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop", alt: "Woman running by the water" },
  { layer: 1, src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop", alt: "Athlete sprinting" },
  { layer: 3, src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", alt: "Close up of running shoes in motion" },
  { layer: 3, src: "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=800&auto=format&fit=crop", alt: "Man running in nature during sunset" },
  { layer: 1, src: "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=800&auto=format&fit=crop", alt: "Group of people running a marathon" },
  { layer: 3, src: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?q=80&w=800&auto=format&fit=crop", alt: "Jogging through a forest trail" },
  { layer: 2, src: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=800&auto=format&fit=crop", alt: "Silhouette of a person running at sunrise" },
  { layer: 1, src: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop", alt: "Runners on a city street" },
];

export default function ScrollExperience() {
  const containerRef = useRef(null);
  const zoomContainerRef = useRef(null);
  const headingRef = useRef(null);
  const sectionStickRef = useRef(null);
  const textRef = useRef(null);

  // Modal state: null = closed, number = index of open image
  const [activeIndex, setActiveIndex] = useState(null);
  const isOpen = activeIndex !== null;

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? i : (i + 1) % IMAGES.length)),
    []
  );
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? i : (i - 1 + IMAGES.length) % IMAGES.length)),
    []
  );

  // Keyboard controls + lock page scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, next, prev]);

  // Touch swipe support
  const touchStartX = useRef(null);
  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchStartX.current = null;
  };

  useGSAP(
    () => {
      if (!zoomContainerRef.current || !textRef.current) return;

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

      const splitLetters = new SplitText(textRef.current, { type: "chars" });
      gsap.set(splitLetters.chars, { opacity: 0.2 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionStickRef.current,
            pin: true,
            start: "center center",
            end: "+=1500",
            scrub: 1,
          },
        })
        .to(splitLetters.chars, { opacity: 1, duration: 1, ease: "none", stagger: 1 })
        .to({}, { duration: 10 })
        .to(textRef.current, { opacity: 0, scale: 1.2, duration: 50 });

      return () => {
        splitLetters.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <main className="m-0 overflow-hidden bg-[#d4ff3f] font-sans">
        {/* Zoom Section */}
        <div ref={zoomContainerRef} className="zoom-container">
          <h3 ref={headingRef} className="heading-zoom zoom-item font-semibold">
            Good things grow when we <br />
            <span className="text-[#6b3fa0]">share them.</span>
          </h3>

          {IMAGES.map((img, i) => (
            <div
              key={i}
              className="zoom-item cursor-pointer"
              data-layer={img.layer}
              onClick={() => setActiveIndex(i)}
            >
              <img src={img.src} alt={img.alt} />
            </div>
          ))}
        </div>

        {/* Text Reveal Section */}
        <section
          ref={sectionStickRef}
          className="section-stick min-h-screen bg-[#d4ff3f] flex justify-center items-center text-[#0a090a]"
        >
          <p ref={textRef} className="opacity-reveal text-3xl sm:text-4xl text-center max-w-5xl text-wrap">
            People stay because they belong. They bring friends because they are proud of it. And they keep
            coming back because, somewhere along the way, it becomes part of who they are.
            <br />
            <span className="font-bold">Share yours with #PurpleSunday and #LivePurple.</span>
          </p>
        </section>
      </main>

      {/* Modal + Slider */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {/* Close */}
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/25"
          >
            ×
          </button>

          {/* Counter */}
          <div className="absolute top-6 left-6 text-sm text-white/70">
            {activeIndex + 1} / {IMAGES.length}
          </div>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/25"
          >
            ‹
          </button>

          {/* Big image */}
          <div
            className="flex max-h-[75vh] w-full max-w-5xl items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <img
              key={activeIndex}
              src={IMAGES[activeIndex].src.replace("w=800", "w=1600")}
              alt={IMAGES[activeIndex].alt}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl animate-[fadeIn_0.3s_ease]"
            />
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/25"
          >
            ›
          </button>

          {/* Caption */}
          <p className="mt-4 text-sm text-white/70" onClick={(e) => e.stopPropagation()}>
            {IMAGES[activeIndex].alt}
          </p>

          {/* Thumbnails */}
          <div
            className="mt-4 flex max-w-full gap-2 overflow-x-auto px-4 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition ${
                  i === activeIndex ? "border-[#d4ff3f] opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img src={img.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}