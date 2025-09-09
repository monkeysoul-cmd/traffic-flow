'use client';

import { useState } from 'react';
import { predictTrafficCongestion, PredictTrafficCongestionOutput } from '@/ai/flows/predict-traffic-congestion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, MapPin, Lightbulb } from 'lucide-react';
import TrafficLightLoader from './traffic-light-loader';

const defaultHistoricalData = JSON.stringify({
  "daily_average_speed": "35 km/h",
  "peak_hour_congestion": "High",
  "common_bottlenecks": ["Downtown intersection", "Bridge entrance"]
}, null, 2);

const defaultRealTimeData = JSON.stringify({
  "current_average_speed": "25 km/h",
  "sensor_vehicle_counts": {"Main St": 500, "Oak Ave": 350},
  "active_incidents": 1
}, null, 2);

export default function PredictionsForm() {
  const [historicalData, setHistoricalData] = useState(defaultHistoricalData);
  const [realTimeData, setRealTimeData] = useState(defaultRealTimeData);
  const [weatherData, setWeatherData] = useState('{"condition": "Rainy", "temperature": "15°C"}');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictTrafficCongestionOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historicalData || !realTimeData) {
      toast({ title: 'Please provide historical and real-time data.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      const predictionResult = await predictTrafficCongestion({
        historicalData,
        realTimeData,
        weatherData: weatherData || undefined,
      });
      setResult(predictionResult);
    } catch (error) {
      console.error(error);
      toast({ title: 'An error occurred during prediction.', description: 'Please check your data format and try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Predictive Congestion Modeling</CardTitle>
          <CardDescription>Input traffic data to predict congestion and get mitigation suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="historicalData">Historical Data (JSON)</Label>
              <Textarea
                id="historicalData"
                value={historicalData}
                onChange={(e) => setHistoricalData(e.target.value)}
                rows={6}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="realTimeData">Real-Time Data (JSON)</Label>
              <Textarea
                id="realTimeData"
                value={realTimeData}
                onChange={(e) => setRealTimeData(e.target.value)}
                rows={6}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weatherData">Weather Data (JSON, Optional)</Label>
              <Textarea
                id="weatherData"
                value={weatherData}
                onChange={(e) => setWeatherData(e.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <span className="text-sm animate-pulse">Predicting...</span> : <><BrainCircuit className="mr-2 h-4 w-4" />Predict Congestion</>}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Prediction Results</CardTitle>
          <CardDescription>Predicted congestion levels and suggested actions.</CardDescription>
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
                <Label className="text-muted-foreground">Congestion Prediction</Label>
                <p className="text-2xl font-bold capitalize">{result.congestionPrediction}</p>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4"/>Bottleneck Locations</Label>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {result.bottleneckLocations.map((location, index) => (
                    <li key={index} className="text-md">{location}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-2"><Lightbulb className="w-4 h-4"/>Suggested Actions</Label>
                <p className="text-md text-foreground/80 mt-2 bg-muted p-4 rounded-md">{result.suggestedActions}</p>
              </div>
            </div>
          )}
          {!isLoading && !result && (
             <div className="flex items-center justify-center h-full text-muted-foreground">
               <p>Input data and click "Predict Congestion" to see results.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
