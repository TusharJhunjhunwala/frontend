'use server';

/**
 * @fileOverview A flow to predict the estimated time of arrival (ETA) for a delivery.
 *
 * - predictDeliveryETA - A function that predicts the delivery ETA.
 * - PredictDeliveryETAInput - The input type for the predictDeliveryETA function.
 * - PredictDeliveryETAOutput - The return type for the predictDeliveryETA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDeliveryETAInputSchema = z.object({
  restaurantLocation: z
    .string()
    .describe('The location of the restaurant or shop.'),
  dropOffLocation: z.string().describe('The destination for the delivery.'),
  trafficConditions: z
    .string()
    .describe('A description of the current traffic conditions on campus.'),
});
export type PredictDeliveryETAInput = z.infer<
  typeof PredictDeliveryETAInputSchema
>;

const PredictDeliveryETAOutputSchema = z.object({
  estimatedDeliveryTime: z
    .string()
    .describe('The estimated time of delivery in minutes.'),
});
export type PredictDeliveryETAOutput = z.infer<
  typeof PredictDeliveryETAOutputSchema
>;

export async function predictDeliveryETA(
  input: PredictDeliveryETAInput
): Promise<PredictDeliveryETAOutput> {
  return predictDeliveryETAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDeliveryETAPrompt',
  input: {schema: PredictDeliveryETAInputSchema},
  output: {schema: PredictDeliveryETAOutputSchema},
  prompt: `You are an expert at predicting delivery times on a university campus.

You will be given the restaurant's location, the drop-off location, and the current traffic conditions.

Based on this information, you will predict the estimated delivery time in minutes.

Restaurant Location: {{{restaurantLocation}}}
Drop-off Location: {{{dropOffLocation}}}
Traffic conditions: {{{trafficConditions}}}

ETA:`,
});

const predictDeliveryETAFlow = ai.defineFlow(
  {
    name: 'predictDeliveryETAFlow',
    inputSchema: PredictDeliveryETAInputSchema,
    outputSchema: PredictDeliveryETAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
