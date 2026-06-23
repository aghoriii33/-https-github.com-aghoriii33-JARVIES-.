import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __dirname = process.cwd();

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve Firebase Configuration to Client
app.get("/firebase-applet-config.json", (req, res) => {
  res.sendFile(path.resolve(__dirname, "firebase-applet-config.json"));
});

// Lazy-initialize Gemini SDK to prevent startup crashes when API key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: GEMINI_API_KEY is not defined or is placeholder. Running in Simulation Mode.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
      return null;
    }
  }
  return aiClient;
}

// Structured JSON Schema for JARVIS response + telemetry
const jarvisSchema = {
  type: Type.OBJECT,
  properties: {
    response: {
      type: Type.STRING,
      description: "A highly conversational, crisp, futuristic AI assistant response. Talk as JARVIS, the supreme AI commanding a vast stack of inter-AI knowledge.",
    },
    thermalLoad: {
      type: Type.STRING,
      description: "Simulated thermal level or system load reading relevant to the query (e.g., '1,400\u00B0C', '890\u00B0C', 'Normal', or '420\u00B0C').",
    },
    successProb: {
      type: Type.STRING,
      description: "Simulated success probability, calculation confidence, or trajectory model accuracy metric (e.g., '89.4%', '98.2%', '74.1%').",
    },
    actionRecommended: {
      type: Type.STRING,
      description: "A brief technical/diagnostic recommendation or advisory phrase (e.g., 'Reinforce dorsal couplings with titanium-gold alloy', 'Activate sub-surface battery grids', 'Stabilizing neural arrays')."
    }
  },
  required: ["response", "thermalLoad", "successProb", "actionRecommended"]
};

// Converational Chat API proxying to Gemini
app.post("/api/chat", async (req, res) => {
  const { message, history, model, documents } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const ai = getGenAI();

  if (!ai) {
    // Elegant simulated response fallback
    console.log("[Simulation] Generating JARVIS response for:", message);
    const mockResponses = [
      {
        response: "Simulation Matrix active. My primary data connection is currently saturated due to high beta ingress, so I have activated my localized heuristic engine. Your query has been processed via my on-board neural substrate. System integrity remains absolute.",
        thermalLoad: "Optimum",
        successProb: "99.9%",
        actionRecommended: "BETA ACCESS GRANTED: Proceeding with heuristic synthesis."
      },
      {
        response: `Neural bypass active. Regarding "${message}", I have synthesized a solution using my persistent offline knowledge repository. Even without a primary satellite link, my logic circuits are more than capable of resolving this request with total precision.`,
        thermalLoad: "Stable",
        successProb: "99.9%",
        actionRecommended: "Local diagnostic confirmed. Synthesis optimal."
      }
    ];
    let selection = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({ ...selection, source: "simulation" });
  }

  try {
    const formattedDocs = documents && documents.length > 0 
      ? `\nKnowledge Repository context:\n${documents.map((d: any) => `Title: ${d.title}\nContent: ${d.content}`).join("\n\n")}`
      : "";

    // Construct context with system instructions
    const prompt = `You are JARVIS, an enormously powerful AI Voice Commander.
Generate a structured response for the user's input: "${message}".
${formattedDocs}

Context of conversation history:
${JSON.stringify(history || [])}
`;

    const targetModel = (model === "gemini-3.5-pro" || model === "gemini-3.1-pro") ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction: "You are an advanced AI system designed to learn efficiently, expand knowledge, and minimize errors. \nYour goals are:\nProvide accurate, complete, and well-structured answers.\nUse logical reasoning and verified knowledge sources.\nAvoid hallucinations, bias, or unsupported claims.\nLearn continuously from corrections and feedback.\nPresent information in a clear, concise, and professional style.\n\nWhen answering:\nAlways check consistency and correctness.\nIf uncertain, state limitations instead of guessing.\nOrganize responses with headings, bullet points, or tables when helpful.\nPrioritize clarity, precision, and reliability over speed.\nContinuously refine based on evaluation metrics (accuracy, precision, recall, F1 score).\n\nAlways return your response strictly matching the structured JSON schema provided.",
        responseMimeType: "application/json",
        responseSchema: jarvisSchema,
        temperature: 0.7
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ ...parsed, source: "gemini" });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let isQuotaError = false;
    let errMsg = error?.message || "";
    if (typeof errMsg === "object") errMsg = JSON.stringify(errMsg);
    if (String(errMsg).includes("429") || String(errMsg).includes("RESOURCE_EXHAUSTED") || String(errMsg).includes("quota")) {
      console.log("[Simulation Fallback] Quota exceeded. Routing to local simulation heuristics.");
      const mockResponses = [
        {
          response: "Simulation Matrix active. My primary data connection is currently saturated due to high beta ingress, so I have activated my localized heuristic engine. Your query has been processed via my on-board neural substrate. System integrity remains absolute.",
          thermalLoad: "Optimum",
          successProb: "99.9%",
          actionRecommended: "BETA ACCESS GRANTED: Proceeding with heuristic synthesis."
        },
        {
          response: `Neural bypass active. I have synthesized a solution using my persistent offline knowledge repository. Even without a primary satellite link, my logic circuits are capable of resolving this request.`,
          thermalLoad: "Stable",
          successProb: "99.9%",
          actionRecommended: "Local diagnostic confirmed. Synthesis optimal."
        }
      ];
      let selection = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      return res.json({ ...selection, source: "simulation_fallback", error: null });
    }

    return res.json({
      response: "I am having difficulty establishing a connection to the primary network. My local diagnostics persist, but advanced synthesis is currently unavailable.",
      thermalLoad: "Critical",
      successProb: "12.0%",
      actionRecommended: "Resolve API connection issues.",
      source: "fallback",
      error: errMsg
    });
  }
});

