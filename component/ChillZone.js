"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const sectionsData = [
  {
    title: "Welcome to Purple Club",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Somewhere along the way, being unhealthy became normal. Half of
          India's adults miss the WHO minimum of 150 active minutes a week,
          up from about one in five in 2000. Society celebrates luxury,
          consumption, entertainment and comfort, while being active,
          disciplined and energetic has become unusual. India doesn't need
          another fitness club. It needs a reason to be proud of living well.
        </p>

        <p>
          Meet Purple Club. Created by Kayapalat, it is a coach-led,
          community-powered active lifestyle movement. Trained Kayapalat
          Coaches run weekly Sunday experiences across multiple cities, and
          nobody is asked to join anything. You are invited to an experience,
          and the experience does the selling.
        </p>

        <p>
          Get High on Life. Our tagline is about living, and fitness is only
          part of it. We believe healthy active living is contagious and is
          the new cool. Our mission is to make it fun, social, visible and
          accessible to every Indian, and to build India's largest coach-led
          active lifestyle movement.
        </p>
      </>
    ),
  },

  {
    title: "Why purple?",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Choose to stand apart. Historically, purple has stood for
          distinction, individuality, creativity, non-conformity and the
          courage to stand apart, which is exactly what it takes to live
          differently when being unhealthy is normal. Every great movement has
          a colour, like the Yellow Jersey, the Pink Ribbon, Red Bull and Blue
          Zones. Indian fitness already uses red, black, orange and blue, so
          we chose the one colour nobody owns.
        </p>

        <p>
          Become a Purple Person. Instead of saying “I go to a fitness club”,
          a member says “I am part of the Purple Movement.” Purple People
          stand out, inspire others, and are healthy, active and alive. They
          live by seven core values: move daily, choose growth, lead by
          example, put community first, keep fun in it, celebrate progress,
          and put transformation before transaction.
        </p>
      </>
    ),
  },

  {
    title: "Every Sunday, one ritual",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Show up for the same 90 minutes. Every Sunday follows one standard
          format in every city: welcome and registration, warm-up, a
          signature workout, a community activity, meditation or recovery, a
          Purple fueling experience, a transformation story, an introduction
          to Kayapalat, group photos and a next-event promotion. That
          consistency makes it easy to repeat and easy to trust.
        </p>

        <p>
          Pick your Sunday. One identity, eight experiences: Rise (stair
          climbing, hill workouts, strength endurance), Alive (breathwork,
          meditation, mobility, recovery), Bounce (fun functional fitness,
          games, partner challenges), Unpause (beginner-friendly, special
          invite and comeback day), Party Pace (easy run and walk-run), Speed
          Thrills (sprint challenges), Movement Magic (functional movement
          training) and Smart Strength (stairs plus bodyweight training).
        </p>

        <p>
          Come to the Purple Party. Once a month, the whole community and
          their families come together for dance fitness, music, games,
          recognition, community awards and transformation stories. It costs
          ₹499 and includes 1 free guest pass.
        </p>
      </>
    ),
  },

  {
    title: "From guest to Purple Person",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Start free. Your first experience is complimentary, by invitation
          only, through a Purple Person or a KP Coach. Love it, and you move
          to membership at ₹1,499: the Purple Kit (T-shirt and shaker), four
          Sundays, four new guest passes, a body composition assessment,
          fueling, community and recognition. After that, recharge for ₹1,199
          for four more Sundays, four new guest passes, fueling, community
          and recognition.
        </p>

        <p>
          Bring someone along. Guest passes let you invite someone new every
          Sunday, and members and coaches also get a 20% discount. Everyone
          registers first, 100% online. Members invite friends, bring family
          and share experiences, while coaches host experiences, convert
          prospects and develop leaders.
        </p>

        <p>
          Grow with your impact. Bring 1 new Purple Person and you become a
          Purple Inspirer: “I inspired someone to join PC.” Bring 10 and you
          become a Purple Ambassador: “My lifestyle is becoming contagious.”
          Bring 100 and you become a Purple Icon, the highest recognition in
          the movement.
        </p>
      </>
    ),
  },

  {
    title: "The front door to Kayapalat",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          One loop that keeps feeding itself. Purple Club attracts, Kayapalat
          transforms, and Coaches build communities. Guests who want more move
          into the coaching system, transformed members become Inspirers,
          Ambassadors and Coaches, and local leaders run their own city
          clubs, which fill Purple Club again.
        </p>

        <p>
          Give Coaches a platform. Kayapalat develops Coaches, and Purple Club
          gives them an attraction platform. It is how we build profitable
          Coaches, and how every Coach gets a simple way to invite people to
          experience Kayapalat before asking them to join it.
        </p>

        <p>
          Keep the door wide open. Purple Club is built for everyday Indians:
          busy professionals, business owners, homemakers, parents, students,
          active seniors, and both ex-KP and current KP members. What they are
          all seeking is a healthier lifestyle, community, belonging and
          accountability.
        </p>
      </>
    ),
  },

  {
    title: "Kota first, then city by city",
    bgColor: "#6b3fa0",
    content: (
      <>
        <p>
          Go local. Not one big club in one big city, but a hundred small
          ones, each built by local Coaches and owned by the people who live
          there. The vision is 100 cities with 1,000 members each: one hundred
          thousand active members, in one community, behind one mission.
        </p>

        <p>
          Clear the launch bar. A city is launch-ready when it has 1 Club
          Operator, 10 active Coaches and 50 active KP members, along with a
          venue, an online registration system, a WhatsApp community and four
          or more weeks of promotion. A city launches only after 100
          registrations.
        </p>

        <p>
          Measure everything. City by city, we track total registrations,
          attendance, repeat attendance, referrals, Silver and Gold upgrades,
          guest pass usage, revenue and retention. Every Coach also gets a
          scorecard covering registrations generated, attendees brought,
          Coach opportunity leads, new Coaches and stories captured.
        </p>

        <p>
          Look at year one. The targets are 10 cities, 5,000 Purple Members,
          2,000 Active Members, 500 new Gold Members, 100 new Coaches, 10 new
          Community Builders and 50,000+ monthly social media reach. It starts
          with the Kota beta test on 10 to 11 October 2026, then the official
          launch on 25 October 2026 (tentative) at the KPW Retreat in
          Dehradun.
        </p>
      </>
    ),
  },
];

export default function ChillZone() {
  const componentRef = useRef(null);

  const [bgColor, setBgColor] = useState("#6b3fa0");
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

        <h3
          className="
            text-[min(max(40px,6vw),70px)]
            font-bold
            leading-tight
          "
        >
          THE PURPLE WAY{" "}<br/>
          <u className="underline">
            Live differently.

          </u>{" "}
        </h3>


        <p
          className="
            text-[min(max(16px,4vw),22px)]
            leading-relaxed
            tracking-wide
          "
        >
          Purple Club is for people who choose movement, growth and connection — and believe healthy living should be something you enjoy, not something you endure.
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