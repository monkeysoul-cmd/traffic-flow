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
import { useHistoryStore } from '@/lib/history-store';


interface Incident {
  id: string;
  location: string;
  priority: string;
  time: string;
}

type LightState = 'red' | 'yellow' | 'green';

interface ControllerState {
    lightState: LightState;
    duration: number;
    remaining: number;
    isRunning: boolean;
}

const TrafficLightController = ({
    incident,
    controllerState,
    onStateChange,
}: {
    incident: Incident;
    controllerState: ControllerState;
    onStateChange: (state: Partial<ControllerState>) => void;
}) => {
    const { lightState, duration, remaining, isRunning } = controllerState;
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { addLightControlLog } = useHistoryStore();

    useEffect(() => {
        if (isRunning && remaining > 0) {
            timerRef.current = setTimeout(() => {
                onStateChange({ remaining: remaining - 1 });
            }, 1000);
        } else if (remaining === 0 && isRunning) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            onStateChange({ isRunning: false });
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [remaining, isRunning, onStateChange]);

    const handleStart = () => {
        if (!isRunning) {
            let newRemaining = remaining;
            if (remaining <= 0) {
                newRemaining = duration;
            }
            onStateChange({ isRunning: true, remaining: newRemaining });
            addLightControlLog({
              location: incident.location,
              action: `Set to ${lightState.toUpperCase()} for ${newRemaining}s`,
              user: 'bitfusion',
            });
        }
    }

    const handleReset = () => {
        onStateChange({ isRunning: false, remaining: duration });
        addLightControlLog({
            location: incident.location,
            action: 'Cycle Reset',
            user: 'bitfusion',
        });
    };

    const handleAdd10s = () => {
        if (isRunning) {
            onStateChange({ remaining: remaining + 10 });
        } else {
            const newDuration = duration + 10;
            onStateChange({ duration: newDuration, remaining: newDuration });
        }
    };

    const handleSubtract5s = () => {
        if (isRunning) {
            onStateChange({ remaining: Math.max(0, remaining - 5) });
        } else {
            const newDuration = Math.max(0, duration - 5);
            onStateChange({ duration: newDuration, remaining: newDuration });
        }
    }

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDuration = parseInt(e.target.value, 10) || 0;
        if (!isRunning) {
            onStateChange({ duration: newDuration, remaining: newDuration });
        } else {
            onStateChange({ duration: newDuration });
        }
    }

    const handleLightStateChange = (newLightState: LightState) => {
        onStateChange({ lightState: newLightState });
        addLightControlLog({
            location: incident.location,
            action: `Set to ${newLightState.toUpperCase()}`,
            user: 'bitfusion',
        });
    }

    return (
        <div className="flex items-center justify-center space-x-1">
            <div className="flex flex-col items-center gap-2 mr-4">
                <div className="flex bg-gray-800 border-2 border-gray-900 rounded-full p-1 space-x-1">
                    <button
                        onClick={() => handleLightStateChange('red')}
                        className={cn(
                            'w-6 h-6 rounded-full transition-all',
                            lightState === 'red' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-gray-600'
                        )}
                    />
                    <button
                        onClick={() => handleLightStateChange('yellow')}
                        className={cn(
                            'w-6 h-6 rounded-full transition-all',
                            lightState === 'yellow' ? 'bg-yellow-500 shadow-[0_0_10px_#f59e0b]' : 'bg-gray-600'
                        )}
                    />
                    <button
                        onClick={() => handleLightStateChange('green')}
                        className={cn(
                            'w-6 h-6 rounded-full transition-all',
                            lightState === 'green' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-600'
                        )}
                    />
                </div>
                <span className="text-xs text-muted-foreground capitalize">{lightState}</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
                <div className="relative w-16">
                    <Input
                        type="number"
                        value={duration}
                        onChange={handleDurationChange}
                        className="w-full h-7 text-center text-sm pr-4"
                    />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">s</span>
                </div>
                <Button size="sm" onClick={handleStart} className="h-7 px-2 text-xs w-16 bg-blue-600/50 hover:bg-blue-700/50 text-white">{isRunning ? 'Running' : 'Start'}</Button>
            </div>
            <div className="flex items-center space-x-1 min-w-[32px] p-3">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono font-bold">{remaining}</span>
            </div>
            <div className="flex flex-col space-y-2 p-1">
                <Button size="icon" onClick={handleAdd10s} className="h-5 w-5 bg-sky-500/50 hover:bg-sky-600/50 text-white">
                    <Plus className="w-3 h-3" />
                </Button>
                <Button size="icon" onClick={handleSubtract5s} className="h-5 w-5 bg-red-400/50 hover:bg-red-500/50 text-white">
                    <Minus className="w-3 h-3" />
                </Button>
            </div>
            <div className="flex flex-col justify-center pl-1 p-1">
                <Button size="icon" onClick={handleReset} className="h-5 w-5 bg-green-500/50 hover:bg-green-600/50 text-white">
                    <RotateCcw className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
};

const LiveTrafficControlContent = ({
  incidents,
  controllerStates,
  onControllerStateChange,
  isFullScreen = false
}: {
  incidents: Incident[],
  controllerStates: Record<string, ControllerState>,
  onControllerStateChange: (incidentId: string, state: Partial<ControllerState>) => void,
  isFullScreen?: boolean
}) => (
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
            <TableHead className="text-center px-1 min-w-[280px]">Signal Control</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(isFullScreen ? incidents : incidents.slice(0, 4)).map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium pl-4 py-1.5">{incident.location}</TableCell>
              <TableCell className="p-1">
                <TrafficLightController
                  incident={incident}
                  controllerState={controllerStates[incident.id]}
                  onStateChange={(newState) => onControllerStateChange(incident.id, newState)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </>
);

export default function LiveTrafficControl({ incidents }: { incidents: Incident[] }) {
    const [controllerStates, setControllerStates] = useState<Record<string, ControllerState>>(() =>
        incidents.reduce((acc, incident) => {
            acc[incident.id] = {
                lightState: 'red',
                duration: 30,
                remaining: 30,
                isRunning: false,
            };
            return acc;
        }, {} as Record<string, ControllerState>)
    );

    const handleControllerStateChange = (incidentId: string, newState: Partial<ControllerState>) => {
        setControllerStates(prev => ({
            ...prev,
            [incidentId]: { ...prev[incidentId], ...newState }
        }));
    };

    return (
        <Dialog>
            <Card>
                <LiveTrafficControlContent
                    incidents={incidents}
                    controllerStates={controllerStates}
                    onControllerStateChange={handleControllerStateChange}
                />
            </Card>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
                <ScrollArea className="h-full w-full [&>div>div[style*='display:block;']]:!hidden">
                    <LiveTrafficControlContent
                        incidents={incidents}
                        controllerStates={controllerStates}
                        onControllerStateChange={handleControllerStateChange}
                        isFullScreen={true}
                    />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
