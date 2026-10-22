import Image from 'next/image';
import React from 'react';

export default function ProofSection({session}) {
  return (
    <div className="w-full font-sans overflow-hidden">
      
      {/* Top Green Gradient Section */}
      <section className="w-full bg-[#6b3fa0] pt-24 pb-48 z-0">
        
        {/* Custom Glowing Background Effect */}
        <div className="absolute top-[120%] right-[-70%] w-[160%] h-[200%] rounded-full bg-[radial-gradient(circle,_#d4ff3f_0%,_transparent_100%)] opacity-100 blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute top-[60%] left-[-10%] w-[180%] h-[150%] rounded-full bg-[radial-gradient(circle,_#d4ff3f_0%,_transparent_100%)] opacity-40 blur-[80px] pointer-events-none -z-10"></div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
            <p className='bg-[#d4ff3f]/45 border border-[#d4ff3f] text-white text-sm py-1 mb-2 w-fit px-4 rounded-full'>What can you expect?</p>
            <h2 className="text-[#d4ff3f] text-3xl md:text-[2.5rem] font-bold leading-[1.05] tracking-tight max-w-3xl">
              Four ways to come alive
            </h2>
            <p className='max-w-2xl mt-3 text-white font-medium text-lg md:text-lg'>Purple Club brings people together for welcoming, coach-led Sunday mornings built around movement, meditation, fuel and connection.</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-white mb-4 max-w-[400px] text-lg md:text-lg md:ml-auto font-medium">
                
Think of it as a run club that also stretches, breathes and stays back to chat.

              </p>
              <button className="bg-[#d4ff3f] text-black border border-gray-800 font-semibold px-8 py-3.5 rounded-full hover:bg-[#bce628] transition-colors text-sm">
                Experience Purple
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 md:mt-24 ">
            
            {/* Card 1 */}
            <div className="bg-[#d4ff3f] rounded-[2rem] border p-8 md:p-10 flex flex-col justify-between h-[320px] rotate-12 hover:rotate-0 transform transition-all duration-400">
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold tracking-tighter">MOVE</span>
                <p className='text-3xl md:text-4xl font-bold tracking-tighter'>Find your pace</p>
              </div>
              <p className="text-black font-medium text-[14px] leading-snug mt-12 ">
               Guided movement and playful games, with an option for every level. Nobody keeps score, except on Speed Thrills Sundays.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F8F9FA] rounded-[2rem] border border-[#0e0e0d] p-8 md:p-10 flex flex-col justify-between h-[320px] -rotate-6 hover:rotate-0 transform transition-all duration-400">
              <div className="flex flex-col items-start text-black">
                <span className="text-sm font-bold tracking-tighter">MEDITATE</span>
                <span className="text-3xl md:text-4xl font-bold tracking-tighter">Make room to pause.</span>
              </div>
              <p className="text-black font-medium text-[14px] leading-snug mt-12 ">
                A few quiet minutes to breathe and settle. Even the restless ones manage it.

              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#6b3fa0] rounded-[2rem] border border-white p-8 md:p-10 flex flex-col justify-between min-h-[220px] rotate-8 shadow-2xl hover:rotate-0 transform transition-all duration-400">
              <div className="flex flex-col items-start text-white">
                <span className="text-sm font-bold tracking-tighter">FUEL</span>
                <span className="text-3xl md:text-4xl font-bold tracking-tighter">Refuel and reconnect</span>
              </div>
              <p className="text-white/90 font-medium text-[14px] leading-snug mt-12 ">
                Some Sundays end with a Purple Fuel experience. The event page tells you what is served and what is in it before you book.
              </p>
            </div>
   <div className="bg-[#da0d7e] rounded-[2rem] border border-white p-8 md:p-10 flex flex-col justify-between min-h-[220px] -rotate-8 shadow-2xl hover:rotate-0 transform transition-all duration-400">
              <div className="flex flex-col items-start text-white"><span className="text-sm font-bold tracking-tighter">CONNECT</span>
                <span className="text-3xl md:text-4xl font-bold tracking-tighter">CONNECT</span>
              </div>
              <p className="text-white/90 font-medium text-[14px] leading-snug mt-12 ">
                A friendly hello, a shared laugh and a group photo you will actually want to post
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Overlapping White Card Section */}
      <section className="relative w-full -mt-24 md:-mt-32 pb-16 z-99">
        <div className="max-w-7xl bg-[#fff] rounded-r-[2.5rem] md:rounded-r-[3rem] overflow-hidden flex flex-col md:flex-row border border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          
          {/* Left Text Content */}
          <div className="p-10 md:p-16 lg:p-20 flex-1 flex flex-col justify-center">
            <p className="text-black font-bold text-sm mb-2">What drives Purple Club is simple</p>
            <h3 className="text-4xl md:text-[2.75rem] font-bold text-black leading-[1.1] mb-6 tracking-tight">
              Let Your Lifestyle <br className="hidden md:block"/>Inspire Others.
            </h3>
            <p className="text-gray-700 text-[16px] leading-relaxed mb-8 max-w-[450px]">
            Being active had started to look unusual, and I wanted Sunday mornings to change that. Come once. If it feels like your kind of Sunday, stay
            </p>
            
            <div>
              <a href={`${session?"/dashboard":'/auth'}`} className="bg-[#d4ff3f] text-black font-bold border border-gray-500 px-6 py-4 rounded-full hover:bg-[#bce628] transition-colors text-sm mb-12">
                Be a Purple Person
              </a>
            </div>

            {/* Signature Area */}
            <div className="mt-auto pt-6">
              {/* Fallback cursive font for the signature */}
              <div className="mb-2" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                <span className="text-4xl text-gray-800 tracking-tight">Ajay Singh Sethi</span>
              </div>
              <p className="font-bold text-black text-sm">Ajay Singh Sethi</p>
              <p className="text-gray-500 text-[12px] leading-snug mt-0.5">
                Founder and CEO of<br/>The Purple Club
              </p>
            </div>
          </div>

          {/* Right Image Content */}
          {/* Using an inner shadow/gradient trick to anchor the portrait visually */}
       
            
  <img
  src="https://framerusercontent.com/images/VaJVz7sLas8kHWe1d2ITuHvrA.png?width=429&height=607"
  alt="Purple Club"
  width={800}
  height={1000} 
  className="
    ml-24
    sm:ml-0
    sm:mt-0
    -mt-10
    object-contain
    w-[44%]
    contrast-125
    object-bottom
    pointer-events-none
  "
/>
</div>
<div className="absolute bottom-0 left-0 z-20 w-full h-20 bg-gradient-to-t from-[#d4ff3f] to-transparent"></div>
      </section>
      
    </div>
  );
}