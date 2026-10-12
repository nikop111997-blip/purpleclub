"use client";

import { useEffect, useRef, useState } from "react";

import {
  User,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  BriefcaseBusiness,
  HeartPulse,
  UserRoundPlus,
  Users,
  ShieldCheck,
  BadgeCheck,
  Pencil,
  Check,
  Loader2,
  ChevronDown,
  Search,
  X,
  Lock,
  AlertCircle,
} from "lucide-react";

/* =========================================================
   PROFILE CARD + COMPACT FORM (ONE SCREEN ON DESKTOP)

   purple #6a3f9e  brand
   deep   #4B176B  banner / headings
   lime   #B9D63B  primary action
   ink    #1f1427  text
   muted  #6b6275  secondary text
   line   #e7e2ec  borders
========================================================= */

const LABEL =
  "mb-1 block text-xs font-medium text-[#4a3f54]";

const ICON_CLASS =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8fa6]";

/* =========================================================
   FIELD CLASS
========================================================= */

function fieldClass(disabled, hasIcon, extra = "") {
  return `
    h-10 w-full rounded-lg border text-sm outline-none transition-colors
    ${hasIcon ? "pl-9" : "px-3"}
    ${extra}
    ${
      disabled
        ? "cursor-default border-[#eeeaf1] bg-[#faf9fb] font-medium text-[#3a2f45]"
        : "border-[#d9d2e0] bg-white font-medium text-[#1f1427] placeholder:font-normal placeholder:text-[#a79eb0] hover:border-[#bfb4c9] focus:border-[#6a3f9e] focus:ring-4 focus:ring-[#6a3f9e]/10"
    }
  `;
}

/* =========================================================
   INSTAGRAM ICON
========================================================= */

