'use client';

import { useState } from 'react';
import { manageTrafficLight, ManageTrafficLightOutput } from '@/ai/flows/manage-traffic-light';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TrafficCone, Lightbulb } from 'lucide-react';
import TrafficLightLoader from './traffic-light-loader';

export default function TrafficLightForm() {
  const [location, setLocation] = useState('Maple Ave & Oak St');
  const [vehicleCount, setVehicleCount] = useState('50');
  const [pedestrianCount, setPedestrianCount] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ManageTrafficLightOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !vehicleCount || !pedestrianCount) {
      toast({ title: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      const predictionResult = await manageTrafficLight({
        location,
        currentTime: new Date().toLocaleTimeString(),
        vehicleCount: parseInt(vehicleCount, 10),
        pedestrianCount: parseInt(pedestrianCount, 10),
      });
      setResult(predictionResult);
    } catch (error) {
      console.error(error);
      toast({ title: 'An error occurred during signal optimization.', description: 'Please check your data and try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Light Control</CardTitle>
          <CardDescription>Optimize traffic light timings based on real-time conditions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location">Intersection Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleCount">Vehicle Count</Label>
              <Input
                id="vehicleCount"
                type="number"
                value={vehicleCount}
                onChange={(e) => setVehicleCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pedestrianCount">Pedestrian Count</Label>
               <Input
                id="pedestrianCount"
                type="number"
                value={pedestrianCount}
                onChange={(e) => setPedestrianCount(e.target.value)}
              />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <span className="text-sm animate-pulse">Optimizing...</span> : <><TrafficCone className="mr-2 h-4 w-4" />Optimize Signals</>}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Optimization Results</CardTitle>
          <CardDescription>Recommended signal timings and actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <TrafficLightLoader />
            </div>
          )}
          {result && (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Optimal Signal Timings</Label>
                <div className="grid grid-cols-2 gap-4 mt-2 text-center">
                    <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Main Street Green</p>
                        <p className="text-xl font-bold">{result.signalTiming.mainStreetGreen}s</p>
                    </div>
                     <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Side Street Green</p>
                        <p className="text-xl font-bold">{result.signalTiming.sideStreetGreen}s</p>
                    </div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-2"><Lightbulb className="w-4 h-4"/>Recommendation</Label>
                <p className="text-md text-foreground/80 mt-2 bg-muted p-4 rounded-md">{result.recommendation}</p>
              </div>
            </div>
          )}
          {!isLoading && !result && (
             <div className="flex items-center justify-center h-full text-muted-foreground">
               <p>Input data and click "Optimize Signals" to see results.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
