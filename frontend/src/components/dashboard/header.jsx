"use client";

import { useEffect, useState } from "react";
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
import { Bell, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge, StatusDot } from "@/components/traffic/status";
import { EmptyState } from "@/components/traffic/state-panels";
import { useHistoryStore } from "@/lib/history-store";
import { clearAuth, getStoredUser } from "@/lib/api";

export default function DashboardHeader() {
  const incidents = useHistoryStore((s) => s.incidents);
  const isScanningActive = useHistoryStore((s) => s.isScanningActive);
  const highPriorityIncidents = incidents.filter((i) => i.priority === "High");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const name = user?.fullName || "bitfusion-I";
  const email = user?.email || "admin@trafficflow.com";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <StatusDot status={isScanningActive ? "free" : "idle"} pulse={isScanningActive} />
        <span className="truncate text-muted-foreground">
          {isScanningActive ? "Live scan running" : "Standby — simulated feed"}
        </span>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Open alerts">
            <Bell className="h-5 w-5" />
            {highPriorityIncidents.length > 0 && (
              <span className="num absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-heavy px-1 text-[10px] font-semibold text-white">
                {highPriorityIncidents.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="border-b p-4">
            <p className="font-headline font-semibold">High-priority alerts</p>
            <p className="text-sm text-muted-foreground">
              {highPriorityIncidents.length} active
            </p>
          </div>
          <ScrollArea className="max-h-60">
            {highPriorityIncidents.length === 0 ? (
              <EmptyState title="No high-priority incidents" hint="New alerts appear here as they are detected." className="py-8" />
            ) : (
              <div className="flex flex-col p-1">
                {highPriorityIncidents.map((incident) => (
                  <Link
                    href="/dashboard#emergency-dispatch"
                    key={incident.id}
                    className="rounded-md p-3 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{incident.type}</span>
                      <StatusBadge status="heavy">High</StatusBadge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {incident.location} · {incident.time}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden font-medium sm:inline">{name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/history">History</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/" onClick={() => clearAuth()}>
              Log out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
