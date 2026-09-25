"use client";

import React from "react";
import { usePageTransition } from "@/component/PageTransitionProvider";

export default function Navbar() {
  const { navigate } = usePageTransition();

  return (
    <div className="fixed left-0 top-0 z-[100] flex w-full justify-center p-4 font-sans">
      {/* Main floating pill navbar */}
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-full bg-[#F5F5F5] p-2 pl-8 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <img
            src="/logos.png"
            alt="Purple Club"
            className="h-10 w-32 object-contain"
          />
        </div>

        {/* Join Button */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/contact")}
            className="
              inline-flex
              items-center
              justify-center
              rounded-full
              border
              border-gray-600
              bg-[#d4ff3f]
              px-5
              py-2.5
              text-[15px]
              font-semibold
              text-black
              shadow-sm
              transition-colors
              hover:bg-[#b8e02a]
              sm:px-8
              sm:py-3.5
            "
          >
            Join the Purple Club
          </button>
        </div>
      </nav>
    </div>
  );
}