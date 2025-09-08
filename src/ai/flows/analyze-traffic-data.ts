'use server';

/**
 * @fileOverview Analyzes real-time traffic data from camera feeds using AI.
 *
 * - analyzeTrafficData - Analyzes traffic data and identifies vehicle counts and congestion areas.
 * - AnalyzeTrafficDataInput - The input type for the analyzeTrafficData function.
 * - AnalyzeTrafficDataOutput - The return type for the analyzeTrafficData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTrafficDataInputSchema = z.object({
  cameraFeedDataUri: z
    .string()
    .describe(
      "A data URI of the camera feed image that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z.string().describe('The location of the camera.'),
  timestamp: z.string().describe('The timestamp of the camera feed data.'),
});
export type AnalyzeTrafficDataInput = z.infer<typeof AnalyzeTrafficDataInputSchema>;

const AnalyzeTrafficDataOutputSchema = z.object({
  vehicleCount: z
    .number()
    .describe('The number of vehicles detected in the camera feed.'),
  congestionLevel: z
    .string()
    .describe(
      'The level of congestion detected in the camera feed (e.g., low, medium, high).'
    ),
  potentialIncidents: z
    .string()
    .optional()
    .describe(
      'Any potential incidents detected in the camera feed (e.g., accidents, road closures).'
    ),
});
export type AnalyzeTrafficDataOutput = z.infer<typeof AnalyzeTrafficDataOutputSchema>;

export async function analyzeTrafficData(
  input: AnalyzeTrafficDataInput
): Promise<AnalyzeTrafficDataOutput> {
  return analyzeTrafficDataFlow(input);
}

const analyzeTrafficDataPrompt = ai.definePrompt({
  name: 'analyzeTrafficDataPrompt',
  input: {schema: AnalyzeTrafficDataInputSchema},
  output: {schema: AnalyzeTrafficDataOutputSchema},
  prompt: `You are an AI that analyzes real-time traffic data from camera feeds.

You will receive a camera feed image, its location, and a timestamp. Your task is to identify the number of vehicles, the level of congestion, and any potential incidents.

Location: {{{location}}}
Timestamp: {{{timestamp}}}
Camera Feed: {{media url=cameraFeedDataUri}}

Analyze the camera feed and provide the following information:
- vehicleCount: The number of vehicles detected in the camera feed.
- congestionLevel: The level of congestion detected in the camera feed (e.g., low, medium, high).
- potentialIncidents: Any potential incidents detected in the camera feed (e.g., accidents, road closures). If there are no incidents, leave this field blank.

Ensure that the vehicle count is accurate. Base congestion level on the number of vehicles detected, with more vehicles meaning higher congestion.

Output the information in JSON format.
`,
});

const analyzeTrafficDataFlow = ai.defineFlow(
  {
    name: 'analyzeTrafficDataFlow',
    inputSchema: AnalyzeTrafficDataInputSchema,
    outputSchema: AnalyzeTrafficDataOutputSchema,
  },
  async input => {
    const {output} = await analyzeTrafficDataPrompt(input);
    return output!;
  }
);
