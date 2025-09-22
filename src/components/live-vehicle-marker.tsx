'use client';

import { useState, useEffect } from 'react';
import { Bus, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

type LiveVehicleMarkerProps = {
  type: 'Shuttle' | 'Auto';
};

export function LiveVehicleMarker({ type }: LiveVehicleMarkerProps) {
  const [position, setPosition] = useState({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        top: `${Math.random() * 90}%`, // Stay within bounds
        left: `${Math.random() * 90}%`,
      });
    }, 2000 + Math.random() * 1000); // Update every 2-3 seconds

    return () => clearInterval(interval);
  }, []);

  const isShuttle = type === 'Shuttle';

  return (
    <div
      className={cn(
        'absolute flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-all duration-1000 ease-in-out',
        isShuttle ? 'bg-blue-500/80 border-2 border-blue-200' : 'bg-yellow-500/80 border-2 border-yellow-200'
      )}
      style={{ top: position.top, left: position.left }}
    >
      {isShuttle ? (
        <Bus className="w-5 h-5 text-white" />
      ) : (
        <Car className="w-5 h-5 text-white" />
      )}
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white animate-pulse"></div>
    </div>
  );
}
