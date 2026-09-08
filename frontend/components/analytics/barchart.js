"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const RANGES = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "365", label: "Last year" },
];

function toDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDayKey(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : toDayKey(value);
  }
  const str = String(value ?? "");
  const plain = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (plain) return plain[0];

  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : toDayKey(parsed);
}

function dayKeyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function eachDay(startKey, endKey) {
  const out = [];
  const cursor = dayKeyToDate(startKey);
  const end = dayKeyToDate(endKey);
  while (cursor <= end) {
    out.push(toDayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function shiftDays(key, days) {
  const d = dayKeyToDate(key);
  d.setDate(d.getDate() + days);
  return toDayKey(d);
}

export function ChartBarInteractive({
  data = [],
  title = "Clicks summary",
  description = "Showing clicks over time",
  height = 260,
}) {
  const [activeRange, setActiveRange] = React.useState("7");

  const byDay = React.useMemo(() => {
    const map = new Map();
    for (const row of data) {
      const key = parseDayKey(row?.date);
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + (Number(row.clicks) || 0));
    }
    return map;
  }, [data]);

  const hasData = byDay.size > 0;

  const todayKey = React.useMemo(() => toDayKey(new Date()), []);

  const windowFor = React.useCallback(
    (days) => {
      const latest = hasData
        ? [...byDay.keys()].sort().at(-1)
        : todayKey;
      const end = latest > todayKey ? latest : todayKey;
      return { start: shiftDays(end, -(days - 1)), end };
    },
    [byDay, hasData, todayKey]
  );

  const filteredData = React.useMemo(() => {
    const { start, end } = windowFor(parseInt(activeRange, 10));
    return eachDay(start, end).map((date) => ({
      date,
      clicks: byDay.get(date) ?? 0,
    }));
  }, [activeRange, byDay, windowFor]);

  const totals = React.useMemo(() => {
    const sumWindow = (days) => {
      const { start, end } = windowFor(days);
      let sum = 0;
      for (const [key, clicks] of byDay) {
        if (key >= start && key <= end) sum += clicks;
      }
      return sum;
    };

    return { 7: sumWindow(7), 30: sumWindow(30), 365: sumWindow(365) };
  }, [byDay, windowFor]);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>
            Your click analysis will appear here once this link gets traffic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
            style={{ height }}
          >
            No clicks yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        <div className="flex">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setActiveRange(r.key)}
              data-active={activeRange === r.key}
              aria-pressed={activeRange === r.key}
              className="flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 text-left transition-colors even:border-l hover:bg-muted/40 data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-6 sm:py-4"
            >
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                {r.label}
              </span>
              <span className="text-lg font-semibold tabular-nums sm:text-2xl">
                {totals[r.key]}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 pb-2 sm:p-4">
        <ChartContainer
          config={{ clicks: { label: "Clicks", color: "var(--chart-2)" } }}
          style={{ height, width: "100%" }}
        >
          <BarChart data={filteredData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              minTickGap={24}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                dayKeyToDate(v).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="clicks"
                  labelFormatter={(v) =>
                    dayKeyToDate(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Bar
              dataKey="clicks"
              fill="var(--color-clicks)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
