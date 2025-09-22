'use client';

import { AppHeader } from '@/components/layout/app-header';
import { RidePanel } from '@/components/ride-panel';
import { useState, useEffect } from 'react';
import { predictDestinationETA } from '@/ai/flows/predict-destination-eta';
import { predictDeliveryETA } from '@/ai/flows/predict-delivery-eta';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

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
  deliverTo: string;
  offerFee: string;
  maxExtra: string;
  paymentMethod: 'upi' | 'cod';
  upiId: string;
};

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
        trafficConditions: 'moderate', // Simplified for now
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
    setDestination(data.deliverTo);
    try {
      const result = await predictDeliveryETA({
        restaurantLocation: data.restaurant,
        dropOffLocation: data.deliverTo,
        trafficConditions: 'moderate', // Simplified for now
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
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <AppHeader />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
          <div className="space-y-6">
            <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border">
              <span className="w-2 h-2 mr-2 rounded-full bg-green-500 animate-pulse"></span>
              VIT Vellore campus • Live ETAs
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold font-headline tracking-tighter">
              VITransit: shuttles and autos with live location. P2P food drops between students.
            </h1>
            <p className="text-lg text-muted-foreground">
              See next arrival at your stop, and get meals picked up by peers on their way back to hostel.
            </p>
            <div className="flex items-center gap-4">
              <button className="text-primary font-semibold hover:underline flex items-center gap-2">
                Learn more <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="lg:pt-8">
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
        </div>
      </main>
    </div>
  );
}
