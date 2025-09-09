'use client';

import { useState } from 'react';
import { analyzeTrafficData, AnalyzeTrafficDataOutput } from '@/ai/flows/analyze-traffic-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import TrafficLightLoader from './traffic-light-loader';

export default function AnalysisForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('Main St & 1st Ave');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeTrafficDataOutput | null>(null);
  const { toast } = useToast();

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
          <CardTitle>Real-Time Traffic Analysis</CardTitle>
          <CardDescription>Upload a traffic camera image to analyze vehicle count and congestion.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="picture">Traffic Camera Image</Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            
            {preview && (
              <div className="w-full aspect-video rounded-md overflow-hidden relative border">
                <Image src={preview} alt="Traffic preview" fill className="object-contain" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., Main St & 1st Ave"
              />
            </div>
            
            <Button type="submit" disabled={isLoading || !file} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Analyze Traffic
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
                <Label className="text-muted-foreground">Congestion Level</Label>
                <p className="text-2xl font-bold capitalize">{result.congestionLevel}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Potential Incidents</Label>
                <p className="text-lg">{result.potentialIncidents || 'None detected'}</p>
              </div>
            </div>
          )}
          {!isLoading && !result && (
             <div className="flex items-center justify-center h-48 text-muted-foreground">
               <p>Upload an image and click "Analyze Traffic" to see results.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
