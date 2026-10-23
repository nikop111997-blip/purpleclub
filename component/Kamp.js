"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// The old version never registered these, so no scroll animation could run.
gsap.registerPlugin(useGSAP, ScrollTrigger);

// pos = { left %, top %, width % } of the zoom stage. layer 1 = far, 3 = nearest.
const IMAGES = [
  { layer: 2, pos: [4, 6, 21], ratio: "4/3", src: "https://ajaysethi.vercel.app/_next/image?url=%2Fdswa.jpg&w=1920&q=75", alt: "Person tying running shoes on a track" },
  { layer: 2, pos: [74, 5, 22], ratio: "4/5", src: "https://ajaysethi.vercel.app/_next/image?url=%2Fhabibi.jpg&w=1920&q=75", alt: "Man running on an outdoor track" },
  { layer: 1, pos: [38, 3, 15], ratio: "1/1", src: "https://ajaysethi.vercel.app/_next/image?url=%2Ffeminist.jpg&w=1920&q=75", alt: "Person running up a mountain trail" },
  { layer: 2, pos: [1, 38, 19], ratio: "4/5", src: "https://ajaysethi.vercel.app/_next/image?url=%2Ffeminist.jpg&w=1920&q=75", alt: "Person running on an open road" },
  { layer: 3, pos: [80, 36, 19], ratio: "4/3", src: "https://ajaysethi.vercel.app/_next/image?url=%2Fjums.jpg&w=1920&q=75", alt: "Woman running by the water" },
  { layer: 1, pos: [8, 70, 22], ratio: "4/3", src: "https://www.kayapalat.in/_next/image?url=https%3A%2F%2Fframerusercontent.com%2Fimages%2FdpoEu6bAixQRYKwFTttRq5qg84U.jpg%3Fscale-down-to%3D1024%26width%3D1200%26height%3D1298&w=1920&q=75", alt: "Athlete sprinting" },
  { layer: 3, pos: [64, 70, 21], ratio: "16/9", src: "https://www.kayapalat.in/_next/image?url=https%3A%2F%2Fframerusercontent.com%2Fimages%2FVKXAstdJwrG80aBOXAVESiEMlw.png%3Fscale-down-to%3D2048%26width%3D3034%26height%3D1433&w=3840&q=75", alt: "Close up of running shoes in motion" },
  { layer: 3, pos: [42, 76, 15], ratio: "1/1", src: "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=1600&auto=format&fit=crop", alt: "Man running in nature during sunset" },
  { layer: 1, pos: [24, 28, 12], ratio: "4/5", src: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?q=80&w=1600&auto=format&fit=crop", alt: "Jogging through a forest trail" },
  { layer: 2, pos: [58, 9, 14], ratio: "1/1", src: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1600&auto=format&fit=crop", alt: "Silhouette of a person running at sunrise" },
  { layer: 1, pos: [87, 66, 12], ratio: "4/5", src: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1600&auto=format&fit=crop", alt: "Runners on a city street" },
];

// z travel per layer: [start, end]. Nearer layers travel further, so they pass the camera first.
const LAYER_Z = {
  1: [-800, 300],
  2: [-600, 500],
  3: [-400, 750],
};

// Depth look: the nearest layer is see-through and softly out of focus,
// the farthest layer is crisp and fully opaque.
const LAYER_LOOK = {
  1: { opacity: 1, blur: 0 },
  2: { opacity: 0.8, blur: 1 },
  3: { opacity: 0.4, blur: 3 },
};

// Letters are rendered by React (not split by a script), so text can never be duplicated.
// Each word is kept together; each letter is a span the scroll animation lights up.
function Letters({ text }) {
  return text.split(" ").map((word, wi, arr) => (
    <span key={wi}>
      <span className="inline-block whitespace-nowrap">
        {[...word].map((ch, ci) => (
          <span key={ci} data-char className="opacity-20">
            {ch}
          </span>
        ))}
      </span>
      {wi < arr.length - 1 ? " " : null}
    </span>
  ));
}

export default function ScrollExperience() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const headingRef = useRef(null);
  const paraWrapRef = useRef(null);
  const revealTextRef = useRef(null);
  const modalImgRef = useRef(null);

  // null = closed, number = index of open image
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

  // Keyboard controls + lock page scroll while the viewer is open
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

  // Fade the big image in with GSAP (the old fadeIn keyframe was never defined)
  useEffect(() => {
    if (activeIndex === null || !modalImgRef.current) return;
    gsap.fromTo(
      modalImgRef.current,
      { opacity: 0, scale: 0.97 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    );
  }, [activeIndex]);

  // Touch swipe
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
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const chars = revealTextRef.current.querySelectorAll("[data-char]");

        // ONE pinned scene: zoom -> heading rises to the top -> paragraph reveals -> end.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top top",
            end: "+=450%",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1) Zoom through the images (0 -> 1)
        [1, 2, 3].forEach((layer) => {
          const sel = `[data-layer='${layer}']`;
          const [z0, z1] = LAYER_Z[layer];
          const { opacity, blur } = LAYER_LOOK[layer];
          tl.fromTo(sel, { z: z0, filter: "blur(0px)" }, { z: z1, filter: `blur(${blur}px)`, ease: "none", duration: 1 }, 0)
            .to(sel, { opacity, ease: "none", duration: 0.3 }, 0)
            .to(sel, { opacity: 0, ease: "none", duration: 0.3 }, 0.7);
        });
        // Faded-out images must not catch clicks meant for nothing.
        tl.set("[data-layer]", { pointerEvents: "none" }, 1);

        // 2) Heading fades in at the centre (0.6 -> 1.0)
        tl.fromTo(
          headingRef.current,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, ease: "power1.out", duration: 0.4 },
          0.6
        );

        // 3) Heading stays, then moves up to the top and shrinks (1.2 -> 1.7)
        tl.to(
          headingRef.current,
          { y: () => -window.innerHeight * 0.28, scale: 0.65, ease: "power2.inOut", duration: 0.5 },
          1.2
        );

        // 4) Paragraph box appears, then letters light up one by one (1.7 -> 3.2)
        tl.to(paraWrapRef.current, { opacity: 1, ease: "none", duration: 0.1 }, 1.65);
        tl.to(
          chars,
          { opacity: 1, ease: "none", duration: 0.05, stagger: { each: 1.5 / chars.length } },
          1.7
        );

        // short hold so the finished text can be read, then the page ends
        tl.to({}, { duration: 0.3 });
      });

      // Reduced motion: no pinning or zooming, show the final state.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-layer]", { opacity: 0.3 });
        gsap.set(headingRef.current, { opacity: 1, scale: 0.65, y: -window.innerHeight * 0.28 });
        gsap.set(paraWrapRef.current, { opacity: 1 });
        gsap.set(revealTextRef.current.querySelectorAll("[data-char]"), { opacity: 1 });
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef}>
      <main className="m-0 bg-[#d4ff3f] font-sans">
        {/* ---------- Single pinned scene ---------- */}
        <div
          ref={stageRef}
          className="relative h-screen w-full overflow-hidden"
          style={{ perspective: "1000px" }}
        >
          <h3
            ref={headingRef}
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center px-6 text-center font-semibold leading-[1.05] tracking-tight text-[#0a090a] opacity-0 text-[clamp(2rem,6vw,4.5rem)]"
          >
            <span>
              Good things grow when we <br />
              <span className="text-[#6b3fa0]">share them.</span>
            </span>
          </h3>

          {IMAGES.map((img, i) => {
            const [left, top, width] = img.pos;
            return (
              <button
                key={i}
                type="button"
                data-layer={img.layer}
                onClick={() => setActiveIndex(i)}
                aria-label={`Open image: ${img.alt}`}
                className="absolute cursor-pointer overflow-hidden rounded-xl opacity-0 shadow-xl will-change-transform focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#6b3fa0]"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  aspectRatio: img.ratio,
                  zIndex: img.layer,
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}

          {/* Second text: sits under the heading once the heading has moved up */}
          <div
            ref={paraWrapRef}
            className="pointer-events-none absolute inset-x-0 top-[36%] z-50 flex justify-center px-6 text-[#0a090a] opacity-0"
          >
            <p
              ref={revealTextRef}
              aria-label="People stay because they belong. They bring friends because they are proud of it. And they keep coming back because, somewhere along the way, it becomes part of who they are. Share yours with #PurpleSunday and #LivePurple."
              className="max-w-4xl text-balance text-center text-xl sm:text-2xl lg:text-4xl"
            >
            </p>
          </div>
        </div>
      </main>

      {/* ---------- Image viewer ---------- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/25"
          >
            ×
          </button>

          <div className="absolute left-6 top-6 text-sm text-white/70">
            {activeIndex + 1} / {IMAGES.length}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/25 sm:left-6"
          >
            ‹
          </button>

          <div
            className="flex max-h-[70vh] w-full max-w-5xl items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <img
              ref={modalImgRef}
              key={activeIndex}
              src={IMAGES[activeIndex].src}
              alt={IMAGES[activeIndex].alt}
              className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/25 sm:right-6"
          >
            ›
          </button>

          <p className="mt-4 text-sm text-white/70" onClick={(e) => e.stopPropagation()}>
            {IMAGES[activeIndex].alt}
          </p>

          <div
            className="mt-4 flex max-w-full gap-2 overflow-x-auto px-4 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Show image ${i + 1}`}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition ${
                  i === activeIndex
                    ? "border-[#d4ff3f] opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
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