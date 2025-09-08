'use client';

import { useState } from 'react';
import { detectTrafficIncident, DetectTrafficIncidentOutput } from '@/ai/flows/detect-traffic-incidents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { Progress } from "@/components/ui/progress"
import { Badge } from '@/components/ui/badge';

export default function IncidentsForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('Highway 280, Southbound');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectTrafficIncidentOutput | null>(null);
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
      const incidentResult = await detectTrafficIncident({
        cameraFeedDataUri,
        locationDescription: location,
      });
      setResult(incidentResult);
    } catch (error) {
      console.error(error);
      toast({ title: 'An error occurred during incident detection.', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Incident Detection</CardTitle>
          <CardDescription>Upload a traffic camera image to detect accidents or road closures.</CardDescription>
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
              <Label htmlFor="location">Location Description</Label>
              <Input 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., Highway 280, Southbound"
              />
            </div>
            
            <Button type="submit" disabled={isLoading || !file} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
              Detect Incident
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detection Results</CardTitle>
          <CardDescription>Results from the incident detection will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {result && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Label>Incident Detected:</Label>
                <Badge variant={result.incidentDetected ? "destructive" : "default"}>
                  {result.incidentDetected ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Incident Type</Label>
                <p className="text-xl font-bold capitalize">{result.incidentType}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Confidence Level</Label>
                <div className="flex items-center gap-2">
                    <Progress value={result.confidenceLevel * 100} className="w-full" />
                    <span className="font-mono text-sm">{(result.confidenceLevel * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm text-foreground/80">{result.description}</p>
              </div>
            </div>
          )}
          {!isLoading && !result && (
             <div className="flex items-center justify-center h-48 text-muted-foreground">
               <p>Upload an image and click "Detect Incident" to see results.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
