'use server';

/**
 * @fileOverview A flow to predict the estimated time of arrival (ETA) to a destination.
 *
 * - predictDestinationETA - A function that predicts the ETA.
 * - PredictDestinationETAInput - The input type for the predictDestinationETA function.
 * - PredictDestinationETAOutput - The return type for the predictDestinationETA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDestinationETAInputSchema = z.object({
  currentLocation: z
    .string()
    .describe('The current GPS coordinates of the rider.'),
  destination: z.string().describe('The destination GPS coordinates.'),
  trafficConditions: z
    .string()
    .describe('A description of the current traffic conditions.'),
});
export type PredictDestinationETAInput = z.infer<
  typeof PredictDestinationETAInputSchema
>;

const PredictDestinationETAOutputSchema = z.object({
  estimatedArrivalTime: z
    .string()
    .describe('The estimated time of arrival in minutes.'),
});
export type PredictDestinationETAOutput = z.infer<
  typeof PredictDestinationETAOutputSchema
>;

export async function predictDestinationETA(
  input: PredictDestinationETAInput
): Promise<PredictDestinationETAOutput> {
  return predictDestinationETAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDestinationETAPrompt',
  input: {schema: PredictDestinationETAInputSchema},
  output: {schema: PredictDestinationETAOutputSchema},
  prompt: `You are a ride-sharing ETA prediction expert.

You will be given the rider's current location, their destination, and the current traffic conditions.

Based on this information, you will predict the estimated time of arrival (ETA) in minutes.

Current location: {{{currentLocation}}}
Destination: {{{destination}}}
Traffic conditions: {{{trafficConditions}}}

ETA:`,
});

const predictDestinationETAFlow = ai.defineFlow(
  {
    name: 'predictDestinationETAFlow',
    inputSchema: PredictDestinationETAInputSchema,
    outputSchema: PredictDestinationETAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
