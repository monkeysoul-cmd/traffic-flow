"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, ChevronDown, BookOpen, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHistoryStore } from "@/lib/history-store";

export default function DashboardHeader() {
  const { documents, selectedDocumentId } = useHistoryStore();
  const activeDoc = documents.find(d => d.id === selectedDocumentId);

  // Mock document alerts
  const notifications = activeDoc 
    ? [
        {
          id: "notif-1",
          title: "Embedding Synced",
          message: `"${activeDoc.filename}" was indexed successfully into RAG vectors.`,
          time: "Just now",
        }
      ]
    : [];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6">
      <SidebarTrigger className="md:hidden text-foreground" />
      <div className="flex-1" />

      {/* Notifications Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 justify-center items-center p-0 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white border-0"
              >
                {notifications.length}
              </Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 border-border bg-card" align="end">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <BookOpen className="w-5 h-5 text-emerald-400" /> RAG System Alerts
              </CardTitle>
              <CardDescription>
                {notifications.length === 0 
                  ? "No new notifications." 
                  : `${notifications.length} active system event.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              {notifications.length > 0 ? (
                <ScrollArea className="h-24">
                  <div className="flex flex-col gap-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="text-xs p-3 hover:bg-muted/50 rounded-lg border border-transparent transition-all"
                      >
                        <div className="font-bold text-foreground">{notif.title}</div>
                        <div className="text-muted-foreground mt-0.5">{notif.message}</div>
                        <div className="text-[10px] text-muted-foreground/60 mt-1">{notif.time}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
                  <AlertCircle className="h-5 w-5 text-muted-foreground/40 mb-1" />
                  No documents currently processing.
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* User profile dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 hover:bg-muted text-foreground px-3 gap-2">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center justify-center">
              A
            </div>
            <span className="font-semibold text-sm">Ayush</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-border bg-card" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-foreground">Ayush</p>
              <p className="text-xs leading-none text-muted-foreground mt-0.5">ayush@example.com</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="border-border" />
          <DropdownMenuItem asChild className="hover:bg-muted">
            <Link href="/dashboard/profile" className="w-full">
              Developer Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-muted text-red-400 focus:text-red-300">
            <Link href="/" className="w-full">
              Sign Out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
