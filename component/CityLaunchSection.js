
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  HeartHandshake,
  Users,
  UserPlus,
  X,
  MapPin,
  Search,
  Sparkles,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Phone,
  PartyPopper,
  MoveUpRight,
  Star,
  Mic2Icon,
  Speaker,
  BellRing,
} from "lucide-react";

const opportunities = [
  {
    id: "member",
    icon: HeartHandshake,
    title: "Charter Member",
    description:
      "Be among the founding members helping bring Purple Club to your city.",
    button: "Become a Founding Member",
    href: "#membership",
    label: "FOUNDING COMMUNITY",
    number: "01",
    background: "#fff",
    accent: "#6b3fa0",
    rotation: "-1deg",
  },
  {
    id: "coach",
    icon: Users,
    title: "Charter Coach",
    description:
      "Help create, lead and grow Purple Club experiences in your city.",
    button: "Become a Charter Coach",
    href: "#membership",
    label: "LEAD THE MOVEMENT",
    number: "02",
    background: "#fff",
    accent: "#6b3fa0",
    rotation: "1deg",
  },
];

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  cityId: "",
  city: "",
  state: "",
};

export default function CityLaunchSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const cityWrapperRef = useRef(null);
  const nameInputRef = useRef(null);

  // Search cities through your existing API.
