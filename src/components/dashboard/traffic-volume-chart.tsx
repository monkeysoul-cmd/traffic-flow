'use client'

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { hour: "00:00", vehicles: 186 },
  { hour: "02:00", vehicles: 305 },
  { hour: "04:00", vehicles: 237 },
  { hour: "06:00", vehicles: 730 },
  { hour: "08:00", vehicles: 1290 },
  { hour: "10:00", vehicles: 590 },
  { hour: "12:00", vehicles: 1190 },
  { hour: "14:00", vehicles: 1330 },
  { hour: "16:00", vehicles: 1500 },
  { hour: "18:00", vehicles: 1890 },
  { hour: "20:00", vehicles: 950 },
  { hour: "22:00", vehicles: 400 },
]

const chartConfig = {
  vehicles: {
    label: "Vehicles",
    color: "hsl(var(--primary))",
  },
}

export default function TrafficVolumeChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
      <BarChart accessibilityLayer data={chartData}>
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
        <Bar dataKey="vehicles" fill="var(--color-vehicles)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
