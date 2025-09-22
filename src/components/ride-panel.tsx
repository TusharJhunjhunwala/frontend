'use client';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MapPin, Star, CheckCircle, Car, PersonStanding, Bus, PackageCheck, PackageSearch, ChevronLeft } from 'lucide-react';
import type { ServiceState, Provider, RideRequestData, DeliveryRequestData } from '@/app/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CampusMap } from './campus-map';
import { useState, useEffect } from 'react';
import type { DeliveryRequest } from '@/ai/flows/get-delivery-requests';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';


type RidePanelProps = {
  serviceState: ServiceState;
  provider: Provider | null;
  destination: string | null;
  eta: string | null;
  isSubmitting: boolean;
  onRequestRide: (data: RideRequestData) => void;
  onRequestDelivery: (data: DeliveryRequestData) => void;
  onCancel: () => void;
  onReset: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showStatusScreen: boolean;
  setShowStatusScreen: (show: boolean) => void;
  isAgentOnline: boolean;
  setIsAgentOnline: (isOnline: boolean) => void;
};

const rideRequestSchema = z.object({
  destination: z.string().min(3, { message: 'Please enter a valid destination.' }),
});

const deliveryRequestSchema = z.object({
    pickupPoint: z.string().min(2, "Required"),
    item: z.string().min(2, "Required"),
    deliverTo: z.string().min(3, "Required"),
    offerFee: z.string().min(1, "Required"),
});

const transitSchema = z.object({
  stop: z.string(),
})

const vehicleData = [
  { vehicle: 'S1', type: 'M-Shuttle', eta: '7 min', icon: <Bus /> },
  { vehicle: 'A1', type: 'Auto', eta: '3 min', icon: <Car /> },
  { vehicle: 'A2', type: 'Auto', eta: '1 min', icon: <Car /> },
  { vehicle: 'S2', type: 'L-Shuttle', eta: '12 min', icon: <Bus /> },
  { vehicle: 'A3', type: 'Auto', eta: '5 min', icon: <Car /> },
]


function TransitView() {
  const form = useForm<z.infer<typeof transitSchema>>({
    resolver: zodResolver(transitSchema),
    defaultValues: { stop: "tt" },
  });
  
  return (
    <FormProvider {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="stop"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your stop</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                  <SelectTrigger>
                      <SelectValue placeholder="Select a stop" />
                  </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tt">TT</SelectItem>
                    <SelectItem value="prp">PRP</SelectItem>
                    <SelectItem value="sjt">SJT</SelectItem>
                    <SelectItem value="foodys">Foodys</SelectItem>
                    <SelectItem value="main-building">Main Building</SelectItem>
                    <SelectItem value="smv">SMV</SelectItem>
                    <SelectItem value="mh-q">MH-Q</SelectItem>
                    <SelectItem value="mh-k">MH-K</SelectItem>
                    <SelectItem value="mh-l">MH-L</SelectItem>
                    <SelectItem value="mh-a">MH-A</SelectItem>
                    <SelectItem value="mh-b">MH-B</SelectItem>
                    <SelectItem value="mh-c">MH-C</SelectItem>
                    <SelectItem value="mh-d">MH-D</SelectItem>
                    <SelectItem value="mh-e">MH-E</SelectItem>
                    <SelectItem value="mh-f">MH-F</SelectItem>
                    <SelectItem value="mh-g">MH-G</SelectItem>
                    <SelectItem value="mh-h">MH-H</SelectItem>
                    <SelectItem value="mh-j">MH-J</SelectItem>
                    <SelectItem value="mh-m">MH-M</SelectItem>
                    <SelectItem value="mh-n">MH-N</SelectItem>
                    <SelectItem value="mh-p">MH-P</SelectItem>
                    <SelectItem value="mh-r">MH-R</SelectItem>
                    <SelectItem value="lh-a">LH-A (Sarojini)</SelectItem>
                    <SelectItem value="lh-b">LH-B (Ramayanam)</SelectItem>
                    <SelectItem value="lh-c">LH-C (Mahabharat)</SelectItem>
                    <SelectItem value="lh-d">LH-D</SelectItem>
                    <SelectItem value="lh-e">LH-E</SelectItem>
                    <SelectItem value="lh-f">LH-F</SelectItem>
                    <SelectItem value="lh-g">LH-G</SelectItem>
                    <SelectItem value="lh-h">LH-H</SelectItem>
                  </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Campus live map</h3>
          <p className="text-sm text-muted-foreground">Shuttles and autos moving on a simple campus grid.</p>
          <CampusMap />
        </div>

        <div className="space-y-2">
            <h3 className="text-sm font-medium">Vehicles arriving at your stop</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleData.map((v) => (
                  <TableRow key={v.vehicle}>
                    <TableCell className="font-medium">{v.vehicle}</TableCell>
                    <TableCell className="flex items-center gap-2 text-muted-foreground"><div className="w-6">{v.icon}</div>{v.type}</TableCell>
                    <TableCell className="text-right">{v.eta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-2">Live location updated every 2s. ETAs are estimated.</p>
        </div>
      </form>
    </FormProvider>
  );
}

function DeliveryRequestForm({ onRequestDelivery, isSubmitting }: Pick<RidePanelProps, 'onRequestDelivery' | 'isSubmitting'>) {
    const form = useForm<z.infer<typeof deliveryRequestSchema>>({
        resolver: zodResolver(deliveryRequestSchema),
        defaultValues: { pickupPoint: 'Foodys', item: 'Paneer Roll', deliverTo: 'MH-Q Block', offerFee: '20' },
    });

    function onSubmit(data: z.infer<typeof deliveryRequestSchema>) {
        onRequestDelivery(data as DeliveryRequestData);
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="pickupPoint"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Pick up Point</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Foodys" {...field} />
                                </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="item"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Item</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g., Paneer Roll" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>
                <FormField
                    control={form.control}
                    name="deliverTo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Deliver to</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., MH-Q Block" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="offerFee"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Offer fee (₹)</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormItem>
                    <FormLabel>Payment method</FormLabel>
                    <FormControl>
                        <Input value="Pay on delivery" readOnly disabled />
                    </FormControl>
                </FormItem>
                <Button type="submit" className="w-full !mt-6" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Find a deliverer
                </Button>
            </form>
        </Form>
    )
}

function AgentAcceptedView({ onComplete, request }: { onComplete: () => void, request: DeliveryRequest }) {
  // In a real app, requester details would be fetched based on a userId stored in the request
  const requester = {
    name: 'Aarav Sharma',
    phone: '9876543210',
    block: request.deliverTo,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Delivery Accepted!</h3>
        <p className="text-muted-foreground text-sm">You are on your way to pick up the item.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Item</span>
            <span className="font-medium">{request.item}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">{request.pickupPoint}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium">{request.deliverTo}</span>
          </div>
           <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Fee</span>
            <span className="font-bold">₹{request.offerFee}</span>
          </div>
        </CardContent>
      </Card>
      
      <Button className="w-full" onClick={onComplete}>Mark as Completed</Button>
    </div>
  );
}


function AgentView({ isAgentOnline, setIsAgentOnline }: Pick<RidePanelProps, 'isAgentOnline' | 'setIsAgentOnline'>) {
  const [acceptedJob, setAcceptedJob] = useState<DeliveryRequest | null>(null);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [isFetchingDeliveries, setIsFetchingDeliveries] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAgentOnline) {
      setDeliveryRequests([]);
      setIsFetchingDeliveries(false);
      return () => {};
    }

    setIsFetchingDeliveries(true);
    const q = query(collection(db, "deliveryRequests"), where("status", "==", "SEARCHING"));
    
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
      setDeliveryRequests(requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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

    return () => unsubscribe();
  }, [isAgentOnline, toast]);


  const handleAcceptJob = async (req: DeliveryRequest) => {
    try {
      const deliveryRef = doc(db, 'deliveryRequests', req.id);
      // In a real app, you'd also assign an agentId here
      await updateDoc(deliveryRef, { status: 'AGENT_ASSIGNED' }); 
      setAcceptedJob(req);
    } catch (error) {
        console.error("Error accepting job: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not accept the job.' });
    }
  }
  
  const handleCompleteJob = async () => {
    if (!acceptedJob) return;
    try {
      const deliveryRef = doc(db, 'deliveryRequests', acceptedJob.id);
      await updateDoc(deliveryRef, { status: 'COMPLETED' });
      setAcceptedJob(null); // Return to the list of open requests
      toast({ title: 'Success', description: 'Delivery marked as complete.' });
    } catch (error) {
        console.error("Error completing job: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not complete the job.' });
    }
  }

  if (acceptedJob) {
    return <AgentAcceptedView onComplete={handleCompleteJob} request={acceptedJob} />;
  }


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Agent Dashboard</h3>
        <p className="text-muted-foreground text-sm">Manage your availability and view delivery requests.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Go Online</CardTitle>
            <CardDescription>Toggle this switch to start or stop receiving delivery requests.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center space-x-2 rounded-lg border p-3">
              <Switch id="online-status" checked={isAgentOnline} onCheckedChange={setIsAgentOnline} />
              <Label htmlFor="online-status" className="flex-grow">{isAgentOnline ? 'You are Online' : 'You are Offline'}</Label>
            </div>
        </CardContent>
      </Card>
      
      {isAgentOnline && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Open Delivery Requests</h3>
            {isFetchingDeliveries && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          {isFetchingDeliveries && deliveryRequests.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Looking for jobs...</p>
            </div>
          ) : deliveryRequests.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {deliveryRequests.map((req) => (
                <Card key={req.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{req.item}</CardTitle>
                    <CardDescription>From: {req.pickupPoint} | To: {req.deliverTo}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center text-sm">
                    <div>
                      <p>Fee: <span className="font-bold">₹{req.offerFee}</span></p>
                    </div>
                    <Button onClick={() => handleAcceptJob(req)}>Accept</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-muted/50">
              <PackageCheck className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground mt-2">No delivery requests right now.</p>
              <p className="text-xs text-muted-foreground">Check back soon!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function DeliveryView(props: RidePanelProps) {
  const [deliveryTab, setDeliveryTab] = useState('request');

  // Show status button only when a delivery search is active in the background
  const showViewStatusButton = props.serviceState === 'SEARCHING' && props.activeTab === 'delivery' && !props.showStatusScreen;

  return (
    <Tabs value={deliveryTab} onValueChange={setDeliveryTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="request">
          <PackageSearch className="mr-2" />
          Request
        </TabsTrigger>
        <TabsTrigger value="agent">
          <PersonStanding className="mr-2" />
          Agent
        </TabsTrigger>
      </TabsList>
      <TabsContent value="request" className="pt-4">
        {showViewStatusButton ? (
          <div className="text-center space-y-4 py-4">
            <p className="text-muted-foreground">Searching for a deliverer...</p>
            <Button onClick={() => props.setShowStatusScreen(true)}>
              View Status
            </Button>
          </div>
        ) : (
          <DeliveryRequestForm {...props} />
        )}
      </TabsContent>
      <TabsContent value="agent" className="pt-4">
        <AgentView {...props} />
      </TabsContent>
    </Tabs>
  );
}


function RequestView(props: RidePanelProps) {
  return (
    <>
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-headline text-2xl">Experience</CardTitle>
        <CardDescription>Live campus transit and student-to-student delivery.</CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <Tabs value={props.activeTab} onValueChange={props.setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transit"><Bus className="mr-2" />Transit</TabsTrigger>
                <TabsTrigger value="delivery"><PersonStanding className="mr-2" />Peer Delivery</TabsTrigger>
            </TabsList>
            <TabsContent value="transit" className="pt-4">
                <TransitView />
            </TabsContent>
            <TabsContent value="delivery" className="pt-4">
                <DeliveryView {...props} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}


function SearchingView({ onCancel, onBack, activeTab }: { onCancel: () => void; onBack: () => void; activeTab: string; }) {
  const titleText = activeTab === 'delivery' ? 'Finding a Deliverer' : 'Finding Your Ride';
  const descriptionText = activeTab === 'delivery' ? 'Please wait while we find an agent for your delivery.' : 'Please wait while we connect you to a driver.';


  return (
    <>
      <CardHeader className="items-center text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <CardTitle className="font-headline mt-4">{titleText}</CardTitle>
        <CardDescription>{descriptionText}</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col gap-2">
        <Button variant="outline" className="w-full" onClick={onCancel}>
          Cancel Search
        </Button>
        {activeTab === 'delivery' && (
          <Button variant="ghost" className="w-full" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Form
          </Button>
        )}
      </CardFooter>
    </>
  );
}

function ProviderEnRouteView({ provider, onCancel, activeTab }: Pick<RidePanelProps, 'provider' | 'onCancel' | 'activeTab'>) {
  if (!provider) return null;

  const titleText = activeTab === 'transit' ? `${provider.name} is on the way` : `Your deliverer is on the way`;
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'driver-avatar')?.imageUrl || '';

  return (
    <>
        <CardHeader>
            <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={avatarUrl} alt={provider.name} data-ai-hint="portrait person" />
                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="font-headline text-xl">{titleText}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" /> {provider.rating}
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="text-center">
             {activeTab === 'transit' && (
                <>
                    <p className="text-lg font-medium">{provider.vehicle}</p>
                    <p className="text-sm px-4 py-1 bg-secondary rounded-md inline-block mt-1 font-mono tracking-widest">{provider.licensePlate}</p>
                </>
            )}
            <p className="text-muted-foreground mt-2">Arriving in approximately 5 minutes.</p>
        </CardContent>
        <CardFooter>
            <Button variant="outline" className="w-full" onClick={onCancel}>Cancel</Button>
        </CardFooter>
    </>
  )
}

function InProgressView({ destination, eta, activeTab }: Pick<RidePanelProps, 'destination' | 'eta' | 'activeTab'>) {
    const titleText = activeTab === 'transit' ? `En route to ${destination}` : `Delivering to ${destination}`;
    return (
        <>
            <CardHeader className="items-center text-center">
                <div className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    <CardTitle className="font-headline text-xl">{titleText}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Estimated arrival in</p>
                <p className="text-4xl font-bold font-headline text-primary">{eta || '~15'} min</p>
                <p className="text-sm text-muted-foreground mt-2">(Predicted by VITransit AI)</p>
            </CardContent>
        </>
    )
}

function CompletedView({ onReset, activeTab }: Pick<RidePanelProps, 'onReset' | 'activeTab'>) {
    const titleText = activeTab === 'transit' ? "You've Arrived!" : "Delivery Complete!";
    const descriptionText = activeTab === 'delivery'
      ? 'Your item has been delivered. Thank you for using VITransit!'
      : `You have arrived at your destination. We hope you had a pleasant ride!`;

    return (
        <>
            <CardHeader className="items-center text-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <CardTitle className="font-headline mt-4">{titleText}</CardTitle>
                <CardDescription>{descriptionText}</CardDescription>
            </CardHeader>
            <CardFooter className="flex-col gap-2">
                <p className="text-sm text-muted-foreground">Please rate your experience.</p>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                        <Button key={rating} variant="ghost" size="icon">
                            <Star className="w-6 h-6" />
                        </Button>
                    ))}
                </div>
                 <Button className="w-full mt-4" onClick={onReset}>Done</Button>
            </CardFooter>
        </>
    )
}

export function RidePanel(props: RidePanelProps) {
  const { serviceState, provider, destination, eta, onCancel, onReset, activeTab, showStatusScreen, setShowStatusScreen } = props;

  const renderContent = () => {
    // If the status screen should be shown (for active deliveries or rides)
    if (showStatusScreen) {
        switch (serviceState) {
          case 'SEARCHING':
            return <SearchingView onCancel={onCancel} onBack={() => setShowStatusScreen(false)} activeTab={activeTab} />;
          case 'PROVIDER_EN_ROUTE':
            return <ProviderEnRouteView provider={provider} onCancel={onCancel} activeTab={activeTab} />;
          case 'IN_PROGRESS':
            return <InProgressView destination={destination} eta={eta} activeTab={activeTab} />;
          case 'COMPLETED':
            return <CompletedView onReset={onReset} activeTab={activeTab} />;
          default:
             // This case should ideally not be reached if showStatusScreen is true,
             // but as a fallback, show the request view.
             return <RequestView {...props} />;
        }
    }
    
    // Default view when no active process is being monitored on screen
    return <RequestView {...props} />;
  };

  return <Card className="w-full max-w-md mx-auto shadow-2xl">{renderContent()}</Card>;
}
