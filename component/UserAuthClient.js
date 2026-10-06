"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Smartphone,
  User,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   THEME TOKENS
   lime   #B9D63B  (primary action)
   purple #6a3f9e  (atmosphere)
   ink    #120d1a  (dark surface)
========================================================= */

// Large glass panel (the form card)
const GLASS_PANEL =
  "border border-white/20 bg-gradient-to-br from-white/[0.14] via-white/[0.05] to-white/[0.03] backdrop-blur-2xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_0_30px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.45)]";

// Small glass surface (tabs, buttons, chips)
const GLASS =
  "border border-white/25 bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]";

// Dark glass input
const INPUT =
  "h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.05] text-sm text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] outline-none transition-all placeholder:text-white/35 focus:border-[#B9D63B]/70 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#B9D63B]/10";

// Lime primary button
const LIME_BTN =
  "group relative flex h-[54px] w-full items-center justify-center overflow-hidden rounded-full border border-white/40 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-sm font-bold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.35)] transition duration-300 ease-out hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.5)] active:scale-[0.98] disabled:cursor-not-allowed";

const LABEL = "mb-2 block text-[12px] font-semibold text-white/70";
const ICON =
  "absolute left-4 top-1/2 -translate-y-1/2 text-white/50";

export default function UserAuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Keep UI synced with /auth?mode=login | signup */
  useEffect(() => {
    const queryMode = searchParams.get("mode");

    if (queryMode === "signup" || queryMode === "login") {
      setMode(queryMode);
    }
  }, [searchParams]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function switchMode(nextMode) {
    // Preserve form, password and OTP state when switching modes.
    setMode(nextMode);

    router.replace(`/auth?mode=${nextMode}`, { scroll: false });

    // Only clear temporary messages.
    setError("");
    setSuccess("");
    setSubmitState("idle");
  }

  /* ================= MOCK OTP ================= */

  function sendOtp() {
    setError("");
    setSuccess("");

    if (!/^\d{10}$/.test(form.mobile)) {
      setError("Enter a valid 10 digit mobile number");
      return;
    }

    const randomOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    setGeneratedOtp(randomOtp);
    setOtpSent(true);
    setOtpVerified(false);

    // Demo only
    setSuccess(`Demo OTP: ${randomOtp}`);
  }

  function verifyOtp() {
    setError("");

    if (!otp) {
      setError("Enter the OTP");
      return;
    }

    if (otp !== generatedOtp) {
      setError("Invalid OTP");
      return;
    }

    setOtpVerified(true);
    setSuccess("Mobile number verified successfully");
  }

  /* ================= LOGIN ================= */

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitState("idle");

    if (!/^\d{10}$/.test(form.mobile)) {
      setError("Enter a valid 10 digit mobile number");
      return;
    }

    if (!form.password) {
      setError("Enter your password");
      return;
    }

    setLoading(true);
    setSubmitState("loading");

    try {
      const result = await signIn("user-credentials", {
        mobile: form.mobile,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid mobile number or password");
        setLoading(false);
        setSubmitState("idle");
        return;
      }

      setLoading(false);
      setSubmitState("success");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Unable to login. Please try again.");
      setLoading(false);
      setSubmitState("idle");
    }
  }

  /* ================= SIGNUP ================= */

  async function handleSignup(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Enter your name");
      return;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      setError("Enter a valid 10 digit mobile number");
      return;
    }

    if (!form.password || form.password.length < 8) {
      setError("Password must contain at least 8 characters");
      return;
    }

    if (!otpSent) {
      setError("Please verify your mobile number first");
      return;
    }

    if (!otpVerified) {
      setError("Please verify the OTP");
      return;
    }

    setLoading(true);
    setSubmitState("loading");

    try {
      const response = await fetch("/api/auth/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          mobile: form.mobile,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create account");
        setLoading(false);
        setSubmitState("idle");
        return;
      }

      setSuccess("Account created successfully. Logging you in...");

      /* Automatically login after signup. */
      const loginResult = await signIn("user-credentials", {
        mobile: form.mobile,
        password: form.password,
        redirect: false,
      });

      if (loginResult?.error) {
        setError(
          "Account created. Please login with your mobile and password."
        );

        setMode("login");
        router.replace("/auth?mode=login", { scroll: false });

        setLoading(false);
        setSubmitState("idle");
        return;
      }

      setLoading(false);
      setSubmitState("success");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error("SIGNUP ERROR:", err);

      setError("Something went wrong. Please try again.");
      setLoading(false);
      setSubmitState("idle");
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.75); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <main className="min-h-screen bg-[#0a0710] p-4 font-sans sm:p-6 lg:p-8">
        <div className="relative flex min-h-[calc(100vh-32px)] w-full overflow-hidden rounded-[2rem] bg-[#120d1a] sm:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-64px)]">
          {/* Atmosphere */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#6a3f9e]/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-[#B9D63B]/15 blur-3xl" />

          {/* ================= FORM SIDE ================= */}

          <section className="relative z-10 flex w-full items-center justify-center px-4 py-8 sm:px-8 lg:w-1/2 lg:px-12 xl:px-16">
            <div
              className={`w-full max-w-[580px] rounded-[2rem] p-6 sm:p-9 lg:p-10 ${GLASS_PANEL}`}
            >
              {/* Brand */}
              <div className="mb-8">
                <h1 className="text-[36px] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-[40px]">
                  {mode === "login" ? "Welcome back." : "Start your journey."}
                </h1>

                <p className="mt-3 max-w-[490px] text-[14px] leading-6 text-white/60">
                  {mode === "login"
                    ? "Login to access your Purple community, events and experiences."
                    : "Create your account and become part of the Purple community."}
                </p>
              </div>

              {/* Mode switch */}
             {/* Mode switch */}
<div className="relative mb-7 rounded-full border border-white/10 bg-black/20 p-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
  {/* Sliding glass drop */}
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 w-[calc(50%-6px)] overflow-hidden rounded-full
      border border-white/25
      bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04]
      backdrop-blur-xl backdrop-saturate-200
      shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)]
      transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      motion-reduce:transition-none
      ${mode === "signup" ? "translate-x-full" : "translate-x-0"}`}
  >
    <span className="absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent opacity-60" />
  </div>

  {/* Tabs */}
  <div className="relative grid grid-cols-2">
    {[
      { id: "login", label: "Login" },
      { id: "signup", label: "Create account" },
    ].map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => switchMode(tab.id)}
        className={`cursor-pointer rounded-full py-3 text-sm font-semibold transition-colors duration-300 ${
          mode === tab.id
            ? "text-white"
            : "text-white/55 hover:text-white"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>

              {/* Form */}
              <form
                onSubmit={mode === "login" ? handleLogin : handleSignup}
                className="space-y-4"
              >
                {/* Name */}
                {mode === "signup" && (
                  <div>
                    <label className={LABEL}>Full name</label>

                    <div className="relative">
                      <User size={17} strokeWidth={1.8} className={ICON} />

                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Enter your name"
                        className={`${INPUT} pl-11 pr-4`}
                      />
                    </div>
                  </div>
                )}

                {/* Mobile */}
                <div>
                  <label className={LABEL}>Mobile number</label>

                  <div className="relative">
                    <Smartphone size={17} strokeWidth={1.8} className={ICON} />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.mobile}
                      onChange={(e) =>
                        updateField(
                          "mobile",
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      placeholder="10 digit mobile number"
                      className={`${INPUT} pl-11 pr-4`}
                    />
                  </div>
                </div>

                {/* OTP */}
                {mode === "signup" && otpSent && !otpVerified && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-[12px] font-semibold text-white/70">
                        Enter OTP
                      </label>

                      <button
                        type="button"
                        onClick={sendOtp}
                        className="cursor-pointer text-[11px] font-semibold text-[#B9D63B] hover:underline"
                      >
                        Resend
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="6 digit OTP"
                        className={`${INPUT} min-w-0 flex-1 px-4 tracking-[0.3em] placeholder:tracking-normal`}
                      />

                      <button
                        type="button"
                        onClick={verifyOtp}
                        className={`flex h-[52px] cursor-pointer items-center gap-1.5 rounded-2xl px-6 text-sm font-semibold text-white transition hover:scale-[1.03] active:scale-95 ${GLASS}`}
                      >
                        Verify
                        <BadgeCheck size={16} className="text-[#B9D63B]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-[12px] font-semibold text-white/70">
                      Password
                    </label>

                    {mode === "login" && (
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-[#B9D63B] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <LockKeyhole size={17} strokeWidth={1.8} className={ICON} />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder={
                        mode === "signup"
                          ? "Create a password"
                          : "Enter your password"
                      }
                      className={`${INPUT} pl-11 pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {mode === "signup" && (
                    <p className="mt-2 text-[11px] text-white/45">
                      Minimum 8 characters.
                    </p>
                  )}
                </div>

                {/* Send OTP */}
                {mode === "signup" && !otpSent && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className={`relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-semibold text-white transition hover:scale-[1.01] active:scale-[0.98] ${GLASS}`}
                  >
                    <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent opacity-60" />
                    <span className="relative">Verify mobile number</span>
                    <ArrowRight size={16} className="relative" />
                  </button>
                )}

                {/* Verified */}
                {mode === "signup" && otpVerified && (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#B9D63B]/40 bg-gradient-to-br from-[#B9D63B]/25 via-[#B9D63B]/10 to-transparent px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#CBE75A] to-[#B9D63B]">
                      <ShieldCheck size={16} className="text-[#1E2A00]" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#DDF27A]">
                        Mobile verified
                      </p>

                      <p className="text-[10px] text-white/55">
                        Your number has been verified.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-300">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="rounded-2xl border border-[#B9D63B]/30 bg-[#B9D63B]/10 px-4 py-3 text-[13px] font-medium text-[#DDF27A]">
                    {success}
                  </div>
                )}

                {/* Submit */}
                {(mode === "login" || (mode === "signup" && otpVerified)) && (
                  <button
                    type="submit"
                    disabled={loading || submitState === "success"}
                    className={LIME_BTN}
                  >
                    <span className="pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70" />

                    {submitState === "idle" && (
                      <span className="relative flex animate-[fadeIn_.2s_ease-out] items-center gap-2">
                        {mode === "login" ? "Login" : "Create account"}
                        <ArrowRight
                          size={17}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </span>
                    )}

                    {submitState === "loading" && (
                      <span className="relative flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Processing...</span>
                      </span>
                    )}

                    {submitState === "success" && (
                      <span className="relative flex animate-[scaleIn_.25s_ease-out] items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E2A00]/15">
                          <Check size={15} strokeWidth={3} />
                        </span>
                        <span>Success!</span>
                      </span>
                    )}
                  </button>
                )}
              </form>

              {/* Footer */}
              <div className="mt-7">
                <div className="mb-4 h-px bg-white/10" />

                <p className="text-center text-[11px] leading-5 text-white/45">
                  By continuing, you agree to Purple's{" "}
                  <span className="font-semibold text-white/80">Terms</span> &{" "}
                  <span className="font-semibold text-white/80">
                    Privacy Policy
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* ================= IMAGE SIDE ================= */}

          <section className="relative hidden w-1/2 overflow-hidden lg:block">
            <img
              src="/loging.png"
              alt="Purple community"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Blend into the dark form side */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#120d1a] via-[#120d1a]/20 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6a3f9e]/25 via-transparent to-transparent mix-blend-soft-light" />
          </section>
        </div>
      </main>
    </>
  );
}