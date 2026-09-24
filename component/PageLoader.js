"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "framer-motion";

const LOGO_SRC = encodeURI("/logo.png");
const PANDA_SRC = encodeURI("/retail-character.svg");

const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_SLIDE = [0.22, 1, 0.36, 1];
const EASE_CURTAIN = [0.76, 0, 0.24, 1];

const PANDA_HOLD_MS = 700;
const COUNT_SECONDS = 2;
const HOLD_MS = 250;

const FRONT_COLOR = "#6B3FA0";
const BACK_COLOR = "#3d2263";

export default function PageLoader() {
  const reduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  /*
   * ============================================================
   * PANDA HOLD
   * ============================================================
   *
   * Panda appears in the center first.
   * After a short delay, the logo appears and
   * the panda smoothly moves to the RIGHT.
   */

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setShowLogo(true);
      },
      reduceMotion ? 0 : PANDA_HOLD_MS
    );

    return () => clearTimeout(timer);
  }, [reduceMotion]);

  /*
   * ============================================================
   * PROGRESS
   * ============================================================
   */

  useEffect(() => {
    let holdTimer;

    const controls = animate(0, 100, {
      duration: reduceMotion ? 0.5 : COUNT_SECONDS,
      ease: EASE_SLIDE,

      onUpdate: (value) => {
        setCount(Math.round(value));
      },

      onComplete: () => {
        holdTimer = setTimeout(() => {
          setLoading(false);
        }, HOLD_MS);
      },
    });

    return () => {
      controls.stop();
      clearTimeout(holdTimer);
    };
  }, [reduceMotion]);

  /*
   * ============================================================
   * CURTAIN EXIT
   * ============================================================
   */

  const frontExit = reduceMotion
    ? {
        opacity: 0,
        transition: {
          duration: 0.3,
        },
      }
    : {
        y: "-100%",
        transition: {
          duration: 0.9,
          ease: EASE_CURTAIN,
        },
      };

  const backExit = reduceMotion
    ? {
        opacity: 0,
        transition: {
          duration: 0.3,
        },
      }
    : {
        y: "-100%",
        transition: {
          duration: 0.9,
          delay: 0.08,
          ease: EASE_CURTAIN,
        },
      };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="page-loader"
          role="status"
          aria-label="Loading"
          className="
            fixed
            inset-0
            z-[999999]
            h-[100dvh]
            w-full
            overflow-hidden
            overscroll-none
          "
          style={{
            height: "100dvh",
            width: "100%",
            maxWidth: "100%",
            touchAction: "none",
          }}
        >
          {/* =====================================================
              BACK CURTAIN
             ===================================================== */}

          <motion.div
            className="
              absolute
              inset-0
              h-full
              w-full
              overflow-hidden
            "
            exit={backExit}
          >
            <div
              className="
                absolute
                inset-0
                h-full
                w-full
              "
              style={{
                backgroundColor: BACK_COLOR,
              }}
            />
          </motion.div>

          {/* =====================================================
              FRONT CURTAIN
             ===================================================== */}

          <motion.div
            className="
              absolute
              inset-0
              h-full
              w-full
              overflow-hidden
            "
            exit={frontExit}
          >
            <div
              className="
                relative
                flex
                h-full
                w-full
                flex-col
                items-center
                justify-center
                overflow-hidden
              "
              style={{
                backgroundColor: FRONT_COLOR,
              }}
            >
              {/* =================================================
                  BACKGROUND GLOW
                 ================================================= */}

              <motion.div
                className="
                  pointer-events-none
                  absolute
                  -left-[25%]
                  -top-[30%]
                  h-[80vmax]
                  w-[80vmax]
                  rounded-full
                  bg-[radial-gradient(circle,rgba(150,105,210,0.5),transparent_65%)]
                "
                animate={
                  reduceMotion
                    ? {}
                    : {
                        x: [0, 60, 0],
                        y: [0, 40, 0],
                      }
                }
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="
                  pointer-events-none
                  absolute
                  -bottom-[30%]
                  -right-[25%]
                  h-[70vmax]
                  w-[70vmax]
                  rounded-full
                  bg-[radial-gradient(circle,rgba(40,18,72,0.55),transparent_65%)]
                "
                animate={
                  reduceMotion
                    ? {}
                    : {
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                      }
                }
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* =================================================
                  DOT TEXTURE
                 ================================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  opacity-50
                "
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",

                  maskImage:
                    "radial-gradient(ellipse at center, black 15%, transparent 70%)",

                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 15%, transparent 70%)",
                }}
              />

              {/* =================================================
                  LOGO + PANDA
                 ================================================= */}

              <div
                className="
                  relative
                  z-10
                  flex
                  items-center
                  justify-center
                "
              >
                {/* =================================================
                    LOGO
                    Appears on the LEFT
                   ================================================= */}

                <AnimatePresence>
                  {showLogo && (
                    <motion.div
                      className="
                        relative
                        z-20
                        w-[150px]
                        -mr-[18px]
                        sm:w-[220px]
                        sm:-mr-[10px]
                        md:w-[260px]
                      "
                      initial={
                        reduceMotion
                          ? {
                              opacity: 0,
                            }
                          : {
                              opacity: 0,
                              x: 50,
                              clipPath: "inset(0 0 0 100%)",
                            }
                      }
                      animate={
                        reduceMotion
                          ? {
                              opacity: 1,
                            }
                          : {
                              opacity: 1,
                              x: 0,
                              clipPath: "inset(0 0 0 0%)",
                            }
                      }
                      exit={{
                        opacity: 0,
                      }}
                      transition={{
                        duration: reduceMotion ? 0 : 1.05,
                        delay: 0.05,
                        ease: EASE_SLIDE,
                      }}
                    >
                      <img
                        src={LOGO_SRC}
                        alt="Purple Club"
                        draggable={false}
                        className="
                          block
                          h-auto
                          w-full
                          select-none
                        "
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* =================================================
                    PANDA
                    Starts CENTER → moves RIGHT
                   ================================================= */}

                <motion.img
                  src={PANDA_SRC}
                  alt=""
                  draggable={false}
                  className="
                    relative
                    z-30
                    h-auto
                    w-[115px]
                    select-none
                    drop-shadow-[0_18px_35px_rgba(0,0,0,0.28)]
                    sm:w-[150px]
                    md:w-[180px]
                    lg:w-[200px]
                  "
                  initial={{
                    opacity: 0,
                    scale: reduceMotion ? 1 : 0.75,
                    x: 0,
                    y: reduceMotion ? 0 : 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,

                    /*
                     * CENTER → RIGHT
                     */
                    x: showLogo
                      ? reduceMotion
                        ? 35
                        : 55
                      : 0,
                  }}
                  transition={{
                    opacity: {
                      duration: 0.7,
                      ease: EASE_OUT,
                    },

                    scale: {
                      duration: 0.9,
                      ease: EASE_OUT,
                    },

                    y: {
                      duration: 0.9,
                      ease: EASE_OUT,
                    },

                    x: {
                      duration: reduceMotion ? 0 : 1.15,
                      ease: EASE_SLIDE,
                    },
                  }}
                />
              </div>

              {/* =================================================
                  PROGRESS
                 ================================================= */}

              <motion.div
                className="
                  relative
                  z-10
                  mt-10
                  flex
                  flex-col
                  items-center
                  gap-3
                "
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.4,
                }}
              >
                {/* Progress line */}

                <div
                  className="
                    h-px
                    w-32
                    overflow-hidden
                    bg-white/20
                    sm:w-40
                  "
                >
                  <motion.div
                    className="
                      h-full
                      origin-left
                      bg-white
                    "
                    style={{
                      width: `${count}%`,
                    }}
                  />
                </div>

                {/* Counter */}

                <span
                  className="
                    text-[10px]
                    font-light
                    tabular-nums
                    tracking-[0.4em]
                    text-white/60
                  "
                >
                  {String(count).padStart(3, "0")}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}