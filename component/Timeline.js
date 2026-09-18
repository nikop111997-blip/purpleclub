'use client'
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap"; import { ScrollTrigger } from "gsap/dist/ScrollTrigger"; if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }
const steps = [ { num: "01", title: "Arrive and exhale", desc: "Your transfer meets you in Ubud. You choose your room, meet the group and leave your phone in the wooden box.", card: ( <div className="bg-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden w-full"> <div className="p-5 flex justify-between items-center border-b border-gray-100"> <span className="text-xs text-gray-500 font-medium"> Week settings </span> <span className="text-xs font-bold tracking-widest text-[#384c24]"> MAYA JUNGLE OS </span> </div> <div className="p-5 space-y-6"> <div className="flex justify-between items-center"> <div> <p className="text-sm font-medium text-gray-800">Wifi</p> <p className="text-xs text-gray-500"> the router stays in town </p> </div> <div className="w-10 h-6 bg-gray-200 rounded-full relative"> <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" /> </div> </div> <div className="flex justify-between items-center"> <div> <p className="text-sm font-medium text-gray-800"> Notifications </p> <p className="text-xs text-gray-500"> replaced by birds </p> </div> <div className="w-10 h-6 bg-gray-200 rounded-full relative"> <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" /> </div> </div> </div> <div className="bg-[#f2f6e7] p-8 text-center flex flex-col items-center justify-center"> <span className="text-xl mb-2">🔑</span> <p className="text-xs font-medium text-[#384c24]"> Room 04 · above the river </p> <p className="text-xs text-[#5a7042] mt-1"> your phone is already asleep in the wooden box </p> </div> </div> ), }, { num: "02", title: "Find your rhythm", desc: "Movement before breakfast. A workshop, the river or absolutely nothing. Dinner together at one long table.", card: ( <div className="bg-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden w-full"> <div className="p-5 flex justify-between items-center border-b border-gray-100"> <span className="text-xs text-gray-500 font-medium"> A day at Maya </span> <span className="text-xs font-bold tracking-widest text-[#384c24]"> DAY 2 OF 7 </span> </div> <div className="flex flex-col text-sm text-gray-600 pb-2"> <div className="flex gap-4 p-4 border-b border-gray-50"> <span className="w-12 text-gray-400">06:30</span> <span className="font-medium text-gray-700"> Wake up with the jungle </span> </div> <div className="flex gap-4 p-4 bg-[#e6f1c5] text-[#384c24]"> <span className="w-12">07:00</span> <span className="font-medium"> Yoga before the heat arrives </span> </div> <div className="flex gap-4 p-4 border-b border-gray-50"> <span className="w-12 text-gray-400">08:30</span> <span className="font-medium text-gray-700"> Breakfast at the long table </span> </div> <div className="flex gap-4 p-4 border-b border-gray-50"> <span className="w-12 text-gray-400">13:00</span> <span className="font-medium text-gray-700"> Lunch and a slow afternoon </span> </div> <div className="flex gap-4 p-4 border-b border-gray-50"> <span className="w-12 text-gray-400">16:30</span> <span className="font-medium text-gray-700"> Bodywork or guided practice </span> </div> <div className="flex gap-4 p-4 border-b border-gray-50"> <span className="w-12 text-gray-400">19:00</span> <span className="font-medium text-gray-700"> Dinner together </span> </div> <div className="flex gap-4 p-4"> <span className="w-12 text-gray-400">21:00</span> <span className="font-medium text-gray-700"> Phones stay asleep </span> </div> </div> </div> ), }, { num: "03", title: "Leave with space", desc: "Nothing dramatic. Just enough quiet to hear yourself again — and eleven new numbers in your phone.", card: ( <div className="bg-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden w-full"> <div className="h-48 w-full bg-gray-200 relative"> <img src="https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1000&auto=format&fit=crop" alt="Dinner table" className="w-full h-full object-cover" /> </div> <div className="p-6"> <p className="text-xs text-gray-500 font-medium mb-1"> Checked out · Oct 24 </p> <p className="text-sm font-medium text-gray-800"> eleven new numbers in a phone that stayed quiet all week </p> </div> </div> ), }, ];
export default function TimelineSection() {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;

    if (!section || !pin) return;

    const ctx = gsap.context(() => {
      // Make sure ScrollTrigger is registered
      gsap.registerPlugin(ScrollTrigger);

      const cards = gsap.utils.toArray(".story-card", pin);
      const texts = gsap.utils.toArray(".story-text", pin);
      const dots = gsap.utils.toArray(".timeline-dot", pin);
      const activeLine = pin.querySelector(".timeline-active-line");

      // --------------------------------------------------
      // DESKTOP
      // --------------------------------------------------
      const desktop = gsap.matchMedia();

      desktop.add("(min-width: 768px)", () => {
        if (!cards.length) return;

        /*
         * IMPORTANT
         * -----------------------------------------------
         * Every card occupies EXACTLY the same position.
         * Card 01 starts visible.
         * Card 02 + 03 start below the viewport.
         */

        gsap.set(cards, {
          position: "absolute",
          inset: 0,
          yPercent: 120,
          autoAlpha: 0,
          scale: 0.96,
          transformOrigin: "center center",
        });

        gsap.set(cards[0], {
          yPercent: 0,
          autoAlpha: 1,
          scale: 1,
        });

        // Text
        gsap.set(texts, {
          position: "absolute",
          inset: 0,
          y: 35,
          autoAlpha: 0,
        });

        gsap.set(texts[0], {
          y: 0,
          autoAlpha: 1,
        });

        // Dots
        gsap.set(dots, {
          scale: 1,
          backgroundColor: "#f9f9f6",
        });

        gsap.set(dots[0], {
          scale: 1.18,
          backgroundColor: "#384c24",
        });

        // Active line
        gsap.set(activeLine, {
          scaleY: 0,
          transformOrigin: "top center",
        });

        /*
         * MASTER TIMELINE
         * -----------------------------------------------
         * 0    = Card 01
         * 1    = Card 02
         * 2    = Card 03
         */

        const tl = gsap.timeline({
          defaults: {
            ease: "power3.inOut",
          },
        });

        // ==============================================
        // CARD 01 → CARD 02
        // ==============================================

        tl.to(
          activeLine,
          {
            scaleY: 0.5,
            duration: 1,
            ease: "none",
          },
          0
        );

        // Move first card UP
        tl.to(
          cards[0],
          {
            yPercent: -120,
            autoAlpha: 0,
            scale: 0.94,
            duration: 1,
          },
          0.7
        );

        // Move first text UP
        tl.to(
          texts[0],
          {
            y: -45,
            autoAlpha: 0,
            duration: 0.7,
          },
          0.7
        );

        // Second card comes FROM BOTTOM
        tl.to(
          cards[1],
          {
            yPercent: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 1,
          },
          0.75
        );

        // Second text
        tl.to(
          texts[1],
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
          },
          0.82
        );

        // Dot 01 off
        tl.to(
          dots[0],
          {
            scale: 1,
            backgroundColor: "#f9f9f6",
            duration: 0.25,
          },
          0.85
        );

        // Dot 02 on
        tl.to(
          dots[1],
          {
            scale: 1.18,
            backgroundColor: "#384c24",
            duration: 0.3,
          },
          1
        );

        // ==============================================
        // CARD 02 → CARD 03
        // ==============================================

        tl.to(
          activeLine,
          {
            scaleY: 1,
            duration: 1,
            ease: "none",
          },
          1.2
        );

        // Move second card UP
        tl.to(
          cards[1],
          {
            yPercent: -120,
            autoAlpha: 0,
            scale: 0.94,
            duration: 1,
          },
          1.85
        );

        // Move second text UP
        tl.to(
          texts[1],
          {
            y: -45,
            autoAlpha: 0,
            duration: 0.7,
          },
          1.85
        );

        // Third card comes FROM BOTTOM
        tl.to(
          cards[2],
          {
            yPercent: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 1,
          },
          1.9
        );

        // Third text
        tl.to(
          texts[2],
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
          },
          1.98
        );

        // Dot 02 off
        tl.to(
          dots[1],
          {
            scale: 1,
            backgroundColor: "#f9f9f6",
            duration: 0.25,
          },
          2
        );

        // Dot 03 on
        tl.to(
          dots[2],
          {
            scale: 1.18,
            backgroundColor: "#384c24",
            duration: 0.3,
          },
          2.1
        );

        /*
         * SCROLLTRIGGER
         * -----------------------------------------------
         *
         * We DO NOT pin the outer section anymore.
         *
         * We pin only the inner timeline.
         */

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",

          // 2 viewport heights of animation
          end: () => `+=${window.innerHeight * 2.4}`,

          pin: pin,

          pinSpacing: false,

          scrub: 1,

          animation: tl,

          anticipatePin: 1,

          invalidateOnRefresh: true,

          markers: false,

          onEnter: () => {
            // Optional debug
            // console.log("Timeline started");
          },

          onLeave: () => {
            // console.log("Timeline finished");
          },
        });

        /*
         * Force ScrollTrigger to calculate positions
         * after everything has rendered.
         */
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });

        return () => {
          trigger.kill();
        };
      });

      // --------------------------------------------------
      // MOBILE
      // --------------------------------------------------

      desktop.add("(max-width: 767px)", () => {
        cards.forEach((card, index) => {
          gsap.set(card, {
            autoAlpha: 1,
            y: 0,
          });

          gsap.fromTo(
            card,
            {
              y: 60,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.8,
              ease: "power3.out",

              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 55%",
                scrub: 0.8,
              },
            }
          );

          gsap.fromTo(
            texts[index],
            {
              y: 30,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,

              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 60%",
                scrub: 0.8,
              },
            }
          );

          ScrollTrigger.create({
            trigger: card,
            start: "top 65%",

            onEnter: () => {
              gsap.to(dots[index], {
                scale: 1.15,
                backgroundColor: "#384c24",
                duration: 0.25,
              });
            },

            onLeaveBack: () => {
              gsap.to(dots[index], {
                scale: 1,
                backgroundColor: "#f9f9f6",
                duration: 0.25,
              });
            },
          });
        });
      });

      // --------------------------------------------------
      // REDUCED MOTION
      // --------------------------------------------------

      desktop.add("(prefers-reduced-motion: reduce)", () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          trigger.disable();
        });

        gsap.set(cards, {
          clearProps: "all",
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });

        gsap.set(texts, {
          clearProps: "all",
          autoAlpha: 1,
          y: 0,
        });
      });

      return () => {
        desktop.revert();
      };
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        w-full
        bg-[#6b3fa0]
        text-[#f4f4f3]
        font-sans
        overflow-hidden
      "
    >
      {/* 
        ===============================================
        OUTER SCROLL SPACE
        ===============================================
      */}

      <div className="relative min-h-[280vh]">

        {/* 
          =============================================
          PINNED AREA
          =============================================
        */}

        <div
          ref={pinRef}
          className="
            timeline-pin
            relative
            min-h-screen
            w-full
            flex
            items-center
          "
        >
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">

            {/* HEADER */}

            <div className="pb-14 md:pb-20">
              <h2
                className="
                  text-4xl
                  md:text-5xl
                  lg:text-6xl
                  text-center
                  font-medium
                  tracking-tight
                "
              >
                How the week{" "}
                <span className="font-serif italic text-[#d4ff3f]">
                  unfolds
                </span>
              </h2>
            </div>

            {/* 
              =========================================
              TIMELINE CONTENT
              =========================================
            */}

            <div
              className="
                grid
                grid-cols-[42px_1fr]
                md:grid-cols-[80px_1fr]
                gap-6
                md:gap-14
                items-start
              "
            >

              {/* =====================================
                  TIMELINE
                  ===================================== */}

              <div
                className="
                  relative
                  h-[520px]
                  md:h-[430px]
                  flex
                  flex-col
                  items-center
                "
              >

                {/* TOP DOT */}

                <div
                  className="
                    timeline-dot
                    w-4
                    h-4
                    rounded-full
                    border-2
                    border-[#384c24]
                    bg-[#f9f9f6]
                    relative
                    z-30
                    shrink-0
                  "
                />

                {/* LINE */}

                <div
                  className="
                    absolute
                    top-2
                    bottom-2
                    left-1/2
                    -translate-x-1/2
                    w-[2px]
                    bg-[#dddeda]
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      timeline-active-line
                      absolute
                      top-0
                      left-0
                      right-0
                      bottom-0
                      bg-[#384c24]
                      origin-top
                    "
                  />
                </div>

                {/* MIDDLE DOT */}

                <div
                  className="
                    timeline-dot
                    absolute
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    rounded-full
                    border-2
                    border-[#384c24]
                    bg-[#f9f9f6]
                    z-30
                  "
                />

                {/* BOTTOM DOT */}

                <div
                  className="
                    timeline-dot
                    absolute
                    bottom-0
                    w-4
                    h-4
                    rounded-full
                    border-2
                    border-[#384c24]
                    bg-[#f9f9f6]
                    z-30
                  "
                />
              </div>

              {/* =====================================
                  STORY CONTENT
                  ===================================== */}

              <div
                className="
                  relative
                  h-[520px]
                  md:h-[430px]
                  min-w-0
                "
              >

                {/* TEXT */}

                <div
                  className="
                    story-text-wrapper
                    relative
                    h-[190px]
                  "
                >
                  {steps.map((step) => (
                    <div
                      key={`text-${step.num}`}
                      className="
                        story-text
                        absolute
                        inset-0
                        max-w-xl
                      "
                    >
                      <span
                        className="
                          text-xs
                          font-bold
                          tracking-[0.2em]
                          text-gray-500
                          mb-4
                          block
                        "
                      >
                        ({step.num})
                      </span>

                      <h3
                        className="
                          text-3xl
                          md:text-4xl
                          lg:text-5xl
                          font-semibold
                          mb-5
                          tracking-tight
                        "
                      >
                        {step.title}
                      </h3>

                      <p
                        className="
                          text-gray-500
                          leading-relaxed
                          text-base
                          md:text-lg
                          max-w-md
                        "
                      >
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 
                  =====================================
                  CARD STACK
                  =====================================
                */}

                <div
                  className="
                    story-card-wrapper
                    absolute
                    left-0
                    right-0
                    top-[185px]
                    md:left-auto
                    md:right-0
                    md:w-[390px]
                    lg:w-[430px]
                    h-[300px]
                    md:h-[300px]
                  "
                >
                  {steps.map((step) => (
                    <div
                      key={`card-${step.num}`}
                      className="
                        story-card
                        absolute
                        inset-0
                        w-full
                      "
                    >
                      {step.card}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
