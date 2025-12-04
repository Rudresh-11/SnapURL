"use client";

import { useEffect, useState } from "react";
import { Calendar, Filter, Download, MoreVertical, TrendingUp, Home, Link2, QrCode, FileText, BarChart3, Megaphone, Globe, Settings } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { PieChart, Pie, LineChart, Line, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";

const chartConfig = {
  clicks: { label: "Clicks", color: "hsl(var(--chart-1))" },
  desktop: { label: "Desktop", color: "hsl(180, 100%, 45%)" },
  mobile: { label: "Mobile", color: "hsl(210, 100%, 50%)" },
  tablet: { label: "Tablet", color: "hsl(210, 100%, 35%)" },
};

// Sidebar Component


export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("Nov 28, 2025 → Dec 4, 2025");
  const [selectedTab, setSelectedTab] = useState("Countries");

  // Sample data - replace with your API data
  const overview = {
    summary: {
      total_engagements: "45",
      top_date: "November 22, 2025",
    },
    devices: [
      { device_type: "Desktop", total: 146 },
      { device_type: "E-Reader", total: 101 },
      { device_type: "Tablet", total: 70 },
      { device_type: "Mobile", total: 50 },
      { device_type: "Unknown", total: 14 },
    ],
    countries: [
      { country: "United States", total: 205, percentage: 45.9 },
      { country: "Japan", total: 6, percentage: 1.3 },
      { country: "Mexico", total: 19, percentage: 4.3 },
      { country: "Russian Federation", total: 5, percentage: 1.1 },
      { country: "India", total: 27, percentage: 6 },
      { country: "Canada", total: 80, percentage: 17.9 },
      { country: "United Kingdom", total: 205, percentage: 45.9 },
      { country: "France", total: 80, percentage: 17.9 },
      { country: "Germany", total: 80, percentage: 17.9 },
    ],
    referrers: [
      { referrer: "LinkedIn", total: 45 },
      { referrer: "Facebook", total: 5 },
      { referrer: "Google", total: 20 },
      { referrer: "Twitter", total: 5 },
      { referrer: "Bitly", total: 15 },
      { referrer: "Direct", total: 10 },
      { referrer: "Other", total: 5 },
    ],
    daily: Array.from({ length: 20 }, (_, i) => ({
      day: `Dec ${i + 1}`,
      clicks: Math.floor(Math.random() * 40) + 10,
    })),
  };

  const deviceData = overview.devices.map((d) => ({
    name: d.device_type,
    value: Number(d.total),
  }));

  const countryData = overview.countries.map((d) => ({
    name: d.country,
    value: Number(d.total),
  }));

  const referrerData = overview.referrers.map((d) => ({
    name: d.referrer ?? "Direct",
    value: Number(d.total),
  }));

  const dailyData = overview.daily;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Search...
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded text-sm font-medium">
            Upgrade
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            ?
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm">
            R
          </button>
        </div>
      </div>

      <div className="flex">

        {/* Main Content */}
        <div className="flex-1 p-6">
          <button className="ml-auto mb-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium flex items-center gap-2 float-right">
            <span>+</span> Add module
          </button>

          {/* Date Range & Filters */}
          <div className="flex items-center gap-3 mb-6">
            <button className="px-4 py-2 border rounded text-sm flex items-center gap-2 hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              {dateRange}
            </button>
            <button className="px-4 py-2 border rounded text-sm flex items-center gap-2 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Add filters
            </button>
            <span className="text-sm text-gray-600">
              Showing data for all links and QR Codes
            </span>
          </div>

          {/* Top Row - 3 Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Top Performing Date */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-gray-600">
                  Top performing date by Total Engagements
                </div>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <div className="text-2xl font-bold">November 22, 2025</div>
                </div>
                <div className="text-3xl font-bold mb-1">45 Engagements</div>
                <div className="text-xs text-gray-500">Nov 28 - Dec 4, 2025</div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-gray-600">
                  Total Engagements by device
                </div>
                <div className="flex gap-1">
                  <Download className="w-4 h-4 text-gray-400" />
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ChartContainer config={chartConfig} className="w-[140px] h-[140px]">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={70}
                        strokeWidth={0}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex-1 space-y-2 text-sm">
                    {overview.devices.map((device, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            i === 0 ? 'bg-cyan-400' : 
                            i === 1 ? 'bg-cyan-300' :
                            i === 2 ? 'bg-blue-600' :
                            i === 3 ? 'bg-blue-300' : 'bg-orange-500'
                          }`}></div>
                          <span className="text-gray-700">{device.device_type}</span>
                        </div>
                        <span className="font-medium">{device.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referrers Bar Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-gray-600">
                  Total Engagements by referrer
                </div>
                <div className="flex gap-1">
                  <Download className="w-4 h-4 text-gray-400" />
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[160px]">
                  <BarChart data={referrerData}>
                    <Bar dataKey="value" fill="hsl(180, 100%, 45%)" radius={[4, 4, 0, 0]} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Middle Row - Line Chart + Location Card */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Line Chart - Spans 2 columns */}
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-gray-600">
                  Total Engagements over time
                </div>
                <div className="flex gap-1">
                  <Download className="w-4 h-4 text-gray-400" />
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(180, 100%, 45%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(180, 100%, 45%)", r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Location */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-gray-600">
                  Top performing location by Total Engagements
                </div>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <div className="text-lg font-bold">United States & United Kingdom</div>
                </div>
                <div className="text-3xl font-bold mb-1">205 Engagements</div>
                <div className="text-xs text-gray-500">Nov 28 - Dec 4, 2025</div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Location Details */}
          <div className="grid grid-cols-2 gap-6">
            {/* Map */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-gray-600">
                  Total Engagements by location
                </div>
                <div className="flex gap-1">
                  <Download className="w-4 h-4 text-gray-400" />
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-50 rounded h-[300px] flex items-center justify-center">
                  <svg viewBox="0 0 800 400" className="w-full h-full">
                    {/* Simple world map representation */}
                    <rect x="0" y="0" width="800" height="400" fill="#f9fafb"/>
                    {/* North America */}
                    <path d="M 100 80 L 250 80 L 250 180 L 100 180 Z" fill="#5eead4" opacity="0.7"/>
                    {/* Australia */}
                    <path d="M 600 250 L 700 250 L 700 320 L 600 320 Z" fill="#5eead4" opacity="0.5"/>
                    <text x="400" y="380" fontSize="12" textAnchor="middle" fill="#6b7280">
                      0 - 50 - 100 - 150 - 200 - 250
                    </text>
                  </svg>
                  <div className="absolute bottom-4 right-4 bg-white border rounded shadow-sm p-2">
                    <button className="block px-2 py-1 text-lg">+</button>
                    <button className="block px-2 py-1 text-lg">-</button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium text-gray-600">
                  Total Engagements by location
                </div>
                <div className="flex gap-1">
                  <Download className="w-4 h-4 text-gray-400" />
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4 border-b">
                  <button 
                    className={`pb-2 text-sm font-medium ${selectedTab === 'Countries' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setSelectedTab('Countries')}
                  >
                    Countries
                  </button>
                  <button 
                    className={`pb-2 text-sm font-medium ${selectedTab === 'Cities' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setSelectedTab('Cities')}
                  >
                    Cities
                  </button>
                </div>
                <div className="overflow-auto max-h-[220px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-600">#</th>
                        <th className="text-left py-2 font-medium text-gray-600">Country</th>
                        <th className="text-right py-2 font-medium text-gray-600">Engagements</th>
                        <th className="text-right py-2 font-medium text-gray-600">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.countries.map((country, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2 text-gray-600">{idx + 1}</td>
                          <td className="py-2 font-medium">{country.country}</td>
                          <td className="py-2 text-right">{country.total}</td>
                          <td className="py-2 text-right">{country.percentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}