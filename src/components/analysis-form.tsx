"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useHistoryStore } from "@/lib/history-store";
import { ingestDocument } from "@/ai/flows/rag-flows";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle,
  Database,
  ArrowRight,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

type IngestionStage = "idle" | "parsing" | "chunking" | "embedding" | "storing" | "completed" | "error";

export default function AnalysisForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSelectedDocumentId, setDocuments, documents, databaseEngine } = useHistoryStore();

  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<IngestionStage>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selected = droppedFiles[0];
      if (selected.type === "application/pdf") {
        setFile(selected);
        setErrorMsg("");
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid PDF document.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type === "application/pdf") {
        setFile(selected);
        setErrorMsg("");
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid PDF document.",
          variant: "destructive",
        });
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setStage("parsing");
    setProgress(15);

    try {
      // Convert file to base64
      const reader = new FileReader();
      
      const fileLoadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const res = e.target?.result as string;
          if (res) resolve(res);
          else reject(new Error("Empty file content read"));
        };
        reader.onerror = () => reject(new Error("File reading error"));
        reader.readAsDataURL(file);
      });

      const base64Uri = await fileLoadPromise;
      
      // Simulate pipeline progression visually for the user
      setStage("chunking");
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 800));

      setStage("embedding");
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 800));

      setStage("storing");
      setProgress(90);

      // Call the server action to run the RAG pipeline
      const response = await ingestDocument(base64Uri, file.name, file.size);

      if (response.success && response.document) {
        setProgress(100);
        setStage("completed");
        setResult(response);
        
        // Update store with the new document list
        setSelectedDocumentId(response.document.id);
        setDocuments([response.document, ...documents]);

        toast({
          title: "Ingestion Successful!",
          description: `Ingested ${response.chunkCount} text chunks using ${response.databaseUsed === "supabase" ? "Supabase pgvector" : "Local JSON database"}.`,
        });
      } else {
        throw new Error(response.error || "RAG Ingestion pipeline failed");
      }
    } catch (err: any) {
      console.error(err);
      setStage("error");
      setErrorMsg(err.message || "An error occurred while uploading and parsing the document.");
      toast({
        title: "Ingestion Failed",
        description: err.message || "RAG pipeline failed.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFile(null);
    setStage("idle");
    setProgress(0);
    setResult(null);
    setErrorMsg("");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* DB status header indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">
        <Database className="h-4 w-4 text-emerald-400" />
        <span className="font-semibold text-foreground">RAG Target:</span>
        <span>
          {databaseEngine === "supabase" || databaseEngine === "both"
            ? "Production Supabase DB (pgvector enabled)"
            : "Local JSON File Fallback DB (No setup required)"}
        </span>
      </div>

      {stage === "idle" && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-2xl p-12 text-center bg-card cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center min-h-[300px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <div className="bg-emerald-500/10 p-5 rounded-full text-emerald-400 group-hover:scale-110 transition-transform duration-300 mb-4">
            <UploadCloud className="h-10 w-10" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-emerald-400 transition-colors">
            Drag & drop PDF here
          </h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse your computer</p>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded">
            Only PDF files up to 10MB
          </span>
        </div>
      )}

      {file && stage === "idle" && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground line-clamp-1">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetForm}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpload} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Ingest & Index
            </Button>
          </div>
        </div>
      )}

      {stage !== "idle" && stage !== "completed" && stage !== "error" && (
        <Card className="border-border bg-card p-6 shadow-sm text-center space-y-6">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
            <h3 className="font-bold text-lg text-foreground">
              {stage === "parsing" && "Extracting text from PDF..."}
              {stage === "chunking" && "Splitting text into recursive chunks..."}
              {stage === "embedding" && "Generating 768-D vector embeddings..."}
              {stage === "storing" && "Storing chunks in Vector Database..."}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {stage === "parsing" && "Reading the uploaded PDF binary stream."}
              {stage === "chunking" && "Creating token overlaps to prevent broken sentences."}
              {stage === "embedding" && "Embedding tokens via Google Gemini text-embedding-004."}
              {stage === "storing" && `Indexing vectors into ${result?.databaseUsed === "supabase" ? "Supabase pgvector" : "Local fallback store"}.`}
            </p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2 bg-muted text-emerald-500" />
            <div className="text-xs text-muted-foreground text-right">{progress}%</div>
          </div>
        </Card>
      )}

      {stage === "completed" && result && (
        <Card className="border-emerald-500/30 bg-card p-8 text-center space-y-6 shadow-md border animate-scale-in">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-full mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="font-extrabold text-2xl text-foreground">Ingested Successfully!</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              The PDF has been fully processed and index vectors are now stored.
            </p>
          </div>

          <div className="bg-muted/40 p-4 rounded-xl border border-border text-left grid grid-cols-2 gap-4 text-sm max-w-md mx-auto">
            <div>
              <span className="text-muted-foreground block text-xs">File Ingested</span>
              <span className="font-bold line-clamp-1">{file?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Total Chunks</span>
              <span className="font-bold">{result.chunkCount} splits</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Database Engine</span>
              <span className="font-bold capitalize">{result.databaseUsed}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Active Embeddings</span>
              <span className="font-bold text-emerald-400">768-Dimensions</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={resetForm}>
              Upload Another
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
              <Link href="/dashboard/history">
                Start Chat <MessageSquare className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white gap-2 border-0">
              <Link href="/dashboard/flow-graph">
                Quiz Game <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {stage === "error" && (
        <Card className="border-red-500/30 bg-card p-6 text-center space-y-4 shadow-sm border animate-shake">
          <div className="text-red-500 text-lg font-bold">Ingestion Error</div>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <div className="pt-2">
            <Button onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Try Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
