"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Link2,
  BarChart,
  ShieldCheck,
  ChevronDown,
  Users,
  MousePointerClick,
  Layers,
  Check,
} from "lucide-react";
import useApi from "@/hooks/useApi";

export default function LandingPage() {
  const [error, setError] = useState(null)
  const [orignal, setorignal] = useState("")
  const [copied, setCopied] = useState(false);

  const demoApi = useApi("/url/demoshorten", { method: "POST" })
  const statsApi = useApi("/analytics/stats", { auto: true, method: "GET" })

  const statsData = statsApi.data?.data || null;
  let statsError = statsApi.error;
  const statsLoading = statsApi.loading;
  console.log(statsData)


  const handleShorten = async () => {
    setError(null);

    const alreadyUsed = localStorage.getItem("snapurl_demo_created");
    if (alreadyUsed) {
      setError("You’ve reached the free limit. Create an account to continue.");
      return;
    }

    if (!orignal.trim()) {
      setError("Insert original URL first");
      return;
    }

    const res = await demoApi.request({ originalUrl: orignal });

    if (!res || demoApi.error) {
      setError(demoApi.error);
      return;
    }

    localStorage.setItem("snapurl_demo_created", "true");
  };

  if (statsError === "timeout of 10000ms exceeded") {
    statsError = "Our backend is starting up. Please refresh again in 7-8 seconds to view stats";
  }
  return (
    <div className="min-h-screen ">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-semibold text-indigo-600">SnapURL</div>

          <div className="hidden md:flex items-center gap-8">

            {/* SERVICES DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                Services <ChevronDown size={16} />
              </button>

              <div
                className="
            absolute top-full left-0 mt-2
            bg-white border border-gray-200 rounded-md shadow-lg py-2 w-48
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-150
          "
              >
                <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                  URL Shortening
                </a>
                <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                  Analytics Dashboard
                </a>
                <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                  Bot Filtering
                </a>
              </div>
            </div>

            {/* RESOURCES DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                Resources <ChevronDown size={16} />
              </button>

              <div
                className="
            absolute top-full left-0 mt-2
            bg-white border border-gray-200 rounded-md shadow-lg py-2 w-48
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-150
          "
              >
                <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                  Documentation
                </a>
                <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                  API Reference
                </a>
                <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                  FAQ
                </a>
              </div>
            </div>

            {/* LOGIN BUTTON WITH BORDER */}
            <a
              href="/login"
              className="
          text-sm text-gray-700
          px-4 py-2 border border-gray-300 rounded-md
          hover:border-indigo-600 hover:text-indigo-600
          transition-colors
        "
            >
              Login
            </a>

            {/* GET STARTED */}
            <a
              href="/register"
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </a>

            {/* GITHUB ICON / LINK */}
            <a
              href="https://github.com/Rudresh-11/SnapURL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .5C5.648.5.5 5.648.5 12a11.5 11.5 0 0 0 7.85 10.94c.575.106.785-.25.785-.556 0-.275-.01-1.002-.015-1.967-3.194.695-3.87-1.542-3.87-1.542-.523-1.33-1.28-1.684-1.28-1.684-1.046-.715.08-.7.08-.7 1.158.082 1.77 1.19 1.77 1.19 1.03 1.766 2.705 1.255 3.365.96.105-.75.403-1.255.73-1.545-2.55-.29-5.228-1.275-5.228-5.673 0-1.253.447-2.276 1.18-3.076-.12-.29-.51-1.455.11-3.03 0 0 .96-.307 3.15 1.175A10.95 10.95 0 0 1 12 6.34c.97.005 1.95.13 2.865.38 2.19-1.482 3.15-1.175 3.15-1.175.62 1.575.23 2.74.115 3.03.73.8 1.175 1.823 1.175 3.076 0 4.41-2.685 5.38-5.245 5.66.41.35.79 1.06.79 2.155 0 1.557-.015 2.812-.015 3.19 0 .31.205.67.795.555A11.5 11.5 0 0 0 23.5 12C23.5 5.648 18.352.5 12 .5Z" />
              </svg>
            </a>
          </div>
        </div>
      </nav>


      {/* HERO SECTION */}
      <header className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
          Shorten Links. Track Performance.
          <span className="text-indigo-600"> Instantly.</span>
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          SnapURL helps you shorten long URLs, track analytics, and understand your audience with clean insights.
        </p>

        <a
          href="/register"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Start for Free <ArrowRight size={20} />
        </a>
      </header>
      {/* DEMO SECTION */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Try shortening a link
          </h3>

          <div className="flex gap-3">
            <input
              type="text"
              value={orignal}
              onChange={(e) => setorignal(e.target.value)}
              placeholder="Paste a long URL here"
              className="flex-1 px-4 py-3 border rounded-md outline-none
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <button
              onClick={handleShorten}
              className="px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Shorten
            </button>
          </div>

          {demoApi.loading && (
            <p className="mt-4 text-sm text-gray-600 flex justify-center items-center">Shortening...</p>
          )}
          {error && <div className="text-red-600 flex justify-center items-center pt-3">{error}</div>}
          {demoApi.data && (
            <div className="mt-6 text-center border-t pt-6">

              <p className="text-lg font-semibold text-gray-800 mb-4">
                Your link created successfully!
              </p>

              <div className="flex items-center justify-center gap-3 p-4 border rounded-lg">

                {/* 75% LINK */}
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/${demoApi.data.data.short_code}`}
                  target="_blank"
                  className="flex-1 max-w-[75%] text-indigo-600 font-bold text-lg truncate hover:underline"
                >
                  {`${process.env.NEXT_PUBLIC_BASE_URL}/${demoApi.data.data.short_code}`.replace("http://", "")}
                </a>

                {/* COPY BUTTON / TICK BUTTON */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/${demoApi.data.data.short_code}`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 20000);
                  }}
                  className={`
          w-[25%] px-4 py-2 rounded-md text-sm font-medium
          border transition-all
          ${copied
                      ? "border-green-600 text-green-600 flex items-center justify-center"
                      : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"}
        `}
                >
                  {copied ? <Check /> : "Copy"}
                </button>

              </div>

              <p className="text-sm text-gray-600 mt-4">
                Enjoy 1 free shortened link before signing in.
              </p>
            </div>
          )}
          <div className="mt-6 text-center border-t pt-6">
            <p className="text-sm text-gray-600">
              Free trial allows creating 1 demo link. Sign up to unlock unlimited URL shortening.
            </p>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        {statsLoading && (
          <p className="text-center text-gray-600">Loading stats...</p>
        )}

        {statsError && (
          <p className="text-center text-red-600">
            {statsError}
          </p>
        )}

        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white border border-gray-200 rounded-lg">
              <Users size={32} className="mx-auto text-indigo-600 mb-3" />
              <h3 className="text-4xl font-bold text-gray-900">
                {statsData.total_users}
              </h3>
              <p className="text-sm text-gray-600 mt-2">Total Users</p>
            </div>

            <div className="text-center p-8 bg-white border border-gray-200 rounded-lg">
              <Layers size={32} className="mx-auto text-indigo-600 mb-3" />
              <h3 className="text-4xl font-bold text-gray-900">
                {statsData.total_urls}
              </h3>
              <p className="text-sm text-gray-600 mt-2">URLs Shortened</p>
            </div>

            <div className="text-center p-8 bg-white border border-gray-200 rounded-lg">
              <MousePointerClick size={32} className="mx-auto text-indigo-600 mb-3" />
              <h3 className="text-4xl font-bold text-gray-900">
                {statsData.total_clicks}
              </h3>
              <p className="text-sm text-gray-600 mt-2">Total Clicks</p>
            </div>
          </div>
        )}
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
          Why SnapURL?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white border border-gray-200 rounded-lg">
            <Link2 className="text-indigo-600 mb-4" size={32} />
            <h3 className="font-semibold text-xl text-gray-900">Shorten Instantly</h3>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              Create clean and memorable links with a single click.
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-200 rounded-lg">
            <BarChart className="text-indigo-600 mb-4" size={32} />
            <h3 className="font-semibold text-xl text-gray-900">Real-Time Analytics</h3>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              Track clicks by device, country, referrer, and timeline.
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-200 rounded-lg">
            <ShieldCheck className="text-indigo-600 mb-4" size={32} />
            <h3 className="font-semibold text-xl text-gray-900">Bot Detection</h3>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              Automatically filter bot clicks for clean analytics.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 mt-16">
        © {new Date().getFullYear()} SnapURL — All rights reserved.
      </footer>

    </div>
  )
}
