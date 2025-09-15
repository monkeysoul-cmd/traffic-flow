'use client';

import { useState, useRef, useEffect } from 'react';
import { analyzeTrafficData, AnalyzeTrafficDataOutput } from '@/ai/flows/analyze-traffic-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, MapPin } from 'lucide-react';
import TrafficLightLoader from './traffic-light-loader';

type Vehicle = AnalyzeTrafficDataOutput['vehicles'][0];

export default function AnalysisForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('MG Road, Bangalore');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeTrafficDataOutput | null>(null);
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentVehicleCount, setCurrentVehicleCount] = useState(0);

  const drawBoundingBoxes = (vehicles: Vehicle[], video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentTime = video.currentTime;
    const currentVehicles = vehicles.filter(v => currentTime >= v.timestamp && currentTime < v.timestamp + 0.5); // Show for 0.5s

    setCurrentVehicleCount(currentVehicles.length);

    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'hsl(var(--primary))';

    currentVehicles.forEach((vehicle, i) => {
      const [x, y, w, h] = vehicle.box;
      ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);
      ctx.fillText(`v${i + 1}`, x * scaleX, y * scaleY - 5);
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    let animationFrameId: number;

    if (video && canvas && result?.vehicles) {
      const render = () => {
        drawBoundingBoxes(result.vehicles, video, canvas);
        animationFrameId = requestAnimationFrame(render);
      };
      
      video.onplay = () => {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        render();
      };
      
      video.onpause = () => {
        cancelAnimationFrame(animationFrameId);
      };
      
      video.onended = () => {
        cancelAnimationFrame(animationFrameId);
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        setCurrentVehicleCount(0);
      };

    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if(video) {
        video.onplay = null;
        video.onpause = null;
        video.onended = null;
      }
    };
  }, [result]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);
      setCurrentVehicleCount(0);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeDataUri = async (dataUri: string) => {
    setIsLoading(true);
    setResult(null);
    setCurrentVehicleCount(0);
    try {
      const analysisResult = await analyzeTrafficData({
        cameraFeedDataUri: dataUri,
        location,
        timestamp: new Date().toISOString(),
      });
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({ title: 'An error occurred during analysis.', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'destructive' });
      return;
    }
    const cameraFeedDataUri = await fileToDataUri(file);
    await analyzeDataUri(cameraFeedDataUri);
  };

  return (
    <div className="grid md:grid-cols-1 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Analysis</CardTitle>
          <CardDescription>Analyze vehicle count and traffic level from a video file.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="picture">Upload Traffic Video</Label>
              <Input id="picture" type="file" accept="video/*" onChange={handleFileChange} />
            </div>

            {preview && (
              <div className="w-full aspect-video rounded-md overflow-hidden relative border bg-muted">
                <video ref={videoRef} src={preview} controls className="w-full h-full object-contain" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="location">Location</Label>
              </div>
              <Input 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., MG Road, Bangalore"
              />
            </div>
            
            <Button type="submit" disabled={isLoading || !file} className="w-full">
                {isLoading ? 'Analyzing...' : <><Upload className="mr-2 h-4 w-4" />Analyze Traffic</>}
            </Button>

            {isLoading && (
              <div className="flex items-center justify-center h-24">
                <TrafficLightLoader />
              </div>
            )}
            {result && (
              <div className="space-y-4 pt-4 border-t">
                 <h3 className="font-semibold">Analysis Results</h3>
                 <div>
                  <Label className="text-muted-foreground">Live Vehicle Count (in view)</Label>
                  <p className="text-2xl font-bold">{currentVehicleCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Unique Vehicles (in video)</Label>
                  <p className="text-2xl font-bold">{result.vehicleCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Traffic Level</Label>
                  <p className="text-2xl font-bold capitalize">{result.trafficLevel}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Potential Incidents</Label>
                  <p className="text-lg">{result.potentialIncidents || 'None detected'}</p>
                </div>
              </div>
            )}
            {!isLoading && !result && (
               <div className="flex items-center justify-center h-24 text-muted-foreground">
                 <p>Upload a video to see results.</p>
               </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
