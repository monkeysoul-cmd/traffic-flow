"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@pdfscholar.com");
  const [password, setPassword] = useState("password");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md border-border bg-card shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center items-center gap-2.5 mb-2">
            <BookOpen className="h-9 w-9 text-emerald-400" />
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              PDF Scholar RAG
            </h1>
          </div>
          <CardTitle className="text-xl font-bold mt-2">Welcome Back</CardTitle>
          <CardDescription className="text-xs">
            Access your Retrieval-Augmented Generation documents.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border bg-background"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 mt-2">
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
              Sign In <BookOpen className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-emerald-400 hover:underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
