
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const wheelCarouselDefaultItems = [
  { label: "I AM A DANCER", image: "/dancee.png" },
  { label: "I AM A RUNNER", image: "/runn.png" },
  { label: "I AM AT PEACE", image: "/medi.png" },
  { label: "I AM A WELCOMER", image: "/main.png" },
  { label: "I AM A WINNER", image: "/power.png" },
  { label: "I AM A FIGHTER", image: "/blackw.png" },
  { label: "I AM MAGIC", image: "/pose.png" },
];

const aspectRatios = {
  "3/4": "3 / 4",
  "1/1": "1 / 1",
  "4/3": "4 / 3",
  "3/2": "3 / 2",
};

function wrapIndex(index, length) {
  return ((index % length) + length) % length;
}

function shortestOffset(index, rotation, length) {
  let offset = index - rotation;

  while (offset > length / 2) offset -= length;
  while (offset < -length / 2) offset += length;

  return offset;
}

export function WheelCarousel({
  items = wheelCarouselDefaultItems,
  mode = "system",
  photoSide = "left",
  photoWidth = 40,
  photoAspect = "3/4",
  contentWidth = 900,
  breakpoint = 600,
  compactPhotoSize = 280,
  height,
  gap = 0,
  photoRadius = 14,
  crossfadeDuration = 0.5,
  radius = 320,
  spacing = 14,
  visibleItems = 7,
  apexInset = 34,
  textColor = "rgba(180, 90, 20, 0.45)",
  selectedColor = "rgb(180, 84, 30)",
  showMarker = true,
  markerColor = "rgb(232, 121, 46)",
  markerSize = 16,
  markerGap = 20,
  background = "rgb(255, 246, 236)",
  panelColor,
  scrollSpeed = 0.008,
  dragSpeed = 0.02,
  loop = true,
  loopOnMobile = false,
  snap = true,
  momentum = true,
  appear = true,
  edgeFade = true,
  edgeFadeSize = 30,
  initialIndex = 0,
  activeIndex,
  onActiveChange,
  className,
  photoClassName,
  itemClassName,
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const instanceId = useId();

  const carouselItems = items?.length ? items : wheelCarouselDefaultItems;
  const itemCount = carouselItems.length;

  const startingIndex = wrapIndex(activeIndex ?? initialIndex, itemCount);

  const [rotation, setRotation] = useState(startingIndex);
  const [selectedIndex, setSelectedIndex] = useState(startingIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [focusRing, setFocusRing] = useState(false);
  const [systemDark, setSystemDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(false);

  const stageRef = useRef(null);
  const rootRef = useRef(null);
  const rotationRef = useRef(startingIndex);
  const selectedRef = useRef(startingIndex);
  const appliedActiveIndexRef = useRef(null);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({
    x: 0,
    y: 0,
    rotation: startingIndex,
  });
  const previousDragRotationRef = useRef(startingIndex);
  const frameRef = useRef(null);

  // Detect system theme.
  useEffect(() => {
    if (!window.matchMedia) return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => setSystemDark(query.matches);

    update();
    query.addEventListener?.("change", update);

    return () => query.removeEventListener?.("change", update);
  }, []);

  const resolvedMode =
    mode === "system" ? (systemDark ? "dark" : "light") : mode;

  const palette = useMemo(() => {
    if (resolvedMode === "dark") {
      return {
        background: "#000000",
        text: "rgba(255,255,255,0.5)",
        selected: "#ffffff",
        marker: "#2c6bff",
        panel: "#141414",
      };
    }

    if (resolvedMode === "light") {
      return {
        background: "#ffffff",
        text: "rgba(0,0,0,0.32)",
        selected: "#0a0a0a",
        marker: "#2c6bff",
        panel: "#ededed",
      };
    }

    return {
      background,
      text: textColor,
      selected: selectedColor,
      marker: markerColor,
      panel: panelColor ?? background,
    };
  }, [
    background,
    markerColor,
    panelColor,
    resolvedMode,
    selectedColor,
    textColor,
  ]);

  // Detect the viewport.
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const update = () => setMobileViewport(query.matches);

    update();
    query.addEventListener?.("change", update);

    return () => query.removeEventListener?.("change", update);
  }, [breakpoint]);

  // Detect the component's actual width.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const update = () => setCompact(node.clientWidth < breakpoint);

    update();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [breakpoint]);

  const mobileLayout = mobileViewport || compact;

  // Desktop loops by default. Mobile can stop at the final slide.
  const canLoop =
    loop && (!mobileLayout || loopOnMobile);

  const commitRotation = useCallback(
    (rawRotation) => {
      let nextRotation = rawRotation;

      if (!canLoop) {
        nextRotation = Math.min(
          Math.max(rawRotation, 0),
          itemCount - 1
        );

        if (nextRotation !== rawRotation) {
          velocityRef.current = 0;
        }
      }

      rotationRef.current = nextRotation;
      setRotation(nextRotation);

      const nextIndex = wrapIndex(
        Math.round(nextRotation),
        itemCount
      );

      if (nextIndex !== selectedRef.current) {
        selectedRef.current = nextIndex;
        setSelectedIndex(nextIndex);
        onActiveChange?.(carouselItems[nextIndex], nextIndex);
      }
    },
    [canLoop, carouselItems, itemCount, onActiveChange]
  );

  const commitRotationRef = useRef(commitRotation);
  commitRotationRef.current = commitRotation;

  // Smooth snapping and momentum.
  const runAnimation = useCallback(() => {
    if (frameRef.current !== null) return;

    const tick = () => {
      let keepAnimating = false;

      if (
        !draggingRef.current &&
        Math.abs(velocityRef.current) > 0.0008
      ) {
        commitRotation(rotationRef.current + velocityRef.current);

        velocityRef.current *=
          momentum && !reduceMotion
            ? snap
              ? 0.9
              : 0.94
            : 0.8;

        keepAnimating = true;
      } else if (!draggingRef.current && snap) {
        velocityRef.current = 0;

        const target = Math.round(rotationRef.current);
        const delta = target - rotationRef.current;

        if (Math.abs(delta) > 0.001 && !reduceMotion) {
          commitRotation(rotationRef.current + delta * 0.22);
          keepAnimating = true;
        } else {
          commitRotation(target);
        }
      } else if (!draggingRef.current) {
        velocityRef.current = 0;
      }

      if (keepAnimating) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [commitRotation, momentum, reduceMotion, snap]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  // Clamp position when looping is disabled.
  useEffect(() => {
    if (canLoop) return;

    const bounded = Math.min(
      Math.max(rotationRef.current, 0),
      itemCount - 1
    );

    velocityRef.current = 0;
    rotationRef.current = bounded;
    selectedRef.current = Math.round(bounded);

    setRotation(bounded);
    setSelectedIndex(Math.round(bounded));
  }, [canLoop, itemCount]);

  // Desktop wheel navigation only. Mobile never navigates using a wheel.
  useEffect(() => {
    if (mobileLayout) return;

    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (event) => {
      if (event.ctrlKey || event.metaKey) return;

      const delta = event.deltaY * scrollSpeed;
      const current = rotationRef.current;

      if (!canLoop) {
        const atFirst = current <= 0.001;
        const atLast = current >= itemCount - 1 - 0.001;

        if (
          (atFirst && delta < 0) ||
          (atLast && delta > 0)
        ) {
          return;
        }
      }

      event.preventDefault();

      commitRotation(current + delta);
      velocityRef.current = delta * 0.2;

      runAnimation();
    };

    stage.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => stage.removeEventListener("wheel", handleWheel);
  }, [
    mobileLayout,
    canLoop,
    commitRotation,
    itemCount,
    runAnimation,
    scrollSpeed,
  ]);

  // Support a controlled activeIndex prop.
  useEffect(() => {
    if (activeIndex === undefined) return;

    const controlledIndex = wrapIndex(activeIndex, itemCount);

    if (appliedActiveIndexRef.current === controlledIndex) return;

    appliedActiveIndexRef.current = controlledIndex;

    const currentIndex = wrapIndex(
      Math.round(rotationRef.current),
      itemCount
    );

    let delta = controlledIndex - currentIndex;

    if (canLoop) {
      if (delta > itemCount / 2) delta -= itemCount;
      if (delta < -itemCount / 2) delta += itemCount;
    }

    selectedRef.current = controlledIndex;
    setSelectedIndex(controlledIndex);

    commitRotationRef.current(rotationRef.current + delta);
  }, [activeIndex, itemCount, canLoop]);

  const moveBy = useCallback(
    (amount) => {
      velocityRef.current = 0;
      commitRotation(rotationRef.current + amount);
      runAnimation();
    },
    [commitRotation, runAnimation]
  );

  // Shared pointer handlers:
  // Desktop drags vertically; mobile swipes horizontally.
  const handlePointerDown = (event) => {
    if (!event.isPrimary || event.button !== 0) return;

    draggingRef.current = true;
    setIsDragging(true);
    velocityRef.current = 0;

    dragOriginRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotation: rotationRef.current,
    };

    previousDragRotationRef.current = rotationRef.current;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;

    const distance = mobileLayout
      ? event.clientX - dragOriginRef.current.x
      : event.clientY - dragOriginRef.current.y;

    const sensitivity = mobileLayout
      ? 1 / Math.max(event.currentTarget.clientWidth * 0.8, 1)
      : dragSpeed;

    const nextRotation =
      dragOriginRef.current.rotation - distance * sensitivity;

    velocityRef.current =
      nextRotation - previousDragRotationRef.current;

    previousDragRotationRef.current = nextRotation;

    commitRotation(nextRotation);
  };

  const handlePointerEnd = (event) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setIsDragging(false);

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {}

    runAnimation();
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "ArrowRight" ||
      (!mobileLayout && event.key === "ArrowDown")
    ) {
      event.preventDefault();
      moveBy(1);
    }

    if (
      event.key === "ArrowLeft" ||
      (!mobileLayout && event.key === "ArrowUp")
    ) {
      event.preventDefault();
      moveBy(-1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      velocityRef.current = 0;
      commitRotation(0);
      runAnimation();
    }

    if (event.key === "End") {
      event.preventDefault();
      velocityRef.current = 0;
      commitRotation(itemCount - 1);
      runAnimation();
    }
  };

  const wheelRadius = compact ? Math.min(radius, 240) : radius;
  const wheelInset = compact ? 8 : apexInset;

  const offsetFor = (index) =>
    canLoop
      ? shortestOffset(index, rotation, itemCount)
      : index - rotation;

  const safeSelectedIndex = wrapIndex(selectedIndex, itemCount);
  const selectedItem = carouselItems[safeSelectedIndex];

  const mask = edgeFade
    ? `linear-gradient(to bottom, transparent 0%, black ${edgeFadeSize}%, black ${100 - edgeFadeSize}%, transparent 100%)`
    : undefined;

  const srOnly = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  };

  return (
    <motion.div
      ref={rootRef}
      initial={appear && !reduceMotion ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`mx-auto border-b border-black/10 bg-[#d4ff3f] ${className || ""}`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        width: "100%",
        height: height ?? "100%",
        minHeight: mobileLayout ? 0 : 520,
        overflow: "hidden",
        boxSizing: "border-box",
        padding: mobileLayout ? "32px 0 26px" : "96px 0",
      }}
    >
      <div
        ref={stageRef}
        role="listbox"
        aria-label="Purple Club carousel"
        aria-activedescendant={`${instanceId}-item-${safeSelectedIndex}`}
        tabIndex={0}
        onFocus={(event) =>
          setFocusRing(event.target.matches(":focus-visible"))
        }
        onBlur={() => setFocusRing(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
        style={{
          display: "flex",
          flexDirection: mobileLayout
            ? "column"
            : photoSide === "right"
              ? "row-reverse"
              : "row",
          alignItems: "stretch",
          flex: "1 1 auto",
          width: "100%",
          boxSizing: "border-box",
          padding: mobileLayout ? "0 22px" : "0 32px",
          margin: "0 auto",
          maxWidth: contentWidth,
          gap: mobileLayout ? 22 : gap,
          overflow: "hidden",
          outline: "none",
          boxShadow: focusRing ? "inset 0 0 0 2px #6b3fa0" : "none",
          touchAction: mobileLayout ? "pan-y" : "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {/* IMAGE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: mobileLayout
              ? "100%"
              : compact
                ? "42%"
                : `${photoWidth}%`,
            minWidth: 0,
            padding: mobileLayout ? 0 : "24px 0",
          }}
        >
          <div
            className={photoClassName}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: mobileLayout
                ? 460
                : compact
                  ? compactPhotoSize
                  : "100%",
              aspectRatio: mobileLayout
                ? "4 / 3"
                : aspectRatios[photoAspect],
              overflow: "hidden",
              borderRadius: photoRadius,
              background: "rgba(255,255,255,0.25)",
            }}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={`${safeSelectedIndex}-${selectedItem.image}`}
                src={selectedItem.image}
                alt={selectedItem.imageAlt ?? selectedItem.label}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 1.035,
                        x: mobileLayout ? 18 : 0,
                      }
                }
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: 0,
                        x: mobileLayout ? -18 : 0,
                      }
                }
                transition={{
                  duration: reduceMotion ? 0 : crossfadeDuration,
                }}
                draggable={false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* MOBILE LABEL + SLIDER CONTROLS */}
        {mobileLayout ? (
          <div
            className="flex w-full flex-col items-center justify-center text-center"
            style={{ color: palette.selected }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={safeSelectedIndex}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: 22 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, x: -22 }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                }}
                className="w-full"
              >
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#6b3fa0]/60">
                  {String(safeSelectedIndex + 1).padStart(2, "0")}
                  {" / "}
                  {String(itemCount).padStart(2, "0")}
                </p>

                <h3
                  className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl"
                  style={{ color: palette.selected }}
                >
                  {selectedItem.label}
                </h3>
              </motion.div>
            </AnimatePresence>

            {/* Pagination dots */}
            <div className="mt-5 flex items-center justify-center gap-2">
              {carouselItems.map((item, index) => (
                <button
                  key={`${item.label}-dot-${index}`}
                  type="button"
                  aria-label={`Go to slide ${index + 1}: ${item.label}`}
                  aria-current={
                    index === safeSelectedIndex ? "true" : undefined
                  }
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    velocityRef.current = 0;
                    commitRotation(index);
                  }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    height: 8,
                    width: index === safeSelectedIndex ? 25 : 8,
                    backgroundColor:
                      index === safeSelectedIndex
                        ? "#6b3fa0"
                        : "rgba(107,63,160,0.28)",
                  }}
                />
              ))}
            </div>

            {/* Previous / next buttons */}
            <div className="mt-5 flex items-center gap-5">
              <button
                type="button"
                aria-label="Previous slide"
                disabled={!canLoop && safeSelectedIndex === 0}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => moveBy(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6b3fa0]/25 text-[#6b3fa0] transition hover:bg-[#6b3fa0] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronLeft size={21} />
              </button>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b3fa0]/60">
                Swipe to explore
              </p>

              <button
                type="button"
                aria-label="Next slide"
                disabled={!canLoop && safeSelectedIndex === itemCount - 1}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => moveBy(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6b3fa0]/25 text-[#6b3fa0] transition hover:bg-[#6b3fa0] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronRight size={21} />
              </button>
            </div>
          </div>
        ) : (
          /* DESKTOP WHEEL TEXT — ORIGINAL LAYOUT */
          <div
            style={{
              position: "relative",
              flex: "1 1 0%",
              minWidth: 0,
              minHeight: 0,
              overflow: "hidden",
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          >
            {showMarker && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `calc(${wheelInset}% - ${markerGap}px)`,
                  width: markerSize,
                  height: markerSize,
                  marginLeft: -markerSize,
                  transform: "translateY(-50%)",
                  borderRadius: "9999px",
                  zIndex: 10,
                  backgroundColor: palette.marker,
                }}
              />
            )}

            {carouselItems.map((item, index) => {
              const offset = offsetFor(index);

              if (Math.abs(offset) > visibleItems + 1) return null;

              const angle = offset * spacing;
              const radians = (angle * Math.PI) / 180;
              const x = -wheelRadius * (1 - Math.cos(radians));
              const y = wheelRadius * Math.sin(radians);
              const distance = Math.min(
                Math.abs(offset) / visibleItems,
                1
              );
              const opacity = Math.cos((distance * Math.PI) / 2);
              const scale =
                1 - Math.min(Math.abs(offset) * 0.04, 0.45);
              const selected = Math.abs(offset) < 0.5;

              return (
                <div
                  id={`${instanceId}-item-${index}`}
                  key={`${item.label}-${index}`}
                  role="option"
                  aria-selected={selected}
                  className={itemClassName}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${wheelInset}%`,
                    transformOrigin: "left center",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    fontSize: "clamp(1rem, 2.4vw, 1.625rem)",
                    fontWeight: 500,
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                    color: selected ? palette.selected : palette.text,
                    opacity,
                    transform: `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}deg) scale(${scale})`,
                  }}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <span style={srOnly} aria-live="polite">
        {selectedItem.label}, item {safeSelectedIndex + 1} of {itemCount}
      </span>
    </motion.div>
  );
}

export default WheelCarousel;
