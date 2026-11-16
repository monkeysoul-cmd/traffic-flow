import { Brand } from "./brand";
import RoadBackdrop from "./road-backdrop";
import { Gauge, Siren, TrafficCone } from "lucide-react";

const POINTS = [
  { icon: TrafficCone, text: "Signals that adapt to the queue in each lane" },
  { icon: Siren, text: "Emergency vehicles detected and cleared automatically" },
  { icon: Gauge, text: "Live counts, speeds and incidents in one view" },
];

export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r bg-[hsl(210_14%_6%)] lg:block">
        <RoadBackdrop />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Brand />
          <div className="max-w-md space-y-6">
            <h2 className="font-headline text-4xl font-semibold leading-[1.1]">
              Keep the city moving, one junction at a time.
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card/80 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
      <main className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <Brand className="lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
