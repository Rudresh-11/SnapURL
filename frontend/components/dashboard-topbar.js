"use client";

import { Search } from "lucide-react";

export default function DashboardTopbar() {
  return (
    <div className="h-16 border-b bg-white px-6 flex items-center justify-between">
      
      {/* SEARCH BAR */}
      <div className="flex items-center gap-2 bg-[#F2F3F5] px-4 py-2 rounded-lg w-[300px]">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {/* PROFILE */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-800 text-white flex items-center justify-center rounded-full">
          R
        </div>
      </div>
    </div>
  );
}
