"use client";

import Link from "next/link";
import { ArrowRight, Link as LinkIcon, BarChart, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b bg-white/70 backdrop-blur-md">
        <div className="text-2xl font-bold text-indigo-600">SnapURL</div>

        <div className="flex gap-6 items-center">
          <Link href="/login" className="text-gray-600 hover:text-indigo-600">
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto text-center mt-20 px-6">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Shorten Links. Track Performance.
          <span className="text-indigo-600"> Instantly.</span>
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          SnapURL helps you shorten long URLs, track analytics, and understand your audience with clean and powerful insights.
        </p>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 mt-10 px-6 py-3 bg-indigo-600 text-white text-lg rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Start for Free
          <ArrowRight size={20} />
        </Link>
      </header>

      {/* Shortening Demo Section */}
      <section className="mt-24 max-w-2xl mx-auto px-6">
        <div className="bg-white p-6 shadow-xl rounded-xl border">
          <p className="font-medium text-gray-700 mb-3">Try it now 👇</p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste a long URL here..."
              className="flex-1 px-4 py-3 border rounded-lg outline-none focus:border-indigo-600"
            />
            <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Shorten
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-28 max-w-5xl mx-auto px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Why SnapURL?
        </h2>

        <div className="grid md:grid-cols-3 gap-10 mt-12">
          
          <div className="p-6 bg-white rounded-xl shadow-md border hover:shadow-lg transition">
            <LinkIcon className="text-indigo-600" size={32} />
            <h3 className="font-semibold text-xl mt-4">Shorten Instantly</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Create clean & memorable links with a single click. Perfect for sharing anywhere.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border hover:shadow-lg transition">
            <BarChart className="text-indigo-600" size={32} />
            <h3 className="font-semibold text-xl mt-4">Real-Time Analytics</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Track clicks by device, country, referrer, and timeline. Get insights like never before.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border hover:shadow-lg transition">
            <ShieldCheck className="text-indigo-600" size={32} />
            <h3 className="font-semibold text-xl mt-4">Bot Detection</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Automatically filter bot clicks and get clean, true analytics.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SnapURL — All rights reserved.
      </footer>
    </div>
  );
}
