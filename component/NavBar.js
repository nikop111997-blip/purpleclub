import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    // Changed 'absolute' to 'fixed' so it stays on the screen while scrolling
    <div className="w-full fixed top-0 left-0 z-100 p-4 flex justify-center font-sans">
      
      {/* The main floating pill navbar */}
      <nav className="w-full max-w-5xl bg-[#F5F5F5] rounded-full flex items-center justify-between p-2 pl-8 shadow-sm">
        
        {/* Left Side: Logo & Navigation Links */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-black text-black tracking-tight">
            purpleclub.io
          </Link>
          
          {/* Links (Hidden on mobile, flex on md+ screens) */}
          <div className="hidden md:flex items-center gap-8 mt-0.5">
            <Link href="/about" className="text-[15px] font-medium text-gray-800 hover:text-black transition-colors">
              About us
            </Link>
            <Link href="/work" className="text-[15px] font-medium text-gray-800 hover:text-black transition-colors">
              Our work
            </Link>
            <Link href="/academy" className="text-[15px] font-medium text-gray-800 hover:text-black transition-colors">
              Academy
            </Link>
          </div>
        </div>

        {/* Right Side: Button */}
        <div>
          <Link 
            href="/contact" 
            className="inline-flex items-center justify-center bg-[#d4ff3f] text-black border border-gray-600 shadow-sm font-semibold text-[15px] sm:px-8 sm:py-3.5 px-5 py-2.5 rounded-full hover:bg-[#b8e02a] transition-colors"
          >
            Contact Now
          </Link>
        </div>

      </nav>
    </div>
  );
}