"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Filter, MoreVertical, TrendingUp } from "lucide-react";

import useApi from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChartBarInteractive } from "@/components/analytics/barchart";
import { ChartPieDonut } from "@/components/analytics/piechart";

function formatISODate(d) {
  return d.toISOString().split("T")[0];
}

function formatPrettyDate(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function AnalyticsPage() {
  // Default: last 7 days (including today)
  const [toDate] = useState(() => new Date());
  const [fromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d;
  });

  const dateRangeLabel = useMemo(() => {
    const from = fromDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const to = toDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${from} → ${to}`;
  }, [fromDate, toDate]);

  // NOTE: adjust the endpoint to match your backend route.
  // Example if you used: router.get("/me/url-stats", ...)
  const endpoint = "/auth/me/url-stats";

  const { data, loading, error, request } = useApi(endpoint, { auto: false });

  useEffect(() => {
    const from = formatISODate(fromDate);
    const to = formatISODate(toDate);
    request(null, `${endpoint}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  }, [endpoint, fromDate, toDate, request]);

  // ApiResponse shape: { statusCode, data, message, success }
  const analytics = data?.data;

  const topDate = analytics?.topPerformingDate?.date;
  const topDateEngagements = analytics?.topPerformingDate?.engagements ?? 0;
  const totalEngagements = analytics?.totals?.engagements ?? 0;

  const engagementsOverTimeForBar = useMemo(() => {
    const rows = analytics?.engagementsOverTime ?? [];
    return rows.map((r) => ({
      date: r.date,
      clicks: Number(r.engagements ?? 0),
    }));
  }, [analytics]);

  const deviceData = useMemo(() => analytics?.engagementsByDevice ?? [], [analytics]);
  const referrerData = useMemo(() => analytics?.engagementsByReferrer ?? [], [analytics]);
  const countryData = useMemo(() => analytics?.engagementsByLocation?.countries ?? [], [analytics]);

  const topLocationLabel = useMemo(() => {
    const country = analytics?.topLocation?.country;
    if (!country) return "-";
    return country;
  }, [analytics]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        {/* Date Range & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button className="px-4 py-2 border rounded text-sm flex items-center gap-2 hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            {dateRangeLabel}
          </button>
          <button className="px-4 py-2 border rounded text-sm flex items-center gap-2 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Add filters
          </button>
          <span className="text-sm text-gray-600">Showing data for all links and QR Codes</span>
        </div>

        {error ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm text-red-600">{error}</CardTitle>
            </CardHeader>
          </Card>
        ) : null}

        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                <div className="text-lg font-bold">{topDate ? formatPrettyDate(topDate) : "-"}</div>
              </div>
              <div className="text-3xl font-bold mb-1">{topDateEngagements} Engagements</div>
              <div className="text-xs text-gray-500">Total: {totalEngagements}</div>
              {loading ? <div className="text-xs text-gray-400 mt-2">Loading...</div> : null}
            </CardContent>
          </Card>

          {/* Devices */}
          <ChartPieDonut
            title="Devices"
            description="Total engagements by device"
            data={deviceData}
            labelKey="device"
            valueKey="engagements"
            maxCategories={5}
          />

          {/* Referrers */}
          <ChartPieDonut
            title="Referrers"
            description="Total engagements by referrer"
            data={referrerData}
            labelKey="referrer"
            valueKey="engagements"
            maxCategories={5}
          />
        </div>

        {/* Over Time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ChartBarInteractive
              title="Total Engagements over time"
              description="Showing clicks over time"
              data={engagementsOverTimeForBar}
              height={260}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium text-gray-600">Top performing location</div>
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <div className="text-lg font-bold">{topLocationLabel}</div>
              </div>
              <div className="text-3xl font-bold mb-1">{analytics?.topLocation?.engagements ?? 0} Engagements</div>
              <div className="text-xs text-gray-500">{dateRangeLabel}</div>
            </CardContent>
          </Card>
        </div>

        {/* Countries table (simple) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Total Engagements by location (Countries)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[260px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-600">#</th>
                    <th className="text-left py-2 font-medium text-gray-600">Country</th>
                    <th className="text-right py-2 font-medium text-gray-600">Engagements</th>
                  </tr>
                </thead>
                <tbody>
                  {(countryData ?? []).map((row, idx) => (
                    <tr key={`${row.country}-${idx}`} className="border-b hover:bg-gray-50">
                      <td className="py-2 text-gray-600">{idx + 1}</td>
                      <td className="py-2 font-medium">{row.country}</td>
                      <td className="py-2 text-right">{row.engagements}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
