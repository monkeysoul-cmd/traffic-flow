import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface Incident {
  id: string;
  location: string;
  type: string;
  priority: string;
  time: string;
}

export default function CameraViews({ incidents }: { incidents: Incident[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          Live Camera Feeds
        </CardTitle>
        <CardDescription>Real-time views from key traffic locations.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {incidents.map((incident, index) => (
            <div key={incident.id} className="relative aspect-[16/11.2] w-full overflow-hidden rounded-md group">
              <Image
                src={`https://picsum.photos/seed/cam-${index + 1}/300/200`}
                alt={`Camera view of ${incident.location}`}
                fill
                data-ai-hint="traffic camera"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                <p className="text-white text-[10px] text-center truncate">{incident.location}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
