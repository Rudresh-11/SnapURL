"use client";

import { Search, HelpCircle, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function DashboardTopbar({
  userName = "User",
  userAvatar = null,
}) {
  const initial = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="h-16 border-b bg-white px-6 flex items-center justify-between">

      {/* LEFT: SEARCH BAR */}
      <div className="flex items-center gap-2 bg-[#F2F3F5] px-4 py-2 rounded-lg w-[320px]">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">

        {/* Upgrade Button */}
        <button className="px-4 py-2 bg-[#0E9F6E] text-white rounded-md text-sm font-medium hover:bg-[#0c8b60] transition">
          Upgrade
        </button>

        {/* Help Button */}
        <button className="text-gray-600 hover:text-black transition">
          <HelpCircle size={22} />
        </button>

        {/* PROFILE DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer select-none">

              {/* Avatar */}
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

              {/* Name */}
              <span className="text-sm font-medium text-gray-800">
                {userName}
              </span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 p-1 rounded-md">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User size={16} />
              Account
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings size={16} />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 cursor-pointer text-red-600">
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}
