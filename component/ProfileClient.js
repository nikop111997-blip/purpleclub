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
  Pencil,
  Check,
  Loader2,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

/* =========================================================
   FLAT, ONE-SCREEN PROFILE
   lime   #B9D63B  (primary action)
   purple #6a3f9e  (brand)
   No blur, gradients or shadows: solid colours and thin borders.
========================================================= */

const LABEL = "mb-1 block text-[11px] font-semibold text-[#6f6577]";
const ICON_CLASS =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7898]";

function fieldClass(disabled, hasIcon, extra = "") {
  return `h-10 w-full rounded-xl border text-sm font-medium outline-none transition ${
    hasIcon ? "pl-9" : "px-3"
  } ${extra} ${
    disabled
      ? "cursor-not-allowed border-[#ece8ef] bg-[#f6f4f8] text-[#8b8190]"
      : "border-[#e2dce8] bg-white text-[#24112f] placeholder:text-[#aaa0b0] focus:border-[#6a3f9e] focus:ring-2 focus:ring-[#6a3f9e]/15"
  }`;
}

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
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

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
      profile.instagram || profile.instagramHandle || profile.socialHandle || "",
    occupation: profile.occupation || "",
    healthGoal: profile.healthGoal || profile.healthFitnessGoal || "",
    invitedBy:
      profile.invitedBy || profile.inspirer || profile.referrerName || "",
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
        {Icon && <Icon size={15} className={ICON_CLASS} />}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={fieldClass(disabled, Boolean(Icon), "pr-3")}
        />

        {locked && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-[#e9e5ec] px-2 py-0.5 text-[10px] font-semibold text-[#76677e]">
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
        {Icon && <Icon size={15} className={ICON_CLASS} />}

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={fieldClass(
            disabled,
            Boolean(Icon),
            `appearance-none pr-9 ${disabled ? "" : "cursor-pointer"}`
          )}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6a3f9e]"
        />
      </div>
    </div>
  );
}

/* =========================================================
   CITY FIELD
   API: Open-Meteo Geocoding (free, no key, CORS enabled)
   https://geocoding-api.open-meteo.com/v1/search
========================================================= */

function CityField({ value, onChange, disabled = false }) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  const wrapperRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
      setResults([]);
      return;
    }

    const trimmed = query.trim();

    if (trimmed.length < 2 || trimmed === value) {
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

        const url =
          "https://geocoding-api.open-meteo.com/v1/search" +
          `?name=${encodeURIComponent(trimmed)}` +
          "&count=10&language=en&format=json&countryCode=IN";

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Failed to search cities");
        }

        const data = await response.json();

        // No matches: the API omits "results" entirely.
        const list = Array.isArray(data?.results) ? data.results : [];

        // Remove duplicates (same city + state)
        const seen = new Set();

        const cities = list
          .map((item) => ({
            id: item.id,
            name: item.name,
            state: item.admin1 || "",
          }))
          .filter((item) => {
            const key = `${item.name}|${item.state}`.toLowerCase();

            if (!item.name || seen.has(key)) return false;

            seen.add(key);
            return true;
          });

        setResults(cities);
        setSearched(true);
        setOpen(true);
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("CITY SEARCH ERROR:", error);
          setResults([]);
          setSearched(false);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query, value, disabled]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function selectCity(city) {
    setQuery(city.name);
    onChange(city.name);

    setOpen(false);
    setResults([]);
  }

  function clearCity() {
    setQuery("");
    onChange("");

    setResults([]);
    setOpen(false);
  }

  const dropdown =
    "absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#e2dce8] bg-white";

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
            onChange(newValue);
          }}
          onFocus={() => {
            if (!disabled && results.length > 0) setOpen(true);
          }}
          placeholder="Search your city"
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
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#8b7898] transition hover:bg-[#6a3f9e]/10 hover:text-[#6a3f9e]"
          >
            <X size={14} />
          </button>
        ) : (
          <Search
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7898]"
          />
        )}
      </div>

      {/* Results */}
      {!disabled && open && results.length > 0 && (
        <div className={`${dropdown} max-h-56 overflow-y-auto p-1`}>
          {results.map((city, index) => (
            <button
              key={`${city.id ?? city.name}-${index}`}
              type="button"
              onClick={() => selectCity(city)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-[#6a3f9e]/8"
            >
              <MapPin size={14} className="shrink-0 text-[#6a3f9e]" />

              <span className="min-w-0 truncate text-sm font-medium text-[#33243d]">
                {city.name}
                {city.state && (
                  <span className="font-normal text-[#8b8190]">
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
      {!disabled && open && !loading && searched && results.length === 0 && (
        <div className={`${dropdown} p-3 text-center text-xs text-[#8b8190]`}>
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
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ---------- load ---------- */

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/user/profile", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load profile");
      }

      setProfile(data.profile);
      setForm(normalizeProfile(data.profile));
    } catch (err) {
      console.error("PROFILE LOAD ERROR:", err);

      setError(err?.message || "Failed to load your profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  /* ---------- update / cancel ---------- */

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function cancelEditing() {
    setForm(normalizeProfile(profile));

    setEditing(false);
    setError("");
    setMessage("");
  }

  /* ---------- save ---------- */

  async function saveProfile() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const age =
        form.age === "" || form.age === null || form.age === undefined
          ? null
          : Number(form.age);

      const payload = {
        name: form.name?.trim() || "",
        age,
        gender: form.gender || "",
        city: form.city?.trim() || "",
        email: form.email?.trim().toLowerCase() || "",
        instagram: form.instagram?.trim() || "",
        occupation: form.occupation?.trim() || "",
        healthGoal: form.healthGoal || "",
        invitedBy: form.invitedBy?.trim() || "",
        coachName: form.coachName?.trim() || "",
        consent: Boolean(form.consent),
      };

      const response = await fetch("/api/auth/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update profile");
      }

      const updatedProfile = data.profile || {
        ...profile,
        ...payload,
        // Never change mobile
        mobile: form.mobile,
      };

      setProfile(updatedProfile);
      setForm(normalizeProfile(updatedProfile));

      setEditing(false);
      setMessage("Profile updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("PROFILE SAVE ERROR:", err);

      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- loading / error ---------- */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#6a3f9e]">
          <Loader2 size={18} className="animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 font-sans text-sm text-red-700">
        {error}
      </div>
    );
  }

  const initial = (form.name || "P").trim().charAt(0).toUpperCase();

  /* ---------- UI ---------- */

  return (
    <section className="w-full font-sans">
      {/* ================= HEADER ================= */}

      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6a3f9e] text-lg font-bold text-white">
            {initial}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-[#24112f]">
              {form.name || "Complete your profile"}
            </h1>

            <p className="text-xs text-[#8a8190]">
              Purple member · Profile details
            </p>
          </div>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setMessage("");
              setError("");
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#B9D63B] px-5 text-sm font-semibold text-[#1E2A00] transition hover:bg-[#c6e04c] active:scale-[0.98]"
          >
            <Pencil size={14} />
            Edit profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="h-10 rounded-full border border-[#e2dce8] bg-white px-5 text-sm font-semibold text-[#4B176B] transition hover:bg-[#f6f4f8] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#B9D63B] px-5 text-sm font-semibold text-[#1E2A00] transition hover:bg-[#c6e04c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
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
      </header>

      {/* ================= MESSAGES ================= */}

      {message && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#B9D63B]/20 px-3 py-2 text-xs font-semibold text-[#3f5000]">
          <Check size={14} />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ================= FORM ================= */}

      <div className="rounded-2xl border border-[#ece8ef] bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <InputField
            label="Name"
            value={form.name}
            onChange={(v) => updateField("name", v)}
            placeholder="Enter your name"
            icon={User}
            disabled={!editing}
          />

          <InputField
            label="Age"
            value={form.age}
            onChange={(v) => updateField("age", v)}
            placeholder="Enter your age"
            type="number"
            icon={CalendarDays}
            disabled={!editing}
          />

          <SelectField
            label="Gender"
            value={form.gender}
            onChange={(v) => updateField("gender", v)}
            options={GENDER_OPTIONS}
            icon={User}
            placeholder="Select gender"
            disabled={!editing}
          />

          <CityField
            value={form.city}
            onChange={(v) => updateField("city", v)}
            disabled={!editing}
          />

          <InputField
            label="Mobile number"
            value={form.mobile}
            onChange={() => {}}
            placeholder="Mobile number"
            icon={Phone}
            disabled
            locked
          />

          <InputField
            label="Email"
            value={form.email}
            onChange={(v) => updateField("email", v)}
            placeholder="Enter your email"
            icon={Mail}
            type="email"
            disabled={!editing}
          />

          <InputField
            label="Instagram / social handle"
            value={form.instagram}
            onChange={(v) => updateField("instagram", v)}
            placeholder="@username"
            icon={Instagram}
            disabled={!editing}
          />

          <InputField
            label="Occupation"
            value={form.occupation}
            onChange={(v) => updateField("occupation", v)}
            placeholder="Enter your occupation"
            icon={BriefcaseBusiness}
            disabled={!editing}
          />

          <SelectField
            label="Health / fitness goal"
            value={form.healthGoal}
            onChange={(v) => updateField("healthGoal", v)}
            options={HEALTH_GOALS}
            icon={HeartPulse}
            placeholder="Select your goal"
            disabled={!editing}
          />

          <InputField
            label="Who invited you? (Inspirer)"
            value={form.invitedBy}
            onChange={(v) => updateField("invitedBy", v)}
            placeholder="Enter inspirer's name"
            icon={UserRoundPlus}
            disabled={!editing}
          />

          <InputField
            label="Coach name"
            value={form.coachName}
            onChange={(v) => updateField("coachName", v)}
            placeholder="Enter coach name"
            icon={Users}
            disabled={!editing}
          />

          {/* Consent (fills the last cell) */}
          <div>
            <label className={LABEL}>Consent</label>

            <label
              className={`flex h-10 items-center gap-2.5 rounded-xl border px-3 transition ${
                form.consent
                  ? "border-[#B9D63B] bg-[#B9D63B]/15"
                  : "border-[#e2dce8] bg-white"
              } ${editing ? "cursor-pointer" : "cursor-default opacity-80"}`}
            >
              <input
                type="checkbox"
                checked={Boolean(form.consent)}
                onChange={(e) => updateField("consent", e.target.checked)}
                disabled={!editing}
                className="h-4 w-4 shrink-0 accent-[#6a3f9e]"
              />

              <ShieldCheck size={14} className="shrink-0 text-[#6a3f9e]" />

              <span className="truncate text-xs font-medium text-[#2d1b38]">
                I agree to share my profile info
              </span>
            </label>
          </div>
        </div>

        {/* Footnotes */}
        <div className="mt-4 flex flex-col gap-1 border-t border-[#f0edf3] pt-3 text-[11px] leading-4 text-[#8a8190] sm:flex-row sm:justify-between">
          <p className="flex items-center gap-1.5">
            <Phone size={12} className="shrink-0 text-[#6a3f9e]" />
            Your mobile number is linked to your membership and can't be
            changed.
          </p>

          <p>
            Your information is used only for your Purple membership
            experience.
          </p>
        </div>
      </div>
    </section>
  );
}