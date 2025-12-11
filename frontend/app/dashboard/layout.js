"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardTopbar from "@/components/dashboard-topbar";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen overflow-hidden w-screen">

        {/* SIDEBAR */}
        <AppSidebar />

        {/* RIGHT SIDE (TOPBAR + CONTENT) */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* TOP NAVBAR */}
          <DashboardTopbar />

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6 w-full">
            {children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}
