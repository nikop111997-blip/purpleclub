"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

/* =========================================================
   THEME TOKENS
   page   #6a3f9e  (purple background)
   lime   #B9D63B  (primary action)
   ink    #120d1a  (poster fade)
========================================================= */

// Liquid glass on the purple background
const GLASS =
  "border border-white/25 bg-gradient-to-br from-white/25 via-white/[0.07] to-white/[0.04] backdrop-blur-xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_12px_rgba(255,255,255,0.08),0_8px_24px_rgba(40,15,70,0.25)]";

// Large glass panel (messages / success)
const GLASS_PANEL =
  "border border-white/25 bg-gradient-to-br from-white/[0.18] via-white/[0.07] to-white/[0.04] backdrop-blur-2xl backdrop-saturate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_0_30px_rgba(255,255,255,0.05),0_30px_80px_rgba(40,15,70,0.45)]";

// Light frosted panel (the form, for easy reading)
const FORM_PANEL =
  "border border-white/80 bg-gradient-to-br from-white/95 via-white/90 to-[#f3ecfa]/90 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_30px_80px_rgba(40,15,70,0.4)]";

// Light glass input
const INPUT =
  "h-12 w-full rounded-2xl border border-[#6a3f9e]/15 bg-white/70 pl-11 pr-4 text-sm font-medium text-[#24112f] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] outline-none transition placeholder:text-[#aaa0b0] focus:border-[#6a3f9e]/60 focus:bg-white focus:ring-4 focus:ring-[#6a3f9e]/10 disabled:opacity-60";

const LABEL = "mb-1.5 block text-xs font-semibold text-[#6f6577]";
const ICON =
  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7898]";

// Lime button
const LIME_BTN =
  "group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/50 bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] px-5 py-3.5 text-sm font-semibold text-[#1E2A00] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(88,112,0,0.25),0_8px_24px_rgba(185,214,59,0.4)] transition duration-300 ease-out hover:brightness-105 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(88,112,0,0.25),0_12px_32px_rgba(185,214,59,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const SHINE =
  "pointer-events-none absolute inset-x-4 top-px h-1/2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent opacity-70";

function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* Shared page shell: purple background with soft light */
function Shell({ children, center = true }) {
  return (
    <main
      className={`relative isolate min-h-screen overflow-hidden bg-[#6a3f9e] px-4 py-8 font-sans sm:px-6 sm:py-12 ${
        center ? "flex items-center justify-center" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.22),transparent_38%),radial-gradient(circle_at_85%_90%,rgba(185,214,59,0.22),transparent_38%),linear-gradient(160deg,#7a4cb0_0%,#6a3f9e_45%,#5a2f8c_100%)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#B9D63B]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      {children}
    </main>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] px-3.5 py-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00]">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-white/60">{label}</p>
        <p className="text-sm font-medium text-white">{children}</p>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, hint, children }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>

      <div className="relative">
        <Icon size={17} className={ICON} />
        {children}
      </div>

      {hint && <p className="mt-1.5 text-[11px] text-[#8a8190]">{hint}</p>}
    </div>
  );
}

function Rule({ ok, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
        ok
          ? "border-[#B9D63B]/70 bg-[#B9D63B]/25 text-[#44590d]"
          : "border-[#6a3f9e]/15 bg-white/60 text-[#8a8190]"
      }`}
    >
      <Check size={11} className={ok ? "opacity-100" : "opacity-30"} />
      {children}
    </span>
  );
}

