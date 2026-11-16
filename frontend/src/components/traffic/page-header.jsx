import { cn } from "@/lib/utils";

export default function PageHeader({ title, description, actions, icon: Icon, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-headline text-2xl font-semibold leading-tight sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="lane-divider" aria-hidden="true" />
    </div>
  );
}
