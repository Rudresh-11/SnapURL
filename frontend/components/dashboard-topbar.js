"use client";

import { Search, HelpCircle, User, Settings, LogOut } from "lucide-react";
import { DropdownMenuDemo } from "@/components/dropdown";
import ConfirmDialog from "./confirm-dialog";
import useApi from "@/hooks/useApi";
import { useState } from "react";

export default function DashboardTopbar() {

  const [openDialog, setOpenDialog] = useState(false)
  const meApi = useApi("/auth/me", { auto: true });
  const me = meApi.data?.data;

  const userName = me?.username || "SnapUrl User";
  const userAvatar = me?.avatar || null;
  const initial = userName.charAt(0).toUpperCase();

  const logoutApi = useApi("/auth/logout", { method: "POST" });

  const handleLogout = async () => {
    await logoutApi.request();
    window.location.href = "/login";
  };

  return (
    <div className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <ConfirmDialog open={openDialog} setOpen={setOpenDialog}
        title="Upgrade account"
        description="This feature will be available soon"
        confirmText="Got it!"
        cancelText="Cancel"
      />

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#F2F3F5] px-4 py-2 rounded-lg w-[320px]">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">

        <button onClick={() => setOpenDialog(true)} className="px-4 py-2 bg-[#0E9F6E] text-white rounded-md text-sm font-medium hover:bg-[#0c8b60] transition">
          Upgrade
        </button>

        <button onClick={()=>{window.location.href="/help"}} className="text-gray-600 hover:text-black transition">
          <HelpCircle size={22} />
        </button>

        {/* YOUR DROPDOWN COMPONENT */}
        <DropdownMenuDemo
          trigger={
            <div className="flex items-center gap-2 cursor-pointer select-none">

              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-800 text-white flex items-center justify-center rounded-full">
                  {initial}
                </div>
              )}

              <span className="text-sm font-medium text-gray-800">
                {userName}
              </span>
            </div>
          }
          label="Profile"
          items={[
            {
              label: "Account",
              icon: <User size={16} />,
              onClick: () => { window.location.href = "/profile" },
            },
            {
              label: "Settings",
              icon: <Settings size={16} />,
              onClick: () => window.location.href = "/settings",
            },
            {
              label: "Logout",
              icon: <LogOut size={16} />,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </div>
  );
}
