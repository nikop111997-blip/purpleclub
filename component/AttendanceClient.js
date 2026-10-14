"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Search,
  Loader2,
  ChevronRight,
  Sparkles,
  Star,
  X,
  MessageSquareText,
  Send,
} from "lucide-react";
import AttendanceMilestones from "./AttendanceMilestones";

const PURPLE = "#6a3f9e";
const MILESTONES = [10, 25, 50, 75, 100];

const REVIEW_OPTIONS = [
  "Great experience",
  "Amazing trainer",
  "Welcoming community",
  "Well organised",
  "Fun and engaging",
  "Great venue",
];

const EMPTY_REVIEW = {
  rating: 0,
  highlights: [],
  review: "",
};

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AttendanceClient() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    attended: 0,
    reserved: 0,
  });

  const [badges, setBadges] = useState({
    milestones: MILESTONES,
    earned: [],
    next: 10,
    remaining: 10,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW);

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/user/attendance", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load attendance.");
      }

      const history = (data.history || []).map((item) => ({
        ...item,
        review: item.review || null,
      }));

      // Load each existing review so the table shows a star after refresh.
      const reviewedHistory = await Promise.all(
        history.map(async (item) => {
          if (
            item.status !== "Attended" ||
            !item.id
          ) {
            return item;
          }

          try {
            const reviewResponse = await fetch(
              `/api/auth/user/attendance/review?attendanceId=${encodeURIComponent(item.id)}`,
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              }
            );

            const reviewData = await reviewResponse.json();

            if (reviewResponse.ok && reviewData.success) {
              return {
                ...item,
                review: reviewData.review || null,
              };
            }
          } catch (reviewLoadError) {
            console.error("Review loading error:", reviewLoadError);
          }

          return item;
        })
      );

      setAttendance(reviewedHistory);

      setSummary({
        total: data.summary?.total || 0,
        attended: data.summary?.attended || 0,
        reserved: data.summary?.reserved || 0,
      });

      setBadges({
        milestones: data.badges?.milestones || MILESTONES,
        earned: data.badges?.earned || [],
        next: data.badges?.next ?? null,
        remaining: data.badges?.remaining || 0,
      });
    } catch (err) {
      console.error("Attendance loading error:", err);
      setError(err.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attendance.filter((item) => {
      const matchesSearch =
        !query ||
        item.eventName?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [attendance, search, filter]);

  async function openReviewModal(item) {
    setSelectedExperience(item);
    setReviewModalOpen(true);
    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");
    setReviewForm(EMPTY_REVIEW);

    if (item.status !== "Attended") {
      setReviewError(
        "You can submit a review after attending this experience."
      );
      setReviewLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/auth/user/attendance/review?attendanceId=${encodeURIComponent(item.id)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load your review.");
      }

      const savedReview = data.review;

      setReviewForm(
        savedReview
          ? {
              rating: savedReview.rating || 0,
              highlights: savedReview.highlights || [],
              review: savedReview.review || "",
            }
          : EMPTY_REVIEW
      );
    } catch (err) {
      setReviewError(err.message || "Unable to load your review.");
    } finally {
      setReviewLoading(false);
    }
  }

  function closeReviewModal() {
    if (reviewSaving) return;

    setReviewModalOpen(false);
    setSelectedExperience(null);
    setReviewError("");
    setReviewSuccess("");
  }

  function toggleReviewHighlight(option) {
    setReviewForm((previous) => ({
      ...previous,
      highlights: previous.highlights.includes(option)
        ? previous.highlights.filter((item) => item !== option)
        : [...previous.highlights, option],
    }));
  }

  async function submitReview() {
    if (!selectedExperience) return;

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewError("Please select a star rating.");
      return;
    }

    if (
      !reviewForm.review.trim() &&
      reviewForm.highlights.length === 0
    ) {
      setReviewError(
        "Select at least one review option or write a short review."
      );
      return;
    }

    try {
      setReviewSaving(true);
      setReviewError("");
      setReviewSuccess("");

      const response = await fetch("/api/auth/user/attendance/review", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceId: selectedExperience.id,
          rating: reviewForm.rating,
          highlights: reviewForm.highlights,
          review: reviewForm.review.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save your review.");
      }

      const savedReview = {
        rating: reviewForm.rating,
        highlights: reviewForm.highlights,
        review: reviewForm.review.trim(),
        updatedAt: new Date().toISOString(),
      };

      setAttendance((previous) =>
        previous.map((item) =>
          item.id === selectedExperience.id
            ? { ...item, review: savedReview }
            : item
        )
      );

      setSelectedExperience((previous) =>
        previous
          ? { ...previous, review: savedReview }
          : previous
      );

      setReviewSuccess("Your review has been saved successfully.");
    } catch (err) {
      setReviewError(err.message || "Unable to save your review.");
    } finally {
      setReviewSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2
            className="h-5 w-5 animate-spin"
            style={{ color: PURPLE }}
          />
          Loading your attendance...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 font-sans text-[#24112f] sm:px-6 lg:px-8">
      <div>
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#806c91]">
              <Sparkles size={14} />
              Purple Club
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Attendance
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#766d7c]">
              Your experiences, check-ins, and milestones—all in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAttendance}
            className="rounded-xl border border-[#e9e3ee] bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#f7f3fa]"
          >
            Refresh
          </button>
        </header>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadAttendance}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        <AttendanceMilestones attendanceCount={summary.attended} />

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Experience history
              </h2>
              <p className="mt-1 text-sm text-[#817789]">
                A record of your registrations and check-ins.
              </p>
            </div>

            <span className="text-xs text-[#8b8093]">
              {filteredAttendance.length} records
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e9e3ee] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#eee9f2] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#968a9f]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search experiences..."
                  className="w-full rounded-lg border border-[#e9e3ee] bg-[#fcfbfd] py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#a58ac0] focus:ring-2 focus:ring-[#6a3f9e]/10"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {["All", "Attended", "Registered"].map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      filter === option
                        ? "bg-[#eee7f5] text-[#5b3289]"
                        : "text-[#817789] hover:bg-[#f7f4f9]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f2ecf8] text-[#6a3f9e]">
                  <CalendarDays size={23} />
                </div>
                <h3 className="mt-4 font-semibold">
                  {attendance.length === 0
                    ? "No experiences yet"
                    : "No matching experiences"}
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-[#817789]">
                  {attendance.length === 0
                    ? "Your event registrations and check-ins will appear here."
                    : "Try a different search or status filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#eee9f2] bg-[#fcfbfd] text-[11px] font-semibold uppercase tracking-wider text-[#92879a]">
                      <th className="px-5 py-3">Experience</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Entry type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Check-in time</th>
                      <th className="px-4 py-3">Review</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendance.map((item) => {
                      const attended = item.status === "Attended";
                      const hasReview = Boolean(item.review?.rating);

                      return (
                        <tr
                          key={item.id}
                          className="group border-b border-[#f0ecf3] last:border-0 hover:bg-[#fcfaff]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                  attended
                                    ? "bg-[#f0f5dc] text-[#687d00]"
                                    : "bg-[#f2ecf8] text-[#6a3f9e]"
                                }`}
                              >
                                {attended ? (
                                  <CheckCircle2 size={17} />
                                ) : (
                                  <CalendarDays size={17} />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[250px] truncate font-semibold text-[#30243a]">
                                  {item.eventName}
                                </p>
                                <p className="mt-0.5 text-xs text-[#9a90a1]">
                                  {attended
                                    ? "You were there"
                                    : "Your spot is reserved"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-[#665a70]">
                            {formatDate(item.eventDate)}
                          </td>

                          <td className="max-w-[180px] px-4 py-4">
                            <span className="flex items-center gap-1.5 text-xs text-[#766d7c]">
                              <MapPin
                                size={14}
                                className="shrink-0 text-[#9a8ca7]"
                              />
                              <span className="truncate">
                                {item.location || "Not specified"}
                              </span>
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-md bg-[#f5f2f7] px-2 py-1 text-xs text-[#6d6078]">
                              {item.type === "Guest invite"
                                ? "Guest invitation"
                                : item.type || "Membership"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                attended
                                  ? "bg-[#f0f6d9] text-[#536600]"
                                  : "bg-[#f1eafa] text-[#684095]"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  attended
                                    ? "bg-[#8da500]"
                                    : "bg-[#9a70c2]"
                                }`}
                              />
                              {item.status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-xs text-[#766d7c]">
                            {attended
                              ? formatDateTime(item.attendedAt)
                              : "—"}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openReviewModal(item)}
                              aria-label={
                                hasReview
                                  ? `View review for ${item.eventName}`
                                  : `Review ${item.eventName}`
                              }
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg p-2 transition hover:bg-[#f2ecf8]"
                            >
                              {hasReview ? (
                                <>
                                  <Star
                                    size={16}
                                    className="fill-[#B9D63B] text-[#8ca400]"
                                  />
                                  <span className="text-xs font-semibold text-[#6a3f9e]">
                                    {item.review.rating}/5
                                  </span>
                                </>
                              ) : (
                                <ChevronRight
                                  size={16}
                                  className="text-[#b4a8bd] transition group-hover:translate-x-0.5 group-hover:text-[#6a3f9e]"
                                />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-[#eee9f2] bg-[#fcfbfd] px-4 py-3 text-xs text-[#92879a]">
              Attendance is counted from confirmed check-ins, not reservations.
            </div>
          </div>
        </section>
      </div>

      {reviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#24112f]/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReviewModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[#e9e3ee] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#eee9f2] p-5 sm:p-6">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2ecf8] text-[#6a3f9e]">
                  <MessageSquareText size={20} />
                </div>

                <h2
                  id="review-modal-title"
                  className="text-xl font-bold text-[#24112f]"
                >
                  {selectedExperience?.review
                    ? "Your experience review"
                    : "Share your experience"}
                </h2>

                <p className="mt-1 text-sm text-[#817789]">
                  {selectedExperience?.eventName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={reviewSaving}
                className="rounded-xl p-2 text-[#817789] transition hover:bg-[#f5f2f7] disabled:opacity-50"
                aria-label="Close review"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {reviewLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#817789]">
                  <Loader2 size={18} className="animate-spin" />
                  Loading review...
                </div>
              ) : selectedExperience?.status !== "Attended" ? (
                <div className="rounded-2xl bg-[#f7f3fa] p-5 text-sm leading-6 text-[#6a3f9e]">
                  You can leave a review after attending this experience.
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-semibold text-[#30243a]">
                      How was your experience?
                    </p>

                    <div className="mt-3 flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setReviewForm((previous) => ({
                              ...previous,
                              rating,
                            }))
                          }
                          aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
                          aria-pressed={reviewForm.rating === rating}
                          className="rounded-lg p-1 transition hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={
                              rating <= reviewForm.rating
                                ? "fill-[#B9D63B] text-[#8ca400]"
                                : "text-[#d9d1df]"
                            }
                          />
                        </button>
                      ))}
                    </div>

                    <p className="mt-2 text-xs text-[#817789]">
                      {reviewForm.rating === 0
                        ? "Select your rating"
                        : [
                            "",
                            "Poor",
                            "Fair",
                            "Good",
                            "Very good",
                            "Excellent",
                          ][reviewForm.rating]}
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold text-[#30243a]">
                      What did you like?
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {REVIEW_OPTIONS.map((option) => {
                        const selected =
                          reviewForm.highlights.includes(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleReviewHighlight(option)}
                            aria-pressed={selected}
                            className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                              selected
                                ? "border-[#6a3f9e] bg-[#f2ecf8] text-[#6a3f9e]"
                                : "border-[#e9e3ee] bg-white text-[#766d7c] hover:border-[#bca8d1]"
                            }`}
                          >
                            {selected ? "✓ " : "+ "}
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="experience-review"
                      className="mb-2 block text-sm font-semibold text-[#30243a]"
                    >
                      Your review
                      <span className="ml-1 font-normal text-[#9a90a1]">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      id="experience-review"
                      rows={4}
                      maxLength={1000}
                      value={reviewForm.review}
                      onChange={(event) =>
                        setReviewForm((previous) => ({
                          ...previous,
                          review: event.target.value,
                        }))
                      }
                      placeholder="Tell us what made this experience memorable..."
                      className="w-full resize-y rounded-xl border border-[#e9e3ee] bg-[#fcfbfd] p-3 text-sm text-[#30243a] outline-none transition placeholder:text-[#aaa0b0] focus:border-[#a58ac0] focus:ring-2 focus:ring-[#6a3f9e]/10"
                    />

                    <p className="mt-1 text-right text-xs text-[#9a90a1]">
                      {reviewForm.review.length}/1000
                    </p>
                  </div>
                </>
              )}

              {reviewError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {reviewError}
                </p>
              )}

              {reviewSuccess && (
                <p
                  role="status"
                  className="rounded-xl border border-lime-200 bg-lime-50 p-3 text-sm text-green-800"
                >
                  {reviewSuccess}
                </p>
              )}

              {!reviewLoading &&
                selectedExperience?.status === "Attended" && (
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeReviewModal}
                      disabled={reviewSaving}
                      className="rounded-xl border border-[#e9e3ee] px-4 py-3 text-sm font-semibold text-[#766d7c] transition hover:bg-[#fcfbfd] disabled:opacity-50"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      disabled={reviewSaving}
                      onClick={submitReview}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6a3f9e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#583184] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reviewSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {reviewSaving ? "Saving..." : "Save review"}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}