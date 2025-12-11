"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    useSidebar,
} from "@/components/ui/sidebar";

import {
    Home,
    Link2,
    QrCode,
    BarChart3,
    MonitorSmartphone,
    Globe,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const items = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Links", url: "/dashboard/links", icon: Link2 },
    { title: "QR Codes", url: "/dashboard/qr", icon: QrCode },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { state,toggleSidebar } = useSidebar(); // expanded | collapsed

    return (
        <Sidebar collapsible="icon" className="border-r bg-white">
            {/* LOGO */}
            <SidebarHeader className="flex items-center justify-center py-4">

                {/* Collapse Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-6 z-20 bg-white border rounded-full p-1 shadow hover:bg-gray-100 transition"
                >
                    {state === "expanded" ? (
                        <ChevronLeft size={18} />
                    ) : (
                        <ChevronRight size={18} />
                    )}
                </button>
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.png"  // <-- replace with your logo path
                        alt="SnapURL Logo"
                        width={64}
                        height={64}
                        className="rounded"
                    />

                    {/* Hide logo text when collapsed */}
                    {state === "expanded" && (
                        <span className="text-lg font-semibold tracking-tight">
                            SnapURL
                        </span>
                    )}
                </div>
            </SidebarHeader>

            {/* MENU */}
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
                                            className={`p-3 transition ${isActive
                                                    ? "bg-[#E5EEFF] text-blue-600 font-medium"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <a href={item.url} className="flex items-center gap-3">
                                                <item.icon size={20} />

                                                {/* When collapsed, hide text */}
                                                {state === "expanded" && <span>{item.title}</span>}
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
