"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Globe2, TrendingUp } from "lucide-react";

import useApi from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { ChartBarInteractive } from "@/components/analytics/barchart";
import { ChartPieDonut } from "@/components/analytics/piechart";

const RANGE_OPTIONS = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
];

const ENDPOINT = "/auth/me/url-stats";

function toISODate(d) {
  return d.toISOString().split("T")[0];
}

function formatPrettyDate(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StatCard({ icon: Icon, label, headline, value, caption, loading }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" />
              <span className="truncate font-medium">{headline}</span>
            </div>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [rangeDays, setRangeDays] = useState(7);

  const { from, to, label } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (rangeDays - 1));

    const fmt = (d) =>
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    return {
      from: toISODate(start),
      to: toISODate(end),
      label: `${fmt(start)} → ${fmt(end)}`,
    };
  }, [rangeDays]);

  const { data, loading, error, request } = useApi(ENDPOINT);

  useEffect(() => {
    request(
      null,
      `${ENDPOINT}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
  }, [from, to, request]);

  const analytics = data?.data;
  const showSkeleton = loading && !analytics;

  const engagementsOverTime = useMemo(
    () =>
      (analytics?.engagementsOverTime ?? []).map((r) => ({
        date: r.date,
        clicks: Number(r.engagements ?? 0),
      })),
    [analytics]
  );

  const totalEngagements = analytics?.totals?.engagements ?? 0;
  const topDate = analytics?.topPerformingDate;
  const topLocation = analytics?.topLocation;
  const countries = analytics?.engagementsByLocation?.countries ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            {label} · all links
          </p>
        </div>

        <div className="flex rounded-md border p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.key}
              size="sm"
              variant={rangeDays === Number(opt.key) ? "secondary" : "ghost"}
              onClick={() => setRangeDays(Number(opt.key))}
              aria-pressed={rangeDays === Number(opt.key)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          label="Top performing date"
          headline={topDate?.date ? formatPrettyDate(topDate.date) : "No data"}
          value={`${topDate?.engagements ?? 0} clicks`}
          caption={`${totalEngagements} clicks in range`}
          loading={showSkeleton}
        />

        <ChartPieDonut
          title="Devices"
          description="Clicks by device"
          data={analytics?.engagementsByDevice ?? []}
          labelKey="device"
          valueKey="engagements"
        />

        <ChartPieDonut
          title="Referrers"
          description="Clicks by referrer"
          data={analytics?.engagementsByReferrer ?? []}
          labelKey="referrer"
          valueKey="engagements"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {showSkeleton ? (
            <Skeleton className="h-[340px] w-full rounded-xl" />
          ) : (
            <ChartBarInteractive
              title="Clicks over time"
              description="All your links combined"
              data={engagementsOverTime}
              height={260}
            />
          )}
        </div>

        <StatCard
          icon={Globe2}
          label="Top performing location"
          headline={topLocation?.country || "No data"}
          value={`${topLocation?.engagements ?? 0} clicks`}
          caption={label}
          loading={showSkeleton}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clicks by country</CardTitle>
        </CardHeader>
        <CardContent>
          {showSkeleton ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : countries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No location data for this range yet.
            </p>
          ) : (
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="py-2 text-left font-medium text-muted-foreground">
                      Country
                    </th>
                    <th className="py-2 text-right font-medium text-muted-foreground">
                      Clicks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map((row, idx) => (
                    <tr
                      key={`${row.country}-${idx}`}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-2 text-muted-foreground tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2 font-medium">{row.country}</td>
                      <td className="py-2 text-right tabular-nums">
                        {row.engagements}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
