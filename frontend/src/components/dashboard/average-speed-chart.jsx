"use client";

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { speedData } from "@/lib/flow-data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  speed: {
    label: "Avg. Speed",
    color: "hsl(var(--chart-1))",
  },
};

export default function AverageSpeedChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full h-full"
    >
      <LineChart accessibilityLayer data={speedData}>
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
          tickFormatter={(value) => `${value} km/h`}
        />

        <ChartTooltip
          cursor={true}
          content={<ChartTooltipContent indicator="line" />}
        />

        <ReferenceLine y={30} stroke="hsl(var(--status-heavy))" strokeDasharray="6 6" label={{ value: "Congested below 30", position: "insideBottomRight", fill: "hsl(var(--status-heavy))", fontSize: 11 }} />
        <Line
          dataKey="speed"
          type="monotone"
          stroke="var(--color-speed)"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}
