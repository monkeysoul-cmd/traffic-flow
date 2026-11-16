import { cn } from "@/lib/utils";

/**
 * Traffic status vocabulary used everywhere in the UI.
 * The store/API still speaks Low / Medium / High — this only maps those
 * values to a colour and a plain-language label.
 */
export const STATUS = {
  free: {
    label: "Free flow",
    text: "text-status-free",
    bg: "bg-status-free",
    soft: "bg-status-free/10 border-status-free/30 text-status-free",
    color: "hsl(var(--status-free))",
  },
  moderate: {
    label: "Moderate",
    text: "text-status-moderate",
    bg: "bg-status-moderate",
    soft: "bg-status-moderate/10 border-status-moderate/30 text-status-moderate",
    color: "hsl(var(--status-moderate))",
  },
  heavy: {
    label: "Congested",
    text: "text-status-heavy",
    bg: "bg-status-heavy",
    soft: "bg-status-heavy/10 border-status-heavy/30 text-status-heavy",
    color: "hsl(var(--status-heavy))",
  },
  idle: {
    label: "No data",
    text: "text-status-idle",
    bg: "bg-status-idle",
    soft: "bg-status-idle/10 border-status-idle/30 text-status-idle",
    color: "hsl(var(--status-idle))",
  },
};

/** Maps "Low" | "Medium" | "High" (traffic level or incident priority). */
export function levelToStatus(level) {
  switch (String(level || "").toLowerCase()) {
    case "low":
      return "free";
    case "medium":
      return "moderate";
    case "high":
      return "heavy";
    default:
      return "idle";
  }
}

export function StatusDot({ status = "idle", pulse = false, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
        STATUS[status].bg,
        pulse && "live-dot",
        className,
      )}
      style={pulse ? { "--pulse-color": `var(--status-${status})` } : undefined}
    />
  );
}

/** Pill with a dot. `children` overrides the default label. */
export function StatusBadge({ status = "idle", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        STATUS[status].soft,
        className,
      )}
    >
      <StatusDot status={status} className="h-1.5 w-1.5" />
      {children ?? STATUS[status].label}
    </span>
  );
}
