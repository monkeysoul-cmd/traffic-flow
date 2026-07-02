"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHistoryStore } from "@/lib/history-store";
import { getDocumentsList, deleteDocument } from "@/ai/flows/rag-flows";
import { DocumentRecord } from "@/lib/local-vector-db";
import {
  FileText,
  Database,
  Cpu,
  Layers,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  UploadCloud,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function Overview() {
  const { toast } = useToast();
  const {
    documents,
    selectedDocumentId,
    databaseEngine,
    setDocuments,
    setSelectedDocumentId,
    setDatabaseEngine,
    deleteDocumentState,
    isLoadingDocs,
    setIsLoadingDocs,
  } = useHistoryStore();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch document lists and initialize state store
  useEffect(() => {
    async function loadDocs() {
      setIsLoadingDocs(true);
      try {
        const res = await getDocumentsList();
        if (res.success) {
          setDocuments(res.documents);
          setDatabaseEngine(res.databaseUsed);
        } else {
          toast({
            title: "Error loading documents",
            description: "Could not retrieve knowledge base list.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    loadDocs();
  }, [setDocuments, setDatabaseEngine, setIsLoadingDocs, toast]);

  const handleSelectDoc = (id: string) => {
    setSelectedDocumentId(id);
    const doc = documents.find((d) => d.id === id);
    toast({
      title: "Document Activated",
      description: `"${doc?.filename}" is now set as the active RAG context.`,
    });
  };

  const handleDeleteDoc = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent setting active
    setDeletingId(id);
    try {
      const res = await deleteDocument(id);
      if (res.success) {
        deleteDocumentState(id);
        toast({
          title: "Document Deleted",
          description: "Removed document and its embeddings successfully.",
        });
      } else {
        toast({
          title: "Delete failed",
          description: "Could not delete document from database.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to format bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunk_count, 0);
  const activeDoc = documents.find((doc) => doc.id === selectedDocumentId);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">RAG Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your parsed documents, vector embeddings, and LLM grounding analytics.
          </p>
        </div>
      </div>

      {/* RAG Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Documents Card */}
        <Card className="bg-card border-border hover:border-emerald-500/30 transition-all duration-300 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Ingested PDFs
            </CardTitle>
            <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">{documents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Knowledge bases stored</p>
          </CardContent>
        </Card>

        {/* Total Text Chunks Card */}
        <Card className="bg-card border-border hover:border-emerald-500/30 transition-all duration-300 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Text Chunks
            </CardTitle>
            <div className="bg-teal-500/10 p-2.5 rounded-lg text-teal-400">
              <Layers className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">{totalChunks}</div>
            <p className="text-xs text-muted-foreground mt-1">Split contexts indexed</p>
          </CardContent>
        </Card>

        {/* Embedding Dimensions Card */}
        <Card className="bg-card border-border hover:border-emerald-500/30 transition-all duration-300 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Vector Dimension
            </CardTitle>
            <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-400">
              <Cpu className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">3072-D</div>
            <p className="text-xs text-muted-foreground mt-1">Gemini embedding-001</p>
          </CardContent>
        </Card>

        {/* Active Database Engine Card */}
        <Card className="bg-card border-border hover:border-emerald-500/30 transition-all duration-300 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Vector DB Engine
            </CardTitle>
            <div className="bg-indigo-500/10 p-2.5 rounded-lg text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold tracking-tight capitalize">
                {databaseEngine === "both" ? "Supabase + Local" : databaseEngine}
              </span>
              <Badge
                className={
                  databaseEngine === "supabase" || databaseEngine === "both"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium"
                }
              >
                {databaseEngine === "supabase" || databaseEngine === "both" ? "Production" : "Fallback"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {databaseEngine === "supabase" || databaseEngine === "both"
                ? "Connecting to pgvector"
                : "Using local JSON files"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Document Indicator */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${activeDoc ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {activeDoc ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="font-bold text-lg">Active RAG Context</h3>
            <p className="text-sm text-muted-foreground">
              {activeDoc
                ? `Ready for QA and Quiz. Active file: "${activeDoc.filename}"`
                : "No active PDF. Select a document below or upload a new one to enable RAG features."}
            </p>
          </div>
        </div>
        {activeDoc && (
          <div className="flex gap-2">
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
              <Link href="/dashboard/history">
                <Sparkles className="h-4 w-4" /> Start Chat
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-border gap-2">
              <Link href="/dashboard/flow-graph">
                Quiz Generator
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Documents Grid / List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Ingested Knowledge Bases</h2>
          <Button asChild variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
            <Link href="/dashboard/analysis" className="gap-1 flex items-center">
              Upload New <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoadingDocs ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="border-border animate-pulse bg-card h-48" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* Empty State */
          <Card className="border-2 border-dashed border-border p-12 text-center bg-card flex flex-col items-center justify-center">
            <div className="bg-muted p-4 rounded-full text-muted-foreground mb-4">
              <UploadCloud className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl font-bold">No Documents Ingested</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              You haven't uploaded any PDFs to your vector database yet. Upload a document to split, embed, and query it.
            </CardDescription>
            <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
              <Link href="/dashboard/analysis">
                <UploadCloud className="h-4 w-4" /> Upload first PDF
              </Link>
            </Button>
          </Card>
        ) : (
          /* Documents Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const isActive = doc.id === selectedDocumentId;
              return (
                <Card
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc.id)}
                  className={`bg-card relative cursor-pointer hover:shadow-md transition-all duration-300 border-2 overflow-hidden flex flex-col justify-between h-56 ${
                    isActive ? "border-emerald-500 shadow-sm" : "border-border hover:border-emerald-500/40"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      {isActive && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Context
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold mt-3 leading-snug line-clamp-2">
                      {doc.filename}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{doc.page_count}</span> pages
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{doc.chunk_count}</span> chunks
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{formatBytes(doc.size_bytes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="border-t border-border px-4 py-3 bg-muted/30 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold">
                      {isActive ? "Active RAG context" : "Click to select"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === doc.id}
                      onClick={(e) => handleDeleteDoc(e, doc.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
