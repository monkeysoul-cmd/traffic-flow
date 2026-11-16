"use client";

import { Bar, BarChart, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { volumeData } from "@/lib/flow-data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  vehicles: {
    label: "Vehicles",
    color: "hsl(var(--primary))",
  },
};

export default function TrafficVolumeChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full h-full"
    >
      <BarChart accessibilityLayer data={volumeData}>
        <CartesianGrid vertical={false} strokeOpacity={0.4} />
        <XAxis
          dataKey="hour"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />

        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />

        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />

        <Bar dataKey="vehicles" fill="var(--color-vehicles)" radius={4}>
          {volumeData.map((d) => (
            <Cell
              key={d.hour}
              fill={
                d.vehicles >= 1500
                  ? "hsl(var(--status-heavy))"
                  : d.vehicles >= 1000
                    ? "hsl(var(--status-moderate))"
                    : "hsl(var(--status-free))"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
