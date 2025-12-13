"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis,YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Normalize ANY date to YYYY-MM-DD
function normalizeDate(input) {
  const d = new Date(input);
  if (isNaN(d)) return null;
  return d.toISOString().split("T")[0];
}

function generateDateRange(startDate, endDate) {
  const result = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    result.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function ChartBarInteractive({ data = [], title = "Clicks Summary", description = "Showing user clicks over time", height =260 }) {
  const ranges = [
    { key: "7", label: "Last 7 Days" },
    { key: "30", label: "Last 30 Days" },
    { key: "365", label: "Last 1 Year" },
  ];

  const [activeRange, setActiveRange] = React.useState("7");

  // STEP 1 — CLEAN + SORT
  const cleanedData = React.useMemo(() => {
    return data
      .map((d) => ({
        date: normalizeDate(d.date),
        clicks: Number(d.clicks) || 0,
      }))
      .filter((d) => d.date !== null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  // STEP 2 — PAD INTO FULL DATE RANGE
  const filteredData = React.useMemo(() => {
    if (!cleanedData.length) return [];

    const days = parseInt(activeRange, 10);

    const lastDate = new Date(cleanedData.at(-1).date);
    const start = new Date(lastDate);
    start.setDate(lastDate.getDate() - (days - 1));

    const fullDates = generateDateRange(start, lastDate);
    const map = Object.fromEntries(cleanedData.map((d) => [d.date, d.clicks]));

    return fullDates.map((date) => ({
      date,
      clicks: map[date] ?? 0,
    }));
  }, [activeRange, cleanedData]);

  // STEP 3 — TOTALS
  const totals = React.useMemo(() => {
    if (!cleanedData.length) {
      return { "7": 0, "30": 0, "365": 0 };
    }

    const getTotal = (rangeDays) =>
      cleanedData
        .slice(-Math.min(rangeDays, cleanedData.length))
        .reduce((sum, d) => sum + d.clicks, 0);

    return {
      "7": getTotal(7),
      "30": getTotal(30),
      "365": getTotal(365),
    };
  }, [cleanedData]);

  if (!cleanedData.length) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center h-[250px] text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>Your click analysis will appear here</CardDescription>
      </Card>
    );
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        <div className="flex">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setActiveRange(r.key)}
              data-active={activeRange === r.key}
              className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            >
              <span className="text-muted-foreground text-xs">{r.label}</span>
              <span className="text-lg font-bold sm:text-3xl">{totals[r.key]}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-4 pt-0 pb-2">
        <ChartContainer config={{ clicks: { label: "Clicks", color: "var(--chart-2)" } }} style={{ height: height, width: "100%" }}>
          <BarChart data={filteredData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
  {/* <YAxis domain={[0, (dataMax) => dataMax * 2]} hide /> */}
            <ChartTooltip content={<ChartTooltipContent nameKey="clicks" />} />

            <Bar dataKey="clicks" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
