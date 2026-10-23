"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Crown,
  Heart,
  Sparkles,
  Star,
  Users,
  Zap,
  RotateCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const plans = [
  {
    id: "charter-member",
    number: "01",
    title: "Charter Member",
    subtitle: "Be part of the beginning.",
    price: "₹14,999",
    priceNote: "Charter membership",
    label: "FOUNDING CREW",
    character: Crown,
    characterLabel: "The Original",
    frontText: "BE PART OF\nTHE BEGINNING.",
    image:'/main.png',
    benefits: [
      "Everything included in regular Membership",
      "Motivation and accountability to keep showing up",
      "Access to 4 exclusive Charter Member meetings",
      "Special recognition across Purple Clubs anywhere in India",
    ],
    footer: "Make your Purple journey count.",
    href: "/membership",
  },
  {
    id: "charter-coach",
    number: "02",
    title: "Charter Coach",
    subtitle: "Lead the movement.",
    price: "₹14,999",
    priceNote: "For Kayapalat Active Coaches",
    label: "COACH SQUAD",
    character: Zap,
    image:'/floding.png',
    characterLabel: "The Game Changer",
    frontText: "LEAD THE\nMOVEMENT.",
    benefits: [
      "Everything included in regular Membership",
      "Motivation and accountability to keep showing up",
      "Access to 4 exclusive Charter Member meetings",
      "Special recognition across Purple Clubs anywhere in India",
      "Exclusive eligibility for Kayapalat Active Coaches",
    ],
    footer: "Move people. Build community.",
    href: "/membership",
  },
  {
    id: "membership",
    number: "03",
    title: "Purple Membership",
    subtitle: "Your Sundays, upgraded.",
    price: "₹14,99",
    priceNote: "Your regular Purple journey",
    label: "YOUR NEXT CHAPTER",
    character: Heart,
    image:'/runn.png',
    characterLabel: "The Everyday Icon",
    frontText: "YOUR SUNDAYS.\nYOUR PEOPLE.\nYOUR JOURNEY.",
    benefits: [
      "Purple kit — T-shirt and shaker",
      "4 guided Sunday experiences",
      "Body composition assessment",
      "Purple health snapshot",
      "Access to the Purple community",
      "Inspirer to Icon journey and recognition",
    ],
    footer: "Small steps. Big energy.",
    href: "/membership",
  },
];
function PlanCard({ plan, session, reduceMotion }) {
  const [flipped, setFlipped] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const href = `${session ? "/dashboard/membership" : plan.href}?plan=${encodeURIComponent(plan.id)}`;

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverCapable(media.matches);

    update();
    media.addEventListener?.("change", update);

    return () => media.removeEventListener?.("change", update);
  }, []);

  const flipToBack = () => setFlipped(true);
  const flipToFront = () => setFlipped(false);

  return (
    <motion.article
      className="relative mx-auto w-full max-w-[360px] cursor-pointer"
      style={{ perspective: 1200 }}
      onHoverStart={() => {
        if (hoverCapable) flipToBack();
      }}
      onHoverEnd={() => {
        if (hoverCapable) flipToFront();
      }}
     onClick={(event) => {
  if (event.target.closest("a, button")) return;

  if (!hoverCapable) {
    setFlipped((value) => !value);
  }
}}
      onKeyDown={(event) => {
        if (!hoverCapable && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          setFlipped((value) => !value);
        }
        if (event.key === "Escape") flipToFront();
      }}
      role={hoverCapable ? undefined : "button"}
      tabIndex={hoverCapable ? undefined : 0}
      aria-expanded={flipped}
      aria-label={`${plan.title}. ${flipped ? "Details visible" : "Tap to see details"}`}
    >
      <motion.div
        className="relative w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
        }
        style={{
          minHeight: 540,
          transformStyle: "preserve-3d",
        }}
      >
        {/* FRONT: LIME MEMBERSHIP PROFILE CARD */}
        <div
          className="absolute inset-0 overflow-hidden rounded-sm border-[5px] border-white bg-[#d4ff3f] text-[#171717] shadow-xl"
          style={{
            minHeight: 540,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: flipped ? "none" : "auto",
          }}
        >
          {/* Inner frame */}
          <div className="absolute inset-[7px] border border-[#291044]/50" />

          {/* Vertical typography */}
          <div className="absolute bottom-5 left-3 top-5 flex items-center gap-1 bg-[#6b3fa0] px-2">
            <span
              className="text-[clamp(2.7rem,5vw,2.4rem)] font-black uppercase leading-[0.8] tracking-[-0.01em] text-[#ffffff]"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              {plan.title}
            </span>
          </div>

          {/* Vertical role */}
          <div className="absolute left-[65px] top-5">
            <span
              className="text-sm font-black uppercase tracking-tight text-[#291044]"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              Purple Club
            </span>
          </div>

          {/* Member details on the upper right */}
          <div className="absolute left-[105px] right-4 top-7 z-10">
            <p
              className="text-3xl font-medium leading-none text-[#291044]"
              style={{ fontFamily: "cursive", transform: "rotate(-8deg)" }}
            >
              Hi! I&apos;m
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-[2px] w-7 rotate-[-35deg] bg-[#291044]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#291044]/75">
                {plan.label}
              </span>
            </div>

            <h3 className="mt-3 text-xl font-black leading-tight tracking-tight text-[#171717]">
              {plan.title}
            </h3>

            <p className="mt-1 text-sm font-medium leading-tight text-[#291044]">
              {plan.subtitle}
            </p>
          </div>

          {/* Photo placeholder — replace with your own image */}
          <div className="absolute bottom-20 left-[76px] right-3 top-[170px] overflow-hidden bg-gradient-to-b from-white/40 via-[#d4ff3f] to-[#a8d82a]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Image src={plan.image} height={110} width={200} alt="memberhsip" />
            </div>
          </div>

          {/* Bottom identity */}
          <div className="absolute bottom-20 left-[85px] right-4 z-10">
            <div className="bg-[#d4ff3f]/90 px-2 py-2">
              <p className="text-sm font-black text-[#291044]">
                {plan.title}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#291044]/75">
                {plan.price}
              </p>
            </div>
          </div>

          {/* Front actions */}
          <div className="absolute bottom-3 left-[76px] right-3 z-30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2" aria-label="Card side">
              <button
                type="button"
                aria-label="Show card front"
                onClick={(event) => {
                  event.stopPropagation();
                  flipToFront();
                }}
                className={`h-2.5 w-2.5 rounded-full border border-[#291044] ${!flipped ? "bg-[#291044]" : "bg-transparent"}`}
              />
              <button
                type="button"
                aria-label="Show membership details"
                onClick={(event) => {
                  event.stopPropagation();
                  flipToBack();
                }}
                className={`h-2.5 w-2.5 rounded-full border border-[#291044] ${flipped ? "bg-[#291044]" : "bg-transparent"}`}
              />
            </div>
            <Link
              href={href}
              onClick={(event) => event.stopPropagation()}
              className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#291044] px-3 py-2 text-xs font-black text-[#d4ff3f]"
            >
              View membership <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* BACK: DETAILS */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[12px] border-2 border-[#d4ff3f] bg-[#6f28ba] p-5 text-white sm:p-6"
          style={{
            minHeight: 540,
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: flipped ? "auto" : "none",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d4ff3f]">
                {plan.label}
              </p>
              <h3 className="mt-2 text-3xl font-black leading-tight">
                {plan.title}
              </h3>
              <p className="mt-1 text-xs text-white/60">{plan.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                flipToFront();
              }}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Return to card front"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20"
            >
              <RotateCw size={17} />
            </button>
          </div>

         {plan.id !=="membership" && <div className="mt-5 rounded-xl bg-white/[0.07] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Membership
            </p>
            <p className="mt-1 text-2xl font-black text-[#d4ff3f]">
              {plan.price}
            </p>
            <p className="mt-1 text-xs text-white/60">{plan.priceNote}</p>
          </div> }

          <div className="mt-5 flex-1">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#d4ff3f]">
              What you get
            </p>

            <ul className="space-y-3">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[#d4ff3f] text-[#291044]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-xs leading-relaxed text-white/85">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">

<div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2" aria-label="Card side">
                <button
                  type="button"
                  aria-label="Show card front"
                  onClick={(event) => {
                    event.stopPropagation();
                    flipToFront();
                  }}
                  className={`h-2.5 w-2.5 rounded-full border border-[#d4ff3f] ${!flipped ? "bg-[#d4ff3f]" : "bg-transparent"}`}
                />
                <button
                  type="button"
                  aria-label="Show membership details"
                  onClick={(event) => {
                    event.stopPropagation();
                    flipToBack();
                  }}
                  className={`h-2.5 w-2.5 rounded-full border border-[#d4ff3f] ${flipped ? "bg-[#d4ff3f]" : "bg-transparent"}`}
                />
              </div>
              <a
                href={href}
                onClick={(event) => event.stopPropagation()}
                className="relative z-50 flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#d4ff3f] px-4 py-3 text-center text-sm font-black text-[#291044] cursor-pointer"
              >
                View membership <ArrowRight size={17} />
              </a>
            </div>

           
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function OneSundaySection({ session }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="membership"
      className="relative w-full overflow-hidden bg-[#6b3fa0] px-4 py-16 font-sans text-white sm:px-6 sm:py-20 lg:pb-48"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs border-b-1 uppercase tracking-[0.08em] text-[#fdfff8]">
           
            Find your Purple
          </div>

          <h2 className="text-4xl font-sans font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            One Sunday can be
            <span className="block text-[#d4ff3f]">
              the beginning.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            More than a Sunday. Find your people, build your motivation,
            and become part of a movement that keeps you coming back.
          </p>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-[#d4ff3f] sm:text-sm">

            <span className="md:hidden">
              Tap a card to discover what’s inside
            </span>
          </p>
        </motion.div>

        {/* Membership cards */}
        <div className="mt-10 grid grid-cols-1 items-stretch gap-3 sm:mt-14 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className="min-w-0"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.55,
                delay: index * 0.12,
                ease: "easeOut",
              }}
            >
              <PlanCard
                plan={plan}
                session={session}
                reduceMotion={reduceMotion}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}