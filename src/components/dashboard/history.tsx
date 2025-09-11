'use client';

import { useState, useEffect } from 'react';
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
import { useHistoryStore, LightControlLog, DispatchLog } from '@/lib/history-store';

export default function History() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { lightControlHistory, dispatchHistory } = useHistoryStore();
  const [filteredLightHistory, setFilteredLightHistory] = useState<LightControlLog[]>([]);
  const [filteredDispatchHistory, setFilteredDispatchHistory] = useState<DispatchLog[]>([]);

  useEffect(() => {
    setFilteredLightHistory(
      lightControlHistory.filter(item =>
        date ? format(item.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') : true
      )
    );
    setFilteredDispatchHistory(
      dispatchHistory.filter(item =>
        date ? format(item.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') : true
      )
    );
  }, [date, lightControlHistory, dispatchHistory]);

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
