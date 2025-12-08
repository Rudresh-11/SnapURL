"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

// PRESET COLORS IN ORDER
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];


function CustomDonutTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];
  const name = item.name;
  const value = item.value;
  const percent = item.payload.percent; // ← we will add this field below

  return (
    <div className="rounded-md border bg-background px-3 py-2 shadow-sm flex items-center gap-2">
      {/* Color dot */}
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: item.payload.fill }}
      />

      {/* Label */}
      <span className="font-medium">{name}</span>

      {/* Value */}
      <span className="font-semibold">{value}</span>

      {/* Percentage (faint) */}
      <span className="text-muted-foreground text-xs">
        {percent}%
      </span>
    </div>
  );
}


export function ChartPieDonut({
  title = "Donut Chart",
  description = "",
  data = [],
  labelKey = "label",
  valueKey = "value",
  maxCategories = 5, // others grouped at end
}) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pb-0">
          <div className="flex h-80 w-full items-center justify-center text-muted-foreground">
            Your data will appear here.
          </div>
        </CardContent>
      </Card>
    );
  }
  let normalized = data.map((item) => ({
    label: item[labelKey],
    value: Number(item[valueKey]),
  }));

  normalized.sort((a, b) => b.value - a.value);

  let slices = normalized.slice(0, maxCategories);
  let extra = normalized.slice(maxCategories);

  if (extra.length > 0) {
    const totalOthers = extra.reduce((sum, x) => sum + x.value, 0);
    slices.push({
      label: "Other",
      value: totalOthers,
    });
  }

  const finalData = slices.map((item, index) => ({
    ...item,
    fill: COLORS[index] ?? COLORS[COLORS.length - 1],
  }));

  const total = finalData.reduce((sum, x) => sum + x.value, 0);

  finalData.forEach((item) => {
    item.percent = ((item.value / total) * 100).toFixed(1);
  });


  const chartConfig = {
    value: { label: "Value" },
    ...Object.fromEntries(
      finalData.map((item) => [
        item.label,
        { label: item.label, color: item.fill },
      ])
    ),
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-80 flex items-center justify-center"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<CustomDonutTooltip />}
            />

            <Pie
              data={finalData}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              outerRadius={100}
            >
              {finalData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>

            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              className="flex-wrap gap-2 *:basis-1/3 *:justify-start mt-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Showing Data by Top 5 {`${title.split(" ")[0]}`} <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
