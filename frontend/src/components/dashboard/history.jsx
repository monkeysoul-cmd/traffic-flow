"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Siren, TrafficCone, History as HistoryIcon } from "lucide-react";
import PageHeader from "@/components/traffic/page-header";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useHistoryStore } from "@/lib/history-store";

export default function History() {
  const [date, setDate] = useState(new Date());
  const { lightControlHistory, dispatchHistory, fetchLogs } = useHistoryStore();
  const [filteredLightHistory, setFilteredLightHistory] = useState([]);
  const [filteredDispatchHistory, setFilteredDispatchHistory] = useState([]);

  useEffect(() => {
    if (fetchLogs) {
      fetchLogs();
    }
  }, []);

  useEffect(() => {
    setFilteredLightHistory(
      lightControlHistory.filter((item) =>
        date
          ? format(item.timestamp, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          : true,
      ),
    );
    setFilteredDispatchHistory(
      dispatchHistory.filter((item) =>
        date
          ? format(item.timestamp, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
          : true,
      ),
    );
  }, [date, lightControlHistory, dispatchHistory]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HistoryIcon}
        title="History"
        description="Signal overrides and emergency dispatches, by day."
        actions={
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[220px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Button onClick={() => setDate(undefined)} variant="ghost">
              Show all dates
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrafficCone className="h-5 w-5 text-primary" />
              Traffic light control log
            </CardTitle>
            <CardDescription>
              Records of manual traffic light overrides.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLightHistory.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{log.location}</TableCell>
                      <TableCell className="text-xs">{log.action}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline">{log.user}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(log.timestamp, "p")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLightHistory.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No signal changes recorded. Pick another date or show all dates.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-status-heavy" />
              Emergency dispatch log
            </CardTitle>
            <CardDescription>
              Records of dispatched emergency vehicles.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDispatchHistory.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs capitalize">
                        {log.unit}
                      </TableCell>
                      <TableCell className="text-xs">{log.location}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline">{log.user}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(log.timestamp, "p")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDispatchHistory.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No dispatches recorded. Pick another date or show all dates.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
