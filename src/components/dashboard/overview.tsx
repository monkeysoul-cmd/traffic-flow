import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { MoveRight, Car, AlertCircle, AlertTriangle } from "lucide-react";
import TrafficVolumeChart from "./traffic-volume-chart";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import LiveTrafficControl from "./live-traffic-control";
import { ScrollArea } from "../ui/scroll-area";

const recentIncidents = [
  { id: "INC-001", location: "Main St & 1st Ave", type: "Accident", severity: "High", time: "10:45 AM" },
  { id: "INC-002", location: "Oakland Bridge", type: "Road Closure", severity: "Medium", time: "10:30 AM" },
  { id: "INC-003", location: "Highway 5, Exit 23", type: "Congestion", severity: "Low", time: "10:15 AM" },
  { id: "INC-004", location: "Downtown Tunnel", type: "Accident", severity: "High", time: "9:50 AM" },
  { id: "INC-005", location: "Industrial Park", type: "Roadwork", severity: "Medium", time: "9:30 AM" },
  { id: "INC-006", location: "West End", type: "Congestion", severity: "Low", time: "9:15 AM" },
];

const TrafficLight = ({ severity }: { severity: 'High' | 'Medium' | 'Low' }) => {
  return (
    <div className="flex space-x-1">
      <div className={cn("w-3 h-3 rounded-full", severity === 'High' ? 'bg-red-500' : 'bg-gray-600')}></div>
      <div className={cn("w-3 h-3 rounded-full", severity === 'Medium' ? 'bg-yellow-500' : 'bg-gray-600')}></div>
      <div className={cn("w-3 h-3 rounded-full", severity === 'Low' ? 'bg-green-500' : 'bg-gray-600')}></div>
    </div>
  );
};

export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,453</div>
            <p className="text-xs text-muted-foreground">+5.2% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
            <MoveRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 km/h</div>
            <p className="text-xs text-muted-foreground">-1.5% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Congestion Level</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Medium</div>
            <p className="text-xs text-muted-foreground">Downtown area is busy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">2 high severity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Congestion Hotspots</CardTitle>
                <CardDescription>Real-time traffic map</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="aspect-video w-full overflow-hidden rounded-md">
                    <Image
                        src="https://picsum.photos/seed/1/600/400"
                        alt="Traffic map with hotspots"
                        width={600}
                        height={400}
                        data-ai-hint="dark city map"
                        className="w-full h-full object-cover"
                    />
                </div>
            </CardContent>
        </Card>
        <LiveTrafficControl incidents={recentIncidents} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Live feed of detected traffic incidents.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="pl-6">Status</TableHead>
                        <TableHead>Incident ID</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead className="pr-6">Time</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recentIncidents.map((incident) => (
                        <TableRow key={incident.id}>
                        <TableCell className="pl-6">
                            <TrafficLight severity={incident.severity as 'High' | 'Medium' | 'Low'} />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{incident.id}</TableCell>
                        <TableCell className="text-xs">{incident.location}</TableCell>
                        <TableCell className="text-xs">{incident.type}</TableCell>
                        <TableCell>
                            <Badge variant={incident.severity === 'High' ? 'destructive' : incident.severity === 'Medium' ? 'secondary' : 'outline'} className="text-xs">
                                {incident.severity}
                            </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-xs">{incident.time}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Traffic Volume</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
                <TrafficVolumeChart />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
