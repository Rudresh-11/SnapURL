'use client';
import { use, useState, useEffect } from 'react';
import { ChevronLeft, Copy, Share2, MoreVertical, Globe, Calendar, TagIcon, Pencil, Share2Icon, Trash, Ticket, Check, CornerDownRight, X } from 'lucide-react';
import { ChartBarInteractive } from '@/components/analytics/barchart.js';
import { ChartPieDonut } from '@/components/analytics/piechart';
import { useParams } from 'next/navigation';
import useApi from '@/hooks/useApi';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenuDemo } from '@/components/dropdown';
import ConfirmDialog from '@/components/confirm-dialog';
import AlertDemo from "@/components/alertdialog";
import { ClicksTable } from '@/components/analytics/datatable';


const ShareLinkModal = ({ link = "bit.ly/44GwO8m", onClose }) => {
  const [copied, setCopied] = useState(false);

  const platforms = [
    { name: "WhatsApp", url: "whatsapp.com" },
    { name: "Facebook", url: "facebook.com" },
    { name: "Instagram", url: "instagram.com" },
    { name: "Twitter", url: "twitter.com" },

  ];

  const handleSocialClick = (platform) => {
    alert(`${platform} sharing functionality not implemented yet. Please copy the link and share manually.`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Share your Bitly Link</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Social Platforms */}
        <div className="flex items-center justify-center gap-3 mb-6 overflow-x-auto pb-2">
          {platforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => handleSocialClick(platform.name)}
              className="flex flex-col items-center gap-2 min-w-fit hover:opacity-80 transition-opacity"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md`}>
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${platform.url}&sz=64`}
                  width={32}
                  height={32}
                  alt="icon"
                />
              </div>
              <span className="text-xs text-gray-700 font-medium">{platform.name}</span>
            </button>
          ))}
        </div>

        {/* Link Input with Copy Button */}
        <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-gray-50">
          <span className="text-gray-700 font-medium">{link}</span>
          <button
            onClick={handleCopyLink}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Icon Skeleton */}
            <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>

            <div className="flex-1">
              {/* Title Skeleton */}
              <div className="h-7 w-64 bg-gray-200 rounded animate-pulse mb-3"></div>

              {/* URL Skeleton */}
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>

              {/* Destination URL Skeleton */}
              <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mb-4"></div>

              {/* Date and Tag Skeleton */}
              <div className="flex items-center gap-4">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Clicks Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center py-4 border-r last:border-r-0">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Bar Chart Skeleton */}
          <div className="flex items-end justify-between gap-2 h-48">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gray-200 rounded-t animate-pulse"
                  style={{ height: `${Math.random() * 60 + 40}%` }}
                ></div>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Countries Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6"></div>

          {/* Country List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                {/* Rank */}
                <div className="h-5 w-6 bg-gray-200 rounded animate-pulse"></div>

                {/* Country Name */}
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>

                {/* Progress Bar */}
                <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-gray-200 rounded animate-pulse"
                    style={{ width: `${Math.random() * 70 + 30}%` }}
                  ></div>
                </div>

                {/* Count */}
                <div className="h-5 w-8 bg-gray-200 rounded animate-pulse"></div>

                {/* Percentage */}
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};



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
  const [alert, setAlert] = useState(false)
  const [isShare, setIsShare] = useState(false)
  const deleteApi = useApi(`/url/delete/${urlId}`, { auto: false, method: "DELETE" });
  const overviewApi = useApi(`/analytics/${urlId}/overview`, { auto: true, method: "GET" });
  const overviewData = overviewApi.data?.data?.overview;
  const clicksApi = useApi(`/analytics/${urlId}/allclicks`, { auto: true, method: "GET" });
  const clicksData = clicksApi.data?.data?.clicks
  if (overviewApi.loading || !overviewData) {
    return <SkeletonLoader />;
  }

  if (clicksApi.loading || !clicksData) {
    return <div>Loading</div>;

  }

  const totalClicks = overviewData.summary.total_clicks;
  const rawData = normalizeData(overviewData.daily);
  const locationData = formatLocationData(overviewData.countries);
  const myreferrersData = overviewData.referrers;
  const devicesData = overviewData.devices;

  console.log(clicksData)


  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${process.env.NEXT_PUBLIC_BASE_URL}/${overviewData.url.short_code}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDelete = async () => {
    const response = await deleteApi.request();
    if (!response) {
      setAlert({
        type: "error",
        message: "Error deleting link",
        description: deleteApi?.error || "An unexpected error occurred.",
      });
      return;
    }
    window.location.href = '/dashboard/links';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {alert && (<AlertDemo {...alert} />)}
      {isShare && (<ShareLinkModal link={`https://${process.env.NEXT_PUBLIC_BASE_URL}/${overviewData.url.short_code}`} onClose={() => { setIsShare(false) }} />)}
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
              <button onClick={() => setIsShare(true)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
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
                      onClick: () => { setShowConfirm(true); },
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Countries</h2>
          </div>

          {/* VALIDATION */}
          {overviewData.countries === undefined ? (
            // 1️⃣ Loading state (API still fetching)
            <div className="text-gray-500 text-sm">Loading country data...</div>

          ) : locationData.length === 0 ? (
            // 2️⃣ Empty state
            <div className="text-gray-500 text-sm flex justify-center items-center ">
              Your location-based analytics will appear here once you get traffic.
            </div>

          ) : (
            // 3️⃣ Data Available
            <div className="space-y-3">
              {locationData.map((country) => (
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
          )}
        </div>

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
        {!clicksData || clicksData.length === 0 ? (
          <div className="text-gray-500 text-sm my-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-8">All Clicks Data</h2>
            No clicks recorded yet.
          </div>
        ) : (
          <>
            <h2 className="text-4xl font-semibold text-gray-900 mb-4 mt-8">All Clicks Data</h2>
            <ClicksTable data={clicksData} />
          </>
        )}
      </div>
    </div>
  );
}