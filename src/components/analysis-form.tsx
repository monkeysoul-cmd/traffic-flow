'use client';

import { useState, useRef } from 'react';
import { analyzeTrafficData, AnalyzeTrafficDataOutput } from '@/ai/flows/analyze-traffic-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, MapPin } from 'lucide-react';
import TrafficLightLoader from './traffic-light-loader';

export default function AnalysisForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('MG Road, Bangalore');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeTrafficDataOutput | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      const cameraFeedDataUri = await fileToDataUri(file);
      const analysisResult = await analyzeTrafficData({
        cameraFeedDataUri,
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
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Live Traffic Analysis</CardTitle>
          <CardDescription>Upload a traffic camera video to analyze vehicle count and traffic level.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="picture">Traffic Camera Video</Label>
              <Input id="picture" type="file" accept="video/*" onChange={handleFileChange} />
            </div>
            
            {preview && (
              <div className="w-full aspect-video rounded-md overflow-hidden relative border">
                <video ref={videoRef} src={preview} controls className="w-full h-full object-contain" />
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
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Results from the traffic analysis will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center h-48">
              <TrafficLightLoader />
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Vehicle Count</Label>
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
             <div className="flex items-center justify-center h-48 text-muted-foreground">
               <p>Upload a video and click "Analyze Traffic" to see results.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
