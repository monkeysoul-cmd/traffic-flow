import { cn } from "@/lib/utils";

export default function OverviewLayout({
  left,
  right,
  className,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 items-start", className)}>
      <div className="w-full h-full">
        {left}
      </div>
      <div className="w-full h-full">
        {right}
      </div>
    </div>
  );
}
