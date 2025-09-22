'use client';

import { AppHeader } from '@/components/layout/app-header';
import { MapView } from '@/components/map-view';
import { RidePanel } from '@/components/ride-panel';
import { useState, useEffect } from 'react';
import { predictDestinationETA } from '@/ai/flows/predict-destination-eta';
import { predictDeliveryETA } from '@/ai/flows/predict-delivery-eta';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export type ServiceState = 'IDLE' | 'SEARCHING' | 'PROVIDER_EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED';

export type Provider = {
  name: string;
  avatarUrl: string;
  rating: number;
  vehicle: string;
  licensePlate: string;
};

const MOCK_PROVIDER: Provider = {
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

export type DeliveryRequestData = {
  restaurant: string;
  item: string;
  orderDetails: string;
  dropOffLocation: string;
  traffic: 'light' | 'moderate' | 'heavy';
}

export default function Home() {
  const [serviceState, setServiceState] = useState<ServiceState>('IDLE');
  const [destination, setDestination] = useState<string>('');
  const [eta, setEta] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (serviceState === 'SEARCHING') {
      timer = setTimeout(() => {
        setProvider(MOCK_PROVIDER);
        setServiceState('PROVIDER_EN_ROUTE');
      }, 4000);
    } else if (serviceState === 'PROVIDER_EN_ROUTE') {
      timer = setTimeout(() => {
        setServiceState('IN_PROGRESS');
      }, 8000);
    } else if (serviceState === 'IN_PROGRESS') {
      const etaMinutes = eta ? parseInt(eta, 10) : 10;
      timer = setTimeout(() => {
        setServiceState('COMPLETED');
      }, etaMinutes * 1000 * 0.5 + 5000);
    }
    return () => clearTimeout(timer);
  }, [serviceState, eta]);

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
      setServiceState('SEARCHING');
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
  
  const handleRequestDelivery = async (data: DeliveryRequestData) => {
    setIsSubmitting(true);
    setDestination(data.dropOffLocation);
    try {
      const result = await predictDeliveryETA({
        restaurantLocation: data.restaurant,
        dropOffLocation: data.dropOffLocation,
        trafficConditions: data.traffic,
      });
      setEta(result.estimatedDeliveryTime);
      setServiceState('SEARCHING');
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
    setServiceState('IDLE');
    setDestination('');
    setEta(null);
    setProvider(null);
  };
  
  const handleReset = () => {
    handleCancel();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background font-body">
      <MapView serviceState={serviceState} destination={destination} />
      <AppHeader />
      <RidePanel
        serviceState={serviceState}
        provider={provider}
        destination={destination}
        eta={eta}
        isSubmitting={isSubmitting}
        onRequestRide={handleRequestRide}
        onRequestDelivery={handleRequestDelivery}
        onCancel={handleCancel}
        onReset={handleReset}
      />
    </div>
  );
}
