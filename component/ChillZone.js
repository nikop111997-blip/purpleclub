"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const sectionsData = [
  {
    title: "Welcome to the chill zone",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Do your own thing, and let others do theirs. If they're not hurting
          anyone, what's the problem? Chill people don't look for reasons or
          opportunities to hate on others just for being different. There's no
          reason to bully or tread on other people's territory. Try to be happy
          with yourself and encourage self-love in others, too and remember be
          yourself.
        </p>

        <p>
          Unless someone is rude to you, your day should go by smoothly by
          being polite, considerate, and nice. Chill people don't antagonize
          for the sake of it or stir up a bunch of negative emotions by being
          jerks; chill people are generally kind and get along well with
          others. However, try to avoid going overboard so you don't become a
          people-pleaser or pushover.
        </p>

        <p>
          Don't sweat the small stuff. Take your life in stride. Roll with the
          punches and be accepting of the little things life throws your way,
          reserving your passion for what matters to you most. This is pretty
          much the defining feature of a chill person.
        </p>
      </>
    ),
  },

  {
    title: "Prepare your chill",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Be fun to hang out with. Don't be someone who is really boring and
          afraid to try new things. Go out and do stuff you consider fun and be
          someone that other people want to spend time with. Talk with people,
          go see movies, play games, go on hikes or go camping: it's all good!
        </p>

        <p>
          Make and follow your own trends. Be unique. A chill person doesn't
          feel the need to follow all the trends set by others, they just do
          what they want and what makes them happy. This laid back attitude
          inspires others to be more laid back and people will want to be
          around you more often.
        </p>
      </>
    ),
  },

  {
    title: "The best chills are those most chilled",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Pick your battles. Some things in life are bound to upset or anger
          you, and while it's okay to have those feelings, it's best not to
          nosedive into every argument that presents itself. Stop, take a deep
          breath, and decide whether an unpleasant situation is worth getting
          into. Catch yourself before you get stuck in a pointless argument or
          a big scene. From here, you can redirect the situation to be in your
          favor.
        </p>

        <p>
          Redirect your thoughts. Distract yourself from your immediate
          feelings by redirecting your thoughts. There are lots of ways you can
          do this. You can count your breaths. You can even sing a song (inside
          your head is probably better than out loud).
        </p>
      </>
    ),
  },

  {
    title: "Chill all day and night",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Chew some gum. Studies have shown that we can reduce a significant
          amount of stress by chewing gum. Pop a stick of that winter fresh if
          you’re just not feeling calm in the moment.
        </p>

        <p>
          Evaluate how much this matters. Think about how much your problem
          matters in the grand scheme of things. Will it still affect you a
          year from now? Does it even help to be so hard on yourself? If you
          made it out alive, chances are you’ll find a way to get through it
          and move on to more happiness and hardships.
        </p>

        <p>
          Do what your grandma would do. By the time we’re much older, we
          usually don’t get so worried when things don’t go our way, because we
          get used to it. Think of how your grandma would react in a situation
          and do that. She’d probably say something funny and then move on to
          the next thing, which is really the best thing to do if you want to
          stay sane.
        </p>
      </>
    ),
  },

  {
    title: "When the chill gets chiller",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Go somewhere else. If you just can’t handle the situation, take
          yourself out of it. No reason to stick around if you’re going to lose
          your cool and make some mistakes. Remove yourself from the room for a
          few minutes and then try again once you’ve managed to work through
          the initial anger or fear (or whatever you’re feeling).
        </p>

        <p>
          Stay away from toxic people and situations. Avoiding such things is
          the best way to be chill in life. Just say no to all the bullies,
          liars, and trash-talkers. You don’t need that in your life! Cut toxic
          people out of your life and don’t go around causing trouble yourself.
        </p>

        <p>
          Get proactive. There's a difference between being chill and being
          passive. Instead of sitting around thinking your problems could be
          worse, always try to make things better for yourself. It'll be a lot
          easier to be genuinely laid-back when you're satisfied with your life
          as opposed to settling for less.
        </p>
      </>
    ),
  },

  {
    title: "Should I bring a jacket?",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Maybe. But be confident. When you have lots of self confidence and
          comfort with who you are, you will have a much easier time being
          chill. You will know that it’s okay if you make a mistake, that it
          doesn’t make you worthless or something like that. You will know you
          can handle whatever crazy life manages to throw at you.
        </p>

        <p>
          Find enjoyment in life. Do things in life that make you happy. Don’t
          do things that stress you out just to accommodate others and not
          yourself. Doing things that make you happy will make you more calm
          and relaxed, helping you deal with all your problems in a better way.
        </p>

        <p>
          Ignore ignorant opinions. Not caring what others think will make many
          situations in your life less stressful, like arguments and rumors.
        </p>

        <p>
          Keep a sense of humor. You’ve got to laugh about stuff in life,
          especially the stuff that doesn’t go your way, or you’re going to
          spend life grumpy and stressed out. When someone is a jerk to you,
          relieve your anger through humor. Just laugh at them because they are
          clearly very boring and miserable.
        </p>
      </>
    ),
  },
];

