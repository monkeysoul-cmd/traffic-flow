import AnalysisForm from '@/components/analysis-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalysisPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Analysis</CardTitle>
        <CardDescription>Analyze vehicle count and traffic level from a video file.</CardDescription>
      </CardHeader>
      <CardContent>
        <AnalysisForm />
      </CardContent>
    </Card>
  );
}
