"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Link as LinkIcon,
  Settings,
  BarChart3,
  Plus,
  Copy,
  ExternalLink,
  MoreVertical,
  Search,
  Bell,
  X,
} from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");

  // ------------------------------
  // AUTH VALIDATION
  // ------------------------------
  useEffect(() => {
    async function validateUser() {
      try {
        const res = await axios.get(`${API}/auth/me`, {
          withCredentials: true,
        });

        setUser(res.data.data);
        fetchUrls();
      } catch (err) {
        window.location.href = "/login";
      }
    }

    validateUser();
  }, []);

  // ------------------------------
  // FETCH USER URLS
  // ------------------------------
  const fetchUrls = async () => {
    try {
      const res = await axios.get(`${API}/urls/all`, {
        withCredentials: true,
      });

      setUrls(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load URLs:", err);
    }
  };

  // ------------------------------
  // CREATE NEW SHORT URL
  // ------------------------------
  const handleShorten = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        original_url: originalUrl,
        custom_alias: customAlias || null,
      };

      const res = await axios.post(`${API}/urls/create`, payload, {
        withCredentials: true,
      });

      setUrls([res.data.data, ...urls]);
      setOriginalUrl("");
      setCustomAlias("");
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create short link.");
    }
  };

  // ------------------------------
  // COPY HANDLER
  // ------------------------------
  const handleCopy = async (content) => {
    await navigator.clipboard.writeText(content);
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">SnapURL</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-gray-50 rounded-lg">
            <LinkIcon size={20} />
            Your URLs
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-gray-50 rounded-lg">
            <BarChart3 size={20} />
            Analytics
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <button className="p-2 text-slate-400">
              <Bell size={20} />
            </button>
          </div>

          {/* Shorten Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl mt-6 flex items-center justify-center gap-2"
          >
            <Plus size={24} />
            Shorten New URL
          </button>

          {/* URL LIST */}
          <div className="mt-8 space-y-4">
            {urls.map((url) => (
              <div
                key={url.id}
                className="bg-white p-4 rounded-xl border shadow-sm flex justify-between"
              >
                <div>
                  <p className="text-indigo-600 font-medium truncate">
                    {url.short_code}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {url.original_url}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleCopy(`${process.env.NEXT_PUBLIC_REDIRECT_BASE}/${url.short_code}`)
                    }
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    <Copy size={18} />
                  </button>

                  <button className="text-slate-400 hover:text-indigo-600">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">Create Short Link</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleShorten} className="space-y-4">
              <div>
                <label>Destination URL</label>
                <input
                  type="url"
                  required
                  className="w-full border p-3 rounded-lg"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                />
              </div>

              <div>
                <label>Custom Alias (Optional)</label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-lg"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
              </div>

              <button className="w-full bg-indigo-600 text-white p-3 rounded-lg">
                Create Short Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
