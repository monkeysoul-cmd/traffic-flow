"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { STATUS, StatusBadge, levelToStatus } from "./status";
import DensityMeter from "./density-meter";
import { EmptyState } from "./state-panels";
import { MapPin, Radio } from "lucide-react";

const JUNCTION = "MG Road & Brigade Road";

// Presentation-only severity for a lane, derived from data the app already has:
// an open incident wins, then the live in-view vehicle count, else "no data".
function laneStatus(count, incidents) {
  if (incidents.some((i) => i.priority === "High")) return "heavy";
  if (count !== undefined) {
    if (count > 30) return "heavy";
    if (count > 15) return "moderate";
    return "free";
  }
  if (incidents.some((i) => i.priority === "Medium")) return "moderate";
  return "idle";
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export default function JunctionMap({ incidents = [], liveCounts = {}, className }) {
  const reduced = usePrefersReducedMotion();
  const [selected, setSelected] = useState("Lane 1");

  const lanes = useMemo(
    () =>
      ["Lane 1", "Lane 2"].map((lane) => {
        const location = `${JUNCTION}: ${lane}`;
        const laneIncidents = incidents.filter((i) => i.location === location);
        const count = liveCounts[location];
        return {
          lane,
          location,
          count,
          incidents: laneIncidents,
          status: laneStatus(count, laneIncidents),
        };
      }),
    [incidents, liveCounts],
  );

  const byLane = Object.fromEntries(lanes.map((l) => [l.lane, l]));
  const active = byLane[selected];
  const hPath = "M -20 150 L 420 150";
  const vPath = "M 200 -20 L 200 320";
  const dots = (lane, path, horizontal) => {
    const n = lane.count === undefined ? 0 : Math.min(8, Math.max(2, Math.round(lane.count / 3)));
    return Array.from({ length: n }).map((_, i) => (
      <circle
        key={i}
        r="4"
        cx={reduced ? (horizontal ? 30 + i * 45 : 200) : undefined}
        cy={reduced ? (horizontal ? 150 : 30 + i * 32) : undefined}
        fill={STATUS[lane.status].color}
        opacity="0.95"
      >
        {!reduced && (
          <animateMotion
            dur={`${9 + (i % 3) * 1.5}s`}
            begin={`${-(i * 9) / n}s`}
            repeatCount="indefinite"
            path={path}
          />
        )}
      </circle>
    ));
  };

  return (
    <div className={cn("grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]", className)}>
      <svg
        viewBox="0 0 400 300"
        role="group"
        aria-label={`Live map of ${JUNCTION}`}
        className="w-full rounded-lg border bg-background/60 road-surface"
      >
        {/* Roads */}
        {[
          { id: "Lane 2", rect: { x: 168, y: 0, w: 64, h: 300 } },
          { id: "Lane 1", rect: { x: 0, y: 118, w: 400, h: 64 } },
        ].map(({ id, rect }) => {
          const l = byLane[id];
          const isSel = selected === id;
          return (
            <g
              key={id}
              tabIndex={0}
              role="button"
              aria-pressed={isSel}
              aria-label={`${id}: ${STATUS[l.status].label}`}
              className="cursor-pointer outline-none"
              onClick={() => setSelected(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(id);
                }
              }}
            >
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                rx="4"
                fill="hsl(210 12% 13%)"
                stroke={isSel ? STATUS[l.status].color : "hsl(210 9% 22%)"}
                strokeWidth={isSel ? 2.5 : 1.5}
              />
            </g>
          );
        })}
        {/* Junction box */}
        <rect x="168" y="118" width="64" height="64" fill="hsl(210 12% 15%)" />
        {/* Centre lines */}
        <path d="M 0 150 L 168 150 M 232 150 L 400 150" stroke="hsl(42 20% 93% / 0.35)" strokeWidth="2" strokeDasharray="14 12" className={reduced ? "" : "road-dash"} fill="none" />
        <path d="M 200 0 L 200 118 M 200 182 L 200 300" stroke="hsl(42 20% 93% / 0.35)" strokeWidth="2" strokeDasharray="14 12" className={reduced ? "" : "road-dash"} fill="none" />
        {/* Stop lines */}
        <path d="M 160 120 L 160 148 M 240 152 L 240 180 M 170 110 L 198 110 M 202 190 L 230 190" stroke="hsl(42 20% 93% / 0.6)" strokeWidth="3" />
        {/* Vehicles */}
        <g pointerEvents="none">
          {dots(byLane["Lane 1"], hPath, true)}
          {dots(byLane["Lane 2"], vPath, false)}
        </g>
        {/* Incident markers */}
        {lanes.flatMap((l) =>
          l.incidents.slice(0, 1).map((i) => (
            <g key={i.id} transform={l.lane === "Lane 1" ? "translate(96 150)" : "translate(200 78)"} pointerEvents="none">
              <circle r="11" fill={STATUS[levelToStatus(i.priority)].color} opacity="0.2" />
              <circle r="6" fill={STATUS[levelToStatus(i.priority)].color} />
              <text y="3.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#101316">!</text>
            </g>
          )),
        )}
        <text pointerEvents="none" x="12" y="108" fontSize="11" fill="hsl(210 8% 62%)">Lane 1</text>
        <text pointerEvents="none" x="240" y="16" fontSize="11" fill="hsl(210 8% 62%)">Lane 2</text>
      </svg>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Select lane">
          {lanes.map((l) => (
            <button
              key={l.lane}
              role="tab"
              aria-selected={selected === l.lane}
              onClick={() => setSelected(l.lane)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                selected === l.lane ? "border-primary/60 bg-primary/10" : "hover:bg-accent",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", STATUS[l.status].bg)} />
              {l.lane}
            </button>
          ))}
        </div>

        <div className="settle rounded-lg border p-4" key={selected}>
          <div className="flex items-start justify-between gap-2">
            <p className="flex min-w-0 items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{active.location}</span>
            </p>
            <StatusBadge status={active.status} />
          </div>
          {active.count === undefined ? (
            <EmptyState
              icon={Radio}
              className="py-6"
              title="No live feed on this lane"
              hint="Start a scan under Camera views to see vehicle counts here."
            />
          ) : (
            <div className="mt-3 space-y-3">
              <p className="num text-4xl font-semibold">
                {active.count}
                <span className="ml-1.5 text-base font-medium text-muted-foreground">vehicles in view</span>
              </p>
              <DensityMeter value={active.count / 40} status={active.status} />
            </div>
          )}
          {active.incidents.length > 0 && (
            <ul className="mt-3 space-y-1.5 border-t pt-3 text-sm">
              {active.incidents.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2">
                  <span>{i.type}</span>
                  <StatusBadge status={levelToStatus(i.priority)}>{i.priority}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
