import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { MoveRight, Car, AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import LiveTrafficControl from "@/components/dashboard/live-traffic-control";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmergencyDispatch from "@/components/dashboard/emergency-dispatch";
import Link from "next/link";
import CameraViews from "@/components/dashboard/camera-views";
import OverviewLayout from "@/components/dashboard/overview-layout";

const recentIncidents = [
  { id: "INC-001", location: "MG Road & Brigade Road", type: "Accident", priority: "High", time: "10:45 AM" },
  { id: "INC-002", location: "Bandra-Worli Sea Link", type: "Road Closure", priority: "Medium", time: "10:30 AM" },
  { id: "INC-003", location: "Outer Ring Road, Marathahalli", type: "Heavy Traffic", priority: "Low", time: "10:15 AM" },
  { id: "INC-004", location: "Marine Drive", type: "Accident", priority: "High", time: "9:50 AM" },
];

const TrafficLight = ({ priority }: { priority: 'High' | 'Medium' | 'Low' }) => {
  return (
    <div className="flex space-x-1">
      <div className={cn("w-3 h-3 rounded-full", priority === 'High' ? 'bg-red-500' : 'bg-gray-600')}></div>
      <div className={cn("w-3 h-3 rounded-full", priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-600')}></div>
      <div className={cn("w-3 h-3 rounded-full", priority === 'Low' ? 'bg-green-500' : 'bg-gray-600')}></div>
    </div>
  );
};

export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/flow-graph">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,453</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/flow-graph">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
              <div className="flex items-center gap-2">
                <MoveRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42 km/h</div>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traffic Level</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Medium</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
      </div>

      <OverviewLayout
        left={<CameraViews incidents={recentIncidents} />}
        right={
          <div className="space-y-6">
            <LiveTrafficControl incidents={recentIncidents} />
            <Card>
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
                              <TableHead>Priority</TableHead>
                              <TableHead className="pr-6">Time</TableHead>
                          </TableRow>
                          </TableHeader>
                          <TableBody>
                          {recentIncidents.map((incident) => (
                              <TableRow key={incident.id}>
                              <TableCell className="pl-6">
                                  <TrafficLight priority={incident.priority as 'High' | 'Medium' | 'Low'} />
                              </TableCell>
                              <TableCell className="font-mono text-xs">{incident.id}</TableCell>
                              <TableCell className="text-xs">{incident.location}</TableCell>
                              <TableCell className="text-xs">{incident.type}</TableCell>
                              <TableCell>
                                  <Badge variant={incident.priority === 'High' ? 'destructive' : incident.priority === 'Medium' ? 'secondary' : 'outline'} className="text-xs">
                                      {incident.priority}
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
            <div id="emergency-dispatch">
                <EmergencyDispatch incidents={recentIncidents} />
            </div>
          </div>
        }
      />
    </div>
  );
}