"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/traffic/state-panels";
import { cn } from "@/lib/utils";
import {
  TrafficCone,
  Timer,
  Maximize,
  Minimize,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useHistoryStore } from "@/lib/history-store";

const TrafficLightController = ({
  incident,
  controllerState,
  onStateChange,
}) => {
  const { lightState, duration, remaining, isRunning } = controllerState;
  const timerRef = useRef(null);
  const { addLightControlLog } = useHistoryStore();

  useEffect(() => {
    if (isRunning && remaining > 0) {
      timerRef.current = setTimeout(() => {
        onStateChange({ remaining: remaining - 1 });
      }, 1000);
    } else if (remaining === 0 && isRunning) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      onStateChange({ isRunning: false });
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [remaining, isRunning, onStateChange]);

  const handleStart = () => {
    if (!isRunning) {
      let newRemaining = remaining;
      if (remaining <= 0) {
        newRemaining = duration;
      }
      onStateChange({ isRunning: true, remaining: newRemaining });
      addLightControlLog({
        location: incident.location,
        action: `Set to ${lightState.toUpperCase()} for ${newRemaining}s`,
        user: "bitfusion-I",
      });
    }
  };

  const handleReset = () => {
    onStateChange({ isRunning: false, remaining: duration });
    addLightControlLog({
      location: incident.location,
      action: "Cycle Reset",
      user: "bitfusion-I",
    });
  };

  const handleAdd10s = () => {
    if (isRunning) {
      onStateChange({ remaining: remaining + 10 });
    } else {
      const newDuration = duration + 10;
      onStateChange({ duration: newDuration, remaining: newDuration });
    }
  };

  const handleSubtract5s = () => {
    if (isRunning) {
      onStateChange({ remaining: Math.max(0, remaining - 5) });
    } else {
      const newDuration = Math.max(0, duration - 5);
      onStateChange({ duration: newDuration, remaining: newDuration });
    }
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value, 10) || 0;
    if (!isRunning) {
      onStateChange({ duration: newDuration, remaining: newDuration });
    } else {
      onStateChange({ duration: newDuration });
    }
  };

  const handleLightStateChange = (newLightState) => {
    onStateChange({ lightState: newLightState });
    addLightControlLog({
      location: incident.location,
      action: `Set to ${newLightState.toUpperCase()}`,
      user: "bitfusion-I",
    });
  };

  const lamps = [
    { key: "red", label: "Red", on: "bg-red-500 shadow-[0_0_12px_2px_rgba(239,68,68,0.55)]" },
    { key: "yellow", label: "Yellow", on: "bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.55)]" },
    { key: "green", label: "Green", on: "bg-emerald-500 shadow-[0_0_12px_2px_rgba(16,185,129,0.55)]" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex items-center gap-3">
        <div
          role="radiogroup"
          aria-label={`Signal state at ${incident.location}`}
          className="flex gap-1.5 rounded-full border bg-black/40 p-1.5"
        >
          {lamps.map((l) => (
            <button
              key={l.key}
              type="button"
              role="radio"
              aria-checked={lightState === l.key}
              aria-label={`Set ${l.label}`}
              onClick={() => handleLightStateChange(l.key)}
              className={cn(
                "h-6 w-6 rounded-full transition-all duration-200 hover:scale-110",
                lightState === l.key ? l.on : "bg-white/10 hover:bg-white/20",
              )}
            />
          ))}
        </div>
        <span className="w-12 text-sm font-medium capitalize">{lightState}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-20">
          <Input
            type="number"
            value={duration}
            onChange={handleDurationChange}
            aria-label="Green time in seconds"
            className="h-9 pr-6 text-center"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            s
          </span>
        </div>
        <Button size="sm" onClick={handleStart} disabled={isRunning} className="w-20">
          {isRunning ? "Running" : "Start"}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="flex min-w-[64px] items-center gap-1.5 rounded-md border px-2 py-1"
          aria-live="off"
        >
          <Timer className={cn("h-4 w-4", isRunning ? "text-primary" : "text-muted-foreground")} />
          <span className="num text-base font-semibold">{remaining}s</span>
        </span>
        <Button size="icon" variant="outline" onClick={handleAdd10s} aria-label="Add 10 seconds" className="h-8 w-8">
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleSubtract5s} aria-label="Subtract 5 seconds" className="h-8 w-8">
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleReset} aria-label="Reset cycle" className="h-8 w-8">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

const LiveTrafficControlContent = ({
  incidents,
  controllerStates,
  onControllerStateChange,
  isFullScreen = false,
  autoPilotMode,
  onToggleAutoPilot,
}) => (
  <>
    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <CardTitle className="flex items-center gap-2">
          <TrafficCone className="h-5 w-5 text-primary" />
          Live traffic light control
        </CardTitle>
        <CardDescription className="mt-1">
          {autoPilotMode
            ? "AI auto-pilot is managing lanes based on YOLO video data."
            : "Manually override traffic signals for active incident locations."}
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={autoPilotMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleAutoPilot}
          aria-pressed={autoPilotMode}
          className="gap-2"
        >
          <span
            aria-hidden="true"
            className={cn("h-2 w-2 rounded-full", autoPilotMode ? "bg-status-free live-dot" : "bg-status-idle")}
          />
          Auto-pilot {autoPilotMode ? "on" : "off"}
        </Button>
        {!isFullScreen && (
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Expand signal control">
              <Maximize className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        )}
        {isFullScreen && (
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Collapse signal control">
              <Minimize className="h-4 w-4" />
            </Button>
          </DialogClose>
        )}
      </div>
    </CardHeader>
    <CardContent className="p-0">
      {incidents.length === 0 ? (
        <EmptyState
          title="No signals to control"
          hint="Signals appear here once an incident is reported at a location."
        />
      ) : (
        <ul className="divide-y border-t">
          {(isFullScreen ? incidents : incidents.slice(0, 4)).map((incident) => {
            const controllerState = controllerStates[incident.id];
            if (!controllerState) return null;
            return (
              <li key={incident.id} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">{incident.location}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {autoPilotMode && <span className="text-status-free">Auto-controlled</span>}
                    <span className="num">{incident.id}</span>
                  </span>
                </div>
                <TrafficLightController
                  incident={incident}
                  controllerState={controllerState}
                  onStateChange={(newState) => onControllerStateChange(incident.id, newState)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </CardContent>
  </>
);

export default function LiveTrafficControl({ incidents }) {
  const [controllerStates, setControllerStates] = useState({});

  // Zustand state properties
  const { 
    autoPilotMode, 
    toggleAutoPilot, 
    currentLiveCounts, 
    addLightControlLog 
  } = useHistoryStore();

  useEffect(() => {
    setControllerStates((prevStates) => {
      const newStates = { ...prevStates };
      let updated = false;
      incidents.forEach((incident) => {
        if (!newStates[incident.id]) {
          newStates[incident.id] = {
            lightState: "red",
            duration: 30,
            remaining: 30,
            isRunning: false,
          };
          updated = true;
        }
      });
      return updated ? newStates : prevStates;
    });
  }, [incidents]);

  const handleControllerStateChange = (incidentId, newState) => {
    setControllerStates((prev) => ({
      ...prev,
      [incidentId]: { ...prev[incidentId], ...newState },
    }));
  };

  // Automated AI Auto-Pilot Light Control loop based on live vehicle counts
  useEffect(() => {
    if (autoPilotMode) {
      incidents.forEach((incident) => {
        const count = currentLiveCounts[incident.location];
        if (count !== undefined) {
          // Dynamic calculation: If vehicles present, clear lane by turning Green.
          // Higher count = longer green duration. If count is 0/low, set to Red.
          let targetState = "red";
          let targetDuration = 30;

          if (count > 5) {
            targetState = "green";
            targetDuration = Math.max(15, Math.min(90, count * 2)); // 2s per vehicle
          }

          const current = controllerStates[incident.id];
          if (current && (current.lightState !== targetState || current.duration !== targetDuration)) {
            handleControllerStateChange(incident.id, {
              lightState: targetState,
              duration: targetDuration,
              remaining: targetDuration,
              isRunning: true,
            });

            // Automatically register and save logs to Supabase
            addLightControlLog({
              location: incident.location,
              action: `AI Auto-Pilot: Set to ${targetState.toUpperCase()} for ${targetDuration}s (${count} vehicles)`,
              user: "AI-Auto-Pilot",
            });
          }
        }
      });
    }
  }, [currentLiveCounts, autoPilotMode, incidents, controllerStates]);

  return (
    <Dialog>
      <Card>
        <LiveTrafficControlContent
          incidents={incidents}
          controllerStates={controllerStates}
          onControllerStateChange={handleControllerStateChange}
          autoPilotMode={autoPilotMode}
          onToggleAutoPilot={toggleAutoPilot}
        />
      </Card>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <ScrollArea className="h-full w-full [&>div>div[style*='display:block;']]:!hidden">
          <LiveTrafficControlContent
            incidents={incidents}
            controllerStates={controllerStates}
            onControllerStateChange={handleControllerStateChange}
            isFullScreen={true}
            autoPilotMode={autoPilotMode}
            onToggleAutoPilot={toggleAutoPilot}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
