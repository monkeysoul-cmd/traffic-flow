import AnalysisForm from "@/components/analysis-form";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/traffic/page-header";
import { Camera } from "lucide-react";

export default function AnalysisPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={Camera}
        title="Live analyze"
        description="Count vehicles, estimate speed and detect incidents from a video file."
      />
      <Card>
        <CardContent className="p-5">
          <AnalysisForm />
        </CardContent>
      </Card>
    </div>
  );
}
