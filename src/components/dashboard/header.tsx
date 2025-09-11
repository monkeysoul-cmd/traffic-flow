'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bell, ChevronDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { AlertTriangle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const highPriorityIncidents = [
  { id: "INC-001", location: "MG Road & Brigade Road", type: "Accident", time: "10:45 AM" },
  { id: "INC-004", location: "Marine Drive", type: "Accident", time: "9:50 AM" },
];

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {highPriorityIncidents.length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{highPriorityIncidents.length}</Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <AlertTriangle className='w-5 h-5 text-destructive'/> High-Priority Alerts
              </CardTitle>
              <CardDescription>
                {highPriorityIncidents.length} active high-priority incidents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="flex flex-col">
                  {highPriorityIncidents.map((incident) => (
                    <Link href="/dashboard#emergency-dispatch" key={incident.id} className="text-sm p-3 hover:bg-muted/50 rounded-md">
                      <div className="font-medium">{incident.location}</div>
                      <div className="text-xs text-muted-foreground">
                        {incident.type} at {incident.time}
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9">
            <span className="font-medium">bitfusion</span>
            <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">bitfusion</p>
              <p className="text-xs leading-none text-muted-foreground">
                admin@trafficflow.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/history">History</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">Log out</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
