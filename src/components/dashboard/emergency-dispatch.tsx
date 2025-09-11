'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Siren, Ambulance, Shield, ChevronsRight, Building, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

interface Incident {
  id: string;
  location: string;
  type: string;
  severity: 'High' | 'Medium' | 'Low';
  time: string;
}

const unitIcons: { [key: string]: React.ReactNode } = {
  police: <Shield className="h-4 w-4" />,
  ambulance: <Ambulance className="h-4 w-4" />,
  fire: <Siren className="h-4 w-4" />,
};

export default function EmergencyDispatch({ incidents }: { incidents: Incident[] }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(incidents.find(i => i.severity === 'High')?.id || null);
  const [unitType, setUnitType] = useState('police');
  const [dispatchedUnits, setDispatchedUnits] = useState<Record<string, { unit: string; time: string }[]>>({});
  const { toast } = useToast();

  const handleDispatch = () => {
    if (!selectedIncidentId) {
      toast({
        title: 'No Incident Selected',
        description: 'Please select an incident to dispatch a unit.',
        variant: 'destructive',
      });
      return;
    }

    const dispatchTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    setDispatchedUnits(prev => ({
      ...prev,
      [selectedIncidentId]: [
        ...(prev[selectedIncidentId] || []),
        { unit: unitType, time: dispatchTime },
      ],
    }));

    toast({
      title: 'Unit Dispatched!',
      description: `A ${unitType} unit has been dispatched to incident ${selectedIncidentId}.`,
    });
  };

  const highSeverityIncidents = incidents.filter(i => i.severity === 'High');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Siren className="w-6 h-6" />
          Emergency Vehicle Dispatch
        </CardTitle>
        <CardDescription>Dispatch units to high-priority incidents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select High-Priority Incident</label>
          <Select onValueChange={setSelectedIncidentId} value={selectedIncidentId || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select an incident..." />
            </SelectTrigger>
            <SelectContent>
              {highSeverityIncidents.map(incident => (
                <SelectItem key={incident.id} value={incident.id}>
                  {incident.id} - {incident.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-grow space-y-2">
            <label htmlFor="unit-type" className="text-sm font-medium">Unit Type</label>
            <Select onValueChange={setUnitType} defaultValue={unitType}>
              <SelectTrigger id="unit-type">
                <SelectValue placeholder="Select unit..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="police">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Police
                  </div>
                </SelectItem>
                <SelectItem value="ambulance">
                  <div className="flex items-center gap-2">
                    <Ambulance className="h-4 w-4" /> Ambulance
                  </div>
                </SelectItem>
                <SelectItem value="fire">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Fire Truck
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleDispatch} disabled={!selectedIncidentId}>
            Dispatch <ChevronsRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="font-medium">Dispatched Units</h4>
          <ScrollArea className="h-32 rounded-md border p-2">
            {selectedIncidentId && dispatchedUnits[selectedIncidentId] ? (
              dispatchedUnits[selectedIncidentId].map((dispatch, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-1.5 rounded-md hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    {unitIcons[dispatch.unit]}
                    <span className="font-medium capitalize">{dispatch.unit}</span>
                  </div>
                  <Badge variant="secondary">{dispatch.time}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No units dispatched for this incident.</p>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
