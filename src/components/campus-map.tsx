'use client';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Car, Bus } from 'lucide-react';

const locations = [
  { name: 'Main Gate', x: 20, y: 90, type: 'stop' },
  { name: "Men's Hostel", x: 15, y: 60, type: 'stop' },
  { name: 'M Block', x: 30, y: 40, type: 'stop' },
  { name: 'Library', x: 60, y: 55, type: 'stop' },
  { name: 'Technology Tower', x: 45, y: 80, type: 'stop' },
  { name: "Ladies Hostel", x: 85, y: 85, type: 'stop' },
  { name: 'Food Court', x: 55, y: 20, type: 'poi' },
];

const vehicles = [
  { id: 'S1', type: 'Shuttle' as const, path: ['Main Gate', 'Technology Tower', "Men's Hostel", 'M Block', 'Food Court', 'Library', "Ladies Hostel"] },
  { id: 'A2', type: 'Auto' as const, path: ["Men's Hostel", 'M Block', 'Food Court', 'Library', 'Technology Tower', 'Main Gate'] },
];

const SVG_WIDTH = 500;
const SVG_HEIGHT = 300;

const VehicleMarker = ({ vehicle, currentPos }: { vehicle: typeof vehicles[0], currentPos: { x: number, y: number }}) => {
  const isShuttle = vehicle.type === 'Shuttle';
  return (
    <g transform={`translate(${currentPos.x}, ${currentPos.y})`}>
      <circle r="10" fill={isShuttle ? 'hsl(var(--primary))' : 'hsl(var(--accent-foreground))'} opacity="0.8" />
      {isShuttle ? (
        <Bus className="w-4 h-4 text-primary-foreground" x="-8" y="-8" />
      ) : (
        <Car className="w-4 h-4 text-primary-foreground" x="-8" y="-8" />
      )}
       <text
        fontSize="10"
        fill="hsl(var(--background))"
        textAnchor="middle"
        dy="18"
      >
        {vehicle.id}
      </text>
    </g>
  );
};

export function CampusMap() {
  const [vehiclePositions, setVehiclePositions] = useState<Record<string, {x: number, y: number}>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newPositions: Record<string, {x: number, y: number}> = {};
      vehicles.forEach(v => {
        const currentPointName = v.path[Math.floor(Math.random() * v.path.length)];
        const point = locations.find(l => l.name === currentPointName);
        if (point) {
            newPositions[v.id] = {
                x: (point.x / 100) * SVG_WIDTH + (Math.random() - 0.5) * 20,
                y: (point.y / 100) * SVG_HEIGHT + (Math.random() - 0.5) * 20,
            };
        }
      });
      setVehiclePositions(newPositions);
    }, 2000);

    return () => clearInterval(interval);
  }, []);


  const getCoords = (name: string) => {
    const loc = locations.find(l => l.name === name);
    if (!loc) return { x: 0, y: 0 };
    return { x: (loc.x / 100) * SVG_WIDTH, y: (loc.y / 100) * SVG_HEIGHT };
  }

  return (
    <div className="relative w-full aspect-[4/3] rounded-lg border bg-card overflow-hidden">
      <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Connection Lines */}
        <g opacity="0.2">
            {vehicles.map(v => (
                <path 
                    key={v.id}
                    d={`M ${v.path.map(p => `${getCoords(p).x},${getCoords(p).y}`).join(' L ')}`}
                    stroke="hsl(var(--foreground))"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="5,5"
                />
            ))}
        </g>


        {/* Locations */}
        {locations.map(loc => {
          const { x, y } = getCoords(loc.name);
          const isPoi = loc.type === 'poi';
          return (
            <g key={loc.name} transform={`translate(${x}, ${y})`}>
              {isPoi ? (
                 <rect width="12" height="12" fill="hsl(var(--destructive))" x="-6" y="-6" />
              ) : (
                <circle r="6" fill="hsl(var(--foreground))" />
              )}
              <text
                fontSize="12"
                fill="hsl(var(--foreground))"
                textAnchor="middle"
                dy="-12"
              >
                {loc.name}
              </text>
            </g>
          );
        })}
        
        {/* Vehicles */}
        {vehicles.map(v => {
            const pos = vehiclePositions[v.id];
            if (!pos) return null;
            return <VehicleMarker key={v.id} vehicle={v} currentPos={pos} />
        })}

      </svg>
    </div>
  );
}
