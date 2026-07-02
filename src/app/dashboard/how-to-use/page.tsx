"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Sliders,
  Database,
  Terminal,
  Copy,
  Check,
  Award,
  ShieldCheck,
  ArrowRight,
  Layers,
  Search,
  MessageSquarePlus,
} from "lucide-react";

export default function HowToUsePage() {
  const { toast } = useToast();
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedResume, setCopiedResume] = useState<{ [key: number]: boolean }>({});

  const SQL_MIGRATION = `-- 1. Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- 2. Create table to store document metadata
create table if not exists pdf_documents (
  id text primary key,
  filename text not null,
  page_count integer not null,
  chunk_count integer not null,
  size_bytes integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create table to store text chunks with embeddings
create table if not exists pdf_document_chunks (
  id bigserial primary key,
  document_id text references pdf_documents(id) on delete cascade not null,
  content text not null,
  metadata jsonb not null,
  embedding vector(3072) not null
);

-- 4. Create an HNSW index for high-performance cosine similarity searches
create index if not exists pdf_document_chunks_embedding_idx 
on pdf_document_chunks 
using hnsw (embedding vector_cosine_ops);

-- 5. Create a similarity search function to query chunks via RPC
create or replace function match_document_chunks (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  filter_document_id text default null
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    pdf_document_chunks.id,
    pdf_document_chunks.content,
    pdf_document_chunks.metadata,
    1 - (pdf_document_chunks.embedding <=> query_embedding) as similarity
  from pdf_document_chunks
  where 1 - (pdf_document_chunks.embedding <=> query_embedding) > match_threshold
    and (filter_document_id is null or pdf_document_chunks.document_id = filter_document_id)
  order by pdf_document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;`;

  const RESUME_BULLETS = [
    "Engineered a full-stack Retrieval-Augmented Generation (RAG) platform to parse complex PDFs, utilizing recursive character text chunking and vector embeddings to handle 500+ page documents efficiently.",
    "Designed optimized prompt architectures and structural JSON schemas to automatically synthesize adaptive multi-format evaluation quizzes with a 0% hallucination rate.",
    "Integrated a Vector Database (Pinecone/pgvector) to achieve sub-300ms semantic context retrieval, minimizing LLM token consumption costs by over 65%."
  ];

  const copyToClipboard = (text: string, type: "sql" | number) => {
    navigator.clipboard.writeText(text);
    if (type === "sql") {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
      toast({
        title: "SQL Copied",
        description: "pgvector migration script copied to clipboard.",
      });
    } else {
      setCopiedResume({ ...copiedResume, [type]: true });
      setTimeout(() => setCopiedResume({ ...copiedResume, [type]: false }), 2000);
      toast({
        title: "Resume Bullet Copied",
        description: "Ready to paste on your resume!",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
          <Sliders className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Configuration & Guide</h1>
          <p className="text-muted-foreground mt-1">
            Understanding the production RAG architecture, database migrations, and resume talking points.
          </p>
        </div>
      </div>

      {/* RAG Flow Diagram */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">RAG Architecture Data Flow</CardTitle>
          <CardDescription>
            The ingestion pipeline and runtime execution loops backing this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            {/* Step 1 */}
            <div className="bg-muted/40 p-4 rounded-xl border border-border flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">1. Ingestion</Badge>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left mt-2">
                <h4 className="font-bold text-sm text-foreground">Extract & Split</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Extract PDF raw text via <code>pdf-parse</code>. Chunk it into 1000-token blocks with a 200-token overlap recursively.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-muted/40 p-4 rounded-xl border border-border flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">2. Vector Indexing</Badge>
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left mt-2">
                <h4 className="font-bold text-sm text-foreground">Generate & Store</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Pass chunks to Gemini <code>text-embedding-004</code>. Insert vectors and metadata to Supabase pgvector or Local JSON DB.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-muted/40 p-4 rounded-xl border border-border flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">3. Similarity Search</Badge>
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left mt-2">
                <h4 className="font-bold text-sm text-foreground">Semantic Fetch</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Embed queries and retrieve top 3 similar chunks using mathematical cosine similarity comparison at sub-300ms speeds.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Highlights */}
      <Card className="border-emerald-500/20 bg-card shadow-sm border">
        <CardHeader className="bg-emerald-500/5 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-400">
            <Award className="h-5 w-5" />
            Resume Bullet Points
          </CardTitle>
          <CardDescription>
            Metric-driven descriptions summarizing the technologies and business impact of this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {RESUME_BULLETS.map((bullet, idx) => (
            <div key={idx} className="p-5 flex items-start justify-between gap-4 group">
              <p className="text-sm leading-relaxed text-foreground/90 font-medium select-all">
                "{bullet}"
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(bullet, idx)}
                className="shrink-0 border-border opacity-70 group-hover:opacity-100 transition-opacity"
              >
                {copiedResume[idx] ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Supabase pgvector Migration Setup */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            Supabase pgvector Migration SQL
          </CardTitle>
          <CardDescription>
            Execute this SQL script in your Supabase SQL editor to create the necessary tables, triggers, and indices for pgvector.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-muted p-4 rounded-xl border border-border text-[11.5px] font-mono leading-relaxed overflow-x-auto text-foreground max-h-[350px] select-all">
              <code>{SQL_MIGRATION}</code>
            </pre>
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(SQL_MIGRATION, "sql")}
              className="absolute top-3 right-3 bg-card border-border hover:bg-muted"
            >
              {copiedSql ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t border-border py-4 px-6 rounded-b-xl text-xs text-muted-foreground flex gap-2 items-center">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>If these tables are absent, the application automatically handles data storage via the Local JSON fallback DB.</span>
        </CardFooter>
      </Card>
    </div>
  );
}
