"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardTopbar from "@/components/dashboard-topbar";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        <DashboardTopbar />

        <main className="min-w-0 flex-1 bg-muted/40">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
