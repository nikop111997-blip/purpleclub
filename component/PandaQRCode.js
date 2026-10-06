"use client";

import { useEffect, useRef } from "react";

const PURPLE = "#6a3f9e";
const DARK = "#120d1a";

function buildOptions({ value, size, image }) {
  return {
    width: size,
    height: size,

    type: "svg",

    data: value,

    image,

    /*
     * IMPORTANT
     * Large white quiet-zone around the QR.
     * Browser scanners need this.
     */
    margin: 32,

    /*
     * H = highest error correction.
     * Important because we have a panda image in the center.
     */
    qrOptions: {
      errorCorrectionLevel: "H",
    },

    /*
     * Keep the panda image small.
     * 0.20 is much safer than 0.32 for browser scanners.
     */
    imageOptions: {
      crossOrigin: "anonymous",

      hideBackgroundDots: true,

      imageSize: 0.20,

      margin: 4,

      /*
       * Prevent the image from affecting
       * the finder patterns.
       */
      saveAsBlob: true,
    },

    /*
     * ALWAYS use a white QR background.
     */
    backgroundOptions: {
      color: "#ffffff",
    },

    /*
     * Keep QR dots dark and high contrast.
     *
     * Do NOT use purple/lime gradient here.
     * Some browser QR decoders struggle with
     * low-contrast gradient modules.
     */
    dotsOptions: {
      type: "rounded",

      color: DARK,
    },

    /*
     * Standard square finder patterns.
     *
     * These are extremely important for
     * browser-based QR scanners.
     */
    cornersSquareOptions: {
      type: "square",

      color: DARK,
    },

    cornersDotOptions: {
      type: "square",

      color: DARK,
    },
  };
}

export default function PandaQRCode({
  value,
  size = 500,
  image = "/cheering.png",
  className = "",
}) {
  const containerRef = useRef(null);
  const qrRef = useRef(null);

  useEffect(() => {
    if (!value || !containerRef.current) {
      return;
    }

    let cancelled = false;

    async function generateQR() {
      try {
        const { default: QRCodeStyling } =
          await import("qr-code-styling");

        if (
          cancelled ||
          !containerRef.current
        ) {
          return;
        }

        const options = buildOptions({
          value,
          size,
          image,
        });

        /*
         * First render
         */
        if (!qrRef.current) {
          qrRef.current =
            new QRCodeStyling(options);

          containerRef.current.innerHTML = "";

          qrRef.current.append(
            containerRef.current
          );

          return;
        }

        /*
         * Update existing QR
         */
        qrRef.current.update(options);
      } catch (error) {
        console.error(
          "Panda QR generation error:",
          error
        );
      }
    }

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [value, size, image]);

  if (!value) {
    return null;
  }

  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Panda ears */}

      <div
        className="pointer-events-none absolute left-[4%] top-[3%] z-0 rounded-full"
        style={{
          width: size * 0.20,
          height: size * 0.20,
          backgroundColor: DARK,
        }}
      />

      <div
        className="pointer-events-none absolute right-[4%] top-[3%] z-0 rounded-full"
        style={{
          width: size * 0.20,
          height: size * 0.20,
          backgroundColor: DARK,
        }}
      />

      {/* QR */}

      <div
        ref={containerRef}
        className="relative z-10 overflow-hidden  bg-white"
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
}