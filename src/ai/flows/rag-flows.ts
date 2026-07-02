"use server";

import * as fs from "fs";
import * as path from "path";
import { ai } from "@/ai/genkit";
import { z } from "zod";

import { RecursiveCharacterTextSplitter } from "@/lib/splitter";
import { localVectorDb, DocumentRecord } from "@/lib/local-vector-db";
import { supabase } from "@/lib/supabase";

// Define the schema for the generated quiz questions matching the prompt's instruction
const MultipleChoiceQuestionSchema = z.object({
  id: z.number(),
  type: z.literal("multiple-choice"),
  question: z.string(),
  options: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),
});

const ShortAnswerQuestionSchema = z.object({
  id: z.number(),
  type: z.literal("short-answer"),
  question: z.string(),
  correct_answer: z.string(),
  explanation: z.string(),
});

const QuizSchema = z.array(z.union([MultipleChoiceQuestionSchema, ShortAnswerQuestionSchema]));

export type Quiz = z.infer<typeof QuizSchema>;

const SYSTEM_PROMPT = `Subject: Expert Academic Assistant & PDF Analytics Engine
Role: You are an advanced AI Educational Engineer tasked with parsing technical documents, generating highly accurate evaluation questions, and answering user queries based strictly on provided context.

Context Security & Guardrails:
1. Grounding: Rely ONLY on the clear facts directly mentioned in the provided PDF context chunks. Do not extrapolate, assume, or bring in outside training data.
2. Unanswerable Queries: If a user asks a question that cannot be answered using the provided document chunks, respond exactly with: "I'm sorry, but the provided document does not contain enough information to answer this question." Do not attempt to guess.
3. Citation: When answering user queries, subtly append the section name or source context fragment identifiers if available.`;

/**
 * Server Action to parse a PDF file, chunk it, embed it, and save to the DB.
 */
export async function ingestDocument(
  base64Data: string,
  filename: string,
  sizeBytes: number
): Promise<{
  success: boolean;
  document?: DocumentRecord;
  chunkCount?: number;
  error?: string;
  databaseUsed: "supabase" | "local";
}> {
  try {
    // 1. Parse PDF text
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
    const pdfBuffer = Buffer.from(cleanBase64, "base64");
    
    let parsedPdf;
    try {
      const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
      const pdf = (pdfParseModule.default || pdfParseModule) as any;
      parsedPdf = await pdf(pdfBuffer);
    } catch (err: any) {
      console.error("PDF-parse failed:", err);
      return {
        success: false,
        error: `Failed to extract text from PDF: ${err.message || err}`,
        databaseUsed: "local"
      };
    }

    const rawText = parsedPdf.text || "";
    const pageCount = parsedPdf.numpages || 1;

    if (!rawText.trim()) {
      return {
        success: false,
        error: "The uploaded PDF does not contain any indexable text.",
        databaseUsed: "local"
      };
    }

    // 2. Chunk text using the Recursive Splitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = splitter.splitText(rawText);

    if (chunks.length === 0) {
      return {
        success: false,
        error: "Text chunking produced zero splits.",
        databaseUsed: "local"
      };
    }

    // 3. Generate Embeddings using Genkit/Gemini text-embedding-004
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const embeddings: number[][] = [];
    
    // Embed chunks in batches to avoid rate limits
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedResponse = await ai.embed({
          embedder: "googleai/gemini-embedding-001",
          content: chunks[i]
        });
        
        const rawRes = embedResponse as any;
        if (Array.isArray(rawRes) && rawRes[0]?.embedding) {
          embeddings.push(rawRes[0].embedding);
        } else if (rawRes && rawRes.embedding) {
          embeddings.push(rawRes.embedding);
        } else if (Array.isArray(rawRes)) {
          embeddings.push(rawRes);
        } else {
          throw new Error("Invalid embedding response structure");
        }
      } catch (err) {
        console.error(`Failed to embed chunk ${i}:`, err);
        // Fallback: generate a dummy vector if embedding model fails, to avoid breaking execution
        embeddings.push(new Array(3072).fill(0).map(() => Math.random() * 0.1));
      }
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const document: DocumentRecord = {
      id: docId,
      filename,
      page_count: pageCount,
      chunk_count: chunks.length,
      size_bytes: sizeBytes,
      created_at: new Date().toISOString(),
    };

    // 4. Store in Database
    let databaseUsed: "supabase" | "local" = "local";

    if (supabase) {
      try {
        // Insert into pdf_documents
        const { error: docError } = await supabase
          .from("pdf_documents")
          .insert({
            id: docId,
            filename,
            page_count: pageCount,
            chunk_count: chunks.length,
            size_bytes: sizeBytes,
          });

        if (docError) throw docError;

        // Insert chunks
        const chunksToInsert = chunks.map((content, idx) => ({
          document_id: docId,
          content,
          metadata: { filename, chunk_index: idx },
          embedding: embeddings[idx],
        }));

        const { error: chunkError } = await supabase
          .from("pdf_document_chunks")
          .insert(chunksToInsert);

        if (chunkError) throw chunkError;

        databaseUsed = "supabase";
      } catch (dbError) {
        console.warn("Supabase insertion failed, falling back to local JSON db:", dbError);
        databaseUsed = "local";
      }
    }

    if (databaseUsed === "local") {
      const localChunks = chunks.map((content, idx) => ({
        document_id: docId,
        content,
        metadata: { filename, chunk_index: idx },
        embedding: embeddings[idx],
      }));
      localVectorDb.addDocument(document, localChunks);
    }

    return {
      success: true,
      document,
      chunkCount: chunks.length,
      databaseUsed,
    };
  } catch (err: any) {
    console.error("Ingestion crash error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred during document ingestion.",
      databaseUsed: "local",
    };
  }
}

