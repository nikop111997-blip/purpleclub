"use client";

import { useState } from "react";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";

export default function UserDashboardLayout({
  children,
  session,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F7F5F1]">
      {/* Sidebar */}
      <UserSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main application area */}
      <div
        className="
          min-h-screen
          min-w-0
          w-full
          max-w-full

          sm:pl-[76px]
        "
      >
        {/* Header */}
        <div className="w-full min-w-0 max-w-full">
          <UserHeader
            session={session}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        {/* Dashboard content */}
        <main
          className="
            min-h-[calc(100vh-72px)]

            w-full
            min-w-0
            max-w-full

            overflow-x-hidden

            px-4
            pb-8
            pt-4

            sm:px-6
            sm:pt-5

            md:px-7

            lg:px-8
            lg:pt-6
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}