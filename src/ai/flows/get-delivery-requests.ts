'use server';

/**
 * @fileOverview A flow to retrieve open delivery requests.
 *
 * - getDeliveryRequests - A function that fetches delivery requests.
 * - DeliveryRequest - The type for a single delivery request document.
 * - GetDeliveryRequestsOutput - The return type for the getDeliveryRequests function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DeliveryRequestSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  phone: z.string().optional(),
  pickupPoint: z.string(),
  item: z.string(),
  deliverTo: z.string(),
  offerFee: z.string(),
  paymentMethod: z.string(),
  status: z.string(),
  createdAt: z.string(),
});
export type DeliveryRequest = z.infer<typeof DeliveryRequestSchema>;

const GetDeliveryRequestsOutputSchema = z.object({
  requests: z.array(DeliveryRequestSchema),
});
export type GetDeliveryRequestsOutput = z.infer<typeof GetDeliveryRequestsOutputSchema>;


export async function getDeliveryRequests(): Promise<GetDeliveryRequestsOutput> {
  return getDeliveryRequestsFlow();
}

const getDeliveryRequestsFlow = ai.defineFlow(
  {
    name: 'getDeliveryRequestsFlow',
    outputSchema: GetDeliveryRequestsOutputSchema,
  },
  async () => {
    // Query for searching requests, and order them by creation date descending.
    // Firestore may require a composite index for this query.
    const q = query(
        collection(db, 'deliveryRequests'), 
        where('status', '==', 'SEARCHING'),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
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

    const validationResult = GetDeliveryRequestsOutputSchema.safeParse({ requests });
    if (!validationResult.success) {
      console.error("Data validation failed in getDeliveryRequestsFlow:", validationResult.error.issues);
      return { requests: [] };
    }
    
    return validationResult.data;
  }
);
