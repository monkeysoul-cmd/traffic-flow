import { create } from "zustand";
import { produce } from "immer";
import { Quiz } from "@/ai/flows/rag-flows";
import { DocumentRecord } from "@/lib/local-vector-db";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  sources?: { content: string; chunk_index: number }[];
  databaseUsed?: "supabase" | "local";
  timestamp: string;
}

interface HistoryStoreState {
  documents: DocumentRecord[];
  selectedDocumentId: string | null;
  quizQuestions: Quiz;
  chatHistory: ChatMessage[];
  isLoadingDocs: boolean;
  isIngesting: boolean;
  isGeneratingQuiz: boolean;
  isChatting: boolean;
  databaseEngine: "supabase" | "local" | "both";
  
  setDocuments: (docs: DocumentRecord[]) => void;
  setSelectedDocumentId: (id: string | null) => void;
  setQuizQuestions: (questions: Quiz) => void;
  addChatMessage: (msg: Omit<ChatMessage, "timestamp">) => void;
  clearChatHistory: () => void;
  setIsLoadingDocs: (loading: boolean) => void;
  setIsIngesting: (ingesting: boolean) => void;
  setIsGeneratingQuiz: (generating: boolean) => void;
  setIsChatting: (chatting: boolean) => void;
  setDatabaseEngine: (engine: "supabase" | "local" | "both") => void;
  deleteDocumentState: (docId: string) => void;
}

export const useHistoryStore = create<HistoryStoreState>()((set) => ({
  documents: [],
  selectedDocumentId: null,
  quizQuestions: [],
  chatHistory: [],
  isLoadingDocs: false,
  isIngesting: false,
  isGeneratingQuiz: false,
  isChatting: false,
  databaseEngine: "local",

  setDocuments: (documents) => set({ documents }),
  setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId, quizQuestions: [], chatHistory: [] }),
  setQuizQuestions: (quizQuestions) => set({ quizQuestions }),
  
  addChatMessage: (msg) =>
    set(
      produce((state: HistoryStoreState) => {
        state.chatHistory.push({
          ...msg,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      })
    ),
    
  clearChatHistory: () => set({ chatHistory: [] }),
  setIsLoadingDocs: (isLoadingDocs) => set({ isLoadingDocs }),
  setIsIngesting: (isIngesting) => set({ isIngesting }),
  setIsGeneratingQuiz: (isGeneratingQuiz) => set({ isGeneratingQuiz }),
  setIsChatting: (isChatting) => set({ isChatting }),
  setDatabaseEngine: (databaseEngine) => set({ databaseEngine }),
  
  deleteDocumentState: (docId) =>
    set(
      produce((state: HistoryStoreState) => {
        state.documents = state.documents.filter((d) => d.id !== docId);
        if (state.selectedDocumentId === docId) {
          state.selectedDocumentId = null;
          state.quizQuestions = [];
          state.chatHistory = [];
        }
      })
    ),
}));
