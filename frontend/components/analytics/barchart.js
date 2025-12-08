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
// Normalize ANY date to YYYY-MM-DD
// ----------------------------------------
function normalizeDate(input) {
  const d = new Date(input);
  if (isNaN(d)) return null;

  return d.toISOString().split("T")[0];
}

// ----------------------------------------
// Generate continuous date range
// ----------------------------------------
function generateDateRange(startDate, endDate) {
  const result = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    result.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return result;
}
// ----------------------------------------
// MAIN COMPONENT
// ----------------------------------------
export function ChartBarInteractive({
  data = [],
  // data = loaddata,
  title = "Clicks Summary",
  description = "Showing user clicks over time",
  height = 260,
}) {
  // Convert & normalize incoming data
  const cleanedData = React.useMemo(() => {
    return data
      .map((d) => ({
        date: normalizeDate(d.date),
        clicks: Number(d.clicks) || 0,
      }))
      .filter((d) => d.date !== null);
  }, [data]);

  // Early empty state
  if (cleanedData.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center h-[250px] text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-4 text-muted-foreground">
          Your click analysis will appear here
        </CardDescription>
      </Card>
    );
  }

  // Ranges
  const ranges = [
    { key: "7", label: "Last 7 Days" },
    { key: "30", label: "Last 30 Days" },
    { key: "365", label: "Last 1 Year" },
  ];

  const [activeRange, setActiveRange] = React.useState("7");

  // ----------------------------------------
  // Produce padded dataset for selected range
  // ----------------------------------------
const filteredData = React.useMemo(() => {
  const days = parseInt(activeRange, 10);

  // Find the latest date in your dataset
  const lastDate = new Date(cleanedData[cleanedData.length - 1].date);

  // compute range start
  const start = new Date(lastDate);
  start.setDate(lastDate.getDate() - (days - 1));

  const fullDates = generateDateRange(start, lastDate);

  // map dataset
  const map = Object.fromEntries(cleanedData.map((d) => [d.date, d.clicks]));

  return fullDates.map((date) => ({
    date,
    clicks: map[date] ?? 0,
  }));
}, [activeRange, cleanedData]);

console.log("Filtered Data:", filteredData);
  // ----------------------------------------
  // Totals based on padded data
  // ----------------------------------------
  const totals = React.useMemo(() => {
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

  const chartConfig = {
    clicks: { label: "Clicks", color: "var(--chart-2)" },
  };

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        {/* RANGE BUTTONS */}
        <div className="flex">
          {ranges.map((r) => (
            <button
              key={r.key}
              data-active={activeRange === r.key}
              className="
                data-[active=true]:bg-muted/50 
                flex flex-1 flex-col justify-center gap-1
                border-t px-6 py-4 text-left even:border-l
                sm:border-t-0 sm:border-l sm:px-8 sm:py-6
              "
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
        <ChartContainer
          config={chartConfig}
          className={`aspect-auto h-[${height}px] w-full`}
        >
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
