import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import TrafficVolumeChart from '@/components/dashboard/traffic-volume-chart';

export default function FlowGraphPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Volume</CardTitle>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <TrafficVolumeChart />
      </CardContent>
    </Card>
  );
}
