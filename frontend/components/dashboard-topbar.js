"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, User, Settings, LogOut, Sparkles } from "lucide-react";

import { DropdownMenuDemo } from "@/components/dropdown";
import ConfirmDialog from "./confirm-dialog";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import useApi from "@/hooks/useApi";

export default function DashboardTopbar() {
  const router = useRouter();
  const [dialog, setDialog] = useState(null);

  const meApi = useApi("/auth/me", { auto: true });
  const me = meApi.data?.data;

  const userName = me?.username || me?.email?.split("@")[0] || "SnapURL user";
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (meApi.errorStatus === 401) router.replace("/login");
  }, [meApi.errorStatus, router]);

  const logoutApi = useApi("/auth/logout", { method: "POST" });

  const handleLogout = async () => {
    await logoutApi.request();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sm:px-6">
      {dialog && (
        <ConfirmDialog
          open
          setOpen={(open) => !open && setDialog(null)}
          title={dialog.title}
          description={dialog.description}
          confirmText="Got it"
          cancelText="Close"
        />
      )}

      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 !h-5 md:hidden" />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 sm:inline-flex"
          onClick={() =>
            setDialog({
              title: "Upgrade your account",
              description:
                "Paid plans are on the way. For now every SnapURL account has unlimited links and full analytics.",
            })
          }
        >
          <Sparkles className="size-4" />
          Upgrade
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          onClick={() =>
            setDialog({
              title: "Need a hand?",
              description:
                "Docs are still being written. In the meantime, open an issue on the SnapURL GitHub repository and we'll get back to you.",
            })
          }
        >
          <HelpCircle className="size-5" />
        </Button>

        <DropdownMenuDemo
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-1 py-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {meApi.loading && !me ? "" : initial}
              </span>
              {meApi.loading && !me ? (
                <Skeleton className="hidden h-4 w-24 sm:block" />
              ) : (
                <span className="hidden max-w-[12rem] truncate text-sm font-medium sm:block">
                  {userName}
                </span>
              )}
            </button>
          }
          label={me?.email || "Profile"}
          items={[
            {
              label: "Account",
              icon: <User size={16} />,
              onClick: () => router.push("/dashboard/settings"),
            },
            {
              label: "Settings",
              icon: <Settings size={16} />,
              onClick: () => router.push("/dashboard/settings"),
            },
            {
              label: "Log out",
              icon: <LogOut size={16} />,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
}