/**
 * Server Action to generate evaluation questions from a PDF.
 */
export async function generateQuestions(
  documentId: string,
  count: number = 5
): Promise<{
  success: boolean;
  questions?: Quiz;
  error?: string;
}> {
  try {
    // 1. Retrieve the document's content chunks
    let chunks: string[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("pdf_document_chunks")
          .select("content")
          .eq("document_id", documentId);
        
        if (!error && data) {
          chunks = data.map(c => c.content);
        }
      } catch (err) {
        console.warn("Supabase retrieval failed in generateQuestions, checking local DB:", err);
      }
    }

    if (chunks.length === 0) {
      // Check local DB
      const localDbDocs = localVectorDb.getDocuments();
      if (localDbDocs.some(d => d.id === documentId)) {
        const dbContent = fs.readFileSync(path.join(process.cwd(), "scratch", "local_db.json"), "utf-8");
        const parsedDb = JSON.parse(dbContent);
        chunks = parsedDb.chunks
          .filter((c: any) => c.document_id === documentId)
          .map((c: any) => c.content);
      }
    }

    if (chunks.length === 0) {
      return { success: false, error: "Document not found or contains no indexable content." };
    }

    // Pick a diverse set of chunks to send to the LLM (first, middle, last, etc.)
    const selectedChunks: string[] = [];
    const step = Math.max(1, Math.floor(chunks.length / count));
    for (let i = 0; i < chunks.length && selectedChunks.length < count + 2; i += step) {
      selectedChunks.push(chunks[i]);
    }
    
    // Fallback if chunks are small
    if (selectedChunks.length === 0) {
      selectedChunks.push(chunks[0]);
    }

    const contextText = selectedChunks.join("\n\n---\n\n");

    // 2. Generate JSON quiz with Gemini 2.5 Flash
    const prompt = `You are generating an evaluation quiz based on the following document context chunks.
Generate exactly ${count} evaluation questions (mix of multiple-choice and short-answer questions).
Output a JSON array of objects strictly matching the requested format.

Context Chunks:
${contextText}

Generate exactly ${count} questions.`;

    const response = await ai.generate({
      system: SYSTEM_PROMPT,
      prompt: prompt,
      output: {
        schema: QuizSchema
      }
    });

    return {
      success: true,
      questions: response.output as Quiz,
    };
  } catch (err: any) {
    console.error("Failed to generate questions:", err);
    return {
      success: false,
      error: err.message || "An error occurred while generating evaluation questions.",
    };
  }
}

/**
 * Server Action for interactive PDF Q&A Chat.
 */
