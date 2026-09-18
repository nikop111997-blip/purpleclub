import React from 'react';

export default function AboutRunClub() {
  return (
    // Background color carefully matched to the bright lime/neon green
    <section className="w-full bg-[#d4ff3f] text-[#1a1a1a] px-6 py-20 md:px-12 lg:px-20 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Headline Section */}
        <div className="mb-16 md:mb-24">
          <h1 className="text-4xl md:text-5xl lg:text-[2.25rem] leading-[1.1] font-bold tracking-[-0.02em] max-w-6xl">
            <span className='text-[#6b3fa0] font-bold'>PURPLE CLUB</span> is the first ever (coolest) run club in the <br className="hidden md:block" />
            Tricity spreading the love for <br className="hidden md:block" />
            <span className="border-b-[3px] border-[#6b3fa0] pb-1 md:pb-2 inline-block mt-2 md:mt-0">
              RUN and FITNESS
            </span>
          </h1>
        </div>

        {/* Thin Divider Line */}
        <hr className="border-t border-[#1a1a1a]/20 mb-12 md:mb-16" />

        {/* Bottom Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
          
          {/* Left Column: Heading */}
          <div>
            <h2 className="text-xl md:text-2xl font-normal tracking-tight">
              What you can expect?
            </h2>
          </div>
          
          {/* Right Column: Paragraphs */}
          <div className="flex flex-col gap-8 text-lg md:text-xl lg:text-[1.35rem] leading-[1.6] text-[#1a1a1a]/90 md:pr-10 lg:pr-24">
            <p>
              We are a community of passionate runners who love to stay fit, laugh, and
              enjoy coffee! Purple Club is here to help you reach your goals,
              combining fitness with fun and friendship.
            </p>
            <p>
              As Rajasthan largest run club, we bring together running, meditation,
              and socializing for an experience that is all about wellness and connection.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}