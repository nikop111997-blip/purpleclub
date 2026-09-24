import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-[#d4ff3f] text-black pt-16 pb-8 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Top Section: Grid Layout */}
        <div className="flex flex-col sm:flex-row justify-between gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {/* Logo Icon */}
              <div className="relative w-36 h-8 flex items-center justify-center">
                <img
  src="/logos.png"
  alt=""
  draggable="false"
  className="
    block
    h-auto
    w-full
    select-none
  "
/>
              </div>
            </div>
            <p className="text-gray-800 text-lg mb-8 max-w-xs leading-snug">
              Get High on Life
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <SocialLink href="#">
                <XIcon />
              </SocialLink>
              <SocialLink href="#">
                <FacebookIcon />
              </SocialLink>
              <SocialLink href="#">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href="#">
                <LinkedInIcon />
              </SocialLink>
            </div>
          </div>

       

          {/* Newsletter Column */}
          <div className="lg:col-span-2 min-w-[280px]">
            <h3 className="font-semibold text-black mb-6">Subscribe to our newsletter</h3>
            <form className="flex flex-col gap-3" >
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/10 border border-gray-800/10 rounded-full px-5 py-3 text-sm text-black placeholder-gray-700 outline-none focus:bg-white/20 transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#6b3fa0] text-[#f8f8f7] rounded-full px-5 py-3 text-sm font-semibold hover:bg-[#562196] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

      </div>

        <div className="flex items-center justify-center gap-4 md:gap-8 -ml-4 md:-ml-8 ">
          
          {/* Giant Layered Box Icon */}
          <div className="relative w-32 h-32 md:w-64 md:h-64 flex-shrink-0 flex items-center justify-center">
           
          <img
  src="/retail-character.svg"
  alt=""
  draggable="false"
  className="
    block
    h-auto
    w-full
    select-none
    animate-mascot
  "
/>
          </div>
          
          {/* Giant Text */}
          <h1 className="text-[10vw] md:text-[16vw] font-bold tracking-tight text-[#6b3fa0] leading-none bg-clip-border">
            purpleclub
          </h1>
        </div>
    </footer>
  );
}

// ==========================================
// Micro-Components & SVGs
// ==========================================

function FooterLink({ href, children }) {
  return (
    <li>
      <Link href={href} className="text-gray-800 hover:text-black text-sm transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, children }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-black"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

// X (Twitter) Logo SVG
function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

// Facebook Logo SVG
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

// Instagram Logo SVG
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

// LinkedIn Logo SVG
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}