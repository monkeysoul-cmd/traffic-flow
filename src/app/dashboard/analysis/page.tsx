import AnalysisForm from "@/components/analysis-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AnalysisPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Ingest Documents</h1>
        <p className="text-muted-foreground mt-1">
          Upload technical papers, textbooks, or PDFs to process them through our semantic RAG pipeline.
        </p>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            PDF Chunking & Embeddings Ingestion
          </CardTitle>
          <CardDescription>
            Documents are automatically parsed into context-overlapping chunks and indexed into the vector DB.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <AnalysisForm />
        </CardContent>
      </Card>
    </div>
  );
}