useEffect(() => {
  if (
    !modalOpen ||
    form.cityId ||
    cityQuery.trim().length < 2
  ) {
    setCities([]);
    setCityLoading(false);
    setDropdownOpen(false);
    return;
  }

  let cancelled = false;

  const timer = setTimeout(async () => {
    try {
      setCityLoading(true);

      const response = await fetch(
        `/api/cities?q=${encodeURIComponent(cityQuery.trim())}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Could not load cities.");
      }

      if (!cancelled) {
        setCities(data.cities || []);
        setDropdownOpen(true);
      }
    } catch {
      if (!cancelled) {
        setCities([]);
        setDropdownOpen(false);
      }
    } finally {
      if (!cancelled) setCityLoading(false);
    }
  }, 300);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [cityQuery, modalOpen, form.cityId]);

  // Close city dropdown when clicking outside.
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        cityWrapperRef.current &&
        !cityWrapperRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Lock page scrolling while the modal is open.
  useEffect(() => {
    if (!modalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => nameInputRef.current?.focus(), 150);

    function handleKeyDown(event) {
      if (event.key === "Escape" && !submitting) {
        setModalOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen, submitting]);

  function openModal() {
    setForm(initialForm);
    setCityQuery("");
    setCities([]);
    setError("");
    setSuccess(false);
    setDropdownOpen(false);
    setModalOpen(true);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

 function selectCity(city) {
  setForm((previous) => ({
    ...previous,
    cityId: city.id,
    city: city.city,
    state: city.state || "",
  }));

  setCityQuery(
    city.state ? `${city.city}, ${city.state}` : city.city
  );

  setDropdownOpen(false);
  setCities([]);
  setCityLoading(false);
  setError("");
}

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.cityId || !form.city) {
      setError("Please select a city from the suggestions.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const digits = form.mobile.replace(/\D/g, "");

    if (digits.length < 10 || digits.length > 15) {
      setError("Please enter a valid mobile number.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/city-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          cityId: form.cityId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Something went wrong. Please try again."
        );
      }

      setSuccess(true);

      // Show success before automatically closing the modal.
      setTimeout(() => {
        setModalOpen(false);
        setSuccess(false);
        setForm(initialForm);
        setCityQuery("");
      }, 1800);
    } catch (err) {
      setError(err.message || "Unable to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="relative isolate border-t border-b border-dashed flex min-h-screen items-center overflow-hidden bg-[#6b3fa0] px-4 py-20 font-sans text-white sm:px-8 lg:min-h-[100svh] lg:px-20 lg:py-16">
    

        <div className="relative mx-auto w-full">
          {/* Header */}
          <header className="mb-8 max-w-4xl sm:mb-10 lg:mb-7">
            <div className="mb-4  py-1 text-[10px] font-semibold uppercase tracking-[0.02em] border-b w-fit text-[#fff] sm:text-xs">
          
              Come as you are. Come alive.
            </div>

            <h2 className="max-w-2xl text-4xl sm:text-5xl font-bold leading-[0.94]">
              Something wonderful is coming to{" "}
              <span className="relative inline-block text-[#d4ff3f]">
                your city.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 16"
                  className="absolute -bottom-2 left-0 w-full"
                  fill="none"
                >
                  <path
                    d="M4 10C65 1 211 1 295 7"
                    stroke="#d4ff3f"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base lg:mt-4">
              Purple Club hasn&apos;t launched in your city yet. But you
              could be part of bringing it to life.
            </p>

            <div className="mt-4 flex items-start gap-3 text-sm font-semibold sm:items-center">
              <span className="flex h-9 w-9 shrink-0 -rotate-0 items-center justify-center rounded-full bg-white/10 text-[#d4ff3f]">
                <UserPlus size={19} />
              </span>
              <p className="max-w-xl leading-relaxed">
                Join the founding community and help make Purple Club a
                reality in your city.
              </p>
            </div>
          </header>

          {/* Playful opportunity cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-7">
            {opportunities.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.id}
                  style={{
                    backgroundColor: item.background,
                  }}
                  className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[28px] p-5 text-[#24152e] transition duration-300 hover:-translate-y-1 hover:rotate-0 sm:min-h-[320px] sm:p-7 lg:min-h-[280px] lg:p-6 xl:min-h-[300px]"
                >
                  {/* Decorative graphic */}
               

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.13em]">
                      PURPLE CLUB
                    </span>
                    <span className="rounded-full border border-[#24152e]/25 px-3 py-1.5 text-[9px] font-bold tracking-[0.1em] sm:text-[10px]">
                      {item.label}
                    </span>
                  </div>

                  <div className="relative z-10 mt-7 sm:mt-9 lg:mt-7">
                    <span
                      className="inline-flex  rounded-lg px-2.5 py-1 text-[10px] font-bold text-white"
                      style={{ backgroundColor: item.accent }}
                    >
                      THE NEXT CHAPTER · {item.number}
                    </span>

                    <h2 className="mt-3 max-w-[75%] text-3xl font-bold leading-[0.96] tracking-[-0.02em]">
                      {item.title}
                      <span
                        className="ml-1 inline-block align-top text-xl"
                        style={{ color: item.accent }}
                      >
                       {item.id==='coach' && '*'}
                      </span>
                    </h2>

                    <p className="mt-3 max-w-[80%] text-xs leading-relaxed text-[#24152e]/75 sm:text-base lg:max-w-[75%] lg:text-sm xl:text-sm">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative z-10 mt-auto pt-6">
                    <a
                      href={item.href}
                      className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-full border-2 border-[#6b3fa0] bg-[#6b3fa0] px-4 py-3 text-sm font-extrabold text-white transition duration-200 hover:bg-transparent hover:text-[#24152e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24152e] focus-visible:ring-offset-2"
                    >
                      {item.button}
                      <MoveUpRight
                        size={19}
                        className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </div>

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-24 right-7 text-5xl font-bold opacity-10"
                  >
                    {item.number}
                  </span>
                </article>
              );
            })}
          </div>

          {/* Notification CTA */}
          <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-white/20 pt-7 text-center sm:flex-row sm:text-left lg:mt-8 lg:pt-6">
            <div>
              <p className="text-lg font-bold tracking-tight sm:text-xl">
                Not ready to lead? That&apos;s okay.
              </p>
              <p className="mt-1 text-sm text-white/70">
                Your city. Your people. Your next chapter.
              </p>
            </div>

            <button
              type="button"
              onClick={openModal}
              className="group inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-3 rounded-full bg-[#d4ff3f] px-6 py-3 text-sm font-bold text-[#24152e] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              <BellRing size={18} />
              Notify Me When Purple Arrives
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Notification modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#180e20]/75 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notify-title"
            className="relative my-auto w-full max-w-lg overflow-visible font-sans rounded-[28px] border-2 border-[#24152e] bg-[#fffaf0] text-[#f4f4f4] shadow-[8px_8px_0_#d4ff3f] sm:rounded-[32px]"
          >
            {/* Modal top strip */}
            <div className="relative overflow-hidden rounded-t-[26px] bg-[#6b3fa0] px-5 pb-5 pt-5 sm:px-7 sm:pt-6 ">
              <div className="absolute -right-5 -top-8 h-28 w-28 rounded-full border-[14px] border-white/20" />

              <button
                type="button"
                onClick={() => !submitting && setModalOpen(false)}
                disabled={submitting}
                aria-label="Close modal"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center text-black justify-center rounded-full border-2 border-[#24152e] bg-[#fffaf0] transition hover:rotate-90 disabled:opacity-50"
              >
                <X size={18} />
              </button>

              <h2
                id="notify-title"
                className="relative z-10 mt-4 max-w-sm text-3xl font-bold leading-[0.98] tracking-[-0.02em] sm:text-2xl"
              >
                Let&apos;s bring
                <br />
                Purple Club to{" "}
                <span className="relative inline-block">
                  your city!
                  <span className="absolute -bottom-1 left-0 h-1 w-full -rotate-2 rounded-full bg-[#6b3fa0]" />
                </span>
              </h2>

              <p className="relative z-10 mt-3 max-w-sm text-sm leading-relaxed text-[#fff]/75">
                Tell us a little about yourself. We&apos;ll let you know
                when your Purple Club community is getting ready.
              </p>
            </div>

            {success ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-10 text-center sm:px-10 text-black">
                <div className="flex h-20 w-20 -rotate-6 items-center justify-center rounded-[25px] border-2 border-[#24152e] bg-[#d4ff3f] shadow-[4px_4px_0_#24152e]">
                  <PartyPopper size={39} strokeWidth={1.7} />
                </div>

                <h3 className="mt-7 text-3xl font-bold tracking-tight">
                  You&apos;re on the list!
                </h3>

                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#24152e]/65">
                  We can&apos;t wait to bring Purple Club to{" "}
                  <strong>{form.city}</strong>. Keep an eye on your inbox!
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e6f4a6] px-4 py-2 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  You&apos;re part of what&apos;s next
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-7 text-black font-sans">
                {/* City autocomplete */}
                <div ref={cityWrapperRef} className="relative">
                  <label
                    htmlFor="notify-city"
                    className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.09em]"
                  >
                    <MapPin size={15} className="text-[#6b3fa0]" />
                    Which city are you in?
                  </label>

                  <div
                    className={`flex min-h-12 items-center gap-2 rounded-xl border-2 bg-white px-3 transition ${
                      dropdownOpen
                        ? "border-[#6b3fa0]"
                        : "border-[#24152e]/15 focus-within:border-[#6b3fa0]"
                    }`}
                  >
                    <Search size={18} className="shrink-0 text-[#6b3fa0]" />

                    <input
                      id="notify-city"
                      type="text"
                      autoComplete="off"
                      value={cityQuery}
                      onChange={(event) => {
                        setCityQuery(event.target.value);
                        setForm((previous) => ({
                          ...previous,
                          cityId: "",
                          city: "",
                          state: "",
                        }));
                        setDropdownOpen(true);
                        setError("");
                      }}
                      onFocus={() => {
                        if (cityQuery.length >= 2) setDropdownOpen(true);
                      }}
                      placeholder="Search your city..."
                      required
                      className="min-w-0 flex-1 bg-transparent py-3 text-sm font-medium outline-none placeholder:text-[#24152e]/40"
                    />

                    {cityLoading && (
                      <LoaderCircle
                        size={17}
                        className="animate-spin text-[#6b3fa0]"
                      />
                    )}
                  </div>

                  {dropdownOpen && cityQuery.trim().length >= 2 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-48 overflow-y-auto rounded-xl border-2 border-[#24152e] bg-white p-1.5 shadow-[4px_4px_0_#d4ff3f]">
                      {cityLoading ? (
                        <div className="flex items-center gap-2 px-3 py-4 text-sm text-[#24152e]/60">
                          <LoaderCircle size={17} className="animate-spin" />
                          Finding your city...
                        </div>
                      ) : cities.length > 0 ? (
                        cities.map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => selectCity(city)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-[#f6a8d9]/35 focus-visible:bg-[#f6a8d9]/35 focus-visible:outline-none"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6b3fa0]/10 text-[#6b3fa0]">
                              <MapPin size={17} />
                            </span>
                            <span>
                              <span className="block text-sm font-bold">
                                {city.city}
                              </span>
                              {city.state && (
                                <span className="mt-0.5 block text-xs text-[#24152e]/55">
                                  {city.state}
                                </span>
                              )}
                            </span>
                            <ArrowRight size={15} className="ml-auto" />
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-sm text-[#24152e]/60">
                          No cities found. Try another spelling.
                        </p>
                      )}
                    </div>
                  )}

                  {form.cityId && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#47752c]">
                      <CheckCircle2 size={14} />
                      {form.city}
                      {form.state ? `, ${form.state}` : ""} selected
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="notify-name"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.09em]"
                  >
                    Your name
                  </label>
                  <input
                    ref={nameInputRef}
                    id="notify-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="What should we call you?"
                    maxLength={100}
                    required
                    className="min-h-12 w-full rounded-xl border-2 border-[#24152e]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#24152e]/40 focus:border-[#6b3fa0]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="notify-email"
                    className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.09em]"
                  >
                    <Mail size={14} className="text-[#6b3fa0]" />
                    Email address
                  </label>
                  <input
                    id="notify-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    maxLength={254}
                    required
                    className="min-h-12 w-full rounded-xl border-2 border-[#24152e]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#24152e]/40 focus:border-[#6b3fa0]"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label
                    htmlFor="notify-mobile"
                    className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.09em]"
                  >
                    <Phone size={14} className="text-[#6b3fa0]" />
                    Mobile number
                  </label>
                  <input
                    id="notify-mobile"
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.mobile}
                    onChange={updateField}
                    placeholder="Your contact number"
                    maxLength={20}
                    required
                    className="min-h-12 w-full rounded-xl border-2 border-[#24152e]/15 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#24152e]/40 focus:border-[#6b3fa0]"
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !form.cityId}
                  className="group flex min-h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#24152e] bg-[#d4ff3f] px-4 py-3.5 text-sm font-bold text-[#24152e] shadow-[3px_3px_0_#24152e] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#24152e] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />
                      Saving your spot...
                    </>
                  ) : (
                    <>
                      Count Me In
                      <ArrowRight
                        size={19}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] leading-relaxed text-[#24152e]/50">
                  No spam. Just a little excitement when Purple Club gets
                  closer to your city.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
