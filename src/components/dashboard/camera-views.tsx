import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Camera } from "lucide-react";
import AnalysisForm from "../analysis-form";

interface Incident {
  id: string;
  location: string;
  type: string;
  priority: string;
  time: string;
}

export default function CameraViews({ incidents }: { incidents: Incident[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          Camera Views & Analysis
        </CardTitle>
        <CardDescription>Upload a video to analyze traffic patterns in real-time.</CardDescription>
      </CardHeader>
      <CardContent>
        <AnalysisForm />
      </CardContent>
    </Card>
  );
}
