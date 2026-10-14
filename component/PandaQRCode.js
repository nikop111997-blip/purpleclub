
"use client";

import { useEffect, useRef } from "react";

const DARK = "#120d1a";

function buildOptions({ value, size, image }) {
  return {
    width: size,
    height: size,
    type: "svg",
    data: String(value).trim(),

    // Keep the panda image optional.
    ...(image ? { image } : {}),

    // White border around the QR for reliable detection.
    margin: 4,

    qrOptions: {
      errorCorrectionLevel: "H",
    },

    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,

      // Keep the center image small.
      imageSize: 0.18,
      margin: 4,
      saveAsBlob: true,
    },

    backgroundOptions: {
      color: "#ffffff",
    },

    // Square modules improve compatibility with scanners.
    dotsOptions: {
      type: "square",
      color: DARK,
    },

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
  size = 220,
  image = "/cheering.png",
  className = "",
}) {
  console.log(value)
  const containerRef = useRef(null);
  const qrRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function generateQR() {
      const container = containerRef.current;

      if (!container || !value || !String(value).trim()) {
        container?.replaceChildren();
        return;
      }

      try {
        const { default: QRCodeStyling } =
          await import("qr-code-styling");

        if (cancelled || !containerRef.current) return;

        const options = buildOptions({
          value,
          size,
          image,
        });

        if (!qrRef.current) {
          qrRef.current = new QRCodeStyling(options);
        } else {
          qrRef.current.update(options);
        }

        // Clear previous output before appending the current QR.
        container.replaceChildren();
        qrRef.current.append(container);
      } catch (error) {
        console.error("Panda QR generation error:", error);
      }
    }

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [value, size, image]);

  if (!value || !String(value).trim()) {
    return null;
  }

  return (
    <div
      className={`mx-auto ${className}`}
      style={{
        width: size,
        height: size,
        maxWidth: "100%",
      }}
    >
      <div
        ref={containerRef}
        role="img"
        aria-label="Member QR code"
        className="overflow-hidden bg-white rounded-2xl"
        style={{
          width: size,
          height: size,
          maxWidth: "100%",
          aspectRatio: "1 / 1",
        }}
      />
    </div>
  );
}