function Instagram({ size = 20, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect
        width="20"
        height="20"
        x="2"
        y="2"
        rx="5"
        ry="5"
      />

      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />

      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/* =========================================================
   OPTIONS
========================================================= */

const HEALTH_GOALS = [
  "Weight loss",
  "Fat loss",
  "Weight gain",
  "Muscle building",
  "Improve fitness",
  "Improve strength",
  "Improve stamina",
  "Better flexibility",
  "Better overall health",
  "Stress management",
  "Lifestyle improvement",
  "General wellness",
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
];

/* =========================================================
   NORMALIZE PROFILE
========================================================= */

function normalizeProfile(profile = {}) {
  return {
    name: profile.name || "",

    age: profile.age ?? "",

    gender: profile.gender || "",

    city: profile.city || "",

    mobile: profile.mobile || profile.phone || "",

    email: profile.email || "",

    instagram:
      profile.instagram ||
      profile.instagramHandle ||
      profile.socialHandle ||
      "",

    occupation: profile.occupation || "",

    healthGoal:
      profile.healthGoal ||
      profile.healthFitnessGoal ||
      "",

    /*
      Automatically populated by API.

      Do not allow the client to manually
      change this value.
    */
    invitedBy:
      profile.invitedBy ||
      profile.inspirer ||
      profile.referrerName ||
      "",

    coachName: profile.coachName || "",

    consent:
      typeof profile.consent === "boolean"
        ? profile.consent
        : profile.consent === "true",
  };
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false,
  locked = false,
  type = "text",
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>

      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className={ICON_CLASS}
          />
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={disabled && !value ? "Not added" : placeholder}
          disabled={disabled}
          className={fieldClass(
            disabled,
            Boolean(Icon),
            locked ? "pr-[4.75rem]" : "pr-3"
          )}
        />

        {locked && (
          <span className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md bg-[#efeaf3] px-1.5 py-0.5 text-[11px] font-medium text-[#6b6275]">
            <Lock size={10} />
            Locked
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  placeholder = "Select",
  disabled = false,
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>

      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className={ICON_CLASS}
          />
        )}

        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={fieldClass(
            disabled,
            Boolean(Icon),
            `appearance-none pr-9 ${
              disabled ? "" : "cursor-pointer"
            }`
          )}
        >
          <option value="">
            {disabled && !value ? "Not added" : placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        {!disabled && (
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6a3f9e]"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CITY FIELD

   Uses:
   GET /api/cities?q=ja

   MongoDB:
   cities collection

   Example:
   {
     _id: ObjectId(...),
     city: "Jaipur",
     state: "Rajasthan"
   }

   Search is debounced by 400ms.
========================================================= */

function CityField({
  value,
  onChange,
  disabled = false,
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  const wrapperRef = useRef(null);
  const controllerRef = useRef(null);

  // The city that is already chosen / saved. Typing a different
  // text must trigger a search; matching this one must not.
  const chosenCityRef = useRef(value || "");

  /* ---------------------------------------------
     Parent changed the value from outside
     (profile loaded, Cancel pressed)
  --------------------------------------------- */

  useEffect(() => {
    if ((value || "") !== query) {
      setQuery(value || "");
      chosenCityRef.current = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* ---------------------------------------------
     Debounced city search
  --------------------------------------------- */

  useEffect(() => {
    if (disabled) {
      setOpen(false);
      setResults([]);
      return;
    }

    const trimmed = query.trim();

    // Search starts at 2 characters
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      setSearched(false);

      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      return;
    }

    // Already the chosen city: don't search again
    if (
      trimmed.toLowerCase() ===
      chosenCityRef.current.trim().toLowerCase()
    ) {
      setResults([]);
      setOpen(false);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        if (controllerRef.current) {
          controllerRef.current.abort();
        }

        const controller = new AbortController();
        controllerRef.current = controller;

        setLoading(true);

        const response = await fetch(
          `/api/cities?q=${encodeURIComponent(trimmed)}`,
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `City search failed (${response.status})`
          );
        }

        const data = await response.json();

        const cities = Array.isArray(data?.cities)
          ? data.cities
          : [];

        setResults(cities);
        setSearched(true);
        setOpen(true);
      } catch (error) {
        // Abort is expected when the user keeps typing
        if (error?.name !== "AbortError") {
          console.error("CITY SEARCH ERROR:", error);

          setResults([]);
          setSearched(false);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [query, disabled]);

  /* ---------------------------------------------
     Abort request on unmount
  --------------------------------------------- */

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  /* ---------------------------------------------
     Outside click
  --------------------------------------------- */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* ---------------------------------------------
     Select city
  --------------------------------------------- */

  function selectCity(city) {
    const cityName = city?.city || "";

    // Remember it so we don't search for it again
    chosenCityRef.current = cityName;

    setQuery(cityName);

    // Only the city name goes to the parent: "Jaipur"
    onChange(cityName);

    setOpen(false);
    setResults([]);
    setSearched(false);
  }

  /* ---------------------------------------------
     Clear city
  --------------------------------------------- */

  function clearCity() {
    chosenCityRef.current = "";

    setQuery("");
    onChange("");

    setResults([]);
    setOpen(false);
    setSearched(false);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }

  const dropdown =
    "absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[#d9d2e0] bg-white";

  return (
    <div ref={wrapperRef} className="relative">
      <label className={LABEL}>City</label>

      <div className="relative">
        <MapPin size={15} className={ICON_CLASS} />

        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            const newValue = e.target.value;

            setQuery(newValue);

            // Keep the form in sync while typing
            onChange(newValue);
          }}
          onFocus={() => {
            if (!disabled && results.length > 0) {
              setOpen(true);
            }
          }}
          placeholder={disabled && !query ? "Not added" : "Search your city"}
          autoComplete="off"
          className={fieldClass(disabled, true, "pr-9")}
        />

        {loading && !disabled ? (
          <Loader2
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#6a3f9e]"
          />
        ) : query && !disabled ? (
          <button
            type="button"
            onClick={clearCity}
            aria-label="Clear city"
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#9a8fa6] transition hover:bg-[#6a3f9e]/10 hover:text-[#6a3f9e]"
          >
            <X size={14} />
          </button>
        ) : !disabled ? (
          <Search
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8fa6]"
          />
        ) : null}
      </div>

      {/* Results */}
      {!disabled && open && results.length > 0 && (
        <div className={`${dropdown} max-h-56 overflow-y-auto p-1`}>
          {results.map((city, index) => (
            <button
              key={`${city.id || city.city}-${index}`}
              type="button"
              onClick={() => selectCity(city)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition hover:bg-[#6a3f9e]/8"
            >
              <MapPin size={14} className="shrink-0 text-[#6a3f9e]" />

              <span className="min-w-0 truncate text-sm font-medium text-[#1f1427]">
                {city.city}

                {city.state && (
                  <span className="font-normal text-[#6b6275]">
                    {" "}
                    · {city.state}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No result */}
      {!disabled &&
        open &&
        !loading &&
        searched &&
        results.length === 0 && (
          <div
            className={`${dropdown} p-3 text-center text-xs text-[#6b6275]`}
          >
            No Indian city found
          </div>
        )}
    </div>
  );
}

/* =========================================================
   PROFILE CLIENT
========================================================= */

export default function ProfileClient() {
  const [profile, setProfile] =
    useState(null);

  const [form, setForm] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  async function loadProfile() {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        "/api/auth/user/profile",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to load profile"
        );
      }

      setProfile(data.profile);

      setForm(
        normalizeProfile(
          data.profile
        )
      );
    } catch (err) {
      console.error(
        "PROFILE LOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to load your profile"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  /* =======================================================
     UPDATE FORM FIELD
  ======================================================= */

  function updateField(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =======================================================
     CANCEL EDITING
  ======================================================= */

  function cancelEditing() {
    setForm(
      normalizeProfile(profile)
    );

    setEditing(false);

    setError("");

    setMessage("");
  }

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  async function saveProfile() {
    try {
      setSaving(true);

      setError("");

      setMessage("");

      const age =
        form.age === "" ||
        form.age === null ||
        form.age === undefined
          ? null
          : Number(form.age);

      /*
        IMPORTANT:

        invitedBy is intentionally NOT included.

        The backend automatically determines
        the Inspirer from guest_invites/referral.
      */
      const payload = {
        name:
          form.name?.trim() || "",

        age,

        gender:
          form.gender || "",

        city:
          form.city?.trim() || "",

        email:
          form.email
            ?.trim()
            .toLowerCase() || "",

        instagram:
          form.instagram?.trim() || "",

        occupation:
          form.occupation?.trim() || "",

        healthGoal:
          form.healthGoal || "",

        coachName:
          form.coachName?.trim() || "",

        consent:
          Boolean(form.consent),
      };

      const response = await fetch(
        "/api/auth/user/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to update profile"
        );
      }

      /*
        API returns the latest profile,
        including automatic invitedBy.
      */
      const updatedProfile =
        data.profile || {
          ...profile,
          ...payload,

          /*
            Mobile never changes.
          */
          mobile: form.mobile,
        };

      setProfile(
        updatedProfile
      );

      setForm(
        normalizeProfile(
          updatedProfile
        )
      );

      setEditing(false);

      setMessage(
        "Profile updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "PROFILE SAVE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm font-medium text-[#6a3f9e]">
          <Loader2
            size={18}
            className="animate-spin"
          />

          Loading profile...
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !profile) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-5 font-sans text-sm text-red-700">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />

        {error}
      </div>
    );
  }

  const initial = (
    form.name || "P"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  /* Chips shown under the name (only when filled) */
  const chips = [
    form.healthGoal,
    form.coachName && `Coach: ${form.coachName}`,
    form.invitedBy && `Inspirer: ${form.invitedBy}`,
  ].filter(Boolean);

  /* Stats row at the bottom of the profile card */
  const stats = [
    {
      icon: CalendarDays,
      value: form.age !== "" && form.age !== null ? form.age : "—",
      label: "Age",
    },
    {
      icon: User,
      value: form.gender || "—",
      label: "Gender",
    },
    {
      icon: MapPin,
      value: form.city || "—",
      label: "City",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="w-full font-sans">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <aside className="overflow-hidden rounded-2xl border border-[#e7e2ec] bg-white">
          {/* Banner */}
          <div
            className="relative h-36"
            style={{
              background:
                "radial-gradient(120% 140% at 85% 110%, rgba(185,214,59,0.85) 0%, rgba(185,214,59,0) 55%), linear-gradient(135deg, #4B176B 0%, #6a3f9e 100%)",
            }}
          >
            <img src="/dance.png" alt="Profile banner" className="h-full w-full object-contain opacity-60" />
            <span className="absolute top-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/40 px-3 py-1 text-xs font-semibold text-[#fff]">
              <span className="h-2 w-2 rounded-full bg-[#B9D63B]" />
              Purple member
            </span>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar overlapping banner */}
            {/* <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#6a3f9e] text-3xl font-semibold text-white ring-2 ring-[#B9D63B]">
              {initial}
            </div> */}

            {/* Name + verified */}
            <div className="mt-3 flex items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight text-[#1f1427]">
                {form.name ||
                  "Complete your profile"}
              </h1>

              {form.name && (
                <BadgeCheck
                  size={20}
                  className="shrink-0 text-[#6a3f9e]"
                />
              )}
            </div>

            <p className="mt-0.5 text-sm text-[#4a3f54]">
              {form.occupation || "Occupation not added"}
            </p>

            {/* Divider */}
            <div className="my-4 h-px bg-[#eeeaf1]" />

            {/* Chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[#6a3f9e] px-3 py-1 text-xs font-medium text-white"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}

            {/* Contact lines */}
            <div className="mt-4 space-y-2 text-sm text-[#4a3f54]">
              <p className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-[#6a3f9e]" />

                <span className="truncate">
                  {form.mobile || "Mobile not added"}
                </span>
              </p>

              <p className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-[#6a3f9e]" />

                <span className="truncate">
                  {form.email || "Email not added"}
                </span>
              </p>

              <p className="flex items-center gap-2.5">
                <Instagram size={14} className="shrink-0 text-[#6a3f9e]" />

                <span className="truncate">
                  {form.instagram || "Social handle not added"}
                </span>
              </p>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-[#e7e2ec] rounded-xl border border-[#e7e2ec] bg-[#faf9fb] py-3">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex min-w-0 flex-col items-center px-2"
                >
                  <span className="max-w-full truncate text-base font-semibold text-[#1f1427]">
                    {value}
                  </span>

                  <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#6b6275]">
                    <Icon size={12} className="text-[#6a3f9e]" />
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* =================================================
            DETAILS FORM
        ================================================= */}

        <div className="rounded-2xl border border-[#e7e2ec] bg-white p-5">
          {/* Header + actions */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#1f1427]">
                Profile details
              </h2>

              <p className="text-xs text-[#6b6275]">
                {editing
                  ? "Update your information, then save your changes."
                  : "Your information is used only for your Purple membership experience."}
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);

                  setMessage("");

                  setError("");
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#B9D63B] px-5 text-sm font-semibold text-[#1E2A00] transition hover:bg-[#c6e04c] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B9D63B]/40 active:scale-[0.98]"
              >
                <Pencil size={14} />

                Edit profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    cancelEditing
                  }
                  disabled={saving}
                  className="h-10 rounded-lg border border-[#d9d2e0] bg-white px-5 text-sm font-semibold text-[#4B176B] transition hover:bg-[#faf9fb] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#6a3f9e]/15 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    saveProfile
                  }
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#B9D63B] px-5 text-sm font-semibold text-[#1E2A00] transition hover:bg-[#c6e04c] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B9D63B]/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />

                      Save changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Success message */}
          {message && (
            <div
              role="status"
              className="mb-3 flex items-center gap-2 rounded-lg border border-[#B9D63B]/50 bg-[#B9D63B]/15 px-3 py-2 text-sm font-medium text-[#3f5000]"
            >
              <Check size={15} />

              {message}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />

              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
            {/* NAME */}

            <InputField
              label="Full name"
              value={form.name}
              onChange={(v) =>
                updateField(
                  "name",
                  v
                )
              }
              placeholder="Enter your name"
              icon={User}
              disabled={!editing}
            />

            {/* AGE */}

            <InputField
              label="Age"
              value={form.age}
              onChange={(v) =>
                updateField(
                  "age",
                  v
                )
              }
              placeholder="Enter your age"
              type="number"
              icon={CalendarDays}
              disabled={!editing}
            />

            {/* GENDER */}

            <SelectField
              label="Gender"
              value={form.gender}
              onChange={(v) =>
                updateField(
                  "gender",
                  v
                )
              }
              options={
                GENDER_OPTIONS
              }
              icon={User}
              placeholder="Select gender"
              disabled={!editing}
            />

            {/* CITY */}

            <CityField
              value={form.city}
              onChange={(v) =>
                updateField(
                  "city",
                  v
                )
              }
              disabled={!editing}
            />

            {/* MOBILE */}

            <InputField
              label="Mobile number"
              value={form.mobile}
              onChange={() => {}}
              placeholder="Mobile number"
              icon={Phone}
              disabled
              locked
            />

            {/* EMAIL */}

            <InputField
              label="Email"
              value={form.email}
              onChange={(v) =>
                updateField(
                  "email",
                  v
                )
              }
              placeholder="Enter your email"
              icon={Mail}
              type="email"
              disabled={!editing}
            />

            {/* INSTAGRAM */}

            <InputField
              label="Instagram / social handle"
              value={form.instagram}
              onChange={(v) =>
                updateField(
                  "instagram",
                  v
                )
              }
              placeholder="@username"
              icon={Instagram}
              disabled={!editing}
            />

            {/* OCCUPATION */}

            <InputField
              label="Occupation"
              value={form.occupation}
              onChange={(v) =>
                updateField(
                  "occupation",
                  v
                )
              }
              placeholder="Enter your occupation"
              icon={BriefcaseBusiness}
              disabled={!editing}
            />

            {/* HEALTH GOAL */}

            <SelectField
              label="Health / fitness goal"
              value={form.healthGoal}
              onChange={(v) =>
                updateField(
                  "healthGoal",
                  v
                )
              }
              options={
                HEALTH_GOALS
              }
              icon={HeartPulse}
              placeholder="Select your goal"
              disabled={!editing}
            />

            {/* =================================================
                INSPIRER

                Automatically assigned.
                User cannot edit it.
            ================================================= */}

            <InputField
              label="Your Inspirer"
              value={form.invitedBy}
              onChange={() => {}}
              placeholder="Automatically assigned"
              icon={UserRoundPlus}
              disabled
              locked
            />

            {/* COACH */}

            <InputField
              label="Coach name"
              value={form.coachName}
              onChange={(v) =>
                updateField(
                  "coachName",
                  v
                )
              }
              placeholder="Enter coach name"
              icon={Users}
              disabled={!editing}
            />

            {/* =================================================
                CONSENT
            ================================================= */}

            <div>
              <label className={LABEL}>
                Consent
              </label>

              <label
                className={`
                  flex h-10 items-center gap-2.5 rounded-lg border px-3 transition-colors
                  ${
                    form.consent
                      ? "border-[#B9D63B] bg-[#B9D63B]/10"
                      : "border-[#d9d2e0] bg-white"
                  }
                  ${
                    editing
                      ? "cursor-pointer hover:border-[#6a3f9e]/50"
                      : "cursor-default border-[#eeeaf1] bg-[#faf9fb]"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={Boolean(
                    form.consent
                  )}
                  onChange={(e) =>
                    updateField(
                      "consent",
                      e.target.checked
                    )
                  }
                  disabled={!editing}
                  className="h-4 w-4 shrink-0 accent-[#6a3f9e]"
                />

                <ShieldCheck
                  size={14}
                  className="shrink-0 text-[#6a3f9e]"
                />

                <span className="truncate text-xs font-medium text-[#1f1427]">
                  I agree to share my profile info
                </span>
              </label>
            </div>
          </div>

          {/* Footnote */}
          <p className="mt-4 flex items-center gap-1.5 border-t border-[#eeeaf1] pt-3 text-xs text-[#6b6275]">
            <Lock
              size={12}
              className="shrink-0 text-[#6a3f9e]"
            />

            Your mobile number is linked to your membership and can't be
            changed.
          </p>
        </div>
      </div>
    </section>
  );
}