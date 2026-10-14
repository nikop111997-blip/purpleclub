"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, LoaderCircle, QrCode } from "lucide-react";
import PandaQRCode from "@/component/PandaQRCode";

export default function MemberQrCard({
  name = "Purple Member",
  profession = "Purple Member",
  memberQrCode,
  photo = "/cheering.png",
  expiryDate = "Not set",
  brand = "purple",
}) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const downloadCard = async () => {
    if (!cardRef.current || downloading) return;

    try {
      setDownloading(true);

      // Wait for fonts and images before generating the PNG.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#20388F",
        skipAutoScale: true,
      });

      const link = document.createElement("a");
      link.download = `${name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "") || "member"}-membership-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Unable to download membership card:", error);
      alert(
        "Unable to download the card. Please try again or check the browser console."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[400px]">
      {/* Membership card: this element is exported as an image */}
      <div
        ref={cardRef}
        className="relative isolate aspect-[380/570] w-full overflow-hidden rounded-[22px] bg-[#6a3f9e] p-[7%] text-white shadow-[0_24px_55px_rgba(20,35,100,0.25)]"
      >
        {/* Abstract blue wave background */}
        <svg
          aria-hidden="true"
          viewBox="0 0 380 570"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        >
          <rect width="380" height="870" fill="#20388F" />
          <path
            d="M-30 25 C25 0 23 95 73 70 S142 20 183 62 S244 93 283 48 S355 13 392 67 L410 125 C350 85 321 160 268 135 S190 100 151 146 S65 175 15 140 L-30 158Z"
            fill="#4035A0"
            opacity=".55"
          />
          <path
            d="M-25 175 C35 130 63 205 112 185 S175 145 217 178 S297 216 335 178 S389 183 405 206 L400 260 C343 226 307 276 255 248 S181 225 132 260 S47 286 -25 253Z"
            fill="#352C91"
            opacity=".75"
          />
          <path
            d="M-30 325 C20 285 40 360 95 337 S166 303 215 336 S302 370 342 328 S393 345 405 365 L405 422 C342 388 307 438 248 408 S171 385 126 421 S42 440 -30 410Z"
            fill="#4035A0"
            opacity=".55"
          />
          <path
            d="M-25 465 C40 425 57 499 110 477 S184 445 224 480 S308 513 352 474 S393 482 405 501 L405 590 L-25 590Z"
            fill="#171F75"
            opacity=".45"
          />
          <path
            d="M15 0 C55 36 30 72 72 65 S139 26 172 60 S232 78 270 44 S338 15 370 56"
            fill="none"
            stroke="#5147BA"
            strokeWidth="13"
            opacity=".35"
          />
        </svg>

        {/* Header: name and QR code */}
        <div className="relative flex h-[25%] items-start justify-between gap-2">
          <div className="min-w-0 flex-1 pt-[12%]">
            <h2
              className="break-words text-[clamp(24px,7vw,42px)] font-normal leading-[0.94] tracking-[-0.055em] text-white"
              style={{
                overflowWrap: "anywhere",
              }}
            >
              {name}
            </h2>

            <div className="mt-3 inline-flex max-w-full bg-white/20 rounded-full border border-white/30 px-2.5 py-1">
              <span className="truncate text-[10px] font-semibold tracking-wide text-white">
                {profession}
              </span>
            </div>
          </div>

          <div className="mt-[10%] flex w-[30%] shrink-0 items-center justify-center rounded-lg bg-white ">
            {memberQrCode ? (
              <PandaQRCode
                value={String(memberQrCode).trim()}
                size={100}
                image="/cheering.png"
              />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center bg-white text-[#20388F]">
                <QrCode size={28} />
                <span className="mt-1 text-[8px] font-bold">
                  Unavailable
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Member photograph */}
        <div className="absolute left-[7%] right-[7%] top-[31%] h-[47%]  ">
          {!imageError && photo ? (
            <img
              src={photo}
              alt={`${name} membership portrait`}
              crossOrigin="anonymous"
              onError={() => setImageError(true)}
              className="h-70 w-80 object-cover"
              style={{
                display: "block",
              }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#EEEEEE] text-[#20388F]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#20388F]/10">
                <span className="text-3xl font-bold">
                  {name?.trim()?.charAt(0)?.toUpperCase() || "P"}
                </span>
              </div>
              <span className="text-xs font-semibold">
                Member portrait
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-[5%] left-[7%] right-[7%] flex items-end justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <img src="/logo.png" className="h-[30px]" />
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[9px] font-bold uppercase tracking-wide text-white/80">
              Expiry Date
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-white">
              {expiryDate}
            </p>
          </div>
        </div>
      </div>

      {/* Download button is intentionally outside the exported card */}
      <button
        type="button"
        onClick={downloadCard}
        disabled={downloading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6a3f9e] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#2D48AA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {downloading ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          <Download size={18} />
        )}
        {downloading ? "Preparing image..." : "Download membership card"}
      </button>

      <p className="mt-2 text-center text-xs text-gray-500">
        Download a high-resolution PNG of your membership card.
      </p>
    </section>
  );
}