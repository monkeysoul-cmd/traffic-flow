'use server';

/**
 * @fileOverview Predicts traffic congestion using historical and real-time data.
 *
 * - predictTrafficCongestion - A function that predicts traffic congestion.
 * - PredictTrafficCongestionInput - The input type for the predictTrafficCongestion function.
 * - PredictTrafficCongestionOutput - The return type for the predictTrafficCongestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTrafficCongestionInputSchema = z.object({
  historicalData: z
    .string()
    .describe('Historical traffic data, as a JSON string.'),
  realTimeData: z
    .string()
    .describe('Real-time traffic data from sensors, as a JSON string.'),
  weatherData: z
    .string()
    .optional()
    .describe('Weather data, as a JSON string.'),
});
export type PredictTrafficCongestionInput = z.infer<
  typeof PredictTrafficCongestionInputSchema
>;

const PredictTrafficCongestionOutputSchema = z.object({
  congestionPrediction: z
    .string()
    .describe('Predicted traffic congestion level (e.g., low, medium, high).'),
  bottleneckLocations: z
    .array(z.string())
    .describe('List of predicted bottleneck locations.'),
  suggestedActions: z
    .string()
    .describe(
      'Suggested actions to mitigate congestion (e.g., adjust signal timings, deploy traffic control).'
    ),
});
export type PredictTrafficCongestionOutput = z.infer<
  typeof PredictTrafficCongestionOutputSchema
>;

export async function predictTrafficCongestion(
  input: PredictTrafficCongestionInput
): Promise<PredictTrafficCongestionOutput> {
  return predictTrafficCongestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTrafficCongestionPrompt',
  input: {schema: PredictTrafficCongestionInputSchema},
  output: {schema: PredictTrafficCongestionOutputSchema},
  prompt: `You are an expert traffic congestion predictor.

  Based on the provided historical traffic data, real-time traffic data, and weather data (if available), predict traffic congestion levels, identify bottleneck locations, and suggest actions to mitigate congestion.

  Historical Data: {{{historicalData}}}
  Real-time Data: {{{realTimeData}}}
  Weather Data (if available): {{{weatherData}}}

  Provide your prediction, identified bottleneck locations, and suggested actions in a concise manner.
  Make sure that the output is a valid JSON.
  `,
});

const predictTrafficCongestionFlow = ai.defineFlow(
  {
    name: 'predictTrafficCongestionFlow',
    inputSchema: PredictTrafficCongestionInputSchema,
    outputSchema: PredictTrafficCongestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
