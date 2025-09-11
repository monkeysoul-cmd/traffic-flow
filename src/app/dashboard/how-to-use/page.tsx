import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import Image from 'next/image';
  import { HelpCircle, LayoutDashboard, Camera, TrafficCone, AlertTriangle, Siren, BarChart, History, Video, Upload } from 'lucide-react';
  
  export default function HowToUsePage() {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <HelpCircle className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold">How to Use the Dashboard</h1>
            <p className="text-muted-foreground">
              A comprehensive guide to all the features in the Traffic Flow management system.
            </p>
          </div>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Snapshot</CardTitle>
            <CardDescription>A quick overview of the main dashboard layout.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Image
              src="https://picsum.photos/seed/dashboard-guide/1200/800"
              alt="Dashboard Snapshot"
              width={1000}
              height={667}
              className="rounded-lg border shadow-md"
              data-ai-hint="dashboard screenshot"
            />
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><><LayoutDashboard />Dashboard Overview</></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The main dashboard provides a high-level overview of the current traffic situation. It is composed of several key sections:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Top Cards:</strong> Quick stats on total vehicles, average speed, traffic level, and active alerts.</li>
              <li><strong>Live Camera Feeds:</strong> Real-time views from key intersections.</li>
              <li><strong>Live Traffic Light Control:</strong> Manual override for traffic signals at incident locations.</li>
              <li><strong>Recent Incidents:</strong> A live feed of detected traffic incidents.</li>
              <li><strong>Emergency Vehicle Dispatch:</strong> A tool to dispatch emergency services to high-priority incidents.</li>
            </ul>
          </CardContent>
        </Card>
  
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><><Camera />Live Camera Feeds</></CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This section shows video feeds from cameras at key locations. It gives you a direct visual on the traffic conditions.</p>
                    <div className="flex items-center justify-center p-6 bg-muted rounded-md mt-4">
                        <Video className="w-16 h-16 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><><TrafficCone />Live Traffic Light Control</></CardTitle>
                </CardHeader>
                <CardContent>
                    <p>For locations with active incidents, you can manually control the traffic lights. This is useful for clearing congestion or giving priority to emergency vehicles.</p>
                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Control</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Light Buttons</TableCell>
                                <TableCell>Click to change the signal to Red, Yellow, or Green.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Duration Input</TableCell>
                                <TableCell>Set how long the selected light state should last.</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Start/Stop</TableCell>
                                <TableCell>Begin or pause the timer for the manual override.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
  
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><><AlertTriangle />Recent Incidents</></CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This table provides a summary of all recent traffic incidents detected by the system. Incidents are categorized by priority:</p>
                     <ul className="list-disc list-inside space-y-2 mt-2">
                        <li><strong>High:</strong> Requires immediate attention (e.g., accidents).</li>
                        <li><strong>Medium:</strong> Significant disruptions (e.g., road closures).</li>
                        <li><strong>Low:</strong> Minor issues (e.g., heavy traffic).</li>
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><><Siren />Emergency Vehicle Dispatch</></CardTitle>
                </Header>
                <CardContent>
                    <p>This tool allows you to dispatch emergency units directly to high-priority incidents.</p>
                     <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Select a high-priority incident from the dropdown menu.</li>
                        <li>Choose the type of unit to dispatch (Police, Ambulance, etc.).</li>
                        <li>Click the "Dispatch" button.</li>
                    </ol>
                    <p className="text-sm text-muted-foreground mt-2">All dispatched units are logged in the History page.</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><><Upload />Live Traffic Analysis</></CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The "Live Analyze" page allows you to get AI-powered analysis from any traffic video feed.</p>
                     <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Click "Choose File" and upload a video file.</li>
                        <li>Verify the location (it defaults to a sample location).</li>
                        <li>Click "Analyze Traffic".</li>
                        <li>The AI will return the vehicle count, traffic level, and detect potential incidents.</li>
                    </ol>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><><BarChart />Flow Graph</></CardTitle>
                </Header>
                <CardContent>
                    <p>The "Flow Graph" page provides historical data visualizations for traffic patterns.</p>
                     <ul className="list-disc list-inside space-y-2 mt-2">
                        <li><strong>Traffic Volume:</strong> A bar chart showing the number of vehicles detected per hour over the last 24 hours.</li>
                        <li><strong>Average Speed:</strong> A line chart showing the average vehicle speed per hour over the last 24 hours.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><><History />History</></CardTitle>
            </CardHeader>
            <CardContent>
                <p>The History page provides a complete log of all manual overrides and dispatches made through the system. You can filter the logs by date to review past actions.</p>
            </CardContent>
        </Card>
  
      </div>
    );
  }