'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrafficCone, Timer, Maximize, Minimize, RotateCcw, Plus, Minus } from 'lucide-react';
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
  const [remaining, setRemaining] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      timerRef.current = setTimeout(() => {
        setRemaining(prev => prev - 1);
      }, 1000);
    } else if (remaining === 0 || !isRunning) {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setIsRunning(false);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [remaining, isRunning]);

  const handleStart = () => {
    if (!isRunning) {
        if (remaining === 0) {
            setRemaining(duration);
        }
        setIsRunning(true);
    }
  }

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(duration);
  };

  const handleAdd10s = () => {
    if (isRunning) {
        setRemaining(prev => prev + 10);
    } else {
        const newDuration = duration + 10;
        setDuration(newDuration);
        setRemaining(newDuration);
    }
  };

  const handleSubtract5s = () => {
    if(isRunning) {
        setRemaining(prev => Math.max(0, prev - 5));
    } else {
        const newDuration = Math.max(0, duration - 5);
        setDuration(newDuration);
        setRemaining(newDuration);
    }
  }


  return (
    <div className="flex items-center justify-end space-x-2">
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
        <div className="flex flex-col items-center space-y-1">
            <Input 
                type="number" 
                value={duration}
                onChange={(e) => {
                    const newDuration = parseInt(e.target.value, 10) || 0;
                    setDuration(newDuration);
                    if (!isRunning) {
                        setRemaining(newDuration);
                    }
                }}
                className="w-12 h-7 text-center text-xs"
            />
            <Button size="sm" variant="outline" onClick={handleStart} className="h-7 px-2 text-xs">{isRunning ? 'Running' : 'Start'}</Button>
        </div>
         <div className="flex items-center space-x-1 min-w-[40px]">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-mono font-bold">{remaining}s</span>
         </div>
         <div className="flex flex-col space-y-1">
            <Button size="icon" variant="ghost" onClick={handleAdd10s} className="h-5 w-5">
                <Plus className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleSubtract5s} className="h-5 w-5">
                <Minus className="w-3 h-3" />
            </Button>
         </div>
         <div className="flex flex-col space-y-0.5">
            <Button size="icon" variant="ghost" onClick={handleReset} className="h-5 w-5">
                <RotateCcw className="w-3 h-3" />
            </Button>
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
            <TableHead className="text-right pr-4 min-w-[320px]">Signal Control</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(isFullScreen ? incidents : incidents.slice(0, 3)).map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium pl-4">{incident.location}</TableCell>
              <TableCell className="text-xs">{incident.type}</TableCell>
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
        <ScrollArea className="h-full w-full [&>div>div[style*='display:block;']]:!hidden">
            <LiveTrafficControlContent incidents={incidents} isFullScreen={true} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
