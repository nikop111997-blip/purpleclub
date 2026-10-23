"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);
const DEFAULT_ROOT_MARGIN = "256px";
function resolveElement(root) {
  if (!root) return null;
  if (typeof root === "function") return root() ?? null;
  if (typeof root === "object" && "current" in root)
    return root.current ?? null;
  return root;
}
function createVisibilityGate({
  root = null,
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = 0,
  observeTab = true,
  observeOffscreen = true,
  onChange,
} = {}) {
  let tabVisible = typeof document === "undefined" ? true : !document.hidden;
  // Assume onscreen until the observer reports otherwise.
  let onscreen = true;
  let destroyed = false;
  let observer = null;
  const isActive = () => {
    if (destroyed) return false;
    if (observeTab && !tabVisible) return false;
    if (observeOffscreen && resolveElement(root) && !onscreen) return false;
    return true;
  };
  let lastActive = isActive();
  const emit = () => {
    if (destroyed) return;
    const next = isActive();
    if (next === lastActive) return;
    lastActive = next;
    onChange?.(next);
  };
  const onVisibilityChange = () => {
    tabVisible = !document.hidden;
    emit();
  };
  if (observeTab && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  const bindObserver = () => {
    if (!observeOffscreen || typeof IntersectionObserver === "undefined") {
      return;
    }
    const el = resolveElement(root);
    if (!el) return;
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          onscreen = entry.isIntersecting;
        }
        emit();
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
  };
  bindObserver();
  return {
    get isActive() {
      return isActive();
    },
    observe(nextRoot) {
      if (destroyed) return;
      if (nextRoot != null) root = nextRoot;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      onscreen = true;
      bindObserver();
      emit();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (observeTab && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    },
  };
}
/**
 * Owns a requestAnimationFrame loop that auto-pauses when the tab is hidden
 * or the root element is offscreen.
 */
function createSuspendedRaf({
  onFrame,
  root = null,
  rootMargin = DEFAULT_ROOT_MARGIN,
  threshold = 0,
  observeTab = true,
  observeOffscreen = true,
}) {
  if (typeof onFrame !== "function") {
    throw new TypeError("createSuspendedRaf: onFrame is required");
  }
  let rafId = null;
  let running = false;
  let destroyed = false;
  const stopRaf = () => {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  const tick = (time) => {
    rafId = null;
    if (destroyed || !running || !gate.isActive) return;
    onFrame(time);
    if (!destroyed && running && gate.isActive) {
      rafId = requestAnimationFrame(tick);
    }
  };
  const sync = () => {
    if (destroyed) return;
    if (running && gate.isActive) {
      if (rafId == null) {
        rafId = requestAnimationFrame(tick);
      }
    } else {
      stopRaf();
    }
  };
  const gate = createVisibilityGate({
    root,
    rootMargin,
    threshold,
    observeTab,
    observeOffscreen,
    onChange: sync,
  });
  return {
    start() {
      if (destroyed) return;
      running = true;
      sync();
    },
    stop() {
      running = false;
      stopRaf();
    },
    get isRunning() {
      return running;
    },
    get isActive() {
      return gate.isActive;
    },
    observe(nextRoot) {
      gate.observe(nextRoot);
      sync();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      running = false;
      stopRaf();
      gate.destroy();
    },
  };
}
const IMAGES = [
  "https://ajaysethi.vercel.app/_next/image?url=%2Fdswa.jpg&w=1920&q=75",
  "https://ajaysethi.vercel.app/_next/image?url=%2Fhabibi.jpg&w=1920&q=75",
  "https://ajaysethi.vercel.app/_next/image?url=%2Ffeminist.jpg&w=1920&q=75",
  "https://ajaysethi.vercel.app/_next/image?url=%2Ffeminist.jpg&w=1920&q=75",
  "https://ajaysethi.vercel.app/_next/image?url=%2Fjums.jpg&w=1920&q=75",
  "https://www.kayapalat.in/_next/image?url=https%3A%2F%2Fframerusercontent.com%2Fimages%2FdpoEu6bAixQRYKwFTttRq5qg84U.jpg%3Fscale-down-to%3D1024%26width%3D1200%26height%3D1298&w=1920&q=75",
  "https://www.kayapalat.in/_next/image?url=https%3A%2F%2Fframerusercontent.com%2Fimages%2FVKXAstdJwrG80aBOXAVESiEMlw.png%3Fscale-down-to%3D2048%26width%3D3034%26height%3D1433&w=3840&q=75",
  "/dsds.jpeg",
  "/sdasd.jpeg",
  "/rer.jpeg",
  
  "https://ajaysethi.vercel.app/_next/image?url=%2Ffeminist.jpg&w=1920&q=75",
];;
const defaultImages = [
  {
    number: "01",
    src: IMAGES[0],
    title: "Inspire",
    desc: "Nature and calm beginnings",
  },
  {
    number: "02",
    src: IMAGES[1],
    title: "Stillness",
    desc: "Moments of quiet and beauty",
  },
  {
    number: "03",
    src: IMAGES[2],
    title: "Texture",
    desc: "Light, grain and motion",
  },
  {
    number: "04",
    src: IMAGES[3],
    title: "Flow",
    desc: "Soft forms and gentle tone",
  },
  {
    number: "05",
    src: IMAGES[4],
    title: "Depth",
    desc: "Warmth and perspective",
  },
  {
    number: "06",
    src: IMAGES[5],
    title: "Motion",
    desc: "Energy, waves and drift",
  },
  { number: "07", src: IMAGES[6], title: "Distort", desc: "Abstract visuals" },
  { number: "08", src: IMAGES[7], title: "Frame", desc: "A cinematic still" },
  { number: "09", src: IMAGES[8], title: "Contrast", desc: "A study in light" },
  {
    number: "10",
    src: IMAGES[9],
    title: "Minimal",
    desc: "Pared-back composition",
  },
];
// True when the user has asked the OS to minimise animation. Safe to call
// during render - returns false on the server.
function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}
const DEFAULT_CARD_WIDTH = 320;
const DEFAULT_CARD_GAP = 24;
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1025;
const MOBILE_CARD_WIDTH = 240;
const MOBILE_CARD_GAP = 16;
const TABLET_CARD_WIDTH = 380;
const TABLET_CARD_GAP = 20;
const ACTIVE_CONTENT_CLEAR_DELTA = 2;
const TEXT_LEAVE_STAGGER = 0.04;
const getItemData = (item) => (typeof item === "string" ? { src: item } : item);
function InfinitePerspectiveSliderComp({
  images = defaultImages,
  cardWidth = DEFAULT_CARD_WIDTH,
  cardGap = DEFAULT_CARD_GAP,
  perspective = 2200,
  scrollSpeed = 1.0,
  scrollLerp = 0.1,
  velocityLerp = 0.09,
  rotationSensitivity = 0.025,
  rotationDamp = 0.1,
  rotationLerp = 0.12,
  maxRotation = 80,
  scrollStopDelay = 180,
  textEnterDuration = 0.35,
  textLeaveDuration = 0.35,
  textStagger = 0.06,
}) {
  const stripRef = useRef(null);
  const settersRef = useRef([]);
  const cardRefs = useRef([]);
  const imageRefs = useRef([]);
  const numberRefs = useRef([]);
  const titleRefs = useRef([]);
  const descriptionRefs = useRef([]);
  const activeHoverIndexRef = useRef(null);
  const hoveredIndexRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollStopTimerRef = useRef(null);
  const leaveHandlersRef = useRef({});
  const enterHandlersRef = useRef({});
  const [viewportWidth, setViewportWidth] = useState(DEFAULT_CARD_WIDTH * 4);
  const isMobileViewport = viewportWidth < MOBILE_BREAKPOINT;
  const isTabletViewport =
    viewportWidth >= MOBILE_BREAKPOINT && viewportWidth < TABLET_BREAKPOINT;
  const resolvedCardWidth = isMobileViewport
    ? MOBILE_CARD_WIDTH
    : isTabletViewport
      ? TABLET_CARD_WIDTH
      : cardWidth;
  const resolvedCardGap = isMobileViewport
    ? MOBILE_CARD_GAP
    : isTabletViewport
      ? TABLET_CARD_GAP
      : cardGap;
  const cardStep = resolvedCardWidth + resolvedCardGap;
  const cardHeight = isMobileViewport
    ? "calc(40vh + 72px)"
    : isTabletViewport
      ? "calc(45vh + 84px)"
      : "calc(50vh + 96px)";
  const stateRef = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    smoothVelocity: 0,
    rotationVelocity: 0,
    currentRotation: 0,
    prevDirection: 0,
    isDragging: false,
    lastX: 0,
  });
  const configRef = useRef({
    cardWidth: resolvedCardWidth,
    scrollSpeed,
    scrollLerp,
    velocityLerp,
    rotationSensitivity,
    rotationDamp,
    rotationLerp,
    maxRotation,
    scrollStopDelay,
    textEnterDuration,
    textLeaveDuration,
    textStagger,
  });
  configRef.current = {
    cardWidth: resolvedCardWidth,
    scrollSpeed,
    scrollLerp,
    velocityLerp,
    rotationSensitivity,
    rotationDamp,
    rotationLerp,
    maxRotation,
    scrollStopDelay,
    textEnterDuration,
    textLeaveDuration,
    textStagger,
  };
  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const clearActiveContent = useCallback(() => {
    const activeIndex = activeHoverIndexRef.current;
    if (activeIndex === null) return;
    const leaveHandler = leaveHandlersRef.current[activeIndex];
    if (leaveHandler) {
      leaveHandler();
    }
    activeHoverIndexRef.current = null;
  }, []);
  const markScrolling = useCallback(() => {
    isScrollingRef.current = true;
    clearActiveContent();
    if (scrollStopTimerRef.current) {
      window.clearTimeout(scrollStopTimerRef.current);
    }
    scrollStopTimerRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      scrollStopTimerRef.current = null;
      const hoveredIndex = hoveredIndexRef.current;
      if (hoveredIndex === null) return;
      const enterHandler = enterHandlersRef.current[hoveredIndex];
      if (enterHandler) {
        enterHandler();
      }
    }, configRef.current.scrollStopDelay);
  }, [clearActiveContent]);
  const initSetters = () => {
    if (!stripRef.current) return;
    settersRef.current = Array.from(stripRef.current.children).map(
      (element) => ({
        x: gsap.quickSetter(element, "x", "px"),
        rotateY: gsap.quickSetter(element, "rotateY", "deg"),
      }),
    );
  };
  const positionCards = useCallback(
    (offset, rotation) => {
      const strip = stripRef.current;
      if (!strip || !images.length) return;
      const cards = strip.children;
      const setters = settersRef.current;
      const count = images.length;
      const loopWidth = count * cardStep;
      const viewW = window.innerWidth;
      const centerX = viewW / 2;
      const centreOffset = centerX - configRef.current.cardWidth / 2;
      for (let index = 0; index < cards.length; index += 1) {
        let x = index * cardStep - offset + centreOffset;
        x = ((x % loopWidth) + loopWidth) % loopWidth;
        if (x > loopWidth - cardStep) {
          x -= loopWidth;
        }
        setters[index]?.x(x);
        setters[index]?.rotateY(rotation);
      }
    },
    [cardStep, images],
  );
  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);
  useEffect(() => {
    if (!images.length) return;
    const state = stateRef.current;
    const loopWidth = images.length * cardStep;
    const reducedMotion = prefersReducedMotion();
    initSetters();
    const tick = () => {
      // Reduced motion: snap straight to the target (no lerp smoothing) and
      // never build up rotation velocity, so cards never tilt while
      // scrolling or dragging - they just track the pointer/wheel directly.
      if (reducedMotion) {
        state.current = state.target;
        state.velocity = 0;
        state.smoothVelocity = 0;
        state.rotationVelocity = 0;
        state.currentRotation = 0;
      } else {
        const config = configRef.current;
        state.current = lerp(state.current, state.target, config.scrollLerp);
        state.velocity = state.target - state.current;
        state.smoothVelocity = lerp(
          state.smoothVelocity,
          state.velocity,
          config.velocityLerp,
        );
        state.rotationVelocity = lerp(
          state.rotationVelocity,
          state.velocity,
          config.rotationDamp,
        );
        const absVel = Math.abs(state.rotationVelocity);
        const sign = Math.sign(state.rotationVelocity);
        const targetRotation = sign * absVel * config.rotationSensitivity;
        state.currentRotation = lerp(
          state.currentRotation,
          targetRotation,
          config.rotationLerp,
        );
      }
      const finalRotation = clamp(
        state.currentRotation,
        -configRef.current.maxRotation,
        configRef.current.maxRotation,
      );
      if (Math.abs(state.current - state.target) < 0.05) {
        const shift = Math.round(state.current / loopWidth) * loopWidth;
        state.current -= shift;
        state.target -= shift;
      }
      positionCards(state.current, finalRotation);
    };
    const onWheel = (event) => {
      const delta = event.deltaY;
      if (Math.abs(delta) >= ACTIVE_CONTENT_CLEAR_DELTA) {
        markScrolling();
      }
      state.target += delta * configRef.current.scrollSpeed;
    };
    const onDown = (clientX) => {
      state.isDragging = true;
      state.lastX = clientX;
      markScrolling();
    };
    const onMove = (clientX) => {
      if (!state.isDragging) return;
      const delta = clientX - state.lastX;
      state.lastX = clientX;
      if (Math.abs(delta) >= ACTIVE_CONTENT_CLEAR_DELTA) {
        markScrolling();
      }
      state.target += -delta * configRef.current.scrollSpeed;
    };
    const onUp = () => {
      state.isDragging = false;
    };
    const handleMouseDown = (event) => onDown(event.clientX);
    const handleMouseMove = (event) => onMove(event.clientX);
    const handleMouseUp = () => onUp();
    const handleTouchStart = (event) => onDown(event.touches[0].clientX);
    const handleTouchMove = (event) => onMove(event.touches[0].clientX);
    const handleTouchEnd = () => onUp();
    const onResize = () => {
      markScrolling();
      initSetters();
      positionCards(state.current, state.currentRotation);
    };
    state.current = 0;
    state.target = 0;
    state.velocity = 0;
    state.smoothVelocity = 0;
    state.rotationVelocity = 0;
    state.currentRotation = 0;
    state.prevDirection = 0;
    activeHoverIndexRef.current = null;
    hoveredIndexRef.current = null;
    isScrollingRef.current = false;
    positionCards(0, 0);
    gsap.set(cardRefs.current, { opacity: 1 });
    const loop = createSuspendedRaf({
      root: stripRef,
      onFrame: tick,
    });
    loop.start();
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      loop.destroy();
      if (scrollStopTimerRef.current) {
        window.clearTimeout(scrollStopTimerRef.current);
      }
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [cardStep, images, positionCards, markScrolling]);
  useEffect(() => {
    if (!images.length) return;
    const animations = [];
    leaveHandlersRef.current = {};
    enterHandlersRef.current = {};
    activeHoverIndexRef.current = null;
    hoveredIndexRef.current = null;
    cardRefs.current.forEach((card, index) => {
      const image = imageRefs.current[index];
      const number = numberRefs.current[index];
      const title = titleRefs.current[index];
      const description = descriptionRefs.current[index];
      if (!card || !image || !number || !title || !description) return;
      const numberSplit = SplitText.create(number, {
        type: "lines",
        mask: "lines",
      });
      const titleSplit = SplitText.create(title, {
        type: "lines",
        mask: "lines",
      });
      const descriptionSplit = SplitText.create(description, {
        type: "lines",
        mask: "lines",
      });
      const numberLines = numberSplit.lines;
      const titleLines = titleSplit.lines;
      const descriptionLines = descriptionSplit.lines;
      const allLines = [...numberLines, ...titleLines, ...descriptionLines];
      gsap.set([number, title, description], {
        autoAlpha: 0,
      });
      gsap.set(allLines, {
        yPercent: 100,
      });
      const enter = () => {
        if (isScrollingRef.current) return;
        if (
          activeHoverIndexRef.current !== null &&
          activeHoverIndexRef.current !== index
        ) {
          const previousLeave =
            leaveHandlersRef.current[activeHoverIndexRef.current];
          if (previousLeave) {
            previousLeave();
          }
        }
        activeHoverIndexRef.current = index;
        gsap.killTweensOf(allLines);
        gsap.killTweensOf([number, title, description]);
        gsap
          .timeline({
            defaults: {
              ease: "power3.out",
              overwrite: "auto",
            },
          })
          .set([number, title, description], { autoAlpha: 1 })
          .to(
            numberLines,
            {
              yPercent: 0,
              duration: configRef.current.textEnterDuration,
              stagger: configRef.current.textStagger,
            },
            0,
          )
          .to(
            [titleLines, descriptionLines],
            {
              yPercent: 0,
              duration: configRef.current.textEnterDuration,
              stagger: configRef.current.textStagger,
            },
            0.05,
          );
      };
      const leave = () => {
        if (activeHoverIndexRef.current === index) {
          activeHoverIndexRef.current = null;
        }
        gsap.killTweensOf(allLines);
        gsap.killTweensOf([number, title, description]);
        gsap
          .timeline({
            defaults: {
              ease: "power3.in",
              overwrite: "auto",
            },
          })
          .to(
            [titleLines, descriptionLines],
            {
              yPercent: 100,
              duration: configRef.current.textLeaveDuration,
              stagger: TEXT_LEAVE_STAGGER,
            },
            0,
          )
          .to(
            numberLines,
            {
              yPercent: 100,
              duration: configRef.current.textLeaveDuration,
              stagger: TEXT_LEAVE_STAGGER,
            },
            0.04,
          )
          .set([number, title, description], { autoAlpha: 0 });
      };
      const handleImageEnter = () => {
        hoveredIndexRef.current = index;
        if (isScrollingRef.current) return;
        enter();
      };
      const handleImageLeave = () => {
        if (hoveredIndexRef.current === index) {
          hoveredIndexRef.current = null;
        }
        leave();
      };
      enterHandlersRef.current[index] = enter;
      leaveHandlersRef.current[index] = leave;
      image.addEventListener("mouseenter", handleImageEnter);
      image.addEventListener("mouseleave", handleImageLeave);
      animations.push({
        image,
        handleImageEnter,
        handleImageLeave,
        numberSplit,
        titleSplit,
        descriptionSplit,
      });
    });
    return () => {
      animations.forEach(
        ({
          image,
          handleImageEnter,
          handleImageLeave,
          numberSplit,
          titleSplit,
          descriptionSplit,
        }) => {
          image.removeEventListener("mouseenter", handleImageEnter);
          image.removeEventListener("mouseleave", handleImageLeave);
          numberSplit.revert();
          titleSplit.revert();
          descriptionSplit.revert();
        },
      );
      leaveHandlersRef.current = {};
      enterHandlersRef.current = {};
      activeHoverIndexRef.current = null;
      hoveredIndexRef.current = null;
    };
  }, [images]);
  return (
    <div className="relative w-full min-w-0 max-w-full overflow-x-clip bg-[#d4ff3f]">
      <div
        className="pointer-events-none relative flex h-full items-center overflow-hidden max-[1005px]:items-center"
        style={{ perspective }}
      >
        <div
          ref={stripRef}
          className="transform-3d relative w-full"
          style={{ height: cardHeight }}
        >
          {images.map((item, index) => {
            const { src, number, title, desc, description } = getItemData(item);
            return (
              <div
                key={index}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className="pointer-events-auto absolute left-0 top-0 opacity-0 will-change-transform"
                style={{
                  width: resolvedCardWidth,
                  height: cardHeight,
                  transformOrigin: "center center",
                  transform: "translateZ(1px)",
                }}
              >
                <div
                  ref={(element) => {
                    numberRefs.current[index] = element;
                  }}
                  className="mb-2 text-2xl leading-none tracking-tight text-foreground opacity-0 max-[1025px]:text-xl max-md:mb-1 max-md:text-lg"
                >
                  {number}
                </div>

                <div
                  ref={(element) => {
                    imageRefs.current[index] = element;
                  }}
                  className="relative h-[50vh] w-full overflow-hidden bg-muted max-[1025px]:h-[45vh] max-md:h-[40vh]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={
                      title
                        ? `${title} - ${desc || description || ""}`
                        : `slide-${index}`
                    }
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                </div>

              </div>
            );
          })}
        </div>
      </div>

     
    </div>
  );
}
export default function File(props) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col justify-center gap-20 overflow-x-clip bg-background">
      <InfinitePerspectiveSliderComp {...props} />
    </div>
  );
}