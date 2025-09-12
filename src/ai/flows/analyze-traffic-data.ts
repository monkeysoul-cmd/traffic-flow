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

const VehicleDetectionSchema = z.object({
  box: z.array(z.number()).describe('The bounding box of the detected vehicle [x, y, width, height].'),
  timestamp: z.number().describe('The timestamp in seconds when the vehicle was detected.'),
});

const AnalyzeTrafficDataInputSchema = z.object({
  cameraFeedDataUri: z
    .string()
    .describe(
      "A data URI of the camera feed video that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z.string().describe('The location of the camera.'),
  timestamp: z.string().describe('The timestamp of the camera feed data.'),
});
export type AnalyzeTrafficDataInput = z.infer<typeof AnalyzeTrafficDataInputSchema>;

const AnalyzeTrafficDataOutputSchema = z.object({
  vehicleCount: z
    .number()
    .describe('The total number of unique vehicles detected in the camera feed.'),
  trafficLevel: z
    .string()
    .describe(
      'The level of traffic detected in the camera feed (e.g., low, medium, high).'
    ),
  potentialIncidents: z
    .string()
    .optional()
    .describe(
      'Any potential incidents detected in the camera feed (e.g., accidents, road closures).'
    ),
  vehicles: z.array(VehicleDetectionSchema).describe('A list of all detected vehicles with their bounding boxes and timestamps.'),
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

You will receive a camera feed video, its location, and a timestamp. Your task is to identify the number of vehicles, the level of traffic, any potential incidents, and track each vehicle's position over time.

Location: {{{location}}}
Timestamp: {{{timestamp}}}
Camera Feed: {{media url=cameraFeedDataUri}}

Analyze the camera feed and provide the following information:
- vehicleCount: The total number of unique vehicles detected in the camera feed.
- trafficLevel: The level of traffic detected in the camera feed (e.g., low, medium, high).
- potentialIncidents: Any potential incidents detected in the camera feed (e.g., accidents, road closures). If there are no incidents, leave this field blank.
- vehicles: A list of all detected vehicle instances. For each instance, provide its bounding box and the timestamp (in seconds) of its appearance in the video.

Ensure that the vehicle count is accurate. Base traffic level on the number of vehicles detected, with more vehicles meaning higher traffic.

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
