import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TrafficVolumeChart from "@/components/dashboard/traffic-volume-chart";
import { volumeData, speedData } from "@/lib/flow-data";
import AverageSpeedChart from "@/components/dashboard/average-speed-chart";
import PageHeader from "@/components/traffic/page-header";
import KpiCard from "@/components/traffic/kpi-card";
import { BarChart3 } from "lucide-react";

export default function FlowGraphPage() {
  const peak = volumeData.reduce((a, b) => (b.vehicles > a.vehicles ? b : a));
  const slowest = speedData.reduce((a, b) => (b.speed < a.speed ? b : a));
  const total = volumeData.reduce((n, d) => n + d.vehicles, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Flow graph"
        description="Vehicle volume and average speed across the last 24 hours."
      />
      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Peak volume" value={peak.vehicles.toLocaleString()} unit={`at ${peak.hour}`} status="heavy" />
        <KpiCard label="Slowest hour" value={slowest.speed} unit={`km/h at ${slowest.hour}`} status="moderate" />
        <KpiCard label="Vehicles in sampled hours" value={total.toLocaleString()} status="idle" />
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic volume</CardTitle>
            <CardDescription>Last 24 hours. Bars turn amber above 1,000 and red above 1,500 vehicles.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrafficVolumeChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average speed</CardTitle>
            <CardDescription>Last 24 hours. Speeds under 30 km/h indicate congestion.</CardDescription>
          </CardHeader>
          <CardContent>
            <AverageSpeedChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
