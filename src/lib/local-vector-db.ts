import * as fs from "fs";
import * as path from "path";

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  metadata: {
    filename: string;
    chunk_index: number;
    [key: string]: any;
  };
  embedding: number[];
}

export interface DocumentRecord {
  id: string;
  filename: string;
  page_count: number;
  chunk_count: number;
  size_bytes: number;
  created_at: string;
}

interface LocalDatabase {
  documents: DocumentRecord[];
  chunks: DocumentChunk[];
}

const DB_DIR = path.join(process.cwd(), "scratch");
const DB_FILE = path.join(DB_DIR, "local_db.json");

function ensureDbExists(): LocalDatabase {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: LocalDatabase = { documents: [], chunks: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading local vector DB, resetting:", error);
    const initial: LocalDatabase = { documents: [], chunks: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

function saveDb(db: LocalDatabase): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  
  if (vecA.length !== vecB.length) {
    console.warn(`Vector dimensions mismatch: A is ${vecA.length}, B is ${vecB.length}. Padding or truncating...`);
    const targetLen = Math.min(vecA.length, vecB.length);
    vecA = vecA.slice(0, targetLen);
    vecB = vecB.slice(0, targetLen);
  }

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const localVectorDb = {
  getDocuments(): DocumentRecord[] {
    const db = ensureDbExists();
    return db.documents;
  },

  addDocument(doc: DocumentRecord, chunks: Omit<DocumentChunk, "id">[]): void {
    const db = ensureDbExists();
    
    // Overwrite document and chunks if they exist
    db.documents = db.documents.filter(d => d.id !== doc.id);
    db.chunks = db.chunks.filter(c => c.document_id !== doc.id);
    
    const chunksWithId = chunks.map((c, index) => ({
      ...c,
      id: `${doc.id}-chunk-${index}`
    }));
    
    db.documents.push(doc);
    db.chunks.push(...chunksWithId);
    
    saveDb(db);
  },

  deleteDocument(docId: string): void {
    const db = ensureDbExists();
    db.documents = db.documents.filter(d => d.id !== docId);
    db.chunks = db.chunks.filter(c => c.document_id !== docId);
    saveDb(db);
  },

  searchChunks(
    queryEmbedding: number[], 
    matchCount: number, 
    filterDocumentId?: string, 
    matchThreshold: number = 0.3
  ) {
    const db = ensureDbExists();
    let candidates = db.chunks;
    
    if (filterDocumentId) {
      candidates = candidates.filter(c => c.document_id === filterDocumentId);
    }
    
    const results = candidates.map(chunk => {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        id: chunk.id,
        content: chunk.content,
        metadata: {
          ...chunk.metadata,
          document_id: chunk.document_id
        },
        similarity
      };
    });
    
    return results
      .filter(r => r.similarity >= matchThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, matchCount);
  }
};
