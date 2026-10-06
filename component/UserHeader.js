"use client";

import {
  Menu,
  Bell,
  ChevronDown,
} from "lucide-react";

export default function UserHeader({
  session,
  onMenuClick,
}) {
  const name = session?.user?.name || "Member";

  const firstName = name.split(" ")[0];

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-black/[0.06] bg-[#F7F5F1]/95 backdrop-blur-xl font-sans">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#35104D] shadow-sm lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#99919D]">
              Purple Community
            </p>

            <p className="text-sm font-semibold text-[#2B2430]">
              Welcome, {firstName}
            </p>
          </div>
        </div>

        {/* Right */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#5F5862] shadow-sm transition hover:text-[#35104D]"
          >
            <Bell size={18} />

            <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#B9D63B]" />
          </button>

          <div className="hidden h-8 w-px bg-black/10 sm:block" />

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B9D63B] text-xs font-bold text-[#35104D]">
              {name
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div className="leading-tight">
              <p className="text-xs font-semibold text-[#352E38]">
                {name}
              </p>

              <p className="text-[10px] text-[#9B939E]">
                Purple Member
              </p>
            </div>

            <ChevronDown
              size={15}
              className="text-[#918A94]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}