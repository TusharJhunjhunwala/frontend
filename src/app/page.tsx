'use client';

import { AppHeader } from '@/components/layout/app-header';
import { RidePanel } from '@/components/ride-panel';
import { useState, useEffect } from 'react';
import { createRideRequest } from '@/ai/flows/create-ride-request';
import { createDeliveryRequest } from '@/ai/flows/create-delivery-request';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, PersonStanding } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DeliveryRequest } from '@/ai/flows/get-delivery-requests';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
};

export type DeliveryRequestData = {
  pickupPoint: string;
  item: string;
  deliverTo:string;
  offerFee: string;
};

export default function Home() {
  const [serviceState, setServiceState] = useState<ServiceState>('IDLE');
  const [destination, setDestination] = useState<string>('');
  const [eta, setEta] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('transit');
  const [currentDeliveryId, setCurrentDeliveryId] = useState<string | null>(null);
  const [showStatusScreen, setShowStatusScreen] = useState(false);
  const [isAgentOnline, setIsAgentOnline] = useState(false);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [isFetchingDeliveries, setIsFetchingDeliveries] = useState(true);

  // Centralized real-time listener for all open delivery requests
  useEffect(() => {
    const q = query(
      collection(db, "deliveryRequests"), 
      where("status", "==", "SEARCHING")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests: DeliveryRequest[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          pickupPoint: data.pickupPoint,
          item: data.item,
          deliverTo: data.deliverTo,
          offerFee: data.offerFee,
          paymentMethod: data.paymentMethod,
          status: data.status,
          createdAt: data.createdAt,
        });
      });
      // Newest requests will appear first.
      requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDeliveryRequests(requests);
      setIsFetchingDeliveries(false);
    }, (error) => {
        console.error("Error fetching real-time delivery requests: ", error);
        toast({
          variant: 'destructive',
          title: 'Real-time Error',
          description: 'Could not fetch delivery updates.',
        });
        setIsFetchingDeliveries(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [toast]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTab === 'transit' && serviceState === 'SEARCHING') {
      setShowStatusScreen(true);
      timer = setTimeout(() => {
        setProvider(MOCK_PROVIDER);
        setServiceState('PROVIDER_EN_ROUTE');
      }, 4000);
    } else if (serviceState === 'PROVIDER_EN_ROUTE') {
      if (activeTab === 'transit') {
        timer = setTimeout(() => {
          setServiceState('IN_PROGRESS');
        }, 8000);
      }
    } else if (serviceState === 'IN_PROGRESS') {
      const etaMinutes = eta ? parseInt(eta, 10) : 10;
      timer = setTimeout(() => {
        setServiceState('COMPLETED');
      }, etaMinutes * 1000 * 0.5 + 5000);
    }
    return () => clearTimeout(timer);
  }, [serviceState, eta, activeTab]);

  // Firestore listener for delivery status changes (for the requester)
  useEffect(() => {
    if (currentDeliveryId && serviceState === 'SEARCHING') {
      const unsub = onSnapshot(doc(db, "deliveryRequests", currentDeliveryId), (doc) => {
        const data = doc.data();
        if (data && data.status === 'AGENT_ASSIGNED') {
          setProvider(MOCK_PROVIDER); 
          setServiceState('PROVIDER_EN_ROUTE');
        }
      });
      return () => unsub();
    }
  }, [currentDeliveryId, serviceState]);


  const handleRequestRide = async (data: RideRequestData) => {
    setIsSubmitting(true);
    setDestination(data.destination);
    try {
      const result = await createRideRequest(data);
      setEta(result.estimatedArrivalTime);
      setServiceState('SEARCHING');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Requesting Ride',
        description: 'Could not save your request. Please try again.',
      });
      setDestination('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRequestDelivery = async (data: DeliveryRequestData) => {
    setServiceState('SEARCHING'); 
    setShowStatusScreen(true);
    setDestination(data.deliverTo); 

    try {
      const result = await createDeliveryRequest(data);
      setCurrentDeliveryId(result.deliveryId);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Requesting Delivery',
        description: 'Could not save your request. Please try again.',
      });
      handleCancel();
    }
  };


  const handleCancel = () => {
    setServiceState('IDLE');
    setDestination('');
    setEta(null);
    setProvider(null);
    setCurrentDeliveryId(null);
    setShowStatusScreen(false);
  };
  
  const handleReset = () => {
    handleCancel();
  };

  const features = [
    "Live shuttle & auto ETAs",
    "GPS tracking on campus",
    "P2P goods delivery",
    "Simple and fast"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <AppHeader />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start py-12 lg:py-20">
          <div className="space-y-6 pt-4">
            <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border text-sm">
              <span className="w-2.5 h-2.5 mr-2.5 rounded-full bg-green-500 animate-pulse"></span>
              VIT Vellore campus • Live ETAs
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold font-headline tracking-tighter">
              VITransit: shuttles and autos with live location. P2P goods delivery between students.
            </h1>
            <p className="text-lg text-muted-foreground">
              See next arrival at your stop, and get meals picked up by peers on their way back to hostel.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>GPS on-campus</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Real-time ETA</span>
              </div>
              <div className="flex items-center gap-2">
                <PersonStanding className="w-4 h-4" />
                <span>Peer delivery</span>
              </div>
            </div>
          </div>
          <div className="lg:pt-0">
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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              showStatusScreen={showStatusScreen}
              setShowStatusScreen={setShowStatusScreen}
              isAgentOnline={isAgentOnline}
              setIsAgentOnline={setIsAgentOnline}
              deliveryRequests={deliveryRequests}
              isFetchingDeliveries={isFetchingDeliveries}
            />
          </div>
        </div>
      </main>
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 border-border/60 bg-transparent shadow-none">
              <p className="text-sm font-medium">{feature}</p>
            </Card>
          ))}
        </div>
      </footer>
    </div>
  );
}
