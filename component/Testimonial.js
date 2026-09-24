'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';

// Sample testimonials: replace with real member quotes before going live.
const testimonials = [
  {
    quote:
      "A friend invited me to a free Sunday session. Ninety minutes later I had sweated, laughed and signed up. It doesn't feel like a gym. It feels like belonging.",
    name: 'Ananya Sharma',
    role: 'Busy Professional',
  },
  {
    quote:
      'My week was always about everyone else. Purple Sundays became my hour to move, meet people who cheer for me, and bring my whole family along on Purple Party day.',
    name: 'Meenakshi Iyer',
    role: 'Homemaker',
  },
  {
    quote:
      'I run a business and thought I had no time. The Sunday format is the same every week, so I just show up. I even used my guest passes to bring my team.',
    name: 'Rohit Agarwal',
    role: 'Business Owner',
  },
  {
    quote:
      'At 62 I was told to slow down. Purple Club showed me that being active and energetic is something to be proud of, at any age.',
    name: 'Rajendra Menon',
    role: 'Active Senior',
  },
];

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

const AUTOPLAY_MS = 6000;

export default function TestimonialSection() {
  // [activeIndex, direction]: direction (1 = next, -1 = previous) drives the slide animation
  const [[index, direction], setPage] = useState([0, 0]);
  const [paused, setPaused] = useState(false);

  const paginate = useCallback((dir) => {
    setPage(([i]) => [(i + dir + testimonials.length) % testimonials.length, dir]);
  }, []);

  const goTo = (target) => {
    setPage(([i]) => (target === i ? [i, 0] : [target, target > i ? 1 : -1]));
  };

  // Autoplay: restarts whenever the slide changes, pauses on hover/touch
  useEffect(() => {
    if (paused) return undefined;
    const timer = setTimeout(() => paginate(1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, paginate]);

  const active = testimonials[index];

  return (
    <div className="min-h-screen bg-[#6b3fa0] text-white flex relative overflow-hidden font-sans">
      {/* Subtle Dotted Background (Simulated World Map Texture) */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          maskImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg'), radial-gradient(ellipse at center, black 10%, transparent 70%)`,
          WebkitMaskImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg'), radial-gradient(ellipse at center, black 10%, transparent 70%)`,
          maskSize: '85% auto, 100% 100%',
          WebkitMaskSize: '85% auto, 100% 100%',
          maskPosition: 'center 40%, center',
          WebkitMaskPosition: 'center 40%, center',
          maskRepeat: 'no-repeat, no-repeat',
          WebkitMaskRepeat: 'no-repeat, no-repeat',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      />

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
                <span className="text-xs font-bold text-white uppercase tracking-[0.2em] pl-1">
                  Clutch Review
                </span>
              </div>
            </div>

            {/* Navigation Arrows + Counter */}
            <div className="flex items-center gap-4 mt-10">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => paginate(-1)}
                className="w-14 h-14 rounded-full bg-[#2a2b2f] flex items-center justify-center text-zinc-400 hover:bg-[#3f4045] hover:text-white active:scale-95 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => paginate(1)}
                className="w-14 h-14 rounded-full bg-[#2a2b2f] flex items-center justify-center text-zinc-400 hover:bg-[#3f4045] hover:text-white active:scale-95 transition-all"
              >
                <ArrowRight size={20} />
              </button>
              <span className="ml-2 text-sm font-semibold tracking-widest text-zinc-200 tabular-nums">
                {String(index + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Right Side: Testimonial Quote (animated slider) */}
          <div
            className="max-w-xl lg:max-w-2xl pt-4 w-full"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {/* Fixed min-height keeps the layout steady while slides swap */}
            <div className="min-h-[300px] sm:min-h-[260px] lg:min-h-[280px]">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={index}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) paginate(1);
                    else if (info.offset.x > 80) paginate(-1);
                  }}
                  style={{ touchAction: 'pan-y' }}
                  className="cursor-grab active:cursor-grabbing select-none"
                >
                  <p className="text-2xl lg:text-[2rem] font-medium leading-[1.4] text-zinc-100 mb-8">
                    {active.quote}
                  </p>
                  <p className="text-[#cfff04] font-bold uppercase tracking-widest text-sm">
                    @{active.name}
                  </p>
                  <p className="text-zinc-300 text-xs uppercase tracking-[0.2em] mt-1">
                    {active.role}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-3 mt-6">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => goTo(i)}
                  className="p-1"
                >
                  <motion.span
                    className="block h-2 rounded-full"
                    animate={{
                      width: i === index ? 32 : 8,
                      backgroundColor: i === index ? '#cfff04' : 'rgba(255,255,255,0.4)',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Half: Client Logos (Simulated) */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-8 w-full border-t border-zinc-800/50 pt-16">
          {/* Walmart */}
          <div className="flex items-center gap-2 text-white opacity-90">
            <span className="text-2xl font-bold tracking-tight">Walmart</span>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
              <path d="M 10 10 Q 50 30 90 5" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M 85 2 L 92 5 L 87 11" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
}