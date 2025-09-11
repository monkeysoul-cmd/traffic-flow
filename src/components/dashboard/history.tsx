'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Siren, TrafficCone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const lightControlHistory = [
  { id: 1, location: 'MG Road & Brigade Road', user: 'bitfusion', action: 'Set to GREEN for 60s', timestamp: new Date(2024, 6, 26, 10, 46) },
  { id: 2, location: 'Marine Drive', user: 'bitfusion', action: 'Set to RED for 30s', timestamp: new Date(2024, 6, 26, 9, 51) },
  { id: 3, location: 'MG Road & Brigade Road', user: 'bitfusion', action: 'Cycle Reset', timestamp: new Date(2024, 6, 25, 18, 20) },
  { id: 4, location: 'Bandra-Worli Sea Link', user: 'other_admin', action: 'Set to YELLOW for 5s', timestamp: new Date(2024, 6, 25, 15, 10) },
];

const dispatchHistory = [
  { id: 1, unit: 'police', incidentId: 'INC-001', location: 'MG Road & Brigade Road', user: 'bitfusion', timestamp: new Date(2024, 6, 26, 10, 45) },
  { id: 2, unit: 'ambulance', incidentId: 'INC-001', location: 'MG Road & Brigade Road', user: 'bitfusion', timestamp: new Date(2024, 6, 26, 10, 45) },
  { id: 3, unit: 'ambulance', incidentId: 'INC-004', location: 'Marine Drive', user: 'bitfusion', timestamp: new Date(2024, 6, 26, 9, 50) },
  { id: 4, unit: 'fire truck', incidentId: 'INC-007', location: 'Cyber Hub', user: 'other_admin', timestamp: new Date(2024, 6, 25, 14, 0) },
];

export default function History() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const filteredLightHistory = lightControlHistory.filter(item =>
    date ? format(item.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') : true
  );

  const filteredDispatchHistory = dispatchHistory.filter(item =>
    date ? format(item.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <div className="flex items-center gap-2">
            <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={'outline'}
                className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                />
            </PopoverContent>
            </Popover>
            <Button onClick={() => setDate(undefined)} variant="ghost">Clear</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><TrafficCone className='w-6 h-6' />Traffic Light Control Log</CardTitle>
                <CardDescription>Records of manual traffic light overrides.</CardDescription>
            </CardHeader>
            <CardContent>
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
                    {filteredLightHistory.map(log => (
                        <TableRow key={log.id}>
                        <TableCell className="text-xs">{log.location}</TableCell>
                        <TableCell className="text-xs">{log.action}</TableCell>
                        <TableCell className="text-xs">
                            <Badge variant="outline">{log.user}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{format(log.timestamp, 'p')}</TableCell>
                        </TableRow>
                    ))}
                     {filteredLightHistory.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No light control records for this date.
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
                <CardTitle className='flex items-center gap-2'><Siren className='w-6 h-6' />Emergency Dispatch Log</CardTitle>
                <CardDescription>Records of dispatched emergency vehicles.</CardDescription>
            </CardHeader>
            <CardContent>
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
                    {filteredDispatchHistory.map(log => (
                        <TableRow key={log.id}>
                        <TableCell className="text-xs capitalize">{log.unit}</TableCell>
                        <TableCell className="text-xs">{log.location}</TableCell>
                        <TableCell className="text-xs">
                            <Badge variant="outline">{log.user}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{format(log.timestamp, 'p')}</TableCell>
                        </TableRow>
                    ))}
                    {filteredDispatchHistory.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No dispatch records for this date.
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
