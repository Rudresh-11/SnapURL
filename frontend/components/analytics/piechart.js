"use client";

import * as React from "react";
import { Cell, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className="flex items-center gap-2 rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ background: item.payload.fill }}
      />
      <span className="font-medium">{item.name}</span>
      <span className="font-semibold tabular-nums">{item.value}</span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {item.payload.percent}%
      </span>
    </div>
  );
}

function EmptyCard({ title, description }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          No data yet
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartPieDonut({
  title = "Breakdown",
  description = "",
  data = [],
  labelKey = "label",
  valueKey = "value",
  maxCategories = 5,
}) {
  const finalData = React.useMemo(() => {
    const normalized = (data ?? [])
      .map((item) => ({
        label: item?.[labelKey] ?? "Unknown",
        value: Number(item?.[valueKey]) || 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const slices = normalized.slice(0, maxCategories);
    const rest = normalized.slice(maxCategories);

    if (rest.length > 0) {
      slices.push({
        label: "Other",
        value: rest.reduce((sum, x) => sum + x.value, 0),
      });
    }

    const total = slices.reduce((sum, x) => sum + x.value, 0);

    return slices.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
      percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
    }));
  }, [data, labelKey, valueKey, maxCategories]);

  const chartConfig = React.useMemo(
    () => ({
      value: { label: "Value" },
      ...Object.fromEntries(
        finalData.map((item) => [item.label, { label: item.label, color: item.fill }])
      ),
    }),
    [finalData]
  );

  if (finalData.length === 0) {
    return <EmptyCard title={title} description={description} />;
  }

  const shown = Math.min(maxCategories, finalData.length);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-72 w-full"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<DonutTooltip />} />

            <Pie
              data={finalData}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              outerRadius={100}
            >
              {finalData.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Pie>

            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              className="mt-4 flex-wrap gap-2 *:basis-1/3 *:justify-start"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        {finalData.length > shown
          ? `Top ${shown}, with the rest grouped as “Other”`
          : `Showing all ${finalData.length} ${
              finalData.length === 1 ? "category" : "categories"
            }`}
      </CardFooter>
    </Card>
  );
}
