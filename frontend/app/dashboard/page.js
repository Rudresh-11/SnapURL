"use client";

import React, { useState,useEffect } from 'react';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Settings, 
  LogOut, 
  Plus, 
  Copy, 
  BarChart3, 
  ExternalLink,
  MoreVertical,
  Search,
  Bell,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { generateShortCode } from '@/lib/shortcode';
import { convertToLocalTime } from '@/lib/timeconverter';

export default function App() {
  const [user, setUser] = useState({username:'',email:''});
  const [urls, setUrls] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
    const [originalUrl, setOriginalUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");

  const fetchUrls = async () => {
    try {
      const res = await api.get(`/url/get`, {
        withCredentials: true,
      });
      console.log("urldata", res.data.data);
      
      setUrls(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load URLs:", err);
    }
  };

  useEffect(() => {
    async function validateUser() {
      try {
        const res = await api.get(`/auth/me`, {});

        console.log("userdata", res.data.data);
        
        setUser(res.data.data);
        fetchUrls();
      } catch (err) {
        window.location.href = "/login";
      }
    }

    validateUser();
  }, []);

  // Copy to clipboard handler
  const handleCopy = (text) => {
    // In a real app, use navigator.clipboard.writeText(text);
    // Here we simulate it visually
    const btn = document.getElementById(`copy-btn-${text}`);
    if(btn) {
      const originalContent = btn.innerHTML;
      btn.innerText = 'Copied!';
      btn.classList.add('bg-green-100', 'text-green-700');
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.remove('bg-green-100', 'text-green-700');
      }, 2000);
    }
  };

  // Add new URL handler
  const handleShorten = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        original_url: originalUrl,
        custom_alias: customAlias || null,
      };

      const res = await api.post(`/url/shorten`, payload, {
        withCredentials: true,
      });

      setUrls([res.data.data, ...urls]);
      setOriginalUrl("");
      setCustomAlias("");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create short link.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* SIDEBAR - Matches the left section of wireframe */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        {/* Logo Area */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            SnapURL
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('urls')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'urls' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-gray-50'}`}
          >
            <LinkIcon size={20} />
            Your URLs
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 size={20} />
            Analytics
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings size={20} />
            Settings
          </button>
        </nav>

        {/* Profile Section - Matches "profile" circle in wireframe */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
              {user?.username[0]?.toUpperCase()||'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT - Matches right section of wireframe */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden sticky top-0 z-10">
          <span className="font-bold text-indigo-600 text-xl">SnapURL</span>
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">JD</div>
        </header>

        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
              <p className="text-slate-500">Overview of your link performance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search links..." 
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Bell size={20} />
              </button>
            </div>
          </div>

          {/* Top Performing URLs Section - Matches wireframe "Top performing urls" */}
          <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 size={120} className="text-indigo-600" />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="text-indigo-600" size={20} />
                Top Performing URL
              </h3>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Trending</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              <div className="col-span-2 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>snapurl.com/k92xs</span>
                    <span>1,245 clicks</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[85%] animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>snapurl.com/m9s8d</span>
                    <span>856 clicks</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full w-[60%]"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                <span className="text-3xl font-bold text-indigo-600">2.5k</span>
                <span className="text-sm text-indigo-600/80 font-medium">Total Clicks today</span>
              </div>
            </div>
          </section>

          {/* Action Button - Matches wireframe "+ short new url" */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 font-medium transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={24} />
            Shorten New URL
          </button>

          {/* URL List - Matches wireframe list section */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="font-semibold text-lg text-slate-800">Recent Links</h3>
               <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
             </div>

             <div className="space-y-3">
               {urls.map((url) => (
                 <div key={url.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-start gap-4 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600">
                        <LinkIcon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 truncate">{`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}</h4>
                          <span className="text-xs text-slate-400 font-normal hidden sm:inline-block">• {convertToLocalTime(url.created_at)}</span>
                        </div>
                        <p className="text-sm text-indigo-600 font-medium truncate">{url.short_code}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{url.original_url}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                      <div className="flex items-center gap-1.5 text-slate-600 bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                        <BarChart3 size={14} />
                        <span className="font-medium">{url.total_clicks}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          id={`copy-btn-${url.short_code}`}
                          onClick={() => handleCopy(url.short_code)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Copy Link"
                        >
                          <Copy size={18} />
                        </button>
                        <button onClick={() => window.open(`dashboard/${url.id}`, "_blank")} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors sm:opacity-0 group-hover:opacity-100">
                          <ExternalLink size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors sm:opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </section>

        </div>
      </main>

      {/* Shorten URL Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Create New Link</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleShorten} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="url" 
                    required
                    placeholder="https://example.com/very-long-url..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Alias (Optional)</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-200 text-slate-500 px-3 py-3 rounded-l-xl text-sm">snapurl.com/</span>
                  <input 
                    type="text" 
                    placeholder="my-link"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={customAlias || generateShortCode(6)}
                    onChange={(e) => setCustomAlias(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]"
                >
                  Create Short Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}