"use client";

import React, { useState, useRef, useEffect } from "react";
import { useHistoryStore } from "@/lib/history-store";
import { chatDocument } from "@/ai/flows/rag-flows";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  AlertCircle,
  ArrowRight,
  Database,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

export default function History() {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    documents,
    selectedDocumentId,
    chatHistory,
    addChatMessage,
    isChatting,
    setIsChatting,
    clearChatHistory,
  } = useHistoryStore();

  const [input, setInput] = useState("");
  const [expandedSources, setExpandedSources] = useState<{ [key: number]: boolean }>({});

  const activeDoc = documents.find((doc) => doc.id === selectedDocumentId);

  // Auto-scroll chat area when messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chatHistory, isChatting]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedDocumentId) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to state
    addChatMessage({
      role: "user",
      content: userMessage,
    });

    setIsChatting(true);

    try {
      // Map history to simple LLM array
      const historyPayload = chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call RAG server action
      const res = await chatDocument(selectedDocumentId, userMessage, historyPayload);

      if (res.success && res.answer) {
        addChatMessage({
          role: "model",
          content: res.answer,
          sources: res.sources,
          databaseUsed: res.databaseUsed,
        });
      } else {
        toast({
          title: "Chat Error",
          description: res.error || "Failed to retrieve answer from AI.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Unexpected Error",
        description: "Could not send query to backend.",
        variant: "destructive",
      });
    } finally {
      setIsChatting(false);
    }
  };

  const toggleSourceExpand = (msgIdx: number) => {
    setExpandedSources({
      ...expandedSources,
      [msgIdx]: !expandedSources[msgIdx],
    });
  };

  // If no active doc
  if (!selectedDocumentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border-border bg-card p-6 text-center space-y-4 shadow-sm">
          <div className="bg-amber-500/10 text-amber-400 p-4 rounded-full mx-auto w-fit">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold">No Active Document</CardTitle>
          <CardDescription>
            You need to select an active PDF document before entering chat mode. Go to the Overview page to select one.
          </CardDescription>
          <div className="pt-2">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
              <Link href="/dashboard">
                Go to Overview <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-border bg-card max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[500px] shadow-sm">
      <CardHeader className="border-b border-border py-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="text-left">
            <CardTitle className="text-base font-bold line-clamp-1">{activeDoc?.filename}</CardTitle>
            <CardDescription className="text-xs">
              Contextual grounding search enabled • {activeDoc?.chunk_count} chunks
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChatHistory} className="text-xs hover:text-red-400">
          Clear Conversation
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <ScrollArea ref={scrollAreaRef} className="h-full p-6">
          <div className="space-y-6 pb-6">
            {/* Greeting */}
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 bg-muted/20 border border-dashed border-border rounded-2xl max-w-md mx-auto mt-8">
                <Bot className="h-10 w-10 text-emerald-400" />
                <h3 className="font-bold text-base text-foreground">Interactive QA Engine Ready</h3>
                <p className="text-xs text-muted-foreground">
                  Ask specific questions about the concepts, formulas, statistics, or details in this document. 
                  Answers are strictly grounded in extracted chunks.
                </p>
              </div>
            )}

            {/* Message Thread */}
            {chatHistory.map((msg, idx) => {
              const isAI = msg.role === "model";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${
                    isAI ? "text-left mr-auto" : "flex-row-reverse text-left ml-auto"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                      isAI ? "bg-emerald-600" : "bg-zinc-600"
                    }`}
                  >
                    {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className="space-y-2 w-full">
                    {/* Speech Bubble */}
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isAI
                          ? "bg-muted text-foreground rounded-tl-none border border-border"
                          : "bg-emerald-600 text-white rounded-tr-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Sources Indicator */}
                    {isAI && msg.sources && msg.sources.length > 0 && (
                      <div className="text-xs border border-border rounded-xl overflow-hidden bg-muted/40">
                        <button
                          onClick={() => toggleSourceExpand(idx)}
                          className="flex items-center justify-between w-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider">
                            <Info className="h-3.5 w-3.5 text-emerald-400" />
                            Grounding Context Sources ({msg.sources.length})
                          </span>
                          {expandedSources[idx] ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        
                        {expandedSources[idx] && (
                          <div className="border-t border-border bg-card p-3 space-y-3 divide-y divide-border/60 animate-fade-in">
                            {msg.sources.map((src, srcIdx) => (
                              <div key={srcIdx} className={`pt-2.5 first:pt-0 text-[12px] text-muted-foreground`}>
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                                    Chunk #{src.chunk_index}
                                  </Badge>
                                </div>
                                <p className="leading-relaxed bg-muted/20 p-2 rounded italic text-foreground/90 font-mono text-[11.5px] border border-border/40">
                                  "{src.content}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking state indicator */}
            {isChatting && (
              <div className="flex gap-3 max-w-[85%] text-left mr-auto">
                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted text-muted-foreground rounded-2xl rounded-tl-none border border-border p-4 flex items-center gap-2 text-sm shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Searching vectors and generating response...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t border-border p-4 bg-muted/30">
        <form onSubmit={handleSend} className="flex w-full gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isChatting}
            placeholder={`Ask anything about "${activeDoc?.filename}"...`}
            className="flex-1 bg-background border-border text-sm"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isChatting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