export default function ChillZone() {
  const componentRef = useRef(null);

  const [bgColor, setBgColor] = useState("#151818");
  const [marqueeText, setMarqueeText] = useState("");
  const [fadeMarquee, setFadeMarquee] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(-1);

  const activeTextRef = useRef("");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* =====================================================
         TOP / BOTTOM MARQUEE ANIMATION
      ===================================================== */

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".horizontal-marquee", {
          xPercent: -50,
          ease: "none",

          scrollTrigger: {
            trigger: componentRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.25,
          },
        });

        gsap.to(".vertical-marquee", {
          yPercent: -50,
          ease: "none",

          scrollTrigger: {
            trigger: componentRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.25,
          },
        });
      });

      /* =====================================================
         SECTION TRIGGERS
      ===================================================== */

      const headings = gsap.utils.toArray(
        ".page-content__section h2"
      );

      headings.forEach((heading, index) => {
        ScrollTrigger.create({
          trigger: heading,

          start: "top center",
          end: "bottom 200px",

          toggleActions: "play reset play reset",

          onEnter: () => {
            activateSection(
              heading.textContent,
              index
            );
          },

          onEnterBack: () => {
            activateSection(
              heading.textContent,
              index
            );
          },
        });
      });

      ScrollTrigger.refresh();
    }, componentRef);

    return () => {
      ctx.revert();
    };
  }, []);

  /* =====================================================
     CHANGE ACTIVE SECTION
  ===================================================== */

  const activateSection = (title, index) => {
    if (activeTextRef.current !== title) {
      activeTextRef.current = title;

      setBgColor(
        sectionsData[index].bgColor
      );

      setActiveSectionIndex(index);

      setFadeMarquee(true);

      setTimeout(() => {
        setMarqueeText(title);
        setFadeMarquee(false);
      }, 300);
    }
  };

  /* =====================================================
     MARQUEE STYLE
  ===================================================== */

  const dynamicMarqueeStyle = {
    backgroundColor: '#6b3fa0',
    boxShadow: `#6b3fa0 0 2vmin 2vmin 1vmin`,
  };

  return (
    <section
      ref={componentRef}
      style={{
        backgroundColor: bgColor,
      }}
      className="
        relative
        w-full
        text-slate-100
        font-sans
        transition-colors
        duration-300
      "
    >


      <div
        className="
          sticky
          top-0
          h-screen
          w-full
          pointer-events-none
          z-50
        "
      >

        {/* =================================================
            TOP FRAME
        ================================================= */}

        <div
          style={dynamicMarqueeStyle}
          className="
            absolute
            top-0
            left-0
            w-full
            h-[clamp(28px,4vw,55px)]
            overflow-hidden
            flex
            items-center
          "
        >
          <div
            className={`
              horizontal-marquee
              flex
              whitespace-nowrap
              font-bold
              text-[min(max(12px,2vw),22px)]
              leading-none
              transition-opacity
              duration-300

            
            `}
          >
            {Array.from({ length: 15 }).map((_, index) => (
  <span
    key={index}
    className="inline-flex items-center gap-4 mx-4"
  >
    <span>purpleclub</span>

    <img
      src="/retail-character.svg"
      alt=""
      className="w-8 h-8 object-contain mr-2"
      draggable="false"
    />
  </span>
))}
          </div>
        </div>


        {/* =================================================
            RIGHT FRAME
        ================================================= */}

        <div
          style={dynamicMarqueeStyle}
          className="
            absolute
            top-0
            right-0
            h-full
            w-[clamp(28px,4vw,55px)]
            overflow-hidden
            flex
            items-center
            justify-center
          "
        >
          <div
            className={`
              vertical-marquee
              whitespace-nowrap
              font-bold
              tracking-[0.25rem]
              text-[min(max(12px,2vw),22px)]
              leading-none
              transition-opacity
              duration-300

            
            `}
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
              {Array.from({ length: 15 }).map((_, index) => (
  <span
    key={index}
    className="inline-flex items-center gap-4 mx-4"
  >
    <span>purpleclub</span>

    <img
      src="/retail-character.svg"
      alt=""
      className="w-8 h-8 object-contain mr-2"
      draggable="false"
    />
  </span>
))}
          </div>
        </div>


        {/* =================================================
            BOTTOM FRAME
        ================================================= */}

        <div
          style={dynamicMarqueeStyle}
          className="
            absolute
            bottom-0
            left-0
            w-full
            h-[clamp(28px,4vw,55px)]
            overflow-hidden
            flex
            items-center
          "
        >
          <div
            className={`
              horizontal-marquee
              flex
              whitespace-nowrap
              font-bold
              tracking-[0.25rem]
              text-[min(max(12px,2vw),22px)]
              leading-none
              transition-opacity
              duration-300

             
            `}
            style={{
              transform: "rotate(180deg)",
            }}
          >
              {Array.from({ length: 15 }).map((_, index) => (
  <span
    key={index}
    className="inline-flex items-center gap-4 mx-4"
  >
    <span>purpleclub</span>

    <img
      src="/retail-character.svg"
      alt=""
      className="w-8 h-8 object-contain mr-2"
      draggable="false"
    />
  </span>
))}
          </div>
        </div>


        {/* =================================================
            LEFT FRAME
        ================================================= */}

        <div
          style={dynamicMarqueeStyle}
          className="
            absolute
            top-0
            left-0
            h-full
            w-[clamp(28px,4vw,55px)]
            overflow-hidden
            flex
            items-center
            justify-center
          "
        >
          <div
            className={`
              vertical-marquee
              whitespace-nowrap
              font-bold
              tracking-[0.25rem]
              text-[min(max(12px,2vw),22px)]
              leading-none
              transition-opacity
              duration-300

             
            `}
            style={{
              writingMode: "vertical-rl",
            }}
          >
              {Array.from({ length: 15 }).map((_, index) => (
  <span
    key={index}
    className="inline-flex items-center gap-4 mx-4"
  >
    <span>purpleclub</span>

    <img
      src="/retail-character.svg"
      alt=""
      className="w-8 h-8 object-contain mr-2"
      draggable="false"
    />
  </span>
))}
          </div>
        </div>

      </div>


      {/* =====================================================
          CONTENT

          Negative margin puts the content INSIDE the
          sticky frame rather than below it.
      ===================================================== */}

      <main
        className="
          page-content
          relative
          z-20
          max-w-[90ch]
          mx-auto

          px-[clamp(55px,7vw,100px)]

          pt-[clamp(100px,12vw,160px)]
          pb-[clamp(100px,12vw,160px)]

          flex
          flex-col
          gap-10

          -mt-[100vh]
        "
      >

        {/* =================================================
            INTRO
        ================================================= */}

        <h1
          className="
            text-[min(max(40px,6vw),70px)]
            font-bold
            leading-tight
          "
        >
          You'll{" "}
          <u className="underline">
            never
          </u>{" "}
          believe how chill it is!
        </h1>


        <p
          className="
            text-[min(max(16px,4vw),22px)]
            leading-relaxed
            tracking-wide
          "
        >
          The chill zone is where all the things are
          copacetic. Think about all the unchill things
          in your life. Think about them, just for a
          moment. And now? Just forget about 'em. Why?
          Because, my friend: you've just entered the{" "}
          <em className="italic">
            Chill Zone
          </em>
          . The following passages of text are pulled
          from this{" "}
          <a
            href="https://www.wikihow.com/Be-Chill"
            target="_blank"
            rel="noreferrer"
            className="
              text-[#ecf232]
              hover:underline
            "
          >
            wikiHow article
          </a>
          .
        </p>


        {/* =================================================
            SECTIONS
        ================================================= */}

        {sectionsData.map(
          (section, index) => (
            <section
              key={index}
              className={`
                page-content__section
                flex
                flex-col
                gap-10
                mt-12

                transition-opacity
                duration-300
                ease-out

                ${
                  activeSectionIndex === index
                    ? "opacity-100 is-active"
                    : "opacity-50"
                }
              `}
            >

              <h2
                className="
                  text-[min(max(30px,4vw),50px)]
                  font-bold
                  leading-tight
                  mt-12
                  origin-bottom
                "
              >
                {section.title}
              </h2>


              <div
                className="
                  flex
                  flex-col
                  gap-10
                  text-[min(max(16px,4vw),22px)]
                  leading-relaxed
                  tracking-wide
                "
              >
                {section.content}
              </div>

            </section>
          )
        )}

      </main>


      {/* =====================================================
          HEADING ANIMATION
      ===================================================== */}

      <style
        dangerouslySetInnerHTML={{
          __html: `

            .page-content__section.is-active h2 {
              animation:
                activateHeading
                600ms
                cubic-bezier(0.33, 1, 0.68, 1)
                forwards;
            }

            @keyframes activateHeading {

              25% {
                color: #ecf232;
                transform: translateY(-12px);
              }

              40% {
                transform: translateY(2px);
              }

              50% {
                transform: translateY(-4px);
              }

              60% {
                color: inherit;
                transform: translateY(1px);
              }

              65%,
              100% {
                opacity: 1;
                transform: translateY(0);
              }

            }

            @media (prefers-reduced-motion: reduce) {

              .page-content__section.is-active h2 {
                animation: none;
                color: #ecf232;
              }

            }

          `,
        }}
      />

    </section>
  );
}