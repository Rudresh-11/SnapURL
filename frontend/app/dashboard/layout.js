"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardTopbar from "@/components/dashboard-topbar";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <AppSidebar />

        {/* RIGHT SECTION */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">

          {/* TOP NAVBAR */}
          <DashboardTopbar />

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-auto p-6 bg-[#F7F8FA]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
