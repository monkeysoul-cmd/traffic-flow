// src/ai/flows/detect-traffic-incidents.ts
'use server';

/**
 * @fileOverview Detects traffic incidents (accidents, road closures) from camera feeds.
 *
 * - detectTrafficIncident - A function that handles the traffic incident detection process.
 * - DetectTrafficIncidentInput - The input type for the detectTrafficIncident function.
 * - DetectTrafficIncidentOutput - The return type for the detectTrafficIncident function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTrafficIncidentInputSchema = z.object({
  cameraFeedDataUri: z
    .string()
    .describe(
      "A data URI of the traffic camera feed, must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  locationDescription: z.string().describe('A description of the camera location.'),
});
export type DetectTrafficIncidentInput = z.infer<typeof DetectTrafficIncidentInputSchema>;

const DetectTrafficIncidentOutputSchema = z.object({
  incidentDetected: z.boolean().describe('Whether a traffic incident is detected.'),
  incidentType: z.string().describe('The type of traffic incident detected (e.g., accident, road closure).'),
  confidenceLevel: z.number().describe('The confidence level of the incident detection (0-1).'),
  description: z.string().describe('A detailed description of the incident.'),
});
export type DetectTrafficIncidentOutput = z.infer<typeof DetectTrafficIncidentOutputSchema>;

export async function detectTrafficIncident(input: DetectTrafficIncidentInput): Promise<DetectTrafficIncidentOutput> {
  return detectTrafficIncidentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectTrafficIncidentPrompt',
  input: {schema: DetectTrafficIncidentInputSchema},
  output: {schema: DetectTrafficIncidentOutputSchema},
  prompt: `You are an AI system designed to detect traffic incidents from traffic camera feeds.

You will receive a camera feed and a location description. Analyze the feed to detect any traffic incidents such as accidents or road closures.

Location Description: {{{locationDescription}}}
Camera Feed: {{media url=cameraFeedDataUri}}

Based on the camera feed, determine if there is an incident.

Respond in the following JSON format:
{
  "incidentDetected": true/false,
  "incidentType": "the type of incident or \"none\" if no incident",
  "confidenceLevel": a number between 0 and 1 indicating confidence,
  "description": "A detailed description of the incident or why no incident was detected."
}
`,
});

const detectTrafficIncidentFlow = ai.defineFlow(
  {
    name: 'detectTrafficIncidentFlow',
    inputSchema: DetectTrafficIncidentInputSchema,
    outputSchema: DetectTrafficIncidentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
