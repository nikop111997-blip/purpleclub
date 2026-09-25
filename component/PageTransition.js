
"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

const PANDA_SRC = "/retail-character.svg";

const EASE_SMOOTH = [0.22, 1, 0.36, 1];
const EASE_CURTAIN = [0.76, 0, 0.24, 1];

const TransitionContext = createContext(null);

export default function PageTransition({
  children,
}) {
  const router = useRouter();

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  const [targetUrl, setTargetUrl] =
    useState(null);

  const navigate = (url) => {
    if (isTransitioning) return;

    setTargetUrl(url);
    setIsTransitioning(true);

    /*
     * Give the animation enough time
     * to feel smooth and cinematic.
     */
    setTimeout(() => {
      router.push(url);
    }, 1050);

    /*
     * Keep the purple transition over the
     * screen while the new page starts rendering.
     */
    setTimeout(() => {
      setIsTransitioning(false);
      setTargetUrl(null);
    }, 1900);
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
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            {/* =================================================
                PURPLE CURTAIN
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
                duration: 1.35,
                ease: EASE_CURTAIN,
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
                duration: 1.8,
                ease: EASE_SMOOTH,
              }}
            />

            {/* =================================================
                SUBTLE LIGHT FOLLOWING PANDA
               ================================================= */}

            <motion.div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                z-10
                h-[350px]
                w-[350px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-[radial-gradient(circle,rgba(255,255,255,0.10),transparent_65%)]
              "
              initial={{
                x: "65vw",
                opacity: 0,
              }}
              animate={{
                x: "-65vw",
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.8,
                ease: EASE_SMOOTH,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

/*
 * =============================================================
 * HOOK
 * =============================================================
 */

export function usePageTransition() {
  const context = useContext(TransitionContext);

  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransition"
    );
  }

  return context;
}

/*
 * =============================================================
 * TRANSITION LINK
 * =============================================================
 */

export function TransitionLink({
  href,
  children,
  className = "",
  ...props
}) {
  const { navigate, isTransitioning } =
    usePageTransition();

  const handleClick = (e) => {
    /*
     * Let browser handle:
     * Ctrl/Cmd click
     * Middle click
     * Shift click
     * Alt click
     */

    if (
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    e.preventDefault();

    if (isTransitioning) return;

    navigate(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}