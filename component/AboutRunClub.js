"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const stories = [
  {
    quote: "I hadn't run since school.",
    name: "Nidhi Nivedita",
    role: "Ex Banker",
    city: "Noida",
    image: "/nidhi.jpeg",
  },
  {
    quote: "My children said, Mummy, you won't last 10 minutes.",
    name: "Shradha Rastogi",
    role: "Home Maker",
    city: "Prayagraj",
    image: "/shardha.jpeg",
  },
  {
    quote: "I came for my health. I stayed for my friends.",
    name: "Manjari Saxena",
    role: "Ex Journalist",
    city: "-",
    image: "/Manjari.jpeg",
  },
  {
    quote: "I was the one everyone joked about.",
    name: "Swati Mathur",
    role: "IT Professional",
    city: "Faridabad",
    image: "/swa.jpeg",
  },
];

const groups = [
  "Professionals",
  "Homemakers",
  "Business owners",
  "Parents",
  "Students",
  "Active seniors",
];

function StoryCard({ story, index }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#6b3fa0]/15 bg-white/90">
      {/* 16:9 Story Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#6b3fa0]/10">
        <Image
          src={story.image}
          alt={`${story.role} from ${story.city} — Purple Club story`}
          fill
          sizes="(max-width: 639px) 85vw, (max-width: 1023px) 48vw, 25vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />

        <span className="absolute right-4 top-4 rounded-full bg-[#d4ff3f] px-3 py-1 text-xs font-bold text-[#6b3fa0]">
          0{index + 1}
        </span>
      </div>

      {/* Story Content */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <span className="text-4xl font-bold leading-none text-[#6b3fa0]/40">
            “
          </span>

          <blockquote className="mt-2 text-xl font-bold leading-snug tracking-tight text-[#1a1a1a] sm:text-xl">
            {story.quote}
          </blockquote>
        </div>

        <div className="mt-7 border-t border-[#6b3fa0]/15 pt-4">
          <p className="font-bold text-[#6b3fa0]">
            {story.name}
          </p>

          <p className="mt-1 text-sm text-[#1a1a1a]/70">
            {story.role}
            <span className="px-1">·</span>
            {story.city}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AboutRunClub() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExpanded(true);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="w-full overflow-hidden bg-[#d4ff3f] px-5 py-16 font-sans text-[#1a1a1a] sm:px-8 sm:py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Heading */}
        <div className="mb-10 max-w-5xl sm:mb-14">
          <h2 className="text-lg font-semibold leading-tight tracking-tight text-[#6b3fa0]/80 sm:text-2xl">
            Come as you are. Become who you could be.
          </h2>

          <h3 className="mt-3 text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-[#6b3fa0] sm:text-5xl md:text-6xl lg:text-7xl">
            You don't need to be fit to start.
            You need to start to get fit.
          </h3>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#1a1a1a]/80 sm:text-lg">
            Every runner has a first day. Every journey starts somewhere.
            There's a place for everyone at Purple Club.
          </p>
        </div>

        {/* Intro Card */}
        {!expanded && (
          <div className="story-intro">
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl bg-[#6b3fa0] p-8 text-center text-white sm:min-h-[340px]">
              <span className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-[#d4ff3f]">
                Purple Club
              </span>

              <h4 className="text-5xl font-bold tracking-[-0.05em] sm:text-7xl">
                Success
                <span className="block text-[#d4ff3f]">Stories</span>
              </h4>

              <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
                Different starting points. One community.
                Meet the people who took the first step.
              </p>
            </div>
          </div>
        )}

        {/* Story Cards */}
        {expanded && (
          <div className="story-results">
            {/* Desktop Grid */}
            <div className="hidden grid-cols-2 items-stretch gap-5 lg:grid lg:grid-cols-4">
              {stories.map((story, index) => (
                <StoryCard
                  key={story.quote}
                  story={story}
                  index={index}
                />
              ))}
            </div>

            {/* Mobile / Tablet Slider */}
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 lg:hidden">
              {stories.map((story, index) => (
                <div
                  key={story.quote}
                  className="w-[85%] shrink-0 snap-start sm:w-[48%]"
                >
                  <StoryCard story={story} index={index} />
                </div>
              ))}
            </div>

            <p className="mt-1 text-xs font-semibold tracking-wide text-[#6b3fa0]/75 lg:hidden">
              SWIPE TO READ MORE →
            </p>
          </div>
        )}

        {/* Community Strip */}
        <div className="mt-10 border-t border-[#1a1a1a]/20 pt-7 sm:mt-14 sm:pt-9">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[#6b3fa0]">
            There's a place for you here
          </p>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {groups.map((group) => (
              <span
                key={group}
                className="rounded-full border border-[#6b3fa0]/25 bg-[#6b3fa0]/[0.07] px-4 py-2 text-sm font-semibold sm:px-5 sm:py-2.5 sm:text-base"
              >
                {group}
              </span>
            ))}
          </div>

          <p className="mt-6 text-lg font-bold tracking-tight text-[#6b3fa0] sm:text-xl">
            Different lives. Different starting points. One community.
          </p>
        </div>
      </div>

      <style jsx>{`
        .story-intro {
          animation: introIn 600ms ease both;
        }

        .story-results {
          animation: resultsIn 700ms ease both;
        }

        @keyframes introIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes resultsIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .story-intro,
          .story-results {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
