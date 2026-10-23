
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PLANS = [
  { value: "charter-member", label: "Charter Member" },
  { value: "charter-coach", label: "Charter Coach" },
  { value: "membership", label: "Membership" },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
  plan: "",
};

function validateForm(form) {
  const errors = {};

  if (form.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }

  if (form.city.trim().length < 2) {
    errors.city = "Enter your city.";
  }

  if (!PLANS.some((plan) => plan.value === form.plan)) {
    errors.plan = "Please select a plan.";
  }

  return errors;
}

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [registration, setRegistration] = useState(null);
  const [reference, setReference] = useState("");
  const [referenceError, setReferenceError] = useState("");
  const [busy, setBusy] = useState(false);
  const [referenceBusy, setReferenceBusy] = useState(false);
  const [notice, setNotice] = useState("");

  // Automatically select plan from ?plan=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPlan = params.get("plan")?.trim().toLowerCase();

    if (queryPlan && PLANS.some((plan) => plan.value === queryPlan)) {
      setForm((current) => ({
        ...current,
        plan: queryPlan,
      }));
    }
  }, []);

  const update = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  async function submitRegistration(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    setNotice("");

    if (Object.keys(nextErrors).length) return;

    setBusy(true);

    try {
      const response = await fetch("/api/public-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          city: form.city.trim(),
          phone: form.phone.replace(/\D/g, ""),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not complete registration."
        );
      }

      setRegistration(data.registration);
      setNotice(
        data.message || "Registration saved successfully."
      );
    } catch (error) {
      setNotice(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitReference(event) {
    event.preventDefault();

    const cleaned = reference.trim();

    if (cleaned.length < 4 || cleaned.length > 100) {
      setReferenceError(
        "Enter a valid payment reference number (4–100 characters)."
      );
      return;
    }

    setReferenceError("");
    setNotice("");
    setReferenceBusy(true);

    try {
      const response = await fetch(
        "/api/public-registration/payment-reference",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberId: registration.memberId,
            registrationToken: registration.registrationToken,
            referenceNumber: cleaned,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not save the reference number."
        );
      }

      setRegistration((current) => ({
        ...current,
        paymentReference: cleaned,
        paymentStatus: data.paymentStatus,
      }));

      setNotice(
        "Payment reference saved. Your payment is awaiting verification."
      );
    } catch (error) {
      setReferenceError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setReferenceBusy(false);
    }
  }

  const paymentQrUrl =
    process.env.NEXT_PUBLIC_PAYMENT_QR_URL ||
    "/inshape_runners_club_scannable_qr.png";

  const selectedPlan = PLANS.find(
    (plan) => plan.value === registration?.plan
  )?.label;

  return (
    <main className="min-h-screen bg-[#f7f4fb] px-3 py-6 font-sans text-[#21182b] sm:px-6 sm:py-12 lg:py-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-2xl mt-12 bg-white shadow-[0_24px_80px_rgba(50,25,75,0.12)] sm:rounded-[2rem] lg:grid-cols-[0.82fr_1.18fr]">

        {/* LEFT SIDEBAR: DESKTOP ONLY */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#6b3fa0] p-10 text-white lg:flex lg:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[36px] border-white/10" />

          <div className="relative z-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#d4ff3f]">
              Your next chapter
            </p>

            <h1 className="max-w-md text-5xl font-bold leading-[1.04] tracking-tight">
              Good people.
              <br />
              Better Sundays.
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-white/80">
              Register your details, choose your plan, and
              complete the payment steps to get started with
              Purple Club.
            </p>
          </div>

          <Image
            src="/like.png"
            alt="Purple Club"
            width={800}
            height={820}
            className="relative z-10 mt-10 h-auto w-full object-contain"
            priority
          />

          <p className="relative z-10 mt-6 text-sm text-white/70">
            Come as you are. Find your people. 💜
          </p>
        </aside>

        {/* MAIN CONTENT: FULL WIDTH ON MOBILE */}
        <section className="min-w-0 p-5 sm:p-9 lg:p-12">
          {!registration ? (
            <>
              <div className="mb-7 sm:mb-9">
                <div className="mb-5 flex items-center gap-2 lg:hidden">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6b3fa0] text-lg font-bold text-[#d4ff3f]">
                    P
                  </span>
                  <span className="font-bold tracking-tight">
                    PURPLE CLUB
                  </span>
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b3fa0] sm:text-sm">
                  Registration
                </p>

                <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  Let’s get you started.
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-[#716779] sm:text-base">
                  Fill in your details and select the plan
                  that’s right for you.
                </p>
              </div>

              <form
                onSubmit={submitRegistration}
                noValidate
                className="space-y-5 sm:space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <Field
                    label="Full name"
                    name="name"
                    value={form.name}
                    onChange={update}
                    error={errors.name}
                    placeholder="Your full name"
                    autoComplete="name"
                  />

                  <Field
                    label="Email address"
                    name="email"
                    value={form.email}
                    onChange={update}
                    error={errors.email}
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                  />

                  <Field
                    label="Phone number"
                    name="phone"
                    value={form.phone}
                    onChange={update}
                    error={errors.phone}
                    placeholder="10-digit mobile number"
                    type="tel"
                    autoComplete="tel"
                    maxLength={14}
                  />

                  <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={update}
                    error={errors.city}
                    placeholder="Your city"
                    autoComplete="address-level2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="plan"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Choose your plan
                  </label>

                  <select
                    id="plan"
                    name="plan"
                    value={form.plan}
                    onChange={update}
                    aria-invalid={Boolean(errors.plan)}
                    className={`w-full min-w-0 rounded-xl border bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#6b3fa0] focus:ring-4 focus:ring-[#6b3fa0]/10 ${
                      errors.plan
                        ? "border-red-400"
                        : "border-[#e6dfed]"
                    }`}
                  >
                    <option value="">Select a plan</option>

                    {PLANS.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>

                  {errors.plan && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.plan}
                    </p>
                  )}

                  {form.plan && (
                    <p className="mt-2 text-xs text-[#716779]">
                      Selected:{" "}
                      {PLANS.find(
                        (plan) => plan.value === form.plan
                      )?.label}
                    </p>
                  )}
                </div>

                {notice && <Notice>{notice}</Notice>}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6b3fa0] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#57308a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b3fa0] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {busy
                    ? "Saving your details…"
                    : "Continue to payment"}
                  {!busy && <span aria-hidden="true">→</span>}
                </button>

                <p className="text-center text-xs leading-5 text-[#8a8192]">
                  Your details are used to set up your Purple Club
                  registration.
                </p>
              </form>
            </>
          ) : (
            <>
              <div className="mb-7 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d4ff3f] text-xl font-bold">
                  ₹
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6b3fa0] sm:text-sm">
                     Complete Payment
                  </p>

                  <p className="mt-0 text-sm leading-6 text-[#716779]">
                    Hi {registration.name}, scan the QR code to pay,
                    then enter your payment reference number.
                  </p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl bg-[#f8f5fb] p-4 text-sm sm:grid-cols-4 sm:p-5">
                <Summary label="Name" value={registration.name} />
                <Summary
                  label="Selected plan"
                  value={selectedPlan || registration.plan}
                />
                <Summary label="Email" value={registration.email} />
                <Summary label="Phone" value={registration.mobile} />
              </div>

              <div className="rounded-2xl border border-[#e9e1f1] p-4 text-center sm:p-6">
                <p className="font-bold">Scan to pay</p>

                <p className="mt-1 text-sm leading-5 text-[#716779]">
                  Open your UPI app and scan the payment QR.
                </p>

                <div className="mx-auto mt-5 flex min-h-56 w-full max-w-64 items-center justify-center rounded-2xl border border-dashed border-[#d9cce7] bg-white p-3">
                  <img
                    src={paymentQrUrl}
                    alt="Purple Club payment QR code"
                    className="max-h-60 w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>

              {registration.paymentReference ? (
                <div className="mt-6 rounded-2xl border border-[#d7e9a0] bg-[#f7ffe3] p-4 sm:p-5">
                  <p className="font-bold">
                    Reference number saved ✓
                  </p>

                  <p className="mt-2 break-words text-sm text-[#4f5c2d]">
                    Reference:{" "}
                    <span className="font-bold">
                      {registration.paymentReference}
                    </span>
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#4f5c2d]">
                    Status: Awaiting payment verification. Your
                    registration is not confirmed until payment
                    is verified.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={submitReference}
                  className="mt-6 space-y-3"
                >
                  <label
                    htmlFor="reference"
                    className="block text-sm font-semibold"
                  >
                    Payment reference / UTR number
                  </label>

                  <input
                    id="reference"
                    value={reference}
                    onChange={(event) => {
                      setReference(event.target.value);
                      setReferenceError("");
                    }}
                    placeholder="Enter your UPI transaction reference"
                    maxLength={100}
                    required
                    aria-invalid={Boolean(referenceError)}
                    className={`w-full min-w-0 rounded-xl border px-4 py-3.5 text-sm outline-none transition focus:border-[#6b3fa0] focus:ring-4 focus:ring-[#6b3fa0]/10 ${
                      referenceError
                        ? "border-red-400"
                        : "border-[#e6dfed]"
                    }`}
                  />

                  {referenceError && (
                    <p className="text-xs text-red-600">
                      {referenceError}
                    </p>
                  )}

                  {notice && <Notice>{notice}</Notice>}

                  <button
                    type="submit"
                    disabled={referenceBusy}
                    className="w-full rounded-xl bg-[#d4ff3f] px-5 py-4 text-sm font-bold text-[#21182b] transition hover:bg-[#c6f02e] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                  >
                    {referenceBusy
                      ? "Saving reference…"
                      : "Submit payment reference →"}
                  </button>

                  <p className="text-xs leading-5 text-[#8a8192]">
                    Submit the reference after making your payment.
                    The team will verify it before activating your plan.
                  </p>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  autoComplete,
  maxLength,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required
        aria-invalid={Boolean(error)}
        className={`w-full min-w-0 rounded-xl border px-4 py-3.5 text-sm outline-none transition placeholder:text-[#aaa1b2] focus:border-[#6b3fa0] focus:ring-4 focus:ring-[#6b3fa0]/10 ${
          error ? "border-red-400" : "border-[#e6dfed]"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-[#8a8192]">{label}</p>
      <p className="mt-1 break-words font-semibold">{value}</p>
    </div>
  );
}

function Notice({ children }) {
  return (
    <p
      role="status"
      className="break-words rounded-xl bg-[#f3edf9] px-4 py-3 text-sm leading-5 text-[#56347b]"
    >
      {children}
    </p>
  );
}