export default function GuestRegisterClient({ token }) {
  const router = useRouter();

  const [invite, setInvite] = useState(null);
  const [inviter, setInviter] = useState(null);
  const [event, setEvent] = useState(null);

  const [loadingInvite, setLoadingInvite] = useState(true);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function loadInvite() {
      try {
        setLoadingInvite(true);
        setError("");

        const response = await fetch(`/api/invite/${token}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "This invitation is no longer available."
          );
        }

        if (data.alreadyRegistered) {
          router.replace(`/invite/${token}`);
          return;
        }

        setInvite(data.invite);
        setInviter(data.inviter);
        setEvent(data.event);

        setName(data.invite?.guestName || "");
        setMobile(data.invite?.guestMobile || "");
      } catch (err) {
        setError(err.message || "Unable to load this invitation.");
      } finally {
        setLoadingInvite(false);
      }
    }

    if (token) {
      loadInvite();
    }
  }, [token, router]);

  function handleMobileChange(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setMobile(digits);
  }

  function validate() {
    if (!name.trim()) {
      return "Please enter your name.";
    }

    if (!/^\d{10}$/.test(mobile)) {
      return "Please enter a valid 10 digit mobile number.";
    }

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one capital letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one small letter.";
    }

    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/invite/${token}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          mobile,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- LOADING ---------------- */

  if (loadingInvite) {
    return (
      <Shell>
        <div className="text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-[#E4F58C] ${GLASS}`}
          >
            <Loader2 className="animate-spin" size={24} />
          </div>

          <p className="mt-4 text-sm text-white/75">
            Loading your invitation...
          </p>
        </div>
      </Shell>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error && !event) {
    return (
      <Shell>
        <div
          className={`w-full max-w-md rounded-[2rem] p-8 text-center ${GLASS_PANEL}`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/40 bg-red-500/20 text-red-100">
            <AlertCircle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Invitation unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">{error}</p>

          <Link href="/auth" className={`mt-6 ${LIME_BTN}`}>
            <span className={SHINE} />
            <span className="relative">Go to login</span>
          </Link>
        </div>
      </Shell>
    );
  }

  /* ---------------- SUCCESS ---------------- */

  if (success) {
    const qrValue = success.registration?.qrCode;

    return (
      <Shell>
        <div
          className={`w-full max-w-md rounded-[2rem] p-7 text-center sm:p-9 ${GLASS_PANEL}`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#CBE75A] to-[#B9D63B] text-[#1E2A00] shadow-[0_8px_24px_rgba(185,214,59,0.45)]">
            <CheckCircle2 size={32} />
          </div>

          <span
            className={`mt-5 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-white ${GLASS}`}
          >
            Welcome to Purple
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            You're registered!
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/70">
            Your account is created and your spot for{" "}
            <strong className="text-white">
              {success.event?.name || event?.name}
            </strong>{" "}
            is confirmed.
          </p>

          {/* QR */}
          <div className="mx-auto mt-6 w-fit rounded-3xl bg-white p-4 shadow-[0_16px_40px_rgba(40,15,70,0.35)]">
            {qrValue ? (
              <QRCodeSVG
                value={qrValue}
                size={160}
                level="H"
                fgColor="#24112f"
              />
            ) : (
              <div className="flex h-[160px] w-[160px] items-center justify-center text-sm text-gray-400">
                No QR
              </div>
            )}
          </div>

          <div className={`mt-4 rounded-2xl p-3.5 text-left ${GLASS}`}>
            <p className="text-[11px] text-white/60">QR code</p>

            <p className="break-all font-mono text-sm font-bold text-[#E4F58C]">
              {qrValue}
            </p>

            {success.registration?.id && (
              <>
                <p className="mt-3 text-[11px] text-white/60">
                  Registration ID
                </p>

                <p className="break-all font-mono text-xs font-semibold text-white">
                  {success.registration.id}
                </p>
              </>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-white/60">
            Save your QR code. You will need it when you attend the experience.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth" className={LIME_BTN}>
              <span className={SHINE} />
              <span className="relative">Login to Purple</span>
              <ArrowRight
                size={16}
                className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
              />
            </Link>

            <Link
              href="/"
              className={`relative flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold text-white transition hover:brightness-125 active:scale-[0.98] ${GLASS}`}
            >
              Back to home
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  /* ---------------- REGISTRATION ---------------- */

  const inviterName = inviter?.name || "A Purple member";

  const d = event?.date ? new Date(event.date) : null;
  const validDate = d && !Number.isNaN(d.getTime());

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  return (
    <Shell>
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white ${GLASS}`}
          >
            <Sparkles size={13} className="text-[#E4F58C]" />
            Invited by {inviterName}
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Join Purple
          </h1>

          <p className="mt-2 text-sm text-white/70">
            Create your account to confirm your place at this experience.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ---------- Event ---------- */}
          <div className={`overflow-hidden rounded-[2rem] ${GLASS_PANEL}`}>
            <div className="relative h-56 overflow-hidden bg-[#120d1a]">
              <img
                src={event?.image || "/cheer.png"}
                alt={event?.name || "Purple Experience"}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-[#6a3f9e]/30 via-transparent to-pink-300/20 mix-blend-soft-light" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-[#120d1a]/60 via-65% to-[#120d1a]" />

              {validDate && (
                <div
                  className={`absolute left-4 top-4 w-14 overflow-hidden rounded-2xl text-center ${GLASS}`}
                >
                  <div className="bg-[#B9D63B] py-1 text-[10px] font-bold tracking-wider text-[#1E2A00]">
                    {d.toLocaleString("en-US", { month: "short" }).toUpperCase()}
                  </div>
                  <div className="pt-1 text-lg font-bold leading-none text-white">
                    {d.getDate()}
                  </div>
                  <div className="pb-1.5 text-[10px] font-medium text-white/70">
                    {d.toLocaleString("en-US", { weekday: "short" })}
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[11px] font-semibold text-[#E4F58C]">
                  Your invitation
                </p>

                <h2 className="mt-1 text-2xl font-bold leading-tight text-white">
                  {event?.name}
                </h2>
              </div>
            </div>

            <div className="p-5">
              {event?.description && (
                <p className="mb-4 text-sm leading-6 text-white/70">
                  {event.description}
                </p>
              )}

              <div className="space-y-2.5">
                {event?.date && (
                  <DetailRow icon={CalendarDays} label="Date">
                    {formatDate(event.date)}
                  </DetailRow>
                )}

                {(event?.startTime || event?.endTime) && (
                  <DetailRow icon={Clock3} label="Time">
                    {event.startTime}
                    {event.endTime ? ` – ${event.endTime}` : ""}
                  </DetailRow>
                )}

                {event?.location && (
                  <DetailRow icon={MapPin} label="Location">
                    {event.location}
                  </DetailRow>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Form ---------- */}
          <div className={`rounded-[2rem] p-6 sm:p-8 ${FORM_PANEL}`}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#6a3f9e]/20 bg-[#6a3f9e]/10 px-3 py-1 text-[11px] font-semibold text-[#6a3f9e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B9D63B] shadow-[0_0_8px_#B9D63B]" />
              Create your account
            </span>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#1a0f24]">
              Complete your registration
            </h2>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Full name" icon={UserRound}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={INPUT}
                  disabled={loading}
                />
              </Field>

              <Field
                label="Mobile number"
                icon={Phone}
                hint="We will use this number for your Purple account."
              >
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder="10 digit mobile number"
                  className={INPUT}
                  disabled={loading}
                />
              </Field>

              <Field label="Create password" icon={Lock}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`${INPUT} pr-12`}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b7898] transition hover:text-[#4B176B]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </Field>

              {/* Live password checks */}
              <div className="flex flex-wrap gap-1.5">
                <Rule ok={rules.length}>8+ characters</Rule>
                <Rule ok={rules.upper}>Capital letter</Rule>
                <Rule ok={rules.lower}>Small letter</Rule>
                <Rule ok={rules.number}>Number</Rule>
              </div>

              <Field label="Confirm password" icon={Lock}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={INPUT}
                  disabled={loading}
                />
              </Field>

              <button type="submit" disabled={loading} className={`${LIME_BTN} !mt-6`}>
                <span className={SHINE} />

                {loading ? (
                  <>
                    <Loader2 size={18} className="relative animate-spin" />
                    <span className="relative">Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span className="relative">Register for experience</span>
                    <ArrowRight
                      size={18}
                      className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-[#8a8190]">
              Already have a Purple account?{" "}
              <Link
                href="/auth"
                className="font-semibold text-[#6a3f9e] hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}