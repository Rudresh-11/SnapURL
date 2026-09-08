"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import {
    Link2,
    QrCode,
    BarChart3,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
} from "lucide-react";

const items = [
    { title: "Links", url: "/dashboard/links", icon: Link2 },
    { title: "QR Codes", url: "/dashboard/qr", icon: QrCode },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { state, isMobile, toggleSidebar, setOpenMobile } = useSidebar();
    const collapsed = state === "collapsed" && !isMobile;

    const closeOnMobile = () => {
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="gap-3 p-3">
                <div className="flex items-center justify-between gap-2">
                    <Link
                        href="/dashboard/links"
                        onClick={closeOnMobile}
                        className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <Image
                            src="/logo.png"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 shrink-0 rounded"
                        />
                        {!collapsed && (
                            <span className="truncate text-base font-semibold tracking-tight">
                                SnapURL
                            </span>
                        )}
                    </Link>

                    {!isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            className={collapsed ? "hidden" : "size-8 shrink-0"}
                        >
                            <PanelLeftClose className="size-4" />
                        </Button>
                    )}
                </div>

                {collapsed ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        aria-label="Expand sidebar"
                        className="size-8"
                    >
                        <PanelLeftOpen className="size-4" />
                    </Button>
                ) : (
                    <Button asChild size="sm" className="w-full justify-start gap-2">
                        <Link href="/dashboard/links/create" onClick={closeOnMobile}>
                            <Plus className="size-4" />
                            Create link
                        </Link>
                    </Button>
                )}
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive =
                                    pathname === item.url || pathname.startsWith(`${item.url}/`);

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.url} onClick={closeOnMobile}>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                {!collapsed && (
                    <p className="px-2 pb-1 text-xs text-sidebar-foreground/60">
                        SnapURL — shorten, share, measure.
                    </p>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
