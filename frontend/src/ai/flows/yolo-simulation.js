"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { YoloSimulation } from "../../../../../simulation/yolo-simulation.js";

// Global state map of simulations
const simulations = new Map();

function getOrCreateSimulation(location) {
  if (!simulations.has(location)) {
    simulations.set(location, new YoloSimulation({ location }));
  }
  return simulations.get(location);
}

// ── Genkit Flow Inputs and Outputs ───────────────────────────────────────────
const YoloSimulationInputSchema = z.object({
  action: z.enum(["start", "frame", "stats", "reset"]),
  location: z.string().default("MG Road & Brigade Road: Lane 1"),
});

const YoloSimulationOutputSchema = z.any();

export async function yoloSimulation(input) {
  return yoloSimulationFlow(input);
}

const yoloSimulationFlow = ai.defineFlow(
  {
    name: "yoloSimulationFlow",
    inputSchema: YoloSimulationInputSchema,
    outputSchema: YoloSimulationOutputSchema,
  },
  async (input) => {
    const { action, location } = input;
    const sim = getOrCreateSimulation(location);

    switch (action) {
      case "start":
        sim.reset();
        return { success: true, message: `YOLO Simulation initialized for ${location}` };
      case "frame":
        return { success: true, frame: sim.nextFrame() };
      case "stats":
        return { success: true, stats: sim.getStats() };
      case "reset":
        sim.reset();
        return { success: true, message: `YOLO Simulation reset for ${location}` };
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }
);
