'use client';
import { use, useState } from 'react';
import { ChevronLeft, Copy, Share2, MoreVertical, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartBarInteractive } from '@/components/analytics/barchart.js';
import { ChartBarLabelCustom } from '@/components/analytics/horizontalBarchart';
import { ChartPieDonut } from '@/components/analytics/piechart';

export default function LinkAnalytics() {

  // Sample data for engagements over time
  const engagementData = [
    { date: '11/1', clicks: 12 },
    { date: '11/5', clicks: 18 },
    { date: '11/10', clicks: 25 },
    { date: '11/15', clicks: 32 },
    { date: '11/20', clicks: 45 },
    { date: '11/25', clicks: 38 },
    { date: '11/30', clicks: 28 },
    { date: '12/1', clicks: 22 },
    { date: '12/5', clicks: 35 },
    { date: '12/10', clicks: 42 },
    { date: '12/15', clicks: 38 },
    { date: '12/20', clicks: 30 },
    { date: '12/25', clicks: 48 },
    { date: '12/30', clicks: 52 },
    { date: '1/4', clicks: 45 },
    { date: '1/9', clicks: 38 },
    { date: '1/14', clicks: 42 },
    { date: '1/19', clicks: 36 },
    { date: '1/24', clicks: 28 },
    { date: '1/29', clicks: 32 }
  ];

  // Location data
  const locationData = [
    { rank: 1, country: 'USA', clicks: 245, percentage: 45 },
    { rank: 2, country: 'Canada', clicks: 156, percentage: 28 },
    { rank: 3, country: 'UK', clicks: 89, percentage: 16 },
    { rank: 4, country: 'Germany', clicks: 34, percentage: 6 },
    { rank: 5, country: 'France', clicks: 28, percentage: 5 }
  ];

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
                  chatgpt.com – untitled
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <a
                    href="https://bit.ly/44GwO8m"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    bit.ly/44GwO8m
                  </a>
                  <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-gray-400">↪</span>
                  <span className="truncate max-w-2xl">
                    https://chatgpt.com/g/g-692ee3e53c9c819187565520ea59656b-snapurl/c/6931a69c-d798-8320-a0d1-078f5f445f21
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>📅 December 6, 2025 12:14 AM GMT+5:30</span>
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Engagements over time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="clicks" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
<ChartBarInteractive />
        {/* Locations */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Countries</h2>
            <div className="flex gap-2">

            </div>
          </div>

          <div className="space-y-3">
            {locationData.map((location) => (
              <div key={location.rank} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-6">{location.rank}</span>
                <span className="text-sm font-medium text-gray-900 w-24">{location.country}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${location.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{location.clicks}</span>
                <span className="text-sm text-gray-500 w-12">{location.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referrers and Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referrers */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Referrers</h2>
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0">
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
              <div className="flex-shrink-0">
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