import { cn } from "@/lib/utils";

const LAMPS = [
  { key: "red", on: "bg-red-500 shadow-[0_0_12px_2px_rgba(239,68,68,0.55)]" },
  { key: "yellow", on: "bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.55)]" },
  { key: "green", on: "bg-emerald-500 shadow-[0_0_12px_2px_rgba(16,185,129,0.55)]" },
];

/**
 * Read-only signal head. `active` is "red" | "yellow" | "green" | null.
 * `orientation` horizontal suits table rows, vertical suits cards.
 */
export default function TrafficSignal({
  active = null,
  orientation = "horizontal",
  size = "md",
  className,
}) {
  const lamp = size === "sm" ? "h-2.5 w-2.5" : size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span
      role="img"
      aria-label={active ? `Signal ${active}` : "Signal off"}
      className={cn(
        "inline-flex gap-1 rounded-full border border-border bg-black/40 p-1",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
    >
      {LAMPS.map((l) => (
        <span
          key={l.key}
          className={cn(
            lamp,
            "rounded-full transition-all duration-300",
            active === l.key ? l.on : "bg-white/10",
          )}
        />
      ))}
    </span>
  );
}
