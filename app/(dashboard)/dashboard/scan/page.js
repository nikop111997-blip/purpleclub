
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ScanLine,
  Search,
  RefreshCw,
  X,
  ShieldAlert,
  LoaderCircle,
  CheckCircle2,
  CircleX,
  Users,
  Camera,
  LogOut,
} from "lucide-react";

const SCANNER_ID = "purple-supercoach-scanner";
const EVENTS_API = "/api/auth/user/scan/events";
const CHECK_IN_API = "/api/auth/user/scan/events/check-in";

export default function SuperCoachScanPage() {
  const [events, setEvents] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [cameraError, setCameraError] = useState("");

  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const shouldResumeRef = useRef(false);
  const mountedRef = useRef(false);
  const authorizedRef = useRef(false);
  const selectedEventRef = useRef(null);
  const scannerStartingRef = useRef(false);
  const handleDecodedCodeRef = useRef(null);
  const restartTimerRef = useRef(null);

  // Keep the React state and synchronous authorization ref in sync.
  const updateAuthorization = useCallback((value) => {
    authorizedRef.current = value;
    setAuthorized(value);
  }, []);

  // ==========================================
  // LOAD EVENTS AND VALIDATE SUPERCOACH ACCESS
  // ==========================================
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setPageError("");
    setNotice("");

    try {
      const response = await fetch(EVENTS_API, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (
        response.status === 401 ||
        response.status === 403 ||
        data.authorized === false
      ) {
        updateAuthorization(false);
        setMember(data.member || null);
        setEvents([]);
        setPageError(
          data.message ||
            "You are not authorised to access the event scanner."
        );
        return;
      }

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message || "Unable to load assigned events."
        );
      }

      const currentMember = data.member || null;
      const assignedEvents = Array.isArray(data.events)
        ? data.events
        : [];

      if (
        String(currentMember?.role || "").toUpperCase() !==
        "SUPERCOACH"
      ) {
        updateAuthorization(false);
        setMember(currentMember);
        setEvents([]);
        setPageError(
          "Only an authorized SUPERCOACH can access this scanner."
        );
        return;
      }

      setMember(currentMember);
      setEvents(assignedEvents);
      updateAuthorization(true);

      setNotice(
        assignedEvents.length
          ? "Only events from your assigned club are shown."
          : data.message ||
              "No events are available for your assigned club."
      );
    } catch (error) {
      console.error("[SCANNER] Event loading failed:", error);
      updateAuthorization(false);
      setEvents([]);
      setPageError(
        error.message || "Unable to verify your scanner access."
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [updateAuthorization]);

  // ==========================================
  // STOP AND CLEAR CAMERA
  // ==========================================
  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setScanning(false);
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (error) {
      console.warn("[SCANNER] Camera stop:", error);
    }

    try {
      await scanner.clear();
    } catch (error) {
      console.warn("[SCANNER] Camera clear:", error);
    }

    if (scannerRef.current === scanner) {
      scannerRef.current = null;
    }

    if (mountedRef.current) {
      setScanning(false);
    }
  }, []);

  // ==========================================
  // CLEANUP
  // ==========================================
  useEffect(() => {
    mountedRef.current = true;
    void loadEvents();

    return () => {
      mountedRef.current = false;
      shouldResumeRef.current = false;

      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }

      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner) {
        void (async () => {
          try {
            if (scanner.isScanning) {
              await scanner.stop();
            }
          } catch (error) {
            console.warn("[SCANNER] Cleanup stop:", error);
          }

          try {
            await scanner.clear();
          } catch {
            // Camera may already be cleared.
          }
        })();
      }
    };
  }, [loadEvents]);

  // ==========================================
  // START CAMERA
  // ==========================================
  const startScanner = useCallback(async () => {
    if (
      !mountedRef.current ||
      !authorizedRef.current ||
      !selectedEventRef.current ||
      scannerRef.current ||
      scannerStartingRef.current ||
      !shouldResumeRef.current
    ) {
      return;
    }

    scannerStartingRef.current = true;
    setCameraError("");
    setScannerLoading(true);

    let scanner = null;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (
        !mountedRef.current ||
        !shouldResumeRef.current ||
        !authorizedRef.current ||
        !selectedEventRef.current
      ) {
        return;
      }

      scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (
            !processingRef.current &&
            shouldResumeRef.current
          ) {
            const handler = handleDecodedCodeRef.current;
            if (handler) void handler(decodedText);
          }
        },
        () => {
          // Ignore frames without a QR code.
        }
      );

      if (mountedRef.current) {
        setScanning(true);
      }
    } catch (error) {
      console.error("[SCANNER] Camera start failed:", error);

      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }

      if (scanner) {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch {
          // Camera may not have started.
        }

        try {
          await scanner.clear();
        } catch {
          // Ignore cleanup errors.
        }
      }

      if (mountedRef.current && shouldResumeRef.current) {
        setScanning(false);
        setCameraError(
          "Unable to start the camera. Allow camera access and use HTTPS, then try again."
        );
      }
    } finally {
      scannerStartingRef.current = false;

      if (mountedRef.current) {
        setScannerLoading(false);
      }
    }
  }, []);

  // ==========================================
  // PROCESS QR CODE
  // ==========================================
  const handleDecodedCode = useCallback(
    async (decodedText) => {
      const currentEvent = selectedEventRef.current;

      if (
        processingRef.current ||
        !currentEvent ||
        !authorizedRef.current ||
        !shouldResumeRef.current
      ) {
        return;
      }

      processingRef.current = true;

      const code = String(decodedText || "").trim();
      const eventId = currentEvent._id;

      try {
        // Stop camera while the API processes this QR.
        await stopScanner();

        if (!mountedRef.current) return;

        setScannerLoading(true);
        setCameraError("");
        setScanResult({
          state: "processing",
          message: "Verifying QR and checking in…",
        });

        const response = await fetch(CHECK_IN_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({ code, eventId }),
        });

        const data = await response.json().catch(() => ({}));

        if (!mountedRef.current) return;

        // The operator's session has expired.
        // Do not show the normal "Not authorised" page because
        // of an attendee scan result.
        if (response.status === 401) {
          shouldResumeRef.current = false;

          setScanResult({
            state: "error",
            message:
              data.message ||
              "Your session has expired. Please sign in again.",
          });

          setScanHistory((items) =>
            [
              {
                id: `${Date.now()}-${Math.random()}`,
                success: false,
                message:
                  data.message ||
                  "Your session has expired. Please sign in again.",
                at: new Date().toISOString(),
              },
              ...items,
            ].slice(0, 12)
          );

          return;
        }

        // Revoke scanner-page access only when the API explicitly
        // identifies an operator authorization failure.
        if (
          response.status === 403 &&
          data.code === "SCANNER_FORBIDDEN"
        ) {
          shouldResumeRef.current = false;
          updateAuthorization(false);

          setPageError(
            data.message ||
              "You are no longer authorized to use this scanner."
          );

          setScanResult({
            state: "error",
            message: data.message || "Scanner access denied.",
          });

          return;
        }

        // All ordinary scan failures stay inside the scanner modal.
        // Examples: invalid QR, duplicate check-in, wrong event,
        // attendee restriction, or an API returning a generic 403.
        if (!response.ok || data.success !== true) {
          const message =
            data.message ||
            data.error ||
            "Check-in could not be completed.";

          setScanResult({
            state: "error",
            message,
          });

          setScanHistory((items) =>
            [
              {
                id: `${Date.now()}-${Math.random()}`,
                success: false,
                message,
                code,
                at: new Date().toISOString(),
              },
              ...items,
            ].slice(0, 12)
          );

          return;
        }

        // Successful check-in.
        const message =
          data.message || "Check-in completed successfully.";

        setScanResult({
          state: "success",
          message,
          details: data,
        });

        setScanHistory((items) =>
          [
            {
              id: `${Date.now()}-${Math.random()}`,
              success: true,
              message,
              name:
                data.member?.name ||
                data.user?.name ||
                data.name ||
                "Attendee",
              type:
                data.type ||
                data.passType ||
                "Attendee",
              at: new Date().toISOString(),
            },
            ...items,
          ].slice(0, 12)
        );
      } catch (error) {
        console.error("[SCANNER] Check-in request failed:", error);

        if (mountedRef.current) {
          const message =
            "Unable to complete check-in. Check your connection and try again.";

          setScanResult({
            state: "error",
            message,
          });

          setScanHistory((items) =>
            [
              {
                id: `${Date.now()}-${Math.random()}`,
                success: false,
                message,
                at: new Date().toISOString(),
              },
              ...items,
            ].slice(0, 12)
          );
        }
      } finally {
        processingRef.current = false;

        if (mountedRef.current) {
          setScannerLoading(false);
        }

        // Resume after success or ordinary scan rejection.
        // Never resume after session expiry or explicit revocation.
        if (
          mountedRef.current &&
          shouldResumeRef.current &&
          authorizedRef.current &&
          selectedEventRef.current
        ) {
          restartTimerRef.current = window.setTimeout(() => {
            restartTimerRef.current = null;

            if (
              mountedRef.current &&
              shouldResumeRef.current &&
              authorizedRef.current &&
              selectedEventRef.current &&
              !processingRef.current
            ) {
              void startScanner();
            }
          }, 700);
        }
      }
    },
    [stopScanner, startScanner, updateAuthorization]
  );

  // Always let the scanner callback call the latest handler.
  handleDecodedCodeRef.current = handleDecodedCode;

  // ==========================================
  // OPEN SCANNER
  // ==========================================
  async function openScanner(event) {
    shouldResumeRef.current = false;

    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    await stopScanner();

    processingRef.current = false;
    selectedEventRef.current = event;

    setSelectedEvent(event);
    setScanResult(null);
    setScanHistory([]);
    setCameraError("");

    // Camera starts when the operator presses Start scanning.
  }

  // ==========================================
  // CLOSE SCANNER
  // ==========================================
  async function closeScanner() {
    shouldResumeRef.current = false;
    selectedEventRef.current = null;

    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    await stopScanner();

    setSelectedEvent(null);
    setScanResult(null);
    setScanHistory([]);
    setCameraError("");
  }

  // ==========================================
  // STOP BATCH SCANNING
  // ==========================================
  async function stopBatchScanning() {
    shouldResumeRef.current = false;

    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    await stopScanner();
  }

  // ==========================================
  // EVENT FILTERING
  // ==========================================
  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      event.name,
      event.club?.name,
      event.location,
      event.status,
      event.date,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function statusStyle(status) {
    const value = String(status || "").toUpperCase();

    if (["PUBLISHED", "ACTIVE"].includes(value)) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (["CANCELLED", "INACTIVE"].includes(value)) {
      return "bg-red-50 text-red-700";
    }

    return "bg-gray-100 text-gray-600";
  }

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9fc] p-6 text-sm text-gray-600">
        <LoaderCircle className="mr-2 animate-spin" size={20} />
        Checking your club access…
      </main>
    );
  }

  // ==========================================
  // UNAUTHORIZED SCREEN
  // ==========================================
  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9fc] p-4 font-sans text-[#252525]">
        <section className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert size={28} />
          </div>

          <h1 className="text-2xl font-semibold">
            Not authorised
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {pageError ||
              "You do not have permission to access this scanner."}
          </p>

          <button
            type="button"
            onClick={() => void loadEvents()}
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6a3f9e] px-4 text-sm font-medium text-white hover:bg-[#573183]"
          >
            <RefreshCw size={15} />
            Check access again
          </button>
        </section>
      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================
  return (
    <main className="min-h-screen  px-4 py-6 font-sans text-[#252525] sm:px-6 lg:px-10 lg:py-10">
      <div>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-[#777]">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-[#6a3f9e]">
                Scan events
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Event check-in
            </h1>

            <p className="mt-2 text-sm text-[#777]">
              Scan attendees continuously. Successful and rejected
              scans appear below.
            </p>

            {member && (
              <p className="mt-3 text-sm text-[#6a3f9e]">
                Signed in as {member.name} · {member.role}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void loadEvents()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-[#e5e5e2] bg-white px-4 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh events
          </button>
        </div>

        {pageError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <p>{pageError}</p>
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-xl border border-[#e5e5e2] bg-white p-4 text-sm text-[#666]">
            {notice}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-[#e5e5e2] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#eeeeeb] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                Events from your assigned club
              </h2>
              <p className="mt-1 text-xs text-[#888]">
                {filteredEvents.length} event
                {filteredEvents.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter events…"
                className="h-10 w-full rounded-lg border border-[#e5e5e2] bg-[#fafaf9] pl-9 pr-3 text-sm outline-none focus:border-[#6a3f9e] focus:ring-2 focus:ring-[#6a3f9e]/10"
              />
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <CalendarDays
                size={26}
                className="mb-3 text-[#6a3f9e]"
              />
              <h3 className="font-medium">
                {search ? "No matching events" : "No assigned events"}
              </h3>
              <p className="mt-2 text-sm text-[#888]">
                Only events belonging to your assigned club can be
                scanned.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#eeeeeb] bg-[#fafaf9] text-[11px] font-semibold uppercase tracking-wider text-[#888]">
                    <th className="px-5 py-3">Event</th>
                    <th className="px-5 py-3">Club</th>
                    <th className="px-5 py-3">Date & time</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map((event) => (
                    <tr
                      key={event._id}
                      className="border-b border-[#f0f0ed] last:border-0 hover:bg-[#fafaf8]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {event.name}
                        </div>
                        {event.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-[#999]">
                            {event.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md bg-[#f3eef8] px-2.5 py-1 text-xs font-medium text-[#6a3f9e]">
                          {event.club?.name || "Unassigned"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays
                            size={15}
                            className="text-[#999]"
                          />
                          {formatDate(event.date)}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[#888]">
                          <Clock3 size={14} />
                          {event.startTime || "—"}
                          {event.endTime
                            ? ` – ${event.endTime}`
                            : ""}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#666]">
                        <span className="flex items-center gap-2">
                          <MapPin
                            size={15}
                            className="shrink-0 text-[#999]"
                          />
                          {event.location || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(event.status)}`}
                        >
                          {event.status || "UNKNOWN"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void openScanner(event)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#6a3f9e] px-3.5 text-sm font-medium text-white transition hover:bg-[#573183]"
                          aria-label={`Scan for ${event.name}`}
                        >
                          <ScanLine size={16} />
                          Scan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-[#eeeeeb] bg-[#fafaf9] px-4 py-3 text-xs text-[#999] sm:flex-row sm:items-center sm:justify-between">
            <span>Club access is checked by the server.</span>
            <span>Purple Club · Check-in</span>
          </div>
        </section>
      </div>

      {/* SCANNER MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-title"
            className="my-auto max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#eeeeeb] p-4 sm:p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#6a3f9e]">
                  Continuous event check-in
                </p>

                <h2
                  id="scan-title"
                  className="mt-1 text-xl font-semibold"
                >
                  {selectedEvent.name}
                </h2>

                <p className="mt-1 text-sm text-[#888]">
                  {selectedEvent.club?.name || "Assigned club"} ·{" "}
                  {formatDate(selectedEvent.date)} ·{" "}
                  {selectedEvent.location || "Location not set"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void closeScanner()}
                aria-label="Close scanner"
                className="rounded-lg p-2 text-[#777] hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Camera
                      size={17}
                      className="text-[#6a3f9e]"
                    />
                    Camera scanner
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${scanning ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {scanning ? "Camera active" : "Camera stopped"}
                  </span>
                </div>

                <div
                  id={SCANNER_ID}
                  className="min-h-[300px] overflow-hidden rounded-xl border border-[#e5e5e2] bg-[#fafaf9]"
                />

                {scannerLoading && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-[#6a3f9e]">
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    {scanResult?.state === "processing"
                      ? "Verifying QR and recording attendance…"
                      : "Preparing camera…"}
                  </p>
                )}

                {cameraError && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {cameraError}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {!scanning && !scannerLoading ? (
                    <button
                      type="button"
                      onClick={() => {
                        shouldResumeRef.current = true;
                        void startScanner();
                      }}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#6a3f9e] px-4 text-sm font-medium text-white hover:bg-[#573183]"
                    >
                      <ScanLine size={17} />
                      Start scanning
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void stopBatchScanning()}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e5e2] px-4 text-sm font-medium hover:bg-gray-50"
                    >
                      <LogOut size={16} />
                      Stop scanning
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs leading-5 text-[#888]">
                  The camera automatically resumes after each scan.
                  Keep this window open while checking attendees in.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-[#eeeeeb] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Latest scan</h3>

                    {scanResult?.state === "success" && (
                      <CheckCircle2
                        size={19}
                        className="text-emerald-600"
                      />
                    )}

                    {scanResult?.state === "error" && (
                      <CircleX
                        size={19}
                        className="text-red-600"
                      />
                    )}
                  </div>

                  {!scanResult ? (
                    <div className="flex min-h-24 flex-col items-center justify-center text-center text-sm text-[#999]">
                      <ScanLine size={24} className="mb-2" />
                      Waiting for a QR code…
                    </div>
                  ) : (
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        scanResult.state === "success"
                          ? "bg-emerald-50 text-emerald-800"
                          : scanResult.state === "error"
                            ? "bg-red-50 text-red-800"
                            : "bg-violet-50 text-violet-800"
                      }`}
                    >
                      <p className="font-semibold">
                        {scanResult.state === "success"
                          ? "Check-in successful"
                          : scanResult.state === "error"
                            ? "Check-in rejected"
                            : "Processing scan"}
                      </p>
                      <p className="mt-1 leading-5">
                        {scanResult.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#eeeeeb] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Recent scans</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-[#888]">
                      <Users size={14} />
                      {scanHistory.length}
                    </span>
                  </div>

                  {scanHistory.length === 0 ? (
                    <p className="py-5 text-center text-sm text-[#999]">
                      Scanned attendees will appear here.
                    </p>
                  ) : (
                    <div className="max-h-[360px] space-y-2 overflow-y-auto">
                      {scanHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 rounded-lg border border-[#f0f0ed] p-3"
                        >
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              item.success
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.success ? (
                              <CheckCircle2 size={17} />
                            ) : (
                              <CircleX size={17} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {item.name ||
                                (item.success
                                  ? "Attendee"
                                  : "Scan rejected")}
                            </p>

                            <p
                              className={`mt-0.5 text-xs leading-5 ${
                                item.success
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              {item.message}
                            </p>

                            <p className="mt-1 text-[11px] text-[#999]">
                              {new Date(item.at).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
