import { cn } from "@/lib/utils";

export default function TrafficLightLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <div className="bg-gray-800 border-4 border-gray-900 rounded-lg p-3 flex flex-col space-y-3 traffic-light-loader">
        <div className="w-12 h-12 rounded-full light bg-gray-600"></div>
        <div className="w-12 h-12 rounded-full light bg-gray-600"></div>
        <div className="w-12 h-12 rounded-full light bg-gray-600"></div>
      </div>
    </div>
  );
}
