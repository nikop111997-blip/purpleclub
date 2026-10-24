
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Mic,
} from "lucide-react";

const VIDEO_ID = "RaeGnFAYQBs";
const PURPLE = "#6b3fa0";
const LIME = "#d4ff3f";
const SKIP = 10;

export default function PurpleExperienceVideo() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const volumeRef = useRef(80);
  const mutedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const getPlayer = () => {
    const player = playerRef.current;

    if (!readyRef.current || !player) return null;

    try {
      return typeof player.getCurrentTime === "function" ? player : null;
    } catch {
      return null;
    }
  };

  const play = useCallback(() => {
    const player = getPlayer();
    if (!player) return;

    try {
      player.playVideo();
      setPlaying(true);
      setMessage("");
    } catch {}
  }, []);

  const pause = useCallback(() => {
    const player = getPlayer();
    if (!player) return;

    try {
      player.pauseVideo();
      setPlaying(false);
    } catch {}
  }, []);

  const togglePlay = useCallback(() => {
    const player = getPlayer();
    if (!player) return;

    try {
      const state = player.getPlayerState();
      const states = window.YT?.PlayerState;

      if (states && state === states.PLAYING) {
        player.pauseVideo();
        setPlaying(false);
      } else {
        player.playVideo();
        setPlaying(true);
      }
    } catch {}
  }, []);

  const seek = useCallback((seconds) => {
    const player = getPlayer();
    if (!player) return;

    try {
      const next = Math.max(
        0,
        Math.min(
          player.getDuration() || duration,
          (player.getCurrentTime() || 0) + seconds
        )
      );

      player.seekTo(next, true);
      setCurrentTime(next);
    } catch {}
  }, [duration]);

  const toggleMute = useCallback(() => {
    const player = getPlayer();
    if (!player) return;

    try {
      if (mutedRef.current) {
        player.unMute();
        player.setVolume(volumeRef.current || 80);
        mutedRef.current = false;
        setMuted(false);
      } else {
        player.mute();
        mutedRef.current = true;
        setMuted(true);
      }
    } catch {}
  }, []);

  const closeModal = useCallback(() => {
    try {
      const player = playerRef.current;
      if (typeof player?.pauseVideo === "function") {
        player.pauseVideo();
      }
    } catch {}

    try {
      recognitionRef.current?.stop();
    } catch {}

    recognitionRef.current = null;
    setListening(false);
    setPlaying(false);
    setMessage("");
    setOpen(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const element = document.getElementById("purple-video-dialog");
    if (!element) return;

    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setMessage("Fullscreen isn't available in this browser.");
    }
  }, []);

  // Initialize the YouTube player once per modal opening.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let poll;
    let createdPlayer = null;

    const initialize = () => {
      if (cancelled || !window.YT?.Player || playerRef.current) return;

      const mount = document.getElementById("purple-youtube-player");
      if (!mount) return;

      try {
        createdPlayer = new window.YT.Player(mount, {
          width: "100%",
          height: "100%",
          videoId: VIDEO_ID,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: (event) => {
              if (cancelled) {
                try {
                  event.target.destroy();
                } catch {}
                return;
              }

              playerRef.current = event.target;
              readyRef.current = true;
              setReady(true);

              try {
                event.target.setVolume(volumeRef.current);
                if (mutedRef.current) event.target.mute();
                event.target.playVideo();
                setPlaying(true);
                setDuration(event.target.getDuration() || 0);
              } catch {}
            },
            onStateChange: (event) => {
              if (cancelled) return;

              const states = window.YT?.PlayerState;
              if (!states) return;

              setPlaying(event.data === states.PLAYING);

              if (event.data === states.ENDED) {
                setPlaying(false);
              }
            },
            onError: () => {
              if (!cancelled) {
                setMessage(
                  "This video can't be embedded or is currently unavailable."
                );
              }
            },
          },
        });

        playerRef.current = createdPlayer;
      } catch {
        if (!cancelled) setMessage("Couldn't load the video. Please try again.");
      }
    };

    if (window.YT?.Player) {
      initialize();
    } else {
      if (!document.querySelector("[data-purple-youtube-api]")) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.dataset.purpleYoutubeApi = "true";
        document.head.appendChild(script);
      }

      const previous = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === "function") previous();
        initialize();
      };

      poll = window.setInterval(() => {
        if (window.YT?.Player) {
          window.clearInterval(poll);
          initialize();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (poll) window.clearInterval(poll);

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const player = playerRef.current || createdPlayer;
      playerRef.current = null;
      readyRef.current = false;

      if (player && typeof player.destroy === "function") {
        try {
          player.destroy();
        } catch {}
      }
    };
  }, [open]);

  // Keep the timeline in sync.
  useEffect(() => {
    if (!open || !ready) return;

    timerRef.current = window.setInterval(() => {
      const player = getPlayer();
      if (!player) return;

      try {
        setCurrentTime(player.getCurrentTime() || 0);
        setDuration(player.getDuration() || 0);
      } catch {}
    }, 300);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [open, ready]);

  // Keyboard shortcuts.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
      ) {
        return;
      }

      if (event.key === "Escape") closeModal();
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        seek(-SKIP);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        seek(SKIP);
      }
      if (event.key.toLowerCase() === "m") toggleMute();
      if (event.key.toLowerCase() === "f") toggleFullscreen();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeModal, togglePlay, seek, toggleMute, toggleFullscreen]);

  useEffect(() => {
    const onFullscreen = () =>
      setFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", onFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  // One-shot voice commands.
  const voiceControl = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage("Voice control works in supported browsers such as Chrome.");
      return;
    }

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage("Listening…");
    };

    recognition.onend = () => setListening(false);

    recognition.onerror = (event) => {
      setListening(false);
      setMessage(
        event.error === "not-allowed"
          ? "Allow microphone access to use voice control."
          : "Didn't catch that. Tap the mic and try again."
      );
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setMessage(`“${command}”`);

      if (/\b(play|resume|start)\b/.test(command)) play();
      else if (/\b(pause|stop)\b/.test(command)) pause();
      else if (/\b(back|backward|rewind|previous)\b/.test(command)) {
        const n = command.match(/(\d+)/);
        seek(-(n ? Number(n[1]) : SKIP));
      } else if (/\b(forward|ahead|skip|next)\b/.test(command)) {
        const n = command.match(/(\d+)/);
        seek(n ? Number(n[1]) : SKIP);
      } else if (/\b(mute|silence)\b/.test(command)) {
        if (!mutedRef.current) toggleMute();
      } else if (/\b(unmute|sound on)\b/.test(command)) {
        if (mutedRef.current) toggleMute();
      } else if (/\b(close|exit)\b/.test(command)) {
        closeModal();
      } else {
        setMessage('Try “play”, “pause”, “forward 10 seconds”, or “back 10 seconds”.');
      }
    };

    try {
      recognition.start();
    } catch {
      setListening(false);
      setMessage("Couldn't start the microphone.");
    }
  }, [listening, play, pause, seek, toggleMute, closeModal]);

  const formatTime = (seconds) => {
    const value = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex min-h-11 items-center font-sans justify-center gap-2 rounded-full border border-[#d4ff3f] bg-[#d4ff3f] px-6 py-2 text-sm font-bold text-black transition duration-200 hover:-translate-y-0.5 hover:bg-[#b8e02a] sm:px-8 sm:text-base"
      >
        Preview Purple Experience
        <Play size={16} className="transition-transform group-hover:scale-110" />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="purple-video-overlay fixed inset-0 flex items-center justify-center overflow-y-auto p-3 sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <div
              id="purple-video-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Purple Experience video"
              className="purple-video-dialog relative w-full max-w-5xl overflow-hidden rounded-[26px] border border-white/20 bg-[#6b3fa0]/95 shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:rounded-[32px]"
            >
              {/* Minimal header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-2">
             

                
              </div>

              {/* Cropped video with progress overlay */}
              <div className="px-2 pb-2 sm:px-4 sm:pb-4">
                <div className="purple-video-stage relative overflow-hidden rounded-[20px] bg-black sm:rounded-[24px]">
                  <div className="purple-video-crop absolute inset-0">
                    <div
                      id="purple-youtube-player"
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>

                  {!ready && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#241535]/80 px-5 text-center">
                      {message ? (
                        <p className="max-w-md text-sm text-white/90">{message}</p>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#d4ff3f]" />
                          <p className="text-sm font-medium text-white/80">
                            Loading your experience…
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Play overlay when paused */}
                  {ready && !playing && (
                    <button
                      type="button"
                      onClick={play}
                      aria-label="Play video"
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black/10"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d4ff3f] text-[#6b3fa0] shadow-xl transition hover:scale-110 sm:h-20 sm:w-20">
                        <Play size={30} fill="currentColor" className="ml-1" />
                      </span>
                    </button>
                  )}

                  {/* Progress bar overlays the bottom edge of the video */}
                  <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-3 pt-8 sm:px-5 sm:pb-4">
                    <input
                      type="range"
                      aria-label="Video progress"
                      min={0}
                      max={Math.max(duration, 1)}
                      step={1}
                      value={Math.min(currentTime, duration || 0)}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setCurrentTime(value);

                        const player = getPlayer();
                        try {
                          player?.seekTo(value, true);
                        } catch {}
                      }}
                      className="purple-video-progress w-full"
                      style={{
                        "--progress": `${
                          duration ? (currentTime / duration) * 100 : 0
                        }%`,
                      }}
                    />

                    <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold tabular-nums text-white/85">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Compact controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-3 sm:px-2 sm:pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => seek(-SKIP)}
                      disabled={!ready}
                      aria-label="Back 10 seconds"
                      title="Back 10 seconds"
                      className="purple-control"
                    >
                      <SkipBack size={19} />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      disabled={!ready}
                      aria-label={playing ? "Pause" : "Play"}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4ff3f] text-[#6b3fa0] transition hover:scale-105 hover:bg-[#e6ff8a] disabled:opacity-50"
                    >
                      {playing ? (
                        <Pause size={22} fill="currentColor" />
                      ) : (
                        <Play size={22} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => seek(SKIP)}
                      disabled={!ready}
                      aria-label="Forward 10 seconds"
                      title="Forward 10 seconds"
                      className="purple-control"
                    >
                      <SkipForward size={19} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleMute}
                      disabled={!ready}
                      aria-label={muted ? "Unmute" : "Mute"}
                      className="purple-control"
                    >
                      {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                    </button>

                    <button
                      type="button"
                      onClick={voiceControl}
                      aria-label="Voice control"
                      title="Voice commands"
                      className={`flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-bold transition ${
                        listening
                          ? "border-[#d4ff3f] bg-[#d4ff3f] text-[#6b3fa0]"
                          : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Mic size={17} className={listening ? "animate-pulse" : ""} />
                      <span className="hidden sm:inline">
                        {listening ? "Listening" : "Voice"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                      className="purple-control"
                    >
                      {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                    <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close video"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"
                >
                  <X size={16} />
                </button>
                  </div>
                </div>

                {message && ready && (
                  <p aria-live="polite" className="px-2 pt-2 text-xs text-white/75">
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      <style jsx global>{`
        .purple-video-overlay {
          z-index: 2147483647;
          background: rgba(17, 10, 25, 0.48);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          animation: purple-overlay-in 180ms ease-out;
        }

        .purple-video-dialog {
          animation: purple-dialog-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .purple-video-stage {
          aspect-ratio: 16 / 9;
          isolation: isolate;
        }

        /*
          Slightly enlarge and vertically offset the iframe.
          Adjust scale/translateY to tune the crop for this video.
        */
        .purple-video-crop {
          overflow: hidden;
          inset: -5% 0;
          height: 110%;
        }

        .purple-video-crop iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: scale(1.08) translateY(-0.5%);
          transform-origin: center center;
          border: 0;
        }

        .purple-control {
          display: inline-flex;
          height: 40px;
          width: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.09);
          color: white;
          transition: background 160ms ease, transform 160ms ease;
        }

        .purple-control:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.19);
          transform: translateY(-1px);
        }

        .purple-control:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .purple-video-progress {
          appearance: none;
          -webkit-appearance: none;
          display: block;
          height: 5px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
          background: linear-gradient(
            to right,
            ${LIME} 0%,
            ${LIME} var(--progress, 0%),
            rgba(255, 255, 255, 0.4) var(--progress, 0%),
            rgba(255, 255, 255, 0.4) 100%
          );
        }

        .purple-video-progress::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 0;
          background-color: transparent;
          background-image: url("/runn.png");
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          box-shadow: none;
          cursor: grab;
        }

        .purple-video-progress:active::-webkit-slider-thumb {
          cursor: grabbing;
        }

        .purple-video-progress::-moz-range-thumb {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 0;
          background-color: transparent;
          background-image: url("/images/purple-progress-dot.png");
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          box-shadow: none;
          cursor: grab;
        }

        .purple-video-overlay button:focus-visible,
        .purple-video-overlay input:focus-visible {
          outline: 2px solid ${LIME};
          outline-offset: 3px;
        }

        @keyframes purple-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes purple-dialog-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .purple-video-overlay,
          .purple-video-dialog {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
