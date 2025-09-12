'use client';

import { useState, useRef, useEffect } from 'react';
import { analyzeTrafficData, AnalyzeTrafficDataOutput } from '@/ai/flows/analyze-traffic-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, MapPin, Video, Camera } from 'lucide-react';
import TrafficLightLoader from './traffic-light-loader';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function AnalysisForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('MG Road, Bangalore');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeTrafficDataOutput | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      // Stop camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setIsLive(true);
      setPreview(null);
      setFile(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);
      setIsLive(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const fileToDataUri = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      setIsRecording(true);
      setResult(null);
      const stream = videoRef.current.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await analyzeBlob(blob);
      };
      mediaRecorderRef.current.start();

      setTimeout(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
      }, 5000); // Record for 5 seconds
    }
  };

  const analyzeBlob = async (blob: Blob) => {
    setIsLoading(true);
    setResult(null);
    try {
      const cameraFeedDataUri = await fileToDataUri(blob);
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
  }

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
          <CardDescription>Analyze vehicle count and traffic level from a video file or live camera.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="picture">Upload Traffic Video</Label>
              <Input id="picture" type="file" accept="video/*" onChange={handleFileChange} />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1 border-t"></div>
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 border-t"></div>
            </div>
            
            <Button variant="outline" className="w-full" onClick={getCameraPermission}>
                <Camera className="mr-2 h-4 w-4" /> Use Live Camera
            </Button>

            {(preview || isLive) && (
              <div className="w-full aspect-video rounded-md overflow-hidden relative border bg-muted">
                <video ref={videoRef} src={preview || ''} controls={!!preview} autoPlay={isLive} muted={isLive} className="w-full h-full object-contain" />
              </div>
            )}
            
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser to use this feature.
                    </AlertDescription>
                </Alert>
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
            
            {isLive ? (
                <Button onClick={startRecording} disabled={isLoading || isRecording} className="w-full">
                    {isRecording ? 'Recording...' : isLoading ? 'Analyzing...' : <><Video className="mr-2 h-4 w-4" />Capture & Analyze</>}
                </Button>
            ) : (
                <Button onClick={handleSubmit} disabled={isLoading || !file} className="w-full">
                    {isLoading ? 'Analyzing...' : <><Upload className="mr-2 h-4 w-4" />Analyze Traffic</>}
                </Button>
            )}
          </div>
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
               <p>Upload a video or use the camera to see results.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
