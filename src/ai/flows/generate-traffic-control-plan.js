"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateControlPlanInputSchema = z.object({
  location: z.string(),
  vehicleCount: z.number(),
  trafficLevel: z.string(),
  potentialIncidents: z.string().optional(),
});

const GenerateControlPlanOutputSchema = z.object({
  recommendedLightDuration: z.number().describe("Recommended green light duration in seconds."),
  reroutingStrategy: z.string().describe("Suggested rerouting strategy for traffic nearby."),
  dispatchAction: z.string().describe("Actionable dispatch recommendation (e.g., dispatch police, ambulance, or none)."),
  explanation: z.string().describe("A brief explanation for these recommendations."),
});

const generateControlPlanPrompt = ai.definePrompt({
  name: "generateControlPlanPrompt",
  input: { schema: GenerateControlPlanInputSchema },
  output: { schema: GenerateControlPlanOutputSchema },
  prompt: `You are an expert traffic management AI.
  
Analyze the following traffic status and generate an optimization control plan:
Location: {{{location}}}
Vehicle Count: {{{vehicleCount}}}
Traffic Level: {{{trafficLevel}}}
Potential Incidents: {{{potentialIncidents}}}

Please output:
1. recommendedLightDuration: A suggested green light duration (in seconds, between 15 and 90) based on traffic level (e.g. low traffic -> shorter green, high traffic -> longer green).
2. reroutingStrategy: Suggestions on how to redirect traffic or display warnings on dynamic signage.
3. dispatchAction: Recommended action for emergency response or traffic control officers.
4. explanation: Rationale behind your recommendation.

Output the information in JSON format.
`,
});

export async function generateTrafficControlPlan(input) {
  return generateTrafficControlPlanFlow(input);
}

const generateTrafficControlPlanFlow = ai.defineFlow(
  {
    name: "generateTrafficControlPlanFlow",
    inputSchema: GenerateControlPlanInputSchema,
    outputSchema: GenerateControlPlanOutputSchema,
  },
  async (input) => {
    const { output } = await generateControlPlanPrompt(input);
    return output;
  },
);
