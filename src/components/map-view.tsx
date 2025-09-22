'use client';
import Image from "next/image";
import { User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RideState } from "@/app/page";
import { CarIcon } from "@/components/icons/car-icon";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useEffect, useState } from "react";

type MapViewProps = {
    rideState: RideState;
    destination: string | null;
};

export function MapView({ rideState, destination }: MapViewProps) {
    const mapImage = PlaceHolderImages.find(img => img.id === 'map-background');
    const [carPositionClass, setCarPositionClass] = useState('top-full -left-24');
    const [carRotationClass, setCarRotationClass] = useState('-rotate-45');

    useEffect(() => {
        if (rideState === 'DRIVER_EN_ROUTE') {
            const timer = setTimeout(() => {
                setCarPositionClass('top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2');
                setCarRotationClass('rotate-[135deg]');
            }, 100);
            return () => clearTimeout(timer);
        } else if (rideState === 'IN_PROGRESS') {
            setCarPositionClass('top-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2');
            setCarRotationClass('rotate-45');
        } else if (rideState === 'IDLE' || rideState === 'SEARCHING' || rideState === 'COMPLETED') {
            const initialPos = rideState === 'COMPLETED' ? 'top-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2' : 'top-full -left-24';
            setCarPositionClass(initialPos);
        }
    }, [rideState]);


    return (
        <div className="fixed inset-0 h-screen w-screen">
            {mapImage && (
                <Image
                    src={mapImage.imageUrl}
                    alt={mapImage.description}
                    data-ai-hint={mapImage.imageHint}
                    fill
                    className="object-cover"
                    priority
                />
            )}
            <div className="absolute inset-0 bg-background/50" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="relative z-10 p-1 bg-primary rounded-full shadow-lg">
                    <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="relative -mt-2 py-0.5 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
                    YOU
                </div>
            </div>

            <div className={cn(
                "absolute transition-all duration-[7000ms] ease-in-out",
                (rideState === 'IDLE' || rideState === 'SEARCHING') && "opacity-0 duration-500",
                carPositionClass
            )}>
                <CarIcon className={cn("w-10 h-10 text-accent drop-shadow-lg transition-transform duration-1000", carRotationClass)} />
            </div>

            <div className={cn(
                "absolute top-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 flex-col items-center",
                "transition-opacity duration-500",
                destination && rideState !== 'IDLE' ? 'opacity-100 flex' : 'opacity-0 hidden'
            )}>
                 <div className="relative z-10 p-1 bg-destructive rounded-full shadow-lg">
                    <MapPin className="w-6 h-6 text-destructive-foreground" />
                </div>
                <div className="relative -mt-2 py-0.5 px-2 rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow truncate max-w-24">
                    {destination}
                </div>
            </div>
        </div>
    );
}
