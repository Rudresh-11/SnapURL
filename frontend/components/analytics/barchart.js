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

// ----------------------------------------
// Example raw data from API
// Format YOU said you have:
// { date: "2024-06-02", clicks: 12 }
// ----------------------------------------
const rawData = [
  { date: "2024-01-01", clicks: 14 },
  { date: "2024-01-02", clicks: 11 },
  { date: "2024-01-03", clicks: 16 },
  { date: "2024-01-04", clicks: 19 },
  { date: "2024-01-05", clicks: 22 },
  { date: "2024-01-06", clicks: 25 },
  { date: "2024-01-07", clicks: 20 },
  { date: "2024-01-08", clicks: 18 },
  { date: "2024-01-26", clicks: 18 },
  { date: "2024-01-27", clicks: 15 },
  { date: "2024-01-28", clicks: 20 },
  { date: "2024-01-29", clicks: 23 },
  { date: "2024-01-30", clicks: 28 },
  { date: "2024-01-31", clicks: 32 },
]


// ----------------------------------------
// Chart config (single color)
// ----------------------------------------
const chartConfig = {
  clicks: { label: "Clicks", color: "var(--chart-2)" },
};

export function ChartBarInteractive() {
  const ranges = [
    { key: "7", label: "Last 7 Days" },
    { key: "30", label: "Last 30 Days" },
    { key: "365", label: "Last 1 Year" },
  ];

  const [activeRange, setActiveRange] = React.useState("7");

  // ----------------------------------------
  // Filter dataset based on selected range
  // ----------------------------------------
  const filteredData = React.useMemo(() => {
    const days = parseInt(activeRange, 10);
    return rawData.slice(-days);
  }, [activeRange]);

  // ----------------------------------------
  // Calculate total clicks for the buttons
  // ----------------------------------------
  const totals = React.useMemo(() => {
    return {
      "7": rawData.slice(-7).reduce((sum, d) => sum + d.clicks, 0),
      "30": rawData.slice(-30).reduce((sum, d) => sum + d.clicks, 0),
      "365": rawData.slice(-365).reduce((sum, d) => sum + d.clicks, 0),
    };
  }, []);

  return (
    <Card className="py-0">
      {/* HEADER */}
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
          <CardTitle>Clicks Summary</CardTitle>
          <CardDescription>Track user clicks over time</CardDescription>
        </div>

        {/* RANGE SELECT BUTTONS */}
        <div className="flex">
          {ranges.map((r) => (
            <button
              key={r.key}
              data-active={activeRange === r.key}
              className="data-[active=true]:bg-muted/50 
                relative z-30 flex flex-1 flex-col justify-center gap-1 
                border-t px-6 py-4 text-left even:border-l 
                sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveRange(r.key)}
            >
              <span className="text-muted-foreground text-xs">
                {r.label}
              </span>
              <span className="text-lg font-bold sm:text-3xl">
                {totals[r.key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      {/* CHART */}
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <BarChart data={filteredData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="clicks"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
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
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
