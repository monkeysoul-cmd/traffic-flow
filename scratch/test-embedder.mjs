import { config } from "dotenv";
config();

import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
});

async function testEmbedders() {
  const embedders = ["googleai/gemini-embedding-001", "googleai/gemini-embedding-2"];
  
  for (const embedder of embedders) {
    try {
      console.log(`Testing embedder: ${embedder}...`);
      const response = await ai.embed({
        embedder: embedder,
        content: "Hello, world!"
      });
      // The response from ai.embed in some versions of Genkit contains embedding: number[]
      const vector = response[0]?.embedding || response.embedding || response;
      console.log(`Success! Embedder ${embedder} works! Vector length:`, Array.isArray(vector) ? vector.length : typeof vector);
      if (Array.isArray(vector)) {
        console.log("Vector snippet:", vector.slice(0, 5));
      }
    } catch (err) {
      console.error(`Failed for ${embedder}:`, err.message || err);
    }
  }
}

testEmbedders();
