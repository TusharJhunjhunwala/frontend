'use client';

import { AppHeader } from '@/components/layout/app-header';
import { MapView } from '@/components/map-view';
import { RidePanel } from '@/components/ride-panel';
import { useState, useEffect } from 'react';
import { predictDestinationETA } from '@/ai/flows/predict-destination-eta';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export type RideState = 'IDLE' | 'SEARCHING' | 'DRIVER_EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED';

export type Driver = {
  name: string;
  avatarUrl: string;
  rating: number;
  vehicle: string;
  licensePlate: string;
};

const MOCK_DRIVER: Driver = {
  name: 'Ramesh K.',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'driver-avatar')?.imageUrl || '',
  rating: 4.8,
  vehicle: 'Auto Rickshaw',
  licensePlate: 'VIT-AUTO',
};

export type RideRequestData = {
  destination: string;
  traffic: 'light' | 'moderate' | 'heavy';
};

export default function Home() {
  const [rideState, setRideState] = useState<RideState>('IDLE');
  const [destination, setDestination] = useState<string>('');
  const [eta, setEta] = useState<string | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (rideState === 'SEARCHING') {
      timer = setTimeout(() => {
        setDriver(MOCK_DRIVER);
        setRideState('DRIVER_EN_ROUTE');
      }, 4000);
    } else if (rideState === 'DRIVER_EN_ROUTE') {
      timer = setTimeout(() => {
        setRideState('IN_PROGRESS');
      }, 8000);
    } else if (rideState === 'IN_PROGRESS') {
      const etaMinutes = eta ? parseInt(eta, 10) : 10;
      timer = setTimeout(() => {
        setRideState('COMPLETED');
      }, etaMinutes * 1000 * 0.5 + 5000); // Simulate trip time based on ETA
    }
    return () => clearTimeout(timer);
  }, [rideState, eta]);

  const handleRequestRide = async (data: RideRequestData) => {
    setIsSubmitting(true);
    setDestination(data.destination);
    try {
      const result = await predictDestinationETA({
        currentLocation: 'VIT Vellore Main Gate',
        destination: data.destination,
        trafficConditions: data.traffic,
      });
      setEta(result.estimatedArrivalTime);
      setRideState('SEARCHING');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Predicting ETA',
        description: 'Could not connect to the AI service. Please try again.',
      });
      setDestination('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRideState('IDLE');
    setDestination('');
    setEta(null);
    setDriver(null);
  };
  
  const handleReset = () => {
    handleCancel();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background font-body">
      <MapView rideState={rideState} destination={destination} />
      <AppHeader />
      <RidePanel
        rideState={rideState}
        driver={driver}
        destination={destination}
        eta={eta}
        isSubmitting={isSubmitting}
        onRequestRide={handleRequestRide}
        onCancel={handleCancel}
        onReset={handleReset}
      />
    </div>
  );
}
