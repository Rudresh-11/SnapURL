'use client';
import { use, useState, useEffect } from 'react';
import { ChevronLeft, Copy, Share2, MoreVertical, Globe, Calendar, TagIcon, Pencil, Share2Icon, Trash, Ticket, Check, CornerDownRight } from 'lucide-react';
import { ChartBarInteractive } from '@/components/analytics/barchart.js';
import { ChartPieDonut } from '@/components/analytics/piechart';
import { useParams } from 'next/navigation';
import useApi from '@/hooks/useApi';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenuDemo } from '@/components/dropdown';
import ConfirmDialog from '@/components/confirm-dialog';
export default function LinkAnalytics() {

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

  function formatDate(d) {
    const date = new Date(d);

    const formatted = date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hrs = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    const mins = String(Math.abs(offset) % 60).padStart(2, "0");

    return `${formatted} GMT${sign}${hrs}:${mins}`;
  }
  const params = useParams();
  const { urlId } = params;

  const [isCopied, setIsCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const overviewApi = useApi(`/analytics/${urlId}/overview`, { auto: true, method: "GET" });
  const overviewData = overviewApi.data?.data?.overview;

  if (overviewApi.loading || !overviewData) {
    return <div>Loading...</div>;
  }

  const totalClicks = overviewData.summary.total_clicks;
  const rawData = normalizeData(overviewData.daily);
  const locationData = formatLocationData(overviewData.countries);
  const myreferrersData = overviewData.referrers;
  const devicesData = overviewData.devices;



  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${process.env.NEXT_PUBLIC_BASE_URL}/${overviewData.url.short_code}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDelete = async (id) => {
    alert("Delete functionality is not implemented yet.");
  };

  if (overviewApi.loading) {
    return <div>Loading12...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium"><Link href="/dashboard/links">Back to list</Link></span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Image width={24} height={24} src={`https://www.google.com/s2/favicons?domain=${overviewData.url.original_url}`} alt="Favicon" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {parseTitleFromUrl(overviewData.url.original_url)} – untitled
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <a
                    href={`https://${process.env.NEXT_PUBLIC_BASE_URL}/${overviewData.url.short_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {`${process.env.NEXT_PUBLIC_BASE_URL}/${overviewData.url.short_code}`}
                  </a>
                  <button onClick={handleCopy} className="text-gray-400 hover:text-blue-600 cursor-pointer">
                    {isCopied ? <Check className="w-4 h-4 " /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-gray-400"><CornerDownRight className="w-4 h-4" /></span>
                  <span className="truncate max-w-2xl">
                    <a className='hover:underline' href={overviewData.url.original_url} target="_blank" rel="noopener noreferrer">{overviewData.url.original_url}</a>
                  </span>
                </div>
                <div className="border-b border-gray-300 mt-3 mb-2 w-full"></div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(overviewData.url.created_at)}
                  </span>

                  <span className="flex items-center gap-1">
                    <TagIcon className="w-4 h-4" />
                    No tags - <span className='text-gray-400'>Feature will be added soon</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <DropdownMenuDemo
                  trigger={<MoreVertical className="w-5 h-5 text-gray-600" />}
                  label="Actions"
                  items={[
                    {
                      label: "Delete",
                      icon: <Trash className="w-4 h-4 text-red-500" />,
                      onClick: () => {setShowConfirm(true);},
                    },
                  ]}
                />
                <ConfirmDialog
                  open={showConfirm}
                  setOpen={setShowConfirm}
                  title="Delete Link"
                  description="Are you sure you want to delete this link? This action cannot be undone."
                  confirmText="Delete"
                  cancelText="Cancel"
                  onConfirm={handleDelete}
                />
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
          <ChartPieDonut
            data={myreferrersData}
            labelKey="referrer"
            valueKey="total"
            title="Referrer Traffic"
          />
          {/* Devices */}
          <ChartPieDonut
            title="Device Breakdown"
            data={devicesData}
            labelKey="device_type"
            valueKey="total"
          />

        </div>
      </div>
    </div>
  );
}