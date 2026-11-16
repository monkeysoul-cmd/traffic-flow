import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon = Inbox, title, hint, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-xs text-sm text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ title, children, action, className }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-status-moderate/40 bg-status-moderate/10 p-4 sm:flex-row sm:items-center",
        className,
      )}
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-status-moderate" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">{title}</p>
        {children && <p className="text-muted-foreground">{children}</p>}
      </div>
      {action}
    </div>
  );
}
