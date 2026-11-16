import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Camera } from "lucide-react";
import AnalysisForm from "../analysis-form";

export default function CameraViews({ incidents }) {
  return (
    <Card className="h-fit lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Camera views and analysis
        </CardTitle>
        <CardDescription>
          Scan the demo feed or upload a video to count vehicles and spot incidents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnalysisForm />
      </CardContent>
    </Card>
  );
}
