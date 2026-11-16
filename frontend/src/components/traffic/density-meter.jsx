import { cn } from "@/lib/utils";
import { STATUS } from "./status";

/**
 * Lane-occupancy style meter: a row of cells that fill up like vehicles
 * queuing in a lane. `value` 0..1.
 */
export default function DensityMeter({ value = 0, status = "idle", cells = 20, className }) {
  const filled = Math.round(Math.max(0, Math.min(1, value)) * cells);
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-label="Lane occupancy"
      className={cn("flex gap-[3px]", className)}
    >
      {Array.from({ length: cells }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 flex-1 rounded-[2px] transition-colors duration-300",
            i < filled ? STATUS[status].bg : "bg-foreground/10",
          )}
        />
      ))}
    </div>
  );
}