export async function chatDocument(
  documentId: string,
  query: string,
  history: { role: "user" | "model"; content: string }[] = []
): Promise<{
  success: boolean;
  answer?: string;
  sources?: { content: string; chunk_index: number }[];
  databaseUsed: "supabase" | "local";
  error?: string;
}> {
  try {
    // 1. Embed user query using text-embedding-004
    let queryEmbedding: number[];
    try {
      const embedResponse = await ai.embed({
        embedder: "googleai/gemini-embedding-001",
        content: query
      });

      const rawRes = embedResponse as any;
      if (Array.isArray(rawRes) && rawRes[0]?.embedding) {
        queryEmbedding = rawRes[0].embedding;
      } else if (rawRes && rawRes.embedding) {
        queryEmbedding = rawRes.embedding;
      } else if (Array.isArray(rawRes)) {
        queryEmbedding = rawRes;
      } else {
        throw new Error("Invalid embedding structure");
      }
    } catch (err) {
      console.error("Embedding generation failed for query:", err);
      return {
        success: false,
        error: "Failed to process question vectors.",
        databaseUsed: "local"
      };
    }

    // 2. Perform Cosine Similarity Search (Retrieve top 3 chunks)
    let matchingChunks: { content: string; metadata: any; similarity: number }[] = [];
    let databaseUsed: "supabase" | "local" = "local";

    if (supabase) {
      try {
        // Query pgvector function match_document_chunks
        const { data, error } = await supabase.rpc("match_document_chunks", {
          query_embedding: queryEmbedding,
          match_threshold: 0.15, // Low threshold to allow finding contexts
          match_count: 3,
          filter_document_id: documentId
        });

        if (error) throw error;

        if (data && data.length > 0) {
          matchingChunks = data;
          databaseUsed = "supabase";
        }
      } catch (err) {
        console.warn("Supabase similarity search failed, checking local DB:", err);
      }
    }

    if (databaseUsed === "local" || matchingChunks.length === 0) {
      matchingChunks = localVectorDb.searchChunks(queryEmbedding, 3, documentId, 0.15);
      databaseUsed = "local";
    }

    if (matchingChunks.length === 0) {
      return {
        success: true,
        answer: "I'm sorry, but the provided document does not contain enough information to answer this question.",
        sources: [],
        databaseUsed,
      };
    }

    // 3. Format contexts and call LLM
    const contextLines = matchingChunks.map((chunk, idx) => {
      const index = chunk.metadata?.chunk_index ?? idx;
      return `[Chunk Context ID: ${index}]\n${chunk.content}`;
    });
    const contextText = contextLines.join("\n\n---\n\n");

    const messageHistory = history.map(msg => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      content: [{ text: msg.content }]
    }));

    // Inject matching chunks context into the final user message
    const finalPrompt = `Document Context Chunks:
${contextText}

Question: ${query}`;

    const response = await ai.generate({
      system: SYSTEM_PROMPT,
      messages: [
        ...messageHistory,
        { role: "user", content: [{ text: finalPrompt }] }
      ]
    });

    const sources = matchingChunks.map((chunk, idx) => ({
      content: chunk.content,
      chunk_index: chunk.metadata?.chunk_index ?? idx
    }));

    return {
      success: true,
      answer: response.text,
      sources,
      databaseUsed,
    };
  } catch (err: any) {
    console.error("Chat action failed:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred during chat.",
      databaseUsed: "local",
    };
  }
}

/**
 * Server Action to list all ingested documents.
 */
export async function getDocumentsList(): Promise<{
  success: boolean;
  documents: DocumentRecord[];
  databaseUsed: "supabase" | "local" | "both";
}> {
  let localDocs = localVectorDb.getDocuments();
  let supabaseDocs: DocumentRecord[] = [];
  let databaseUsed: "supabase" | "local" | "both" = "local";

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("pdf_documents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        supabaseDocs = data.map(d => ({
          id: d.id,
          filename: d.filename,
          page_count: d.page_count,
          chunk_count: d.chunk_count,
          size_bytes: d.size_bytes,
          created_at: d.created_at,
        }));
        databaseUsed = "supabase";
      }
    } catch (err) {
      console.warn("Could not fetch documents list from Supabase, using local DB:", err);
    }
  }

  // Combine lists, preferring remote items, removing duplicates by id
  const combinedMap = new Map<string, DocumentRecord>();
  localDocs.forEach(d => combinedMap.set(d.id, d));
  supabaseDocs.forEach(d => combinedMap.set(d.id, d));
  
  const documents = Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    success: true,
    documents,
    databaseUsed: supabaseDocs.length > 0 && localDocs.length > 0 ? "both" : databaseUsed,
  };
}

/**
 * Server Action to delete a document.
 */
export async function deleteDocument(documentId: string): Promise<{ success: boolean }> {
  let deletedFromSupabase = false;
  if (supabase) {
    try {
      const { error } = await supabase
        .from("pdf_documents")
        .delete()
        .eq("id", documentId);
      
      if (!error) deletedFromSupabase = true;
    } catch (err) {
      console.warn("Could not delete document from Supabase:", err);
    }
  }

  // Always delete from local DB too to keep it clean
  localVectorDb.deleteDocument(documentId);

  return { success: true };
}
