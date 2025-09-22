'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
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
import { Loader2, MapPin, Star, Clock, CheckCircle, ShoppingCart } from 'lucide-react';
import type { RideState, Driver, RideRequestData } from '@/app/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type RidePanelProps = {
  rideState: RideState;
  driver: Driver | null;
  destination: string | null;
  eta: string | null;
  isSubmitting: boolean;
  onRequestRide: (data: RideRequestData) => void;
  onCancel: () => void;
  onReset: () => void;
};

const rideRequestSchema = z.object({
  destination: z.string().min(3, { message: 'Please enter a valid destination.' }),
  traffic: z.enum(['light', 'moderate', 'heavy'], {
    required_error: 'You need to select a traffic condition.',
  }),
});

const deliveryRequestSchema = z.object({
  restaurant: z.string().min(3, { message: 'Please enter a restaurant.' }),
  item: z.string().min(3, { message: 'Please enter an item to deliver.' }),
});

function RideRequestForm({ onRequestRide, isSubmitting }: Pick<RidePanelProps, 'onRequestRide' | 'isSubmitting'>) {
  const form = useForm<z.infer<typeof rideRequestSchema>>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: { destination: '', traffic: 'moderate' },
  });

  function onSubmit(data: z.infer<typeof rideRequestSchema>) {
    onRequestRide(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Silver Jubilee Tower" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="traffic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Campus Traffic</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select traffic conditions" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Request Transit
        </Button>
      </form>
    </Form>
  );
}

function DeliveryRequestForm({ isSubmitting }: Pick<RidePanelProps, 'isSubmitting'>) {
    const form = useForm<z.infer<typeof deliveryRequestSchema>>({
        resolver: zodResolver(deliveryRequestSchema),
        defaultValues: { restaurant: '', item: '' },
    });

    function onSubmit(data: z.infer<typeof deliveryRequestSchema>) {
        // Placeholder for delivery request logic
        console.log("Delivery requested:", data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                    control={form.control}
                    name="restaurant"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Restaurant / Shop</FormLabel>
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
                            <FormLabel>Item to Deliver</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Chicken Biryani" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Find a Deliverer
                </Button>
            </form>
        </Form>
    )
}

function RequestView(props: Pick<RidePanelProps, 'onRequestRide' | 'isSubmitting'>) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">How can we help?</CardTitle>
        <CardDescription>Book a ride or get something delivered.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transit">Transit</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
            <TabsContent value="transit">
                <RideRequestForm {...props} />
            </TabsContent>
            <TabsContent value="delivery">
                <DeliveryRequestForm {...props} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}


function SearchingView({ onCancel }: Pick<RidePanelProps, 'onCancel'>) {
  return (
    <>
      <CardHeader className="items-center text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <CardTitle className="font-headline mt-4">Finding Your Ride</CardTitle>
        <CardDescription>Please wait while we connect you with a driver.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onCancel}>
          Cancel Search
        </Button>
      </CardFooter>
    </>
  );
}

function DriverEnRouteView({ driver, onCancel }: Pick<RidePanelProps, 'driver' | 'onCancel'>) {
  if (!driver) return null;
  return (
    <>
        <CardHeader>
            <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={driver.avatarUrl} alt={driver.name} data-ai-hint="portrait person" />
                    <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="font-headline text-xl">{driver.name} is on the way</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" /> {driver.rating}
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-lg font-medium">{driver.vehicle}</p>
            <p className="text-sm px-4 py-1 bg-secondary rounded-md inline-block mt-1 font-mono tracking-widest">{driver.licensePlate}</p>
            <p className="text-muted-foreground mt-2">Arriving in approximately 5 minutes.</p>
        </CardContent>
        <CardFooter>
            <Button variant="outline" className="w-full" onClick={onCancel}>Cancel Ride</Button>
        </CardFooter>
    </>
  )
}

function InProgressView({ destination, eta }: Pick<RidePanelProps, 'destination' | 'eta'>) {
    return (
        <>
            <CardHeader className="items-center text-center">
                <div className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    <CardTitle className="font-headline text-xl">En route to {destination}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Estimated arrival in</p>
                <p className="text-4xl font-bold font-headline text-primary">{eta} min</p>
                <p className="text-sm text-muted-foreground mt-2">(Predicted by VITransit AI)</p>
            </CardContent>
        </>
    )
}

function CompletedView({ onReset }: Pick<RidePanelProps, 'onReset'>) {
    return (
        <>
            <CardHeader className="items-center text-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <CardTitle className="font-headline mt-4">You've Arrived!</CardTitle>
                <CardDescription>Thank you for using VITransit.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-sm text-muted-foreground">We hope you had a pleasant journey.</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={onReset}>New Request</Button>
            </CardFooter>
        </>
    )
}

export function RidePanel(props: RidePanelProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
      <Card className="max-w-md mx-auto shadow-2xl">
        {props.rideState === 'IDLE' && <RequestView {...props} />}
        {props.rideState === 'SEARCHING' && <SearchingView {...props} />}
        {props.rideState === 'DRIVER_EN_ROUTE' && <DriverEnRouteView {...props} />}
        {props.rideState === 'IN_PROGRESS' && <InProgressView {...props} />}
        {props.rideState === 'COMPLETED' && <CompletedView {...props} />}
      </Card>
    </div>
  );
}
