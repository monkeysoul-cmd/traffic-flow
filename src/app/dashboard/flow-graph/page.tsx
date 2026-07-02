"use client";

import React, { useState } from "react";
import { useHistoryStore } from "@/lib/history-store";
import { generateQuestions, Quiz } from "@/ai/flows/rag-flows";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export default function FlowGraphPage() {
  const { toast } = useToast();
  const {
    documents,
    selectedDocumentId,
    quizQuestions,
    setQuizQuestions,
    isGeneratingQuiz,
    setIsGeneratingQuiz,
  } = useHistoryStore();

  const [questionCount, setQuestionCount] = useState(5);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [shortAnswersSubmitted, setShortAnswersSubmitted] = useState<{ [key: number]: boolean }>({});
  const [score, setScore] = useState<number | null>(null);

  const activeDoc = documents.find((doc) => doc.id === selectedDocumentId);

  const handleGenerateQuiz = async () => {
    if (!selectedDocumentId) return;
    setIsGeneratingQuiz(true);
    setAnswers({});
    setShortAnswersSubmitted({});
    setScore(null);

    try {
      const res = await generateQuestions(selectedDocumentId, questionCount);
      if (res.success && res.questions) {
        setQuizQuestions(res.questions);
        toast({
          title: "Quiz Generated",
          description: `Created ${res.questions.length} adaptive evaluation questions from the text.`,
        });
      } else {
        toast({
          title: "Generation failed",
          description: res.error || "Could not generate questions.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during quiz generation.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (questionId: number, option: string) => {
    // Only allow selection if not already answered
    if (answers[questionId] !== undefined) return;
    
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const handleSubmitShortAnswer = (questionId: number) => {
    setShortAnswersSubmitted({
      ...shortAnswersSubmitted,
      [questionId]: true,
    });
  };

  const calculateScore = () => {
    let correctMCQs = 0;
    let mcqCount = 0;

    quizQuestions.forEach((q) => {
      if (q.type === "multiple-choice") {
        mcqCount++;
        if (answers[q.id] === q.correct_answer) {
          correctMCQs++;
        }
      }
    });

    setScore(correctMCQs);
    toast({
      title: "Quiz Completed!",
      description: mcqCount > 0 ? `You scored ${correctMCQs} out of ${mcqCount} multiple-choice questions.` : "Short answers reviewed.",
    });
  };

  const resetQuiz = () => {
    setAnswers({});
    setShortAnswersSubmitted({});
    setScore(null);
  };

  // If no document selected
  if (!selectedDocumentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border-border bg-card p-6 text-center space-y-4 shadow-sm">
          <div className="bg-amber-500/10 text-amber-400 p-4 rounded-full mx-auto w-fit">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold">No Active Document</CardTitle>
          <CardDescription>
            You need to select an active PDF document before generating a quiz. Go to the Overview page to select one.
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-emerald-400" />
          Adaptive Quiz Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate custom evaluation quizzes from the text of <strong>{activeDoc?.filename}</strong>.
        </p>
      </div>

      {/* Quiz Config Form */}
      {quizQuestions.length === 0 && !isGeneratingQuiz && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Configure Evaluation Quiz</CardTitle>
            <CardDescription>
              Select the number of questions. The system will pull diverse content chunks and synthesize custom test items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qCount" className="text-sm font-semibold">
                Number of Questions
              </Label>
              <Input
                id="qCount"
                type="number"
                min={3}
                max={15}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                className="max-w-xs border-border"
              />
              <span className="text-xs text-muted-foreground block">
                Generates a mixture of multiple-choice and conceptual short-answer items.
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateQuiz} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
              Generate Questions
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Loading State */}
      {isGeneratingQuiz && (
        <Card className="border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
          <CardTitle className="text-lg font-bold">Synthesizing Evaluation Questions...</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Gemini is reading context chunks of the PDF to design conceptual, data analysis, and critical thinking questions. This may take up to 10 seconds.
          </CardDescription>
        </Card>
      )}

      {/* Quiz Questions Render */}
      {quizQuestions.length > 0 && !isGeneratingQuiz && (
        <div className="space-y-6">
          {quizQuestions.map((q, idx) => {
            const isMCQ = q.type === "multiple-choice";
            const isAnswered = isMCQ ? answers[q.id] !== undefined : shortAnswersSubmitted[q.id];

            return (
              <Card
                key={q.id}
                className={`border bg-card shadow-sm transition-all duration-300 ${
                  isAnswered ? "border-emerald-500/30" : "border-border"
                }`}
              >
                <CardHeader className="pb-3 flex flex-row items-start gap-3">
                  <span className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1.5 rounded-lg text-sm">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      {q.type === "multiple-choice" ? "Multiple Choice" : "Short Answer"}
                    </span>
                    <CardTitle className="text-lg font-bold mt-1 text-foreground leading-snug">
                      {q.question}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-1">
                  {/* Multiple Choice Options */}
                  {isMCQ && q.type === "multiple-choice" && (
                    <div className="grid gap-2">
                      {q.options.map((option) => {
                        const isSelected = answers[q.id] === option;
                        const isCorrect = option === q.correct_answer;
                        const hasSelectedWrong = isSelected && !isCorrect;

                        return (
                          <button
                            key={option}
                            onClick={() => handleSelectOption(q.id, option)}
                            className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-center justify-between ${
                              isAnswered
                                ? isCorrect
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-medium"
                                  : hasSelectedWrong
                                    ? "bg-red-500/10 border-red-500/40 text-red-400"
                                    : "bg-muted/50 border-border text-muted-foreground"
                                : "border-border hover:border-emerald-500/30 hover:bg-muted/30 text-foreground"
                            }`}
                          >
                            <span>{option}</span>
                            {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                            {isAnswered && hasSelectedWrong && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Answer Input */}
                  {!isMCQ && q.type === "short-answer" && (
                    <div className="space-y-3">
                      {!isAnswered ? (
                        <>
                          <textarea
                            placeholder="Draft your conceptual response here..."
                            rows={3}
                            className="w-full rounded-lg border border-border p-3 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSubmitShortAnswer(q.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            Submit Answer
                          </Button>
                        </>
                      ) : (
                        <div className="bg-muted/40 border border-border rounded-lg p-3.5 space-y-2 text-sm">
                          <span className="text-xs font-bold text-muted-foreground uppercase">Expected Rubric / Key points:</span>
                          <p className="font-semibold text-emerald-400">{q.correct_answer}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation card displayed once answered */}
                  {isAnswered && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 space-y-1.5 text-sm leading-relaxed animate-fade-in mt-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase">
                        <HelpCircle className="h-4 w-4" /> Explanation
                      </div>
                      <p className="text-muted-foreground">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Quiz Action Footer */}
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetQuiz} className="border-border gap-2">
                <RotateCcw className="h-4 w-4" /> Reset Answers
              </Button>
              <Button variant="ghost" onClick={() => setQuizQuestions([])} className="text-muted-foreground hover:text-foreground">
                Generate Different Quiz
              </Button>
            </div>
            
            {score === null ? (
              <Button
                onClick={calculateScore}
                disabled={quizQuestions.some((q) => {
                  if (q.type === "multiple-choice") return answers[q.id] === undefined;
                  return shortAnswersSubmitted[q.id] === undefined;
                })}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Grade Quiz
              </Button>
            ) : (
              <div className="text-sm font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg">
                Score: {score} MCQ Correct
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
