"use client";

import React from "react";
import { usePageTransition } from "@/component/PageTransitionProvider";
import Link from "next/link";

export default function Navbar() {
  const { navigate } = usePageTransition();

  return (
    <div className="fixed left-0 top-0 z-[100] flex w-full justify-center p-2 sm:p-4 font-sans">
      {/* Main floating pill navbar */}
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-full bg-[#F5F5F5] pl-4 p-1 sm:p-2 sm:pl-8 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <img
            src="/logod.png"
            alt="Purple Club"
            className="h-10 w-32 object-contain"
          />
        </div>

    

<div>
 
</div>
      </nav>
    </div>
  );
}