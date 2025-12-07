'use client';
import { use, useState, useEffect } from 'react';
import { ChevronLeft, Copy, Share2, MoreVertical, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartBarInteractive } from '@/components/analytics/barchart.js';
import { ChartBarLabelCustom } from '@/components/analytics/horizontalBarchart';
import { ChartPieDonut } from '@/components/analytics/piechart';
import { useParams } from 'next/navigation';
import useApi from '@/hooks/useApi';

export default function LinkAnalytics() {
  const params = useParams();
  const { urlId } = params;

  const overviewApi = useApi(`/analytics/${urlId}/overview`, {
    auto: true,
    method: "GET"
  });

  const overviewData = overviewApi.data?.data?.overview;

  if (overviewApi.loading || !overviewData) {
    return <div>Loading...</div>;
  }


  function normalizeData(apiDaily) {
    return apiDaily.map(item => ({
      date: item.day.split("T")[0],
      clicks: Number(item.clicks)
    }));
  }

  function formatLocationData(raw) {
    // 1. Convert totals to numbers
    const arr = raw.map(item => ({
      country: item.country,
      clicks: Number(item.total)
    }));

    // 2. Calculate total clicks
    const totalClicks = arr.reduce((sum, item) => sum + item.clicks, 0);

    // 3. Sort by clicks (descending)
    arr.sort((a, b) => b.clicks - a.clicks);

    // 4. Format with rank + percentage
    return arr.map((item, index) => ({
      rank: index + 1,
      country: item.country,
      clicks: item.clicks,
      percentage: Math.round((item.clicks / totalClicks) * 100)
    }));
  }

  function parseTitleFromUrl(url) {
    try {
      const hostname = new URL(url).hostname; // google.com
      const name = hostname.replace("www.", "").split(".")[0]; // google
      return name.charAt(0).toUpperCase() + name.slice(1); // Google
    } catch {
      return "Untitled";
    }
  }
  const totalClicks = overviewData.summary.total_clicks;
  const rawData = normalizeData(overviewData.daily);
  const locationData = formatLocationData(overviewData.countries);

  console.log('Overview Data:', overviewData);
  console.log('Country Data:', overviewData);
  // Referrers data
  const referrersData = [
    { name: 'Direct', value: 156, color: '#3B82F6' },
    { name: 'Twitter', value: 124, color: '#10B981' },
    { name: 'Facebook', value: 98, color: '#F59E0B' },
    { name: 'LinkedIn', value: 76, color: '#8B5CF6' },
    { name: 'Other', value: 54, color: '#06B6D4' }
  ];

  const referrersList = [
    { source: 'Direct', clicks: 156, percentage: 31 },
    { source: 'Twitter', clicks: 124, percentage: 24 },
    { source: 'Facebook', clicks: 98, percentage: 19 },
    { source: 'LinkedIn', clicks: 76, percentage: 15 },
    { source: 'Other', clicks: 54, percentage: 11 }
  ];

  // Devices data
  const devicesData = [
    { name: 'Mobile', value: 245, color: '#06B6D4' },
    { name: 'Desktop', value: 189, color: '#F59E0B' },
    { name: 'Tablet', value: 74, color: '#3B82F6' }
  ];

  const devicesList = [
    { device: 'Mobile', clicks: 245, percentage: 48 },
    { device: 'Desktop', clicks: 189, percentage: 37 },
    { device: 'Tablet', clicks: 74, percentage: 15 }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText('bit.ly/44GwO8m');
  };
  if (overviewApi.loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium">Back to list</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {parseTitleFromUrl(overviewData.url.original_url)} – untitled
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/${overviewData.url.short_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {`${process.env.NEXT_PUBLIC_BASE_URL}/${overviewData.url.short_code}`}
                  </a>
                  <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-gray-400">↪</span>
                  <span className="truncate max-w-2xl">
                    {overviewData.url.original_url}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>📅 {new Date(overviewData.url.created_at).toLocaleString()}</span>
                  <span>🏷️ No tags</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Engagements Over Time */}
        <ChartBarInteractive data={rawData} />
        {/* Locations */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Countries</h2>
            <div className="flex gap-2">

            </div>
          </div>

          <div className="space-y-3">
            {(locationData).map((country) => (
              <div key={country.rank} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-6">{country.rank}</span>
                <span className="text-sm font-medium text-gray-900 w-24">{country.country}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{country.clicks}</span>
                <span className="text-sm text-gray-500 w-12">{country.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* <ChartBarLabelCustom/> */}
        
        
        {/* Referrers and Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referrers */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Referrers</h2>
            <div className="flex items-center gap-8">
              <div className="shrink-0">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={referrersData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {referrersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {referrersList.map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: referrersData[index].color }}
                      />
                      <span className="text-gray-700">{referrer.source}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-900 font-medium">{referrer.clicks}</span>
                      <span className="text-gray-500 w-10">{referrer.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Devices */}
          <ChartPieDonut />
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Devices</h2>
            <div className="flex items-center gap-8">
              <div className="shrink-0">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={devicesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {devicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {devicesList.map((device, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: devicesData[index].color }}
                      />
                      <span className="text-gray-700">{device.device}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-900 font-medium">{device.clicks}</span>
                      <span className="text-gray-500 w-10">{device.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}