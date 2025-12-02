"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  MousePointer,
  Users,
  MapPin,
  PieChart
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const { urlId } = useParams();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics/${urlId}/overview`, {
        withCredentials: true,
      });
console.log(res.data.data);

      setOverview(res.data.data.overview);
      setLoading(false);
    } catch (err) {
      console.error("Analytics fetch failed:", err);
      alert("Failed to load analytics");
    }
  };

  useEffect(() => {
    if (urlId) fetchAnalytics();
  }, [urlId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-lg">
        Loading analytics...
      </div>
    );
  }

  const summary = overview.summary;

  // Prepare Chart.js Data
  const dailyLabels = overview.daily.map((d) =>
    new Date(d.day).toLocaleDateString()
  );
  const dailyClicks = overview.daily.map((d) => d.clicks);

  const deviceLabels = overview.devices.map((d) => d.device_type);
  const deviceTotals = overview.devices.map((d) => d.total);

  const countryLabels = overview.countries.map((c) => c.country);
  const countryTotals = overview.countries.map((c) => c.total);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => history.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">URL Analytics</h1>
      </div>

      {/* Summary Stats */}
      <section className="grid md:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Clicks"
          value={summary.total_clicks}
          icon={<MousePointer size={20} />}
        />

        <SummaryCard
          title="Unique Users"
          value={summary.unique_users}
          icon={<Users size={20} />}
        />

        <SummaryCard
          title="Countries"
          value={summary.unique_countries}
          icon={<MapPin size={20} />}
        />

        <SummaryCard
          title="Devices"
          value={summary.unique_devices}
          icon={<Smartphone size={20} />}
        />

        <SummaryCard
          title="Referrers"
          value={summary.unique_referrers}
          icon={<Globe size={20} />}
        />
      </section>

      {/* Daily Clicks Line Chart */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" /> Click Trends
        </h2>

        <Line
          data={{
            labels: dailyLabels,
            datasets: [
              {
                label: "Clicks",
                data: dailyClicks,
                borderColor: "rgb(79, 70, 229)",
                backgroundColor: "rgba(79, 70, 229, 0.3)",
                tension: 0.4,
              },
            ],
          }}
          height={90}
        />
      </div>

      {/* Pie Charts: Devices + Countries */}
      <section className="grid md:grid-cols-2 gap-6">
        <AnalyticsPieCard
          title="Device Breakdown"
          labels={deviceLabels}
          data={deviceTotals}
        />

        <AnalyticsPieCard
          title="Country Breakdown"
          labels={countryLabels}
          data={countryTotals}
        />
      </section>

      {/* Referrers */}
      <section className="bg-white p-6 rounded-2xl shadow border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <PieChart size={20} className="text-indigo-600" /> Referrers
        </h2>

        <div className="space-y-3">
          {overview.referrers.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <span className="text-slate-700">{r.referrer || "Direct"}</span>
              <span className="font-semibold text-indigo-600">{r.total}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------ Components ------------------------ */

function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow border flex flex-col gap-2">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-indigo-600">{icon}</div>
    </div>
  );
}

function AnalyticsPieCard({ title, labels, data }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <PieChart size={20} className="text-indigo-600" /> {title}
      </h2>

      <Pie
        data={{
          labels,
          datasets: [
            {
              data,
              backgroundColor: [
                "rgba(79, 70, 229, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(59, 130, 246, 0.8)",
              ],
            },
          ],
        }}
      />
    </div>
  );
}
