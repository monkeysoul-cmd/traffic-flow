'use client';

import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { hour: '00:00', speed: 45 },
  { hour: '02:00', speed: 50 },
  { hour: '04:00', speed: 55 },
  { hour: '06:00', speed: 40 },
  { hour: '08:00', speed: 30 },
  { hour: '10:00', speed: 35 },
  { hour: '12:00', speed: 32 },
  { hour: '14:00', speed: 38 },
  { hour: '16:00', speed: 28 },
  { hour: '18:00', speed: 25 },
  { hour: '20:00', speed: 40 },
  { hour: '22:00', speed: 48 },
];

const chartConfig = {
  speed: {
    label: 'Avg. Speed',
    color: 'hsl(var(--chart-2))',
  },
};

export default function AverageSpeedChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
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
