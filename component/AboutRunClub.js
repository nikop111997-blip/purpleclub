import React from 'react';

export default function AboutRunClub() {
  return (
    // Background color carefully matched to the bright lime/neon green
    <section className="w-full bg-[#d4ff3f] text-[#1a1a1a] px-6 py-20 md:px-12 lg:px-20 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Headline Section */}
        <div className="mb-16 md:mb-24">
          <h3 className="text-4xl md:text-5xl lg:text-[2.25rem] leading-[1.1] font-bold tracking-[-0.02em] max-w-6xl">
            <span className="text-[#6b3fa0]/80 font-bold">
  THINKING PURPLE CLUB ISN’T FOR YOU
</span>
          </h3>
         <h3 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-none font-bold tracking-[-0.04em] max-w-6xl">
  <span className="text-[#6b3fa0] font-bold">
    THINK AGAIN?
  </span>
</h3>
        </div>

        {/* Thin Divider Line */}
        <hr className="border-t border-[#1a1a1a]/20 mb-12 md:mb-16" />

        {/* Bottom Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
          
          {/* Left Column: Heading */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              WHO IS PURPLE CLUB FOR?
            </h2>
          </div>
          
          {/* Right Column: Paragraphs */}
          <div className="flex flex-col gap-8 text-lg md:text-xl lg:text-[1.35rem] leading-[1.6] text-[#1a1a1a]/90 md:pr-10 lg:pr-24">
            <p>
              You don't have to be a runner. You don't have to be super fit. You just have to be ready to move, connect and live a little more actively. Purple Club is for people at every stage of their journey who want healthier habits, real community and more energy in everyday life.

            </p>
            <p>
              Come as you are. Find your pace.

            </p>
          </div>

        </div>

      </div>
    </section>
  );
}