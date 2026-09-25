
"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";

const TransitionContext = createContext(null);

const PANDA_SRC = "/retail-character.svg";

const EASE = [0.22, 1, 0.36, 1];
const CURTAIN_EASE = [0.76, 0, 0.24, 1];

export function PageTransitionProvider({ children }) {
  const router = useRouter();

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  const navigate = (href) => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    /*
     * Panda starts on the right
     * and travels to the left.
     */

    setTimeout(() => {
      router.push(href);
    }, 700);

    /*
     * Remove transition after
     * new page starts rendering.
     */

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1400);
  };

  return (
    <TransitionContext.Provider
      value={{
        navigate,
        isTransitioning,
      }}
    >
      {children}

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="page-transition"
            className="
              pointer-events-none
              fixed
              inset-0
              z-[999999]
              h-[100dvh]
              w-full
              overflow-hidden
            "
          >
            {/* =================================================
                PURPLE BACKGROUND
               ================================================= */}

            <motion.div
              className="
                absolute
                inset-0
                h-full
                w-full
              "
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                duration: 0.65,
                ease: CURTAIN_EASE,
              }}
              style={{
                backgroundColor: "#6B3FA0",
              }}
            />

            {/* =================================================
                PANDA
               ================================================= */}

            <motion.img
              src={PANDA_SRC}
              alt=""
              draggable={false}
              className="
                absolute
                left-1/2
                top-1/2
                z-20
                w-[115px]
                -translate-x-1/2
                -translate-y-1/2
                select-none
                drop-shadow-[0_18px_35px_rgba(0,0,0,0.28)]
                sm:w-[150px]
                md:w-[180px]
                lg:w-[200px]
              "
              initial={{
                x: "65vw",
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                x: "-65vw",
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 1.05,
                ease: EASE,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(TransitionContext);

  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider"
    );
  }

  return context;
}
