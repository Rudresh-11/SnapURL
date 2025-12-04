"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Home,
  Link2,
  QrCode,
  BarChart3,
  Globe,
  Settings,
  MonitorSmartphone,
} from "lucide-react";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Links", url: "/dashboard/links", icon: Link2 },
  { title: "QR Codes", url: "/dashboard/qr", icon: QrCode },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Campaigns", url: "/dashboard/campaigns", icon: MonitorSmartphone },
  { title: "Custom Domains", url: "/dashboard/domains", icon: Globe },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r bg-white w-[250px]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`p-3 ${
                        isActive ? "bg-[#E5EEFF] text-blue-600" : "text-gray-700"
                      }`}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
