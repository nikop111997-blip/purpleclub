"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  QrCode,
  Clock3,
  UserRound,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    label: "My Registrations",
    href: "/dashboard/registrations",
    icon: Ticket,
  },
  {
    label: "Guest Pass",
    href: "/dashboard/guest-pass",
    icon: QrCode,
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: Clock3,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
];

/* =========================================================
   DESKTOP TOOLTIP
   ========================================================= */

function Tooltip({ children }) {
  return (
    <span
      role="tooltip"
      className="
        pointer-events-none
        absolute
        left-[calc(100%+14px)]
        top-1/2
        z-[9999]

        hidden
        -translate-y-1/2
        translate-x-[-6px]

        whitespace-nowrap
        rounded-lg
        bg-[#24133b]
        px-3
        py-1.5

        text-xs
        font-medium
        text-white

        opacity-0
        shadow-xl

        transition-all
        duration-150

        group-hover:translate-x-0
        group-hover:opacity-100

        group-focus-visible:translate-x-0
        group-focus-visible:opacity-100

        lg:block
      "
    >
      {/* Arrow */}
      <span
        className="
          absolute
          -left-1
          top-1/2
          h-2
          w-2
          -translate-y-1/2
          rotate-45
          bg-[#24133b]
        "
      />

      {children}
    </span>
  );
}

export default function UserSidebar({ open, setOpen }) {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await signOut({
      callbackUrl: "/auth?mode=login",
    });
  }

  /* =========================================================
     ESCAPE KEY
     ========================================================= */

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  /* =========================================================
     PREVENT BODY SCROLL WHEN MOBILE SIDEBAR IS OPEN
     ========================================================= */

  useEffect(() => {
    if (!open) return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    if (mediaQuery.matches) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
      ===================================================== */}

      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`
          fixed
          inset-0
          z-[80]

          bg-black/45
          backdrop-blur-[2px]

          transition-opacity
          duration-300

          lg:hidden

          ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* =====================================================
          SIDEBAR CONTAINER

          IMPORTANT:
          No overflow-hidden here because desktop tooltip
          needs to escape outside the 76px sidebar.
      ===================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-y-0
          left-0
          z-[90]

          flex
          items-center

          font-sans
        "
      >
        <aside
          aria-label="Sidebar Navigation"
          className={`
            pointer-events-auto
            relative

            h-[100dvh]

            transition-transform
            duration-300
            ease-[cubic-bezier(0.4,0,0.2,1)]

            /* ==========================================
               MOBILE
            ========================================== */

            w-[280px]

            -translate-x-full

            bg-[#6a3f9e]

            shadow-[10px_0_40px_rgba(0,0,0,0.18)]

            /* ==========================================
               DESKTOP
            ========================================== */

            lg:h-[calc(100dvh-32px)]
            lg:w-[76px]

            lg:bg-transparent
            lg:shadow-none

            lg:translate-x-0

            ${
              open
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          {/* =================================================
              MOBILE SIDEBAR BACKGROUND
          ================================================= */}

          <div
            className="
              absolute
              inset-0
              -z-10

              bg-[#6a3f9e]

              lg:hidden
            "
          />

          {/* =================================================
              MOBILE DECORATIVE CIRCLE
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              -right-16
              -top-16
              h-40
              w-40
              rounded-full
              bg-white/[0.07]

              lg:hidden
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-16
              -right-12
              h-44
              w-44
              rounded-full
              bg-white/[0.07]

              lg:hidden
            "
          />

          {/* =================================================
              MOBILE HEADER
          ================================================= */}

          <div
            className="
              relative
              flex
              h-[86px]
              shrink-0
              items-center
              justify-between
              px-6

              lg:hidden
            "
          >
            <div>
              <p className="text-lg font-semibold text-white">
                Dashboard
              </p>

              <p className="mt-0.5 text-xs text-white/60">
                Navigation
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-xl
                bg-white/10

                text-white

                transition

                hover:bg-white/20
                active:scale-95
              "
            >
              <X size={19} />
            </button>
          </div>

          {/* =================================================
              MOBILE MENU
          ================================================= */}

          <div
            className="
              relative
              flex
              h-[calc(100dvh-86px)]
              flex-col

              overflow-y-auto

              px-4
              pb-6

              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden

              lg:hidden
            "
          >
            <p
              className="
                mb-3
                px-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white/40
              "
            >
              Menu
            </p>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`
                      flex
                      min-h-[52px]
                      w-full
                      items-center
                      gap-3

                      rounded-2xl
                      px-4

                      outline-none

                      transition-all
                      duration-200

                      ${
                        active
                          ? `
                            bg-white
                            text-[#6a3f9e]
                            shadow-[0_6px_20px_rgba(0,0,0,0.12)]
                          `
                          : `
                            text-white/75
                            hover:bg-white/10
                            hover:text-white
                          `
                      }
                    `}
                  >
                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        ${
                          active
                            ? "bg-[#6a3f9e]/10"
                            : "bg-white/[0.06]"
                        }
                      `}
                    >
                      <Icon
                        size={19}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                    </span>

                    <span className="flex-1 text-left text-sm font-medium">
                      {item.label}
                    </span>

                    {active && (
                      <ChevronRight
                        size={17}
                        strokeWidth={2}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile divider */}
            <div className="my-5 h-px w-full bg-white/10" />

            {/* Mobile logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="
                flex
                min-h-[52px]
                w-full
                items-center
                gap-3
                rounded-2xl
                px-4

                text-white/70

                transition

                hover:bg-white/10
                hover:text-white
                active:scale-[0.99]
              "
            >
              <span
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/[0.06]
                "
              >
                <LogOut size={19} />
              </span>

              <span className="text-sm font-medium">
                Logout
              </span>
            </button>
          </div>

          {/* =================================================
              DESKTOP ORGANIC SIDEBAR
          ================================================= */}

          <div
            className="
              hidden
              h-full
              w-[76px]
              flex-col
              items-center

              lg:flex
            "
          >
            {/* Top organic curve */}
            <svg
              viewBox="0 0 76 64"
              className="
                -mb-px
                block
                h-16
                w-[76px]
                shrink-0

                text-[#6a3f9e]
              "
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M 0 0 C 0 35 76 29 76 64 L 0 64 Z" />
            </svg>

            {/* Main desktop rail */}
            <div
              className="
                relative
                flex
                w-[76px]
                flex-1
                flex-col
                items-center

                gap-3

                bg-[#6a3f9e]

                py-4

                shadow-[0_18px_35px_-15px_rgba(106,63,158,0.55)]
              "
            >
              {/* Decorative circle */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  overflow-visible
                "
              >
                <div
                  className="
                    absolute
                    -left-8
                    -top-8
                    h-28
                    w-28
                    rounded-full
                    bg-white/[0.08]
                  "
                />

                <div
                  className="
                    absolute
                    -bottom-10
                    -right-8
                    h-32
                    w-32
                    rounded-full
                    bg-white/[0.08]
                  "
                />
              </div>

              {/* Desktop navigation */}
              <nav
                className="
                  relative
                  z-10
                  flex
                  flex-col
                  items-center
                  gap-3
                "
              >
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={`
                        group
                        relative

                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center

                        rounded-2xl

                        outline-none

                        transition-all
                        duration-200

                        focus-visible:ring-2
                        focus-visible:ring-white/70

                        ${
                          active
                            ? `
                              bg-white
                              text-[#6a3f9e]
                              shadow-md
                            `
                            : `
                              text-white/75
                              hover:bg-white/15
                              hover:text-white
                              hover:scale-105
                            `
                        }
                      `}
                    >
                      <Icon
                        size={20}
                        strokeWidth={active ? 2.2 : 1.8}
                      />

                      {/* Tooltip */}
                      <Tooltip>
                        {item.label}
                      </Tooltip>
                    </Link>
                  );
                })}
              </nav>

              {/* Desktop divider */}
              <div
                className="
                  relative
                  z-10
                  my-1
                  h-px
                  w-7
                  shrink-0
                  bg-white/20
                "
              />

              {/* Desktop logout */}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className="
                  group
                  relative
                  z-10

                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center

                  rounded-2xl

                  text-white/75

                  outline-none

                  transition-all
                  duration-200

                  hover:bg-white/15
                  hover:text-white
                  hover:scale-105

                  focus-visible:ring-2
                  focus-visible:ring-white/70
                "
              >
                <LogOut
                  size={20}
                  strokeWidth={1.8}
                />

                <Tooltip>Logout</Tooltip>
              </button>
            </div>

            {/* Bottom organic curve */}
            <svg
              viewBox="0 0 76 64"
              className="
                -mt-px
                block
                h-16
                w-[76px]
                shrink-0

                text-[#6a3f9e]
              "
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M 76 0 C 76 35 0 29 0 64 L 0 0 Z" />
            </svg>
          </div>
        </aside>
      </div>
    </>
  );
}