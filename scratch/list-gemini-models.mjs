import { config } from "dotenv";
config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in env");
    return;
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    console.log("Fetching available models...");
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log("Models found:", data.models.length);
      const embeddingModels = data.models.filter(m => m.supportedGenerationMethods.includes("embedContent"));
      console.log("Supported Embedding Models:");
      console.log(JSON.stringify(embeddingModels, null, 2));
    } else {
      console.log("No models key in response:", data);
    }
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
