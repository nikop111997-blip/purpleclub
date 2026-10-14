"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock3, MapPin, ArrowRight, CalendarDays } from "lucide-react";

const GLASS_ROW =
  "border border-white/80 bg-white/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(106,63,158,0.05)] backdrop-blur-md";

const pad = (n) => String(n).padStart(2, "0");
const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * events: [{ id, name, date: "YYYY-MM-DD", startTime, location, clubName }]
 * (plain, serialisable objects — safe to pass from a server component)
 */
export default function EventCalendar({ events = [] }) {
  const byDate = useMemo(() => {
    const map = {};
    for (const e of events) if (e.date) (map[e.date] ||= []).push(e);
    return map;
  }, [events]);

  const firstKey = useMemo(() => Object.keys(byDate).sort()[0], [byDate]);
  const [cursor, setCursor] = useState(() => {
    const d = firstKey ? parse(firstKey) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(firstKey ?? null);

  const now = new Date();
  const todayKey = keyOf(now.getFullYear(), now.getMonth(), now.getDate());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (n) => setCursor(new Date(year, month + n, 1));
  const list = selected ? byDate[selected] ?? [] : [];

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      {/* Calendar */}
      <div className={`rounded-2xl p-3.5 ${GLASS_ROW}`}>
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="rounded-lg border border-white/80 bg-white/60 p-1.5 text-[#4B176B] transition hover:bg-white"
          >
            <ChevronLeft size={15} />
          </button>
          <p className="text-sm font-bold text-[#24112f]">
            {cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next month"
            className="rounded-lg border border-white/80 bg-white/60 p-1.5 text-[#4B176B] transition hover:bg-white"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="py-1 text-[10px] font-bold text-[#9B939E]">{d}</span>
          ))}

          {cells.map((day, i) => {
            if (!day) return <span key={`e-${i}`} />;
            const k = keyOf(year, month, day);
            const has = !!byDate[k];
            const isSel = selected === k;
            const isToday = todayKey === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelected((c) => (c === k ? null : k))}
                className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition ${
                  isSel
                    ? "bg-[#6a3f9e] text-white shadow-[0_4px_12px_rgba(106,63,158,0.35)]"
                    : has
                    ? "bg-[#6a3f9e]/10 text-[#4B176B] hover:bg-[#6a3f9e]/20"
                    : "text-[#6f6577] hover:bg-white/70"
                } ${isToday && !isSel ? "ring-1 ring-[#B9D63B]" : ""}`}
              >
                {day}
                {has && (
                  <i className={`absolute bottom-1 h-1 w-1 rounded-full ${isSel ? "bg-[#B9D63B]" : "bg-[#B9D63B]"}`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-[#6a3f9e]/10 pt-2.5 text-[10px] text-[#6f6577]">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#B9D63B]" /> Event day
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-md ring-1 ring-[#B9D63B]" /> Today
          </span>
        </div>
      </div>

      {/* Events for the selected day */}
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-[#24112f]">
            {selected
              ? parse(selected).toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "short",
                })
              : "Select a date"}
          </p>
          <span className="text-[11px] text-[#6f6577]">
            {list.length} event{list.length === 1 ? "" : "s"}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#6a3f9e]/25 bg-white/30 px-4 text-center">
            <CalendarDays size={20} className="text-[#4B176B]" />
            <p className="mt-2 text-xs text-[#6f6577]">
              {selected ? "No events on this day. Pick a highlighted date." : "Pick a highlighted date to see events."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((e) => (
              <Link
                key={e.id}
                href={`/dashboard/events/${e.id}`}
                className={`group flex items-center gap-3 rounded-2xl p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[#B9D63B] hover:bg-white/70 ${GLASS_ROW}`}
              >
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-[#6a3f9e]/15 bg-gradient-to-br from-[#6a3f9e]/20 to-[#6a3f9e]/5">
                  <span className="text-[9px] font-bold uppercase text-[#6B3FA0]">
                    {parse(e.date).toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                  <span className="text-lg font-bold leading-5 text-[#35104D]">{parse(e.date).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#24112f]">{e.name || "Purple Experience"}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#6f6577]">
                    {e.startTime && (
                      <span className="flex items-center gap-1"><Clock3 size={11} />{e.startTime}</span>
                    )}
                    {e.location && (
                      <span className="flex items-center gap-1"><MapPin size={11} />{e.location}</span>
                    )}
                  </div>
                  {e.clubName && (
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-[#6a3f9e]">Club: {e.clubName}</p>
                  )}
                </div>
                <ArrowRight size={16} className="shrink-0 text-[#6f6577]/50 transition group-hover:translate-x-1 group-hover:text-[#4B176B]" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}