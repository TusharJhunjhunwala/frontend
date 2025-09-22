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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DeliveryRequestSchema = z.object({
  id: z.string(),
  restaurant: z.string(),
  item: z.string(),
  deliverTo: z.string(),
  offerFee: z.string(),
  maxExtra: z.string(),
  paymentMethod: z.enum(['upi', 'cod']),
  upiId: z.string().optional(),
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
    const q = query(collection(db, 'deliveryRequests'), where('status', '==', 'SEARCHING'));
    const querySnapshot = await getDocs(q);
    const requests: DeliveryRequest[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        restaurant: data.restaurant,
        item: data.item,
        deliverTo: data.deliverTo,
        offerFee: data.offerFee,
        maxExtra: data.maxExtra,
        paymentMethod: data.paymentMethod,
        upiId: data.upiId,
        status: data.status,
        createdAt: data.createdAt,
      });
    });

    return { requests };
  }
);
