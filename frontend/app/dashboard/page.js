"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export default function AnalyticsPage({ params }) {
  const  id  = 3;

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  const COLORS = ["#6366F1", "#22C55E", "#F97316", "#06B6D4", "#EF4444"];

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.get(`/analytics/${id}/overview`);
      setOverview(res.data.data.overview);
    } catch (err) {
      console.log(err);
      alert("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !overview) return <p className="p-6">Loading analytics...</p>;

  const { summary, daily, devices, countries, referrers } = overview;

  // Convert charts to recharts-friendly structures
  const referrerChart = referrers.map(r => ({
    name: r.referrer || "Direct",
    value: Number(r.total)
  }));

  const deviceChart = devices.map(d => ({
    name: d.device_type,
    value: Number(d.total)
  }));

  const countryChart = countries.map(c => ({
    name: c.country,
    value: Number(c.total)
  }));

  const dailyChart = daily.map(d => ({
    date: new Date(d.day).toLocaleDateString(),
    clicks: Number(d.clicks)
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      <p className="text-gray-600">Performance insights for this link</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <SummaryCard label="Total Clicks" value={summary.total_clicks} />
        <SummaryCard label="Unique Users" value={summary.unique_users} />
        <SummaryCard label="Countries" value={summary.unique_countries} />
        <SummaryCard label="Devices" value={summary.unique_devices} />
        <SummaryCard label="Referrers" value={summary.unique_referrers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Clicks Over Time */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Clicks Over Time
            </h2>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChart}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#6366F1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Referrer List */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Top Referrers
            </h2>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2">Referrer</th>
                  <th className="py-2">Clicks</th>
                </tr>
              </thead>

              <tbody>
                {referrers.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{r.referrer || "Direct"}</td>
                    <td className="py-2 font-semibold">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT COLUMN: 3 Pie Charts */}
        <div className="space-y-6">

          {/* Referrer Pie */}
          <ChartCard title="Clicks by Referrer">
            <PieChartComponent data={referrerChart} colors={COLORS} />
          </ChartCard>

          {/* Device Pie */}
          <ChartCard title="Clicks by Device">
            <PieChartComponent data={deviceChart} colors={COLORS} />
          </ChartCard>

          {/* Country Pie */}
          <ChartCard title="Clicks by Country">
            <PieChartComponent data={countryChart} colors={COLORS} />
          </ChartCard>

        </div>
      </div>
    </div>
  );
}

/* ---------------------- COMPONENTS ---------------------- */

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="h-56 mt-3">
        {children}
      </div>
    </div>
  );
}

function PieChartComponent({ data, colors }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
