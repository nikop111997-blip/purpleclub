import React from 'react';
import {  ArrowLeft, ArrowRight, Star } from 'lucide-react';

export default function TestimonialSection() {
  return (
    <div className="min-h-screen bg-[#6b3fa0] text-white flex relative overflow-hidden font-sans">
      
      {/* Subtle Dotted Background (Simulated World Map Texture) */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          /* Dotted pattern */
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          /* Combine World Map SVG mask with the fading radial gradient mask */
          maskImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg'), radial-gradient(ellipse at center, black 10%, transparent 70%)`,
          WebkitMaskImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg'), radial-gradient(ellipse at center, black 10%, transparent 70%)`,
          /* Center and scale the map appropriately */
          maskSize: '85% auto, 100% 100%',
          WebkitMaskSize: '85% auto, 100% 100%',
          maskPosition: 'center 40%, center',
          WebkitMaskPosition: 'center 40%, center',
          maskRepeat: 'no-repeat, no-repeat',
          WebkitMaskRepeat: 'no-repeat, no-repeat',
          /* Intersect the two masks so dots only show within the map AND fade out at the edges */
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in'
        }}
      />

      {}
      {/* Left Sidebar */}
    
      {}
      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-12 lg:px-24 py-16 max-w-7xl mx-auto">
        
        {/* Top Half: Rating and Testimonial */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-24 mb-24">
          
          {/* Left Side: Rating Block */}
          <div className="flex flex-col">
            <div className="flex items-center gap-6">
              <span className="text-7xl lg:text-[5.5rem] font-bold tracking-tight">4.82</span>
              
              <div className="flex flex-col items-start gap-2 pt-2">
                {/* Lime Green Stars Pill */}
                <div className="bg-[#cfff04] text-black px-3 py-1.5 rounded-full flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} fill="currentColor" className="text-black border-none" />
                  ))}
                </div>
                {/* Clutch Text */}
                <span className="text-xs font-bold text-white uppercase tracking-[0.2em] pl-1">
                  Clutch Review
                </span>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-4 mt-10">
              <button className="w-14 h-14 rounded-full bg-[#2a2b2f] flex items-center justify-center text-zinc-400 hover:bg-[#3f4045] hover:text-white transition-all">
                <ArrowLeft size={20} />
              </button>
              <button className="w-14 h-14 rounded-full bg-[#2a2b2f] flex items-center justify-center text-zinc-400 hover:bg-[#3f4045] hover:text-white transition-all">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Right Side: Testimonial Quote */}
          <div className="max-w-xl lg:max-w-2xl pt-4">
            <p className="text-2xl lg:text-[2rem] font-medium leading-[1.4] text-zinc-100 mb-8">
              There are design companies and then there are user <span className="relative inline-block">experience.<span className="absolute left-0 bottom-0 w-full h-[2px] bg-zinc-400"></span></span> Simply the great designs and best theme for fast loading.
            </p>
            <p className="text-[#cfff04] font-bold uppercase tracking-widest text-sm">
              @Jacob Kalling
            </p>
          </div>

        </div>

        {}
        {/* Bottom Half: Client Logos (Simulated) */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-8 w-full border-t border-zinc-800/50 pt-16">
          
          {/* Walmart */}
          <div className="flex items-center gap-2 text-white opacity-90">
            <span className="text-2xl font-bold tracking-tight">Walmart</span>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Netflix */}
          <div className="text-white opacity-90">
            <span className="text-3xl font-black tracking-tighter" style={{ transform: 'scaleY(1.1)', display: 'inline-block' }}>NETFLIX</span>
          </div>

          {/* inVision */}
          <div className="flex items-center text-white opacity-90">
            <div className="bg-white text-black px-1.5 py-0.5 rounded-sm font-bold text-xl mr-1">in</div>
            <span className="text-2xl font-light tracking-wide">vision</span>
          </div>

          {/* YAHOO! */}
          <div className="text-white opacity-90">
            <span className="text-3xl font-serif italic font-bold">YAHOO!</span>
          </div>

          {/* Amazon */}
          <div className="text-white opacity-90 relative">
            <span className="text-3xl font-bold tracking-tighter">amazon</span>
            <svg viewBox="0 0 100 30" className="absolute -bottom-2 left-0 w-full h-auto text-white">
              <path d="M 10 10 Q 50 30 90 5" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M 85 2 L 92 5 L 87 11" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

        </div>

      </main>
    </div>
  );
}