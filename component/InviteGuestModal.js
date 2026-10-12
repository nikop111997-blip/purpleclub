"use client";

import { useEffect, useState } from "react";
import {
  X,
  UserPlus,
  CalendarDays,
  Phone,
  User,
  Copy,
  Check,
  Share2,
  Loader2,
} from "lucide-react";

const PURPLE = "#6a3f9e";
const LIME = "#b9d63b";

export default function InviteGuestModal({
  open,
  onClose,
  events = [],
}) {
  const [eventId, setEventId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestMobile, setGuestMobile] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setEventId("");
      setGuestName("");
      setGuestMobile("");
      setLoading(false);
      setError("");
      setInvite(null);
      setCopied(false);
    }
  }, [open]);

  if (!open) return null;

  const formatEventDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setCopied(false);

    const cleanName = guestName.trim();
    const cleanMobile = guestMobile.replace(/\D/g, "");

    if (!eventId) {
      setError("Please select an experience.");
      return;
    }

    if (!cleanName) {
      setError("Please enter your guest's name.");
      return;
    }

    if (!/^\d{10}$/.test(cleanMobile)) {
      setError("Please enter a valid 10 digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/user/guest-invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            eventId,
            guestName: cleanName,
            guestMobile: cleanMobile,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create invitation."
        );
      }

      setInvite(data.invite);
    } catch (error) {
      console.error("INVITE GUEST ERROR:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!invite?.inviteUrl) return;

    try {
      await navigator.clipboard.writeText(
        invite.inviteUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("COPY ERROR:", error);
    }
  };

  const handleWhatsApp = () => {
    if (!invite?.inviteUrl) return;

    const selectedEvent = events.find(
      (event) => event.id === invite.eventId
    );

    const eventName =
      selectedEvent?.name || "Purple Experience";

    const eventDate = selectedEvent
      ? formatEventDate(selectedEvent.date)
      : "";

    const message = [
      `Hey ${invite.guestName}! 💜`,
      "",
      `I'd love to invite you to a Purple experience.`,
      "",
      `✨ ${eventName}`,
      eventDate ? `📅 ${eventDate}` : "",
      "",
      `Join using this link:`,
      invite.inviteUrl,
      "",
      `See you there!`,
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl =
      `https://wa.me/91${invite.guestMobile}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
        {/* Header */}
        <div
          className="relative px-6 py-6 sm:px-7"
          style={{
            background: `linear-gradient(135deg, ${PURPLE}, #8153b5)`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: LIME }}
            >
              <UserPlus
                size={22}
                className="text-[#120d1a]"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Invite a Guest
              </h2>

              <p className="mt-1 text-sm text-white/75">
                Bring someone along to experience Purple.
              </p>
            </div>
          </div>
        </div>

        {!invite ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6 sm:p-7"
          >
            {/* Event */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#120d1a]">
                Choose Experience
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a3f9e]"
                />

                <select
                  value={eventId}
                  onChange={(e) =>
                    setEventId(e.target.value)
                  }
                  className="w-full appearance-none rounded-2xl border border-black/10 bg-[#faf9fc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#6a3f9e]"
                >
                  <option value="">
                    Select an experience
                  </option>

                  {events.map((event) => (
                    <option
                      key={event.id}
                      value={event.id}
                    >
                      {event.name}
                      {event.date
                        ? ` — ${formatEventDate(event.date)}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#120d1a]">
                Guest Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a3f9e]"
                />

                <input
                  type="text"
                  value={guestName}
                  onChange={(e) =>
                    setGuestName(e.target.value)
                  }
                  placeholder="Enter guest name"
                  className="w-full rounded-2xl border border-black/10 bg-[#faf9fc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#6a3f9e]"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#120d1a]">
                Guest Mobile
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a3f9e]"
                />

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={guestMobile}
                  onChange={(e) =>
                    setGuestMobile(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="10 digit mobile number"
                  className="w-full rounded-2xl border border-black/10 bg-[#faf9fc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#6a3f9e]"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#120d1a] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: LIME }}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating invitation...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Guest Invitation
                </>
              )}
            </button>
          </form>
        ) : (
          /* Success */
          <div className="space-y-5 p-6 sm:p-7">
            <div className="rounded-2xl bg-[#f5f8e9] p-5">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: LIME }}
                >
                  <Check
                    size={20}
                    className="text-[#120d1a]"
                  />
                </div>

                <div>
                  <p className="font-bold text-[#120d1a]">
                    Invitation ready!
                  </p>

                  <p className="text-sm text-black/60">
                    Send it to {invite.guestName}.
                  </p>
                </div>
              </div>

              <div className="break-all rounded-xl bg-white px-4 py-3 text-sm text-black/70">
                {invite.inviteUrl}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-[#120d1a] transition hover:bg-black/[0.03]"
              >
                {copied ? (
                  <>
                    <Check size={17} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={17} />
                    Copy Link
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#120d1a] transition hover:opacity-90"
                style={{ backgroundColor: LIME }}
              >
                <Share2 size={17} />
                WhatsApp
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-[#6a3f9e] px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}