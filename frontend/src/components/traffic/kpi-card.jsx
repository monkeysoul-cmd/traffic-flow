import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS } from "./status";

export function Sparkline({ values = [], color = "hsl(var(--primary))", className }) {
  if (values.length < 2) return <div className={cn("h-8", className)} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" className={cn("h-8 w-full", className)}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Lane-style metric card: a kerb stripe on the left carries the severity colour. */
export default function KpiCard({ label, value, unit, icon: Icon, status = "idle", href, children }) {
  const body = (
    <div
      className={cn(
        "kerb h-full rounded-xl border bg-card p-4 pl-5 transition-colors",
        href && "hover:border-primary/50 hover:bg-accent/40",
      )}
      style={{ "--kerb-color": STATUS[status].color }}
    >
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        {href ? <ArrowUpRight className="h-4 w-4" /> : Icon && <Icon className="h-4 w-4" />}
      </div>
      <p className="num mt-1.5 text-3xl font-semibold leading-none">
        {value}
        {unit && <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>}
      </p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-xl">
      {body}
    </Link>
  ) : (
    body
  );
}