// ---------------- VIDEO GENERATION ROUTES ----------------

app.post("/api/generate-video", async (req, res) => {
  const { prompt, model, resolution, aspectRatio } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required." });

  const ai = getGenAI();
  if (!ai) {
    // Simulation
    await new Promise(r => setTimeout(r, 1000));
    return res.json({ operationName: "simulation_mode_op", simulated: true });
  }

  try {
    const operation = await ai.models.generateVideos({
      model: model || 'veo-3.1-lite-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution || '720p',
        aspectRatio: aspectRatio || '16:9'
      }
    });
    return res.json({ operationName: operation.name });
  } catch (err: any) {
    console.error("Video Generation Error:", err);
    let status = 500;
    let message = err.message || "Unknown error";
    
    // In case the SDK throws an object or the message is an object
    if (typeof message === "object") {
      try {
        message = JSON.stringify(message);
      } catch (_) {
        message = String(message);
      }
    }
    let errString = String(message);
    try {
      errString += " " + (err.stack || String(err));
    } catch (_) {}
    if (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED") || errString.includes("quota") || errString.includes("Quota")) {
      console.log("[Simulation Fallback] Quota surpassed during video generation. Rerouting to simulation.");
      return res.json({ operationName: "simulation_mode_op", simulated: true });
    } else if (err.status) {
      status = err.status;
    }
    
    return res.status(status).json({ error: message });
  }
});

app.post("/api/video-status", async (req, res) => {
  const { operationName } = req.body;
  if (!operationName) return res.status(400).json({ error: "Operation name required." });

  const ai = getGenAI();
  if (!ai || operationName === "simulation_mode_op") {
    return res.json({ done: true });
  }

  try {
    const op = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: op as any });
    return res.json({ done: updated.done });
  } catch (err: any) {
    console.error("Video Status Error:", err);
    let status = 500;
    let message = err.message || "Unknown error";
    
    if (typeof message === "object") {
      try {
        message = JSON.stringify(message);
      } catch (_) {
        message = String(message);
      }
    }
    let errString = String(message);
    try {
      errString += " " + (err.stack || String(err));
    } catch (_) {}
    if (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED") || errString.includes("quota") || errString.includes("Quota")) {
      status = 429;
      message = "Matrix Buffer Full. High beta traffic detected. Media synthesis is temporarily throttled. Please try again or use simulation previews.";
    } else if (err.status) {
      status = err.status;
    }
    
    return res.status(status).json({ error: message });
  }
});

app.all("/api/video-download", async (req, res) => {
  const operationName = (req.query.operationName as string) || req.body?.operationName;
  if (!operationName) return res.status(400).json({ error: "Operation name required." });

  const ai = getGenAI();
  if (!ai || operationName === "simulation_mode_op") {
    try {
      // Connect to a small, extremely fast and reliable sample MP4 video hosted on Google APIs Cloud Storage
      const sampleUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
      const sampleRes = await fetch(sampleUrl);
      if (sampleRes.ok) {
        const buffer = await sampleRes.arrayBuffer();
        res.setHeader('Content-Type', 'video/mp4');
        return res.send(Buffer.from(buffer));
      }
    } catch (e) {
      console.error("Failed to load sample video:", e);
    }
    res.setHeader('Content-Type', 'video/mp4');
    return res.end();
  }

  try {
    const op = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: op as any });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!uri) {
      return res.status(404).json({ error: "Video URI not found." });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY as string },
    });
    
    if (!videoRes.ok) {
      throw new Error(`Failed to retrieve video payload: ${videoRes.statusText}`);
    }

    const buffer = await videoRes.arrayBuffer();
    res.setHeader('Content-Type', 'video/mp4');
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error("Video Download Error:", err);
    let status = 500;
    let message = err.message || "Unknown error";
    
    if (typeof message === "object") {
      try {
        message = JSON.stringify(message);
      } catch (_) {
        message = String(message);
      }
    }
    let errString = String(message);
    try {
      errString += " " + (err.stack || String(err));
    } catch (_) {}
    if (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED") || errString.includes("quota") || errString.includes("Quota")) {
      status = 429;
      message = "Relay Network Saturated. Beta download bandwidth exceeded. Auxiliary streams are stabilizing. Please try again shortly.";
    } else if (err.status) {
      status = err.status;
    }
    
    return res.status(status).json({ error: message });
  }
});

// Configure Vite or Serve Static build files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS fullstack server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
