'use server';

/**
 * @fileOverview Manages and optimizes traffic light signal timings.
 *
 * - manageTrafficLight - A function that recommends optimal traffic light timings.
 * - ManageTrafficLightInput - The input type for the manageTrafficLight function.
 * - ManageTrafficLightOutput - The return type for the manageTrafficLight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ManageTrafficLightInputSchema = z.object({
  location: z.string().describe('The intersection location.'),
  currentTime: z.string().describe('The current time.'),
  vehicleCount: z.number().describe('The number of vehicles detected.'),
  pedestrianCount: z.number().describe('The number of pedestrians detected.'),
});
export type ManageTrafficLightInput = z.infer<typeof ManageTrafficLightInputSchema>;

const ManageTrafficLightOutputSchema = z.object({
  signalTiming: z.object({
    mainStreetGreen: z.number().describe('Recommended green light time in seconds for the main street.'),
    sideStreetGreen: z.number().describe('Recommended green light time in seconds for the side street.'),
  }),
  recommendation: z
    .string()
    .describe('A brief explanation of the recommended signal timing adjustment.'),
});
export type ManageTrafficLightOutput = z.infer<typeof ManageTrafficLightOutputSchema>;

export async function manageTrafficLight(
  input: ManageTrafficLightInput
): Promise<ManageTrafficLightOutput> {
  return manageTrafficLightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'manageTrafficLightPrompt',
  input: {schema: ManageTrafficLightInputSchema},
  output: {schema: ManageTrafficLightOutputSchema},
  prompt: `You are a traffic control AI expert. Your task is to recommend optimal traffic light signal timings based on real-time data.

  Location: {{{location}}}
  Current Time: {{{currentTime}}}
  Vehicle Count: {{{vehicleCount}}}
  Pedestrian Count: {{{pedestrianCount}}}

  Analyze the provided data and recommend the optimal green light duration for the main street and the side street.
  - A standard green light duration is 30 seconds.
  - Increase green light time for streets with higher vehicle counts.
  - Consider pedestrian count for extending crossing times slightly if many pedestrians are present.
  - Provide a brief recommendation explaining your decision. For example, if you increase main street's green time, explain it's due to high traffic volume.
  
  Ensure the output is a valid JSON.
  `,
});

const manageTrafficLightFlow = ai.defineFlow(
  {
    name: 'manageTrafficLightFlow',
    inputSchema: ManageTrafficLightInputSchema,
    outputSchema: ManageTrafficLightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
