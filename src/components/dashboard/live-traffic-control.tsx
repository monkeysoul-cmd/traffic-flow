'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrafficCone } from 'lucide-react';

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

  return (
    <div className="flex items-center space-x-2">
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
  );
};

export default function LiveTrafficControl({ incidents }: { incidents: Incident[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrafficCone className="w-6 h-6" />
          Live Traffic Light Control
        </CardTitle>
        <CardDescription>Manually override traffic signals for active incident locations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Incident Type</TableHead>
              <TableHead className="text-right">Signal Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.slice(0, 3).map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">{incident.location}</TableCell>
                <TableCell>{incident.type}</TableCell>
                <TableCell className="text-right">
                  <TrafficLightController incidentId={incident.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
