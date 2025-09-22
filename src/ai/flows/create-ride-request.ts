'use server';

/**
 * @fileOverview A flow to create a ride request and predict the ETA.
 *
 * - createRideRequest - A function that creates a ride request.
 * - CreateRideRequestInput - The input type for the createRideRequest function.
 * - CreateRideRequestOutput - The return type for the createRideRequest function.
 */

import {ai} from '@/ai/genkit';
import {predictDestinationETA, PredictDestinationETAInput} from './predict-destination-eta';
import {z} from 'genkit';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CreateRideRequestInputSchema = z.object({
  destination: z.string(),
});
export type CreateRideRequestInput = z.infer<typeof CreateRideRequestInputSchema>;

const CreateRideRequestOutputSchema = z.object({
  estimatedArrivalTime: z.string(),
  rideId: z.string(),
});
export type CreateRideRequestOutput = z.infer<typeof CreateRideRequestOutputSchema>;

export async function createRideRequest(input: CreateRideRequestInput): Promise<CreateRideRequestOutput> {
  return createRideRequestFlow(input);
}

const createRideRequestFlow = ai.defineFlow(
  {
    name: 'createRideRequestFlow',
    inputSchema: CreateRideRequestInputSchema,
    outputSchema: CreateRideRequestOutputSchema,
  },
  async (input) => {
    const rideRequestRef = await addDoc(collection(db, 'rideRequests'), {
        ...input,
        origin: 'VIT Vellore Main Gate',
        status: 'SEARCHING',
        createdAt: new Date().toISOString(),
    });

    const etaInput: PredictDestinationETAInput = {
        currentLocation: 'VIT Vellore Main Gate',
        destination: input.destination,
        trafficConditions: 'moderate',
    };
    const etaResult = await predictDestinationETA(etaInput);

    return {
      estimatedArrivalTime: etaResult.estimatedArrivalTime,
      rideId: rideRequestRef.id,
    };
  }
);
