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
  pickupPoint: z.string().describe('The location where the item should be picked up.'),
  item: z.string().describe('The item to be delivered.'),
  deliverTo: z.string().describe('The final delivery destination.'),
  offerFee: z.string().describe('The fee offered for the delivery.'),
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
    // 1. Save the delivery request to Firestore with 'SEARCHING' status.
    const deliveryRequestRef = await addDoc(collection(db, 'deliveryRequests'), {
        restaurant: input.pickupPoint, // Use 'restaurant' to match getDeliveryRequests flow
        item: input.item,
        deliverTo: input.deliverTo,
        offerFee: input.offerFee,
        paymentMethod: 'cod', // Always 'cod' as requested
        status: 'SEARCHING',
        createdAt: new Date().toISOString(), // Save as ISO string
    });

    // 2. Predict the ETA for the delivery.
    const etaInput: PredictDeliveryETAInput = {
        restaurantLocation: input.pickupPoint,
        dropOffLocation: input.deliverTo,
        trafficConditions: 'moderate', // Assuming moderate traffic for now
    };
    const etaResult = await predictDeliveryETA(etaInput);

    // 3. Return the ETA and the new delivery ID to the frontend.
    return {
      estimatedDeliveryTime: etaResult.estimatedDeliveryTime,
      deliveryId: deliveryRequestRef.id,
    };
  }
);
