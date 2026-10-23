'use client'
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

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

/**
 * Props:
 *  items: { label, image, imageAlt? }[]
 *  mode: "system" | "light" | "dark" | "custom"   ("system" follows prefers-color-scheme)
 *  photoSide: "left" | "right"
 *  photoAspect: "3/4" | "1/1" | "4/3" | "3/2"
 *  activeIndex / initialIndex / onActiveChange(item, index)
 */
export function WheelCarousel({
  items = wheelCarouselDefaultItems,
  mode = "system",
  photoSide = "left",
  photoWidth = 40,
  photoAspect = "3/4",
  contentWidth = 900,
  breakpoint = 600, // container width (px) below which the mobile layout is used
  compactPhotoSize = 280, // photo width (px) in the mobile layout
  height, // optional: e.g. 500 or "100vh". Defaults to filling the parent (min 420px)
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
  loop = true, // infinite wrap-around
  loopOnMobile = false, // on the compact/mobile layout, stop at the first/last item
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

  // System theme detection (replaces next-themes)
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(query.matches);
    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  const resolvedMode =
    mode === "system" ? (systemDark ? "dark" : "light") : mode;

  const carouselItems = items.length ? items : wheelCarouselDefaultItems;
  const itemCount = carouselItems.length;
  const startingIndex = wrapIndex(activeIndex ?? initialIndex, itemCount);
  const [rotation, setRotation] = useState(startingIndex);
  const [selectedIndex, setSelectedIndex] = useState(startingIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [focusRing, setFocusRing] = useState(false);
  const stageRef = useRef(null);
  const rootRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(false);

  // Detect the actual viewport as well as the component width. Some mobile
  // layouts place this carousel inside a wide parent, so container width alone
  // can incorrectly enable looping.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setMobileViewport(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, [breakpoint]);

  // Always stop at the first/last image on mobile. Desktop keeps the original
  // loop prop and behavior unchanged.
  const canLoop = loop && !mobileViewport && !(compact && !loopOnMobile);
  const rotationRef = useRef(startingIndex);
  const selectedRef = useRef(startingIndex);
  const appliedActiveIndexRef = useRef(null);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({ y: 0, rotation: startingIndex });
  const previousDragRotationRef = useRef(startingIndex);
  const frameRef = useRef(null);

  // Container-based responsive switch (inline styles can't use media queries)
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

  useEffect(() => {
    const normalizedIndex = wrapIndex(selectedRef.current, itemCount);
    if (normalizedIndex === selectedRef.current) return;
    selectedRef.current = normalizedIndex;
    rotationRef.current = normalizedIndex;
    setSelectedIndex(normalizedIndex);
    setRotation(normalizedIndex);
  }, [itemCount]);

  const palette = useMemo(() => {
    if (resolvedMode === "dark") {
      return {
        background: "#000000",
        text: "rgba(255, 255, 255, 0.5)",
        selected: "#ffffff",
        marker: "#2c6bff",
        panel: "#141414",
      };
    }
    if (resolvedMode === "light") {
      return {
        background: "#ffffff",
        text: "rgba(0, 0, 0, 0.32)",
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
  }, [background, markerColor, panelColor, resolvedMode, selectedColor, textColor]);

  const commitRotation = useCallback(
    (rawRotation) => {
      let nextRotation = rawRotation;
      if (!canLoop) {
        nextRotation = Math.min(Math.max(rawRotation, 0), itemCount - 1);
        if (nextRotation !== rawRotation) velocityRef.current = 0; // hit an end
      }
      rotationRef.current = nextRotation;
      setRotation(nextRotation);
      const nextIndex = wrapIndex(Math.round(nextRotation), itemCount);
      if (nextIndex !== selectedRef.current) {
        selectedRef.current = nextIndex;
        setSelectedIndex(nextIndex);
        onActiveChange?.(carouselItems[nextIndex], nextIndex);
      }
    },
    [canLoop, carouselItems, itemCount, onActiveChange],
  );

  const commitRotationRef = useRef(commitRotation);
  commitRotationRef.current = commitRotation;

  const runAnimation = useCallback(() => {
    if (frameRef.current !== null) return;

    const tick = () => {
      let keepAnimating = false;

      if (!draggingRef.current && Math.abs(velocityRef.current) > 0.0008) {
        commitRotation(rotationRef.current + velocityRef.current);
        velocityRef.current *=
          momentum && !reduceMotion ? (snap ? 0.9 : 0.94) : 0.8;
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

      if (keepAnimating) frameRef.current = requestAnimationFrame(tick);
      else frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [commitRotation, momentum, reduceMotion, snap]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  useEffect(() => {
    if (canLoop) return;
    // When looping is disabled, clamp to the nearest valid end rather than
    // wrapping around to the first image.
    const boundedRotation = Math.min(
      Math.max(rotationRef.current, 0),
      itemCount - 1
    );
    velocityRef.current = 0;
    rotationRef.current = boundedRotation;
    selectedRef.current = Math.round(boundedRotation);
    setRotation(boundedRotation);
    setSelectedIndex(Math.round(boundedRotation));
  }, [canLoop, itemCount]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (event) => {
      if (event.ctrlKey || event.metaKey) return; // don't hijack pinch-zoom

      const delta = event.deltaY * scrollSpeed;
      const current = rotationRef.current;
      const next = current + delta;

      // At either end, let the page receive the wheel so the user can
      // continue scrolling to the next/previous section.
      if (!canLoop) {
        const atFirst = current <= 0.001;
        const atLast = current >= itemCount - 1 - 0.001;
        if ((atFirst && delta < 0) || (atLast && delta > 0)) return;
      }

      event.preventDefault();
      commitRotation(next);
      velocityRef.current = delta * 0.2;
      runAnimation();
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [canLoop, commitRotation, itemCount, runAnimation, scrollSpeed]);

  useEffect(() => {
    if (activeIndex === undefined) return;
    const controlledIndex = wrapIndex(activeIndex, itemCount);
    if (appliedActiveIndexRef.current === controlledIndex) return;
    appliedActiveIndexRef.current = controlledIndex;
    const currentIndex = wrapIndex(Math.round(rotationRef.current), itemCount);
    let delta = controlledIndex - currentIndex;
    if (canLoop) {
      if (delta > itemCount / 2) delta -= itemCount;
      if (delta < -itemCount / 2) delta += itemCount;
    }
    selectedRef.current = controlledIndex;
    setSelectedIndex(controlledIndex);
    commitRotationRef.current(rotationRef.current + delta);
  }, [activeIndex, itemCount, canLoop]);

  const moveBy = (amount) => {
    velocityRef.current = 0;
    commitRotation(rotationRef.current + amount);
    runAnimation();
  };

  const handlePointerDown = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    draggingRef.current = true;
    setIsDragging(true);
    velocityRef.current = 0;
    dragOriginRef.current = { y: event.clientY, rotation: rotationRef.current };
    previousDragRotationRef.current = rotationRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;
    const distance = event.clientY - dragOriginRef.current.y;
    const nextRotation = dragOriginRef.current.rotation - distance * dragSpeed;
    velocityRef.current = nextRotation - previousDragRotationRef.current;
    previousDragRotationRef.current = nextRotation;
    commitRotation(nextRotation);
  };

  const handlePointerEnd = (event) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    runAnimation();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveBy(-1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      velocityRef.current = 0;
      commitRotation(rotationRef.current - selectedIndex);
      runAnimation();
    }
    if (event.key === "End") {
      event.preventDefault();
      velocityRef.current = 0;
      const lastIndex = itemCount - 1;
      commitRotation(rotationRef.current + lastIndex - selectedIndex);
      runAnimation();
    }
  };

  const wheelRadius = compact ? Math.min(radius, 240) : radius;
  const wheelInset = compact ? 8 : apexInset;
  const offsetFor = (index) =>
    canLoop ? shortestOffset(index, rotation, itemCount) : index - rotation;
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
      transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="py-24 mx-auto bg-[#d4ff3f] border-b"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        width: "100%",
        height: height ?? "100%",
        minHeight: compact ? 420 : 520,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        ref={stageRef}
        role="listbox"
        aria-label="Wheel carousel"
        aria-activedescendant={
          Math.abs(offsetFor(safeSelectedIndex)) <=
          visibleItems + 1
            ? `${instanceId}-item-${safeSelectedIndex}`
            : undefined
        }
        tabIndex={0}
        onFocus={(e) => setFocusRing(e.target.matches(":focus-visible"))}
        onBlur={() => setFocusRing(false)}
        style={{
          display: "flex",
          flexDirection: photoSide === "right" ? "row-reverse" : "row",
          alignItems: "stretch",
          flex: "1 1 auto",
          width: "100%",
          boxSizing: "border-box",
          padding: compact ? "0 28px" : "0 32px",
          margin: "0 auto",
          maxWidth: contentWidth,
          gap: compact ? 16 : gap,
          overflow: "hidden",
          outline: "none",
          boxShadow: focusRing ? "inset 0 0 0 2px currentColor" : "none",
          // Keep native vertical page scrolling available on mobile so users
          // can leave the carousel after reaching its first/last item.
          touchAction: mobileViewport ? "pan-y" : "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        {/* Photo column */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: compact ? "42%" : `${photoWidth}%`,
            minWidth: 0,
            padding: compact ? "0" : "24px 0",
          }}
        >
          <div
            className={photoClassName}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: compact ? compactPhotoSize : "100%",
              aspectRatio: aspectRatios[photoAspect],
              overflow: "hidden",
              borderRadius: photoRadius,
            }}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={`${safeSelectedIndex}-${selectedItem.image}`}
                src={selectedItem.image}
                alt={selectedItem.imageAlt ?? selectedItem.label}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : crossfadeDuration }}
                draggable={false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Wheel column */}
        <div
          style={{
            position: "relative",
            flex: "1 1 0%",
            minWidth: 0,
            minHeight: compact ? 320 : 0,
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
                backgroundColor: "#6b3fa0",
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
            const distance = Math.min(Math.abs(offset) / visibleItems, 1);
            const opacity = Math.cos((distance * Math.PI) / 2);
            const scale = 1 - Math.min(Math.abs(offset) * 0.04, 0.45);
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
      </div>

      <span style={srOnly} aria-live="polite">
        {selectedItem.label}, item {safeSelectedIndex + 1} of {itemCount}
      </span>
    </motion.div>
  );
}

export default WheelCarousel;