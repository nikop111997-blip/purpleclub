"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Re-measures all ScrollTriggers whenever the page height changes
// (late-rendered cards, images, fonts, session fetches, etc.)
export default function useScrollTriggerRefresh() {
  useEffect(() => {
    let rafId = 0;
    let lastHeight = document.documentElement.scrollHeight;

    const refresh = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastHeight) < 2) return; // ignore pin-spacer noise
      lastHeight = h;
      refresh();
    });
    ro.observe(document.body);

    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    const t = setTimeout(refresh, 600);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
      clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, []);
}