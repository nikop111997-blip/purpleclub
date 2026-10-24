"use client";

import React from "react";
import { usePageTransition } from "@/component/PageTransitionProvider";
import Link from "next/link";

export default function Navbar({ session }) {
  const { navigate } = usePageTransition();

  return (
    <header className="fixed inset-x-0 top-0 z-[100] w-full px-3 pt-3 sm:px-4 sm:pt-4 font-sans">
      <nav className="mx-auto flex w-full max-w-5xl border border-white/20 items-center justify-center sm:justify-between backdrop-blur-2xl rounded-full bg-[#ffff] px-4 py-2 shadow-sm sm:px-2 sm:pl-8 sm:py-1">
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          aria-label="Purple Club Home"
          className="flex shrink-0 items-center"
        >
          <img
            src="/logod.png"
            alt="Purple Club"
            className="h-12 w-36 object-contain sm:h-14 sm:w-46"
          />
        </Link>

        {/* Join button — hidden on mobile */}
        <div className="hidden sm:block">
          <a
            href={session ? "/dashboard" : "#membership"}
            className="inline-flex items-center justify-center rounded-full border border-gray-600 bg-[#d4ff3f] px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-[#b8e02a] sm:px-8 sm:py-3.5 sm:text-[15px]"
          >
            Book your free purple experience
          </a>
        </div>
      </nav>
    </header>
  );
}