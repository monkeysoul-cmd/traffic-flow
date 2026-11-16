"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Car, Gauge, AlertTriangle, Activity, Bot, TrafficCone, Siren, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveTrafficControl from "./live-traffic-control";
import { ScrollArea } from "../ui/scroll-area";
import EmergencyDispatch from "./emergency-dispatch";
import CameraViews from "./camera-views";
import OverviewLayout from "./overview-layout";
import { useHistoryStore } from "@/lib/history-store";
import PageHeader from "@/components/traffic/page-header";
import KpiCard, { Sparkline } from "@/components/traffic/kpi-card";
import JunctionMap from "@/components/traffic/junction-map";
import TrafficSignal from "@/components/traffic/traffic-signal";
import DensityMeter from "@/components/traffic/density-meter";
import { EmptyState, ErrorBanner } from "@/components/traffic/state-panels";
import { StatusBadge, levelToStatus, STATUS } from "@/components/traffic/status";
import { Skeleton } from "@/components/ui/skeleton";

const SIGNAL_FOR_PRIORITY = { High: "red", Medium: "yellow", Low: "green" };

function speedStatus(speed) {
  if (!speed) return "idle";
  if (speed < 30) return "heavy";
  if (speed < 45) return "moderate";
  return "free";
}

function useTrail(value, max = 24) {
  const [trail, setTrail] = useState([]);
  const last = useRef(null);
  useEffect(() => {
    if (last.current === value) return;
    last.current = value;
    setTrail((t) => [...t, value].slice(-max));
  }, [value, max]);
  return trail;
}

function timeOf(ts) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function Overview() {
  const {
    totalVehiclesBase,
    sessionVehiclesScanned,
    trafficLevel,
    activeAlerts,
    updateScannedVehicles,
    updateLiveCount,
    isScanningActive,
    avgSpeed,
    incidents,
    currentLiveCounts,
    autoPilotMode,
    lightControlHistory,
    dispatchHistory,
    fetchFromBackend,
  } = useHistoryStore();
  const totalVehicles = totalVehiclesBase + sessionVehiclesScanned;
  const [syncState, setSyncState] = useState("connecting");
  const vehicleTrail = useTrail(totalVehicles);
  const speedTrail = useTrail(avgSpeed);

  // Load persisted data from the backend once; fall back to local demo data
  const loadFromBackend = async () => {
    setSyncState("connecting");
    await fetchFromBackend();
    setSyncState(useHistoryStore.getState().backendLoaded ? "synced" : "offline");
  };
  useEffect(() => {
    loadFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background micro-traffic simulator to update the dashboard stats in quick intervals
  useEffect(() => {
    if (isScanningActive) return; // Pause simulator if active YOLO scanning is running

    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const nextCount = Math.max(0, sessionVehiclesScanned + delta);
      updateScannedVehicles(nextCount);

      const liveDelta = Math.floor(Math.random() * 7) - 3; // -3 to +3
      const baseLiveCount = 20;
      const currentLive = Math.max(0, baseLiveCount + liveDelta);
      updateLiveCount("MG Road & Brigade Road: Lane 1", currentLive);
    }, 5000); // 5 second intervals

    return () => clearInterval(interval);
  }, [sessionVehiclesScanned, updateScannedVehicles, updateLiveCount, isScanningActive]);

  const levelStatus = levelToStatus(trafficLevel);
  const levelFill = { Low: 0.25, Medium: 0.55, High: 0.9 }[trafficLevel] ?? 0;
  const lastSignal = lightControlHistory[0];
  const lastDispatch = [...dispatchHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Control center"
        description="MG Road & Brigade Road — live traffic, signals and emergency response."
        icon={Activity}
        actions={
          <StatusBadge status={syncState === "synced" ? "free" : syncState === "offline" ? "moderate" : "idle"}>
            {syncState === "synced" ? "Synced with server" : syncState === "offline" ? "Local data" : "Connecting…"}
          </StatusBadge>
        }
      />

      {syncState === "offline" && (
        <ErrorBanner
          title="Can't reach the traffic server"
          action={
            <Button variant="outline" size="sm" onClick={loadFromBackend}>
              <CloudOff className="h-4 w-4" /> Retry
            </Button>
          }
        >
          Showing local demo data. Check that the API is running and you're signed in, then retry.
        </ErrorBanner>
      )}

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {syncState === "connecting" ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[118px] rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total vehicles" value={totalVehicles.toLocaleString()} status={levelStatus} href="/dashboard/flow-graph">
              <Sparkline values={vehicleTrail} color={STATUS[levelStatus].color} />
            </KpiCard>
            <KpiCard label="Average speed" value={avgSpeed} unit="km/h" status={speedStatus(avgSpeed)} href="/dashboard/flow-graph">
              {avgSpeed ? (
                <Sparkline values={speedTrail} color={STATUS[speedStatus(avgSpeed)].color} />
              ) : (
                <p className="text-xs text-muted-foreground">Starts when a scan is running</p>
              )}
            </KpiCard>
            <KpiCard label="Traffic level" value={trafficLevel} status={levelStatus} icon={Gauge}>
              <DensityMeter value={levelFill} status={levelStatus} />
            </KpiCard>
            <KpiCard label="Active alerts" value={activeAlerts} status={activeAlerts > 0 ? "heavy" : "free"} icon={AlertTriangle}>
              <p className="text-xs text-muted-foreground">
                {activeAlerts > 0 ? "Review incidents and dispatch units" : "Nothing needs attention"}
              </p>
            </KpiCard>
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Junction status</CardTitle>
            <CardDescription>Select a lane to see its live count and open incidents.</CardDescription>
          </CardHeader>
          <CardContent>
            <JunctionMap incidents={incidents} liveCounts={currentLiveCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How the system is responding</CardTitle>
            <CardDescription>Latest automated and manual actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">AI auto-pilot {autoPilotMode ? "is on" : "is off"}</p>
                <p className="text-muted-foreground">
                  {autoPilotMode
                    ? "Signals follow live vehicle counts."
                    : "Signals are under manual control."}
                </p>
              </div>
            </div>
            <div className="lane-divider" aria-hidden="true" />
            <div className="flex items-start gap-3">
              <TrafficCone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-medium">Last signal change</p>
                {lastSignal ? (
                  <p className="text-muted-foreground">
                    {lastSignal.action} · {lastSignal.location} · {timeOf(lastSignal.timestamp)}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No signal changes yet.</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Siren className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-medium">Last dispatch</p>
                {lastDispatch ? (
                  <p className="text-muted-foreground">
                    <span className="capitalize">{lastDispatch.unit}</span> to {lastDispatch.location} · {timeOf(lastDispatch.timestamp)}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No units dispatched yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <OverviewLayout
        left={<CameraViews incidents={incidents} />}
        right={
          <div className="space-y-6">
            <LiveTrafficControl incidents={incidents} />
            <Card>
              <CardHeader>
                <CardTitle>Recent incidents</CardTitle>
                <CardDescription>Live feed of detected traffic incidents.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {incidents.length === 0 ? (
                  <EmptyState title="No incidents" hint="Detected incidents will be listed here with their priority." />
                ) : (
                  <ScrollArea className="h-72">
                    <ul className="divide-y border-t">
                      {incidents.map((incident) => (
                        <li key={incident.id} className="flex items-center gap-4 px-5 py-3">
                          <TrafficSignal active={SIGNAL_FOR_PRIORITY[incident.priority]} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{incident.type}</p>
                            <p className="text-xs text-muted-foreground">{incident.location}</p>
                            <p className="num mt-0.5 text-xs text-muted-foreground">
                              {incident.id} · {incident.time}
                            </p>
                          </div>
                          <StatusBadge status={levelToStatus(incident.priority)}>{incident.priority}</StatusBadge>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
            <div id="emergency-dispatch" className="scroll-mt-20">
              <EmergencyDispatch incidents={incidents} />
            </div>
          </div>
        }
      />
    </div>
  );
}
