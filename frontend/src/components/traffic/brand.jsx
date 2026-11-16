import { cn } from "@/lib/utils";

export function BrandMark({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-black/50",
        className,
      )}
    >
      <span className="flex flex-col gap-[3px]">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
    </span>
  );
}

export function Brand({ className }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="font-headline text-lg font-semibold leading-none">
        Traffic Flow
        <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
          Control center
        </span>
      </span>
    </span>
  );
}
