'use server';

/**
 * @fileOverview A flow to create a delivery request and predict the ETA.
 *
 * - createDeliveryRequest - A function that creates a delivery request.
 * - CreateDeliveryRequestInput - The input type for the createDeliveryRequest function.
 * - CreateDeliveryRequestOutput - The return type for the createDeliveryRequest function.
 */

import {ai} from '@/ai/genkit';
import {predictDeliveryETA, PredictDeliveryETAInput} from './predict-delivery-eta';
import {z} from 'genkit';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CreateDeliveryRequestInputSchema = z.object({
  restaurant: z.string(),
  item: z.string(),
  deliverTo: z.string(),
  offerFee: z.string(),
  maxExtra: z.string(),
  paymentMethod: z.enum(['upi', 'cod']),
  upiId: z.string().optional(),
});
export type CreateDeliveryRequestInput = z.infer<typeof CreateDeliveryRequestInputSchema>;

const CreateDeliveryRequestOutputSchema = z.object({
  estimatedDeliveryTime: z.string(),
  deliveryId: z.string(),
});
export type CreateDeliveryRequestOutput = z.infer<typeof CreateDeliveryRequestOutputSchema>;

export async function createDeliveryRequest(input: CreateDeliveryRequestInput): Promise<CreateDeliveryRequestOutput> {
  return createDeliveryRequestFlow(input);
}

const createDeliveryRequestFlow = ai.defineFlow(
  {
    name: 'createDeliveryRequestFlow',
    inputSchema: CreateDeliveryRequestInputSchema,
    outputSchema: CreateDeliveryRequestOutputSchema,
  },
  async (input) => {
    const deliveryRequestRef = await addDoc(collection(db, 'deliveryRequests'), {
        ...input,
        status: 'SEARCHING',
        createdAt: new Date().toISOString(),
    });

    const etaInput: PredictDeliveryETAInput = {
        restaurantLocation: input.restaurant,
        dropOffLocation: input.deliverTo,
        trafficConditions: 'moderate',
    };
    const etaResult = await predictDeliveryETA(etaInput);

    return {
      estimatedDeliveryTime: etaResult.estimatedDeliveryTime,
      deliveryId: deliveryRequestRef.id,
    };
  }
);
