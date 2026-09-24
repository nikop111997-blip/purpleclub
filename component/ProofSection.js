import React from 'react';

export default function ProofSection() {
  return (
    <div className="w-full font-sans overflow-hidden">
      
      {/* Top Green Gradient Section */}
      <section className="relative w-full bg-[#6b3fa0] pt-24 pb-48 z-0">
        
        {/* Custom Glowing Background Effect */}
        <div className="absolute top-[120%] right-[-70%] w-[160%] h-[200%] rounded-full bg-[radial-gradient(circle,_#d4ff3f_0%,_transparent_100%)] opacity-100 blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute top-[60%] left-[-10%] w-[180%] h-[150%] rounded-full bg-[radial-gradient(circle,_#d4ff3f_0%,_transparent_100%)] opacity-40 blur-[80px] pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <h2 className="text-[#d4ff3f] text-3xl md:text-[2.5rem] font-bold leading-[1.05] tracking-tight max-w-3xl">
              THE PURPLE EXPERIENCE.<br/><span className='text-white'> WWhat Happens on a Purple Sunday?</span>
            </h2>
            <div className="text-left md:text-right">
              <p className="text-white mb-4 max-w-[400px] text-lg md:text-xl md:ml-auto font-medium">
                90 minutes of movement, energy, connection and fun — designed to leave you feeling better than when you arrived.

              </p>
              <button className="bg-[#d4ff3f] text-black border border-gray-800 font-semibold px-8 py-3.5 rounded-full hover:bg-[#bce628] transition-colors text-sm">
                Experience Purple
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24 ">
            
            {/* Card 1 */}
            <div className="bg-[#d4ff3f] rounded-[2rem] border p-8 md:p-10 flex flex-col justify-between h-[320px] rotate-12 hover:rotate-0 transform transition-all duration-400">
              <div className="flex items-start">
                <span className="text-6xl md:text-7xl font-bold tracking-tighter">MOVE</span>
              </div>
              <p className="text-black font-medium text-[18px] leading-snug mt-12 ">
                Warm up. Work out. Challenge yourself. Move at your own level.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F8F9FA] rounded-[2rem] border border-[#0e0e0d] p-8 md:p-10 flex flex-col justify-between h-[320px] -rotate-6 hover:rotate-0 transform transition-all duration-400">
              <div className="flex items-start text-black">
                <span className="text-6xl md:text-7xl font-bold tracking-tighter">RESET</span>
              </div>
              <p className="text-black font-medium text-[18px] leading-snug mt-12 ">
                Recover, breathe, refuel and learn something that helps you live better.

              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#6b3fa0] rounded-[2rem] border border-white p-8 md:p-10 flex flex-col justify-between min-h-[220px] rotate-8 shadow-2xl hover:rotate-0 transform transition-all duration-400">
              <div className="flex items-start text-white">
                <span className="text-6xl md:text-7xl font-bold tracking-tighter">CONNECT</span>
              </div>
              <p className="text-white/90 font-medium text-[18px] leading-snug mt-12 ">
                Meet your people, share the energy and become part of the Purple Tribe.
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
             We believe healthy living is contagious. When you choose movement, energy, growth and community, you don't just change your own life. You show the people around you what's possible
            </p>
            
            <div>
              <button className="bg-[#d4ff3f] text-black font-bold border border-gray-500 px-6 py-4 rounded-full hover:bg-[#bce628] transition-colors text-sm mb-12">
                Be a Purple Person
              </button>
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
       
            
  <video
    src="/FD.mp4"
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
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