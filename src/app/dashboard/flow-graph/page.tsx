import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import TrafficVolumeChart from '@/components/dashboard/traffic-volume-chart';
import AverageSpeedChart from '@/components/dashboard/average-speed-chart';

export default function FlowGraphPage() {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Volume</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <TrafficVolumeChart />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Average Speed</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <AverageSpeedChart />
        </CardContent>
      </Card>
    </div>
  );
}
