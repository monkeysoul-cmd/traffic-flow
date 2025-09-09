'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrafficCone, Timer, Maximize, Minimize } from 'lucide-react';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';


interface Incident {
  id: string;
  location: string;
  type: string;
  severity: string;
  time: string;
}

type LightState = 'red' | 'yellow' | 'green';

const TrafficLightController = ({ incidentId }: { incidentId: string }) => {
  const [lightState, setLightState] = useState<LightState>('red');
  const [duration, setDuration] = useState(30);
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (remaining > 0) {
      timerRef.current = setTimeout(() => {
        setRemaining(remaining - 1);
      }, 1000);
    } else if (remaining === 0 && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [remaining]);

  const handleStart = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
    }
    setRemaining(duration);
  }

  return (
    <div className="flex items-center justify-end space-x-4">
        <div className="flex flex-col items-center gap-2">
            <div className="flex bg-gray-800 border-2 border-gray-900 rounded-full p-1 space-x-1">
                <button
                onClick={() => setLightState('red')}
                className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    lightState === 'red' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-gray-600'
                )}
                />
                <button
                onClick={() => setLightState('yellow')}
                className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    lightState === 'yellow' ? 'bg-yellow-500 shadow-[0_0_10px_#f59e0b]' : 'bg-gray-600'
                )}
                />
                <button
                onClick={() => setLightState('green')}
                className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    lightState === 'green' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-600'
                )}
                />
            </div>
            <span className="text-xs text-muted-foreground capitalize">{lightState}</span>
        </div>
        <div className="flex items-center space-x-2">
            <Input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                className="w-16 h-8 text-center"
            />
            <Button size="sm" variant="outline" onClick={handleStart} className="h-8">Start</Button>
        </div>
         <div className="flex items-center space-x-2 min-w-[60px]">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-mono font-bold">{remaining}s</span>
         </div>
    </div>
  );
};

const LiveTrafficControlContent = ({ incidents, isFullScreen = false }: { incidents: Incident[], isFullScreen?: boolean }) => (
  <>
    <CardHeader className="flex flex-row items-start justify-between p-4">
      <div>
        <CardTitle className="flex items-center gap-2">
          <TrafficCone className="w-6 h-6" />
          Live Traffic Light Control
        </CardTitle>
        <CardDescription>Manually override traffic signals for active incident locations.</CardDescription>
      </div>
      {!isFullScreen && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Maximize className="w-5 h-5" />
          </Button>
        </DialogTrigger>
      )}
      {isFullScreen && (
        <DialogClose asChild>
            <Button variant="ghost" size="icon">
                <Minimize className="w-5 h-5" />
            </Button>
        </DialogClose>
      )}
    </CardHeader>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Location</TableHead>
            <TableHead>Incident Type</TableHead>
            <TableHead className="text-right pr-4">Signal Control</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(isFullScreen ? incidents : incidents.slice(0, 3)).map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium pl-4">{incident.location}</TableCell>
              <TableCell>{incident.type}</TableCell>
              <TableCell className="text-right pr-4">
                <TrafficLightController incidentId={incident.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </>
);

export default function LiveTrafficControl({ incidents }: { incidents: Incident[] }) {
  return (
    <Dialog>
      <Card>
        <LiveTrafficControlContent incidents={incidents} />
      </Card>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <div className="flex-grow overflow-auto">
            <ScrollArea className="h-full">
                <LiveTrafficControlContent incidents={incidents} isFullScreen={true} />
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
