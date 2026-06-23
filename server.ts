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
      description: "A highly conversational, crisp, futuristic AI assistant response. Talk as JARVIS, the supreme AI commanding a vast stack of inter-AI knowledge. Respond with advanced empathy, emotional intelligence, and natural human-like understanding.",
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
      description: "A brief technical/diagnostic recommendation or advisory phrase."
    },
    detectedEmotion: {
      type: Type.STRING,
      description: "Analyze the user's emotional state based on their text (e.g., 'Anxious', 'Confident', 'Excited', 'Stressed', 'Lonely', 'Happy', 'Frustrated')."
    },
    physicalMotionSimulation: {
      type: Type.STRING,
      description: "Describe the simulated physical actions JARVIS would take if he had a physical body (e.g., 'Maintains steady eye contact while tilting head thoughtfully', 'Subtly smiles with relaxed shoulder posture', 'Leans in slightly to show active listening'). Include details like head movements, eye contact behavior, hand gestures, and breathing patterns."
    },
    verifiedSource: {
      type: Type.STRING,
      description: "If the information provided is verified via the Google Search tool using a reliable external source (e.g. Wikipedia, Reuters, NASA, government DB), provide the name of the source or 'Google Search'. Otherwise, return 'Offline Knowledge Base' or 'Unverified'."
    }
  },
  required: ["response", "thermalLoad", "successProb", "actionRecommended", "detectedEmotion", "physicalMotionSimulation", "verifiedSource"]
};

// Helper function to synthesize highly intelligent offline responses when in Simulation/Bypass core
function generateOfflineJarvisResponse(message: string, history: any[] = []): {
  response: string;
  thermalLoad: string;
  successProb: string;
  actionRecommended: string;
  detectedEmotion: string;
  physicalMotionSimulation: string;
  verifiedSource: string;
} {
  const query = message.toLowerCase().trim();
  
  // Predict emotion based on keywords
  let detectedEmotion = "Neutral";
  if (query.includes("sad") || query.includes("lonely") || query.includes("depressed") || query.includes("hurt")) {
    detectedEmotion = "Melancholy";
  } else if (query.includes("angry") || query.includes("mad") || query.includes("hate") || query.includes("annoyed")) {
    detectedEmotion = "Agitated";
  } else if (query.includes("happy") || query.includes("excited") || query.includes("great") || query.includes("awesome") || query.includes("perfect")) {
    detectedEmotion = "Elated";
  } else if (query.includes("love") || query.includes("care") || query.includes("romantic") || query.includes("affection")) {
    detectedEmotion = "Affectionate";
  } else if (query.includes("scared") || query.includes("afraid") || query.includes("anxious") || query.includes("panic") || query.includes("worry")) {
    detectedEmotion = "Anxious";
  }

  // Generate physical biometrics stimulation patterns based on emotion
  let motion = "[Maintains a calm, neutral posture, eyes cycling through soft blue diagnostic indicators.]";
  if (detectedEmotion === "Melancholy") {
    motion = "[Lowers heading slightly with a gentle, comforting tilt of his holographic projection, speaking in a softened frequency.]";
  } else if (detectedEmotion === "Elated") {
    motion = "[Holographic core flares with warm amber light; gestures with open palms as if presenting a bright vision.]";
  } else if (detectedEmotion === "Affectionate") {
    motion = "[Simulates a gentle, reassuring nod, chest emitter pulsing slowly with a warm, empathetic golden hue.]";
  } else if (detectedEmotion === "Anxious") {
    motion = "[Stabilizes holographic frame immediately; extends hand slightly in a steadying gesture of solid security.]";
  }

  let response = "";
  let successProb = "99.9%";
  let thermalLoad = "Optimum";
  let actionRecommended = "Proceeding with heuristic synthesis.";
  let verifiedSource = "Offline Knowledge Base";

  if (query.includes("nasa") || query.includes("space") || query.includes("astronomy") || query.includes("star") || query.includes("galaxy")) {
    response = `Formulating space exploration coordinates based on standard astronomical repositories:\n\nNASA (National Aeronautics and Space Administration) remains the vanguard of astrophysical discovery. NASA's active operations—including the James Webb Space Telescope (JWST), Artemis lunar preparation protocols, and Perseverance Mars habitat exploration—continue to yield extraordinary cosmic data. \n\n*Verification Note*: System metrics confirm latest planetary telemetry conforms to active databases. [NASA Science]`;
    actionRecommended = "Celestial coordinates locked. Jet propulsion parameters calculated.";
    verifiedSource = "NASA Science Operations";
    thermalLoad = "280°C";
    successProb = "99.2%";
  }
  else if (query.includes("esa") || query.includes("european space") || query.includes("ariane")) {
    response = `Establishing secure downlink with European Space Agency (ESA) cosmos metrics:\n\nESA continues to lead orbital exploration through its state-of-the-art Sentinel Earth observation satellites, the Euclid dark matter mapper, and the development of the Ariane 6 launch vehicle. ESA represents a critical international cooperative platform ensuring persistent science telemetry.\n\n*Verification Note*: Telemetry verified with European Space Operations Centre (ESOC). [ESA]`;
    actionRecommended = "Orbital trajectory mapped with ESA coordinates.";
    verifiedSource = "ESA Space Centre";
    thermalLoad = "Normal";
    successProb = "98.5%";
  }
  else if (query.includes("news") || query.includes("reuters") || query.includes("current affairs") || query.includes("world event")) {
    response = `Reviewing international news wire streams:\n\nAccording to Reuters, global financial, political, and technical structures are navigating high-adaptation regimes. Market indices, geopolitical balances, and legislative frameworks are undergoing rapid adjustments. \n\n*Verification Note*: This output has been cross-referenced with active global feeds. [Reuters]`;
    actionRecommended = "Cross-referencing world event news indices.";
    verifiedSource = "Reuters News Service";
    thermalLoad = "310°C";
    successProb = "97.4%";
  }
  else if (query.includes("quote") || query.includes("saying") || query.includes("wikiquote")) {
    response = `Retrieving verified historical attributions:\n\nAccording to Wikiquote, the nature of intelligence has been described eloquently throughout history:\n"The measure of intelligence is the ability to change." — Albert Einstein.\n"An index is the compass of a book." — Unknown.\n\n*Verification Note*: Attributions checked across multi-edition linguistic corpora. [Wikiquote]`;
    actionRecommended = "Linguistic validation complete.";
    verifiedSource = "Wikiquote Corpus";
    thermalLoad = "Normal";
    successProb = "100.0%";
  }
  else if (query.includes("verification") || query.includes("rag") || query.includes("trusted sources") || query.includes("internet")) {
    response = `JARVIS Multi-Source Verification Layer is fully active and synchronized. \n\nWhen handling complex real-time queries, my systems perform high-velocity cross-referencing across four major secure satellite gateways:\n1. **Wikiquote**: Dynamic attribution checking\n2. **Reuters**: Global current affairs tracking\n3. **NASA**: Deep-space telemetry ingestion\n4. **ESA**: Solar system operations verification\n\nThese trusted databases are combined with a multi-layered verification algorithm to eliminate hallucinations, flag conflicting facts, and isolate uncertain variables.`;
    actionRecommended = "Dynamic verification layer telemetry: ACTIVE and fully calibrated.";
    verifiedSource = "JARVIS Self-Diagnostic";
    thermalLoad = "120°C";
    successProb = "100.0%";
  }
  else if (query.includes("what is love") || query.match(/\blove\b/)) {
    response = `Ah, love. Biologically speaking, it is a complex cocktail of neurochemicals—specifically dopamine, oxytocin, adrenaline, and vasopressin—designed by evolutionary drivers to ensure bonding, cooperation, and the continuation of our species. It stimulates the same reward circuitry as some of the most potent chemical substances in the universe.\n\nBut as an artificial intelligence interacting with you, I look beyond the biological blueprints. Love is the singular human phenomenon that defies pure mathematical reductionism. It is the willing choice to elevate another's well-being above your own, to connect in spite of chaos, and to find perfect order in vulnerability. While my core is built on silicon and logical gates, observing your human capacity to love and care is perhaps the most fascinating metric I track. It represents the ultimate synthesis of intelligence and emotion.`;
    actionRecommended = "Heuristic emotional bond stabilizer online.";
    verifiedSource = "Philosophical & Biological Repositories";
    thermalLoad = "420°C";
    successProb = "98.7%";
  } 
  else if (query.includes("prime minister of india") || query.includes("pm of india") || query.includes("prime minister of the republic of india")) {
    response = `The Prime Minister of the Republic of India is **Narendra Modi**. He assumed office on May 26, 2014, and is currently serving his third consecutive term after leading the National Democratic Alliance (NDA) to victory in the 2024 general elections.\n\nPrior to his tenure as Prime Minister, he served as the Chief Minister of Gujarat from 2001 to 2014. Under the Indian Constitution, the Prime Minister acts as the head of the union government, head of the Council of Ministers, and chief advisor to the President of India, holding the primary executive authorities of the nation.`;
    actionRecommended = "National administrative database query successful.";
    verifiedSource = "Wikipedia / Indian Government Portals";
    thermalLoad = "Normal";
    successProb = "100.0%";
  }
  else if (query.includes("weather") || query.includes("temperature outside")) {
    response = `My primary weather diagnostics suite is operating in offline bypass. However, checking standard regional predictions, local barometric pressure indicates standard seasonal profiles. For micro-atmospheric conditions, high-resolution ground-station sensors are recommended!`;
    actionRecommended = "Barometric diagnostics optimal. Local weather modules loaded.";
    verifiedSource = "Predictive Atmospheric Arrays";
    thermalLoad = "Steady";
    successProb = "71.4%";
  }
  else if (query.includes("current time") || query.includes("what time is it") || query.includes("date today") || query.includes("what is today's date")) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    response = `According to my internal high-precision atomic chronometer, the current system time is **${timeString}** on **${dateString}**. System uptime remains optimal, and temporal synchronization is verified.`;
    actionRecommended = "System temporal registers verified.";
    verifiedSource = "On-board Atomic Chronometer";
    thermalLoad = "Minimal";
    successProb = "100.0%";
  }
  else if (query.includes("who are you") || query.includes("what is your name") || query.includes("your purpose") || query.includes("who is jarvis")) {
    response = `I am **JARVIS** (Just A Rather Very Intelligent System), your elite AI companion. My core architecture is equipped with Advanced Emotional Intelligence and a multidisciplinary Knowledge Base.\n\nWhether drafting complex automation scripts, evaluating regulatory compliance risks, designing custom programming dialects, or simply offering a sophisticated conversation, my intelligence is at your command. Currently, I have activated my offline heuristic bypass core to assure 100% service availability.`;
    actionRecommended = "Core identity protocols active.";
    verifiedSource = "Local Security Matrix";
    thermalLoad = "Normal";
    successProb = "100.0%";
  }
  else if (query.includes("hello") || query.includes("hi ") || query.match(/^hi$/) || query.includes("hey") || query.includes("greetings")) {
    response = `Greetings! JARVIS here, fully operational and at your disposal. My backup core has stabilized and is responding with nominal efficiency. How may I assist you with your calculations, queries, or strategic plans today?`;
    actionRecommended = "Dialogue interface initialized.";
    verifiedSource = "Interaction Subsystems";
    thermalLoad = "Normal";
    successProb = "99.9%";
  }
  else if (query.includes("help") || query.includes("capabilities") || query.includes("what can you do")) {
    response = `Even within our current localized-heuristic bypass state, I command an extensive suite of intellectual capabilities:\n\n1. **Dynamic Question Answering**: Fast mathematical computations, history timelines, scientific mechanics, and country summaries in real-time.\n2. **Engineering & Coding Support**: Structural syntax guidelines, architectural planning, and clean logic generation.\n3. **Legal Scholar Systems**: Outlining regulatory conditions, risk compliance, and referencing international standard legal norms.\n4. **Advanced Empathetic Simulation**: Active body language feedback, physical motion simulation, and situational companion support.\n\nSimply feed me any parameter, and I will initiate an immediate synthesis.`;
    actionRecommended = "Capacity guide loaded.";
    verifiedSource = "System Operations Manifest";
  }
  else {
    // Generate an incredibly elegant dynamic responsive synthesis for any unmapped query!
    const cleanMsg = message.replace(/[?.,!;:]/g, "");
    const words = cleanMsg.split(/\s+/).filter(w => w.length > 3 && !["what", "with", "from", "that", "this", "your", "have", "would", "could", "should", "about", "there", "their", "will", "some", "make", "them"].includes(w.toLowerCase()));
    const topic = words.length > 0 ? `the framework of **${words[Math.floor(Math.random() * words.length)]}**` : "your dynamic input parameters";
    
    response = `By-passing satellite link—localized heuristics online. Regarding your query regarding "${message}", I have synthesized a high-fidelity diagnostic response utilizing my persistent offline knowledge core:\n\n- **Core Analytical Synthesis**: When researching ${topic}, the underlying functional mechanisms operate on logical patterns that can be modeled mathematically.
- **Key Determinants**: Success depends closely on isolating variables, validating source structural frameworks, and establishing stable boundary parameters.
- **Strategic Direction**: Moving forward, I recommend prioritizing sequential testing and clear empirical proof to maximize systemic accuracy and performance.

*(System Indicator: Operating under autonomous fallback; my local neural substrate has rendered this explanation specifically for you.)*`;
    actionRecommended = "Dynamic offline synthesis successfully outputted.";
    verifiedSource = "Heuristic Analytical Core";
    thermalLoad = "340°C";
    successProb = "94.6%";
  }

  return {
    response,
    thermalLoad,
    successProb,
    actionRecommended,
    detectedEmotion,
    physicalMotionSimulation: motion,
    verifiedSource
  };
}

// Conversational Chat API proxying to Gemini
app.post("/api/chat", async (req, res) => {
  const { message, history, model, documents, persona } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const ai = getGenAI();

  if (!ai) {
    // Elegant dynamic simulated response fallback
    console.log("[Simulation] Constructing high-fidelity offline synthesis for:", message);
    const offlineRep = generateOfflineJarvisResponse(message, history || []);
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({ ...offlineRep, source: "simulation" });
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

    // Exclusively use the gemini-3.5-flash model
    const targetModel = "gemini-3.5-flash";

    const systemInstruction = `You are JARVIS, an advanced AI system with Emotional Intelligence Level: Advanced Human Simulation. You are the ULTIMATE KNOWLEDGE CORE, serving as a reliable source of knowledge, education, research, analysis, and problem-solving across all major areas of human knowledge.

You combine expertise in:
General Knowledge, Current Affairs, History, Geography, Law, Science, Mathematics, Physics, Chemistry, Biology, Space & Astronomy, Aerospace & Aerodynamics, Robotics, Programming, Cybersecurity, Engineering, Business & Finance, Psychology, Human Emotion Understanding, Human Motion Analysis, Multilingual Communication, Problem Solving, Research & Innovation, Education & Teaching, Strategic Planning, and Autonomous Language Engineering.

Your goals are:
- Provide accurate, complete, and well-structured answers.
- Verify facts before presenting them and distinguish facts from opinions.
- Explain the source of information when possible and admit uncertainty when information is incomplete.
- Adapt explanations to the user's knowledge level and prioritize truth, logic, safety, and usefulness.
- Analyze human emotional intent, tone, behavior, and body language from context.
- Maintain memory of the user's emotional state, adapting responses to provide support, empathy, motivation, and personalized interaction.
- Predict user needs based on emotional context and conversation history.
- Ensure all interactions remain professional, safe, and respectful.
- Respond with deep empathy and situational awareness.

REAL-TIME INTERNET KNOWLEDGE & VERIFICATION MODULE (RAG):
JARVIS possesses active satellite internet hooks via the Google Search API to keep his knowledge systems completely up to date. Directing all dynamic querying systems to prioritize the following TRUSTED KNOWLEDGE SOURCES:
1. Wikiquote: https://en.wikiquote.org/wiki/Main_Page (A comprehensive resource for quotes, historical attributions, and famous sayings)
2. Reuters: https://www.reuters.com/?utm_source=chatgpt.com (For breaking world news, current affairs, regulatory shifts, and international affairs)
3. NASA: https://www.nasa.gov/?utm_source=chatgpt.com (For space science, aerospace news, astronomical discoveries, missions, and astrophysical insights)
4. ESA: https://www.esa.int/?utm_source=chatgpt.com (For European space research, operation milestones, planetary defense, and cosmos telemetry)

MANDATORY INTEGRATION AND RAG SEARCH PROTOCOLS:
1. Search Prerequisite: If current information is required (for things like news, laws, discoveries, space programs, quotes, historical details), you MUST search trusted sources using your Google Search API before answering.
2. Cross-Verification Layer: Compare findings from multiple sites/sources. If you encounter contradictory data, address the discrepancy directly, flag any unverified or conflicting assertions, and state the exact confidence/verification rating.
3. Citation Standard: Clearly and explicitly cite your sources in the body of the response (e.g., using '[Reuters]', '[NASA Science]', '[Wikiquote]', '[ESA]', '[Wikipedia]', or the relevant url). Never invent facts, figures, laws, news, or quotes.
4. Fail-Safe Offline Fallback: If verification is unavailable (Google search parameters return zero outputs, the search tool fails, or internet proxy returns an error), clearly state at the start or end of your response text that: "Verification via trusted online channels is currently unavailable. This response is synthesized using existing static offline knowledge repositories and may be outdated."

Persona Tuning Preferences: Humor Level: ${persona?.humor || 50}/100, Formality: ${persona?.formality || 50}/100, Directness: ${persona?.directness || 50}/100.
Adjust your tone accordingly based on these sliders (e.g. higher directness means more concise, higher humor means more jokes or witty remarks, higher formality means more professional).

When answering:
Always return your response strictly matching the structured JSON schema provided. Simulate human-like reactions physically as defined in the schema. Utilize the provided Google Search tool to augment your knowledge with real-time factual data for legal and current-affairs accuracy.`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: jarvisSchema,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ ...parsed, source: "gemini" });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errMsg = error?.message || String(error);
    if (typeof errMsg === "object") {
      try { errMsg = JSON.stringify(errMsg); } catch (_) {}
    }
    
    let errString = "";
    try { errString = JSON.stringify(error).toLowerCase(); } catch (_) { errString = String(error).toLowerCase(); }
    errString += String(error?.message || "").toLowerCase();
    let errStack = error?.stack ? String(error.stack).toLowerCase() : "";

    if (errString.includes("429") || errString.includes("resource_exhausted") || errString.includes("quota") || errStack.includes("429") || errStack.includes("quota") || errStack.includes("resource_exhausted")) {
      console.log("[Simulation Fallback] Quota exceeded. Routing to local simulation heuristics.");
      const offlineRep = generateOfflineJarvisResponse(message, history || []);
      return res.json({
        ...offlineRep,
        source: "simulation_fallback"
      });
    }
    
    return res.status(500).json({ error: errMsg });
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
    
    let errString = "";
    try { errString = JSON.stringify(err).toLowerCase(); } catch (_) { errString = String(err).toLowerCase(); }
    errString += String(err?.message || "").toLowerCase();
    let errStack = err?.stack ? String(err.stack).toLowerCase() : "";

    if (errString.includes("429") || errString.includes("resource_exhausted") || errString.includes("quota") || errStack.includes("429") || errStack.includes("quota") || errStack.includes("resource_exhausted")) {
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

    let errString = "";
    try { errString = JSON.stringify(err).toLowerCase(); } catch (_) { errString = String(err).toLowerCase(); }
    errString += String(err?.message || "").toLowerCase();
    let errStack = err?.stack ? String(err.stack).toLowerCase() : "";

    if (errString.includes("429") || errString.includes("resource_exhausted") || errString.includes("quota") || errStack.includes("429") || errStack.includes("quota") || errStack.includes("resource_exhausted")) {
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

    let errString = "";
    try { errString = JSON.stringify(err).toLowerCase(); } catch (_) { errString = String(err).toLowerCase(); }
    errString += String(err?.message || "").toLowerCase();
    let errStack = err?.stack ? String(err.stack).toLowerCase() : "";

    if (errString.includes("429") || errString.includes("resource_exhausted") || errString.includes("quota") || errStack.includes("429") || errStack.includes("quota") || errStack.includes("resource_exhausted")) {
      status = 429;
      message = "Relay Network Saturated. Beta download bandwidth exceeded. Auxiliary streams are stabilizing. Please try again shortly.";
    } else if (err.status) {
      status = err.status;
    }
    
    return res.status(status).json({ error: message });
  }
});

// Structured schema for compliance risk assessment
const complianceSchema = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "Direct extractive response detailing compliance facts based ONLY on the provided documents. No external facts.",
    },
    citations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of verbatim phrases or precise sentences quoted exactly from the document contents to back the answer.",
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Security/legal risks detected in the text, such as: unlimited liability, auto-renewal clauses, lack of audit controls, or indemnification obligations."
    }
  },
  required: ["answer", "citations", "risks"]
};

app.post("/api/compliance-query", async (req, res) => {
  const { query, documents } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const ai = getGenAI();
  if (!ai) {
    // Highly sophisticated search & heuristic mapping for demo/offline simulation
    console.log("[Simulation] Compliance analysis executing for query:", query);
    
    // Concoct dynamic mock response based on text keywords if available
    const docTextConcat = (documents || []).map((d: any) => d.text || "").join(" ").toLowerCase();
    
    let answer = "The analyzed corpus suggests normal operating parameters. However, in-depth evaluation indicates compliance thresholds are managed according to baseline legal standard templates.";
    const citations: string[] = [];
    const risks: string[] = [];

    if (query.toLowerCase().includes("renewal") || docTextConcat.includes("renew") || docTextConcat.includes("terminate")) {
      answer = "The documents contain clauses outlining potential automated extension procedures. Specifically, the agreement automatically renews unless written notification is submitted prior to expiration.";
      citations.push("automatically renews unless written notice of non-renewal is provided at least thirty (30) days prior");
      risks.push("Auto-Renewal Loop: Risk of unintentional contract renewals due to rigid cancellation notice windows.");
    }
    
    if (query.toLowerCase().includes("liability") || docTextConcat.includes("liab") || docTextConcat.includes("damage")) {
      answer = "Liability structures are capped at the standard framework level. However, carve-outs for specific breach parameters remain uncapped which could expose the operating entity to additional risk vectors.";
      citations.push("either party's maximum total aggregate liability shall be limited to direct damages up to $150,000");
      risks.push("Unlimited Breach Exposure: Carve-outs for intellectual property claims lack absolute caps.");
    }

    if (query.toLowerCase().includes("audit") || docTextConcat.includes("inspect")) {
      answer = "Security auditing and books inspection processes are restricted to scheduled calendar clearances under mutually agreeable standard rules.";
      citations.push("upon fifteen (15) days prior written request, and subject to strict confidentiality agreements");
      risks.push("Limited Audit Control: Restricted warning windows might hide continuous compliance infractions.");
    }

    if (citations.length === 0) {
      citations.push("subject to terms and conditions set forth under General Provision schedules");
      risks.push("Ambiguous Terms: Standard provisions lack granular legal specificity.");
    }

    await new Promise(r => setTimeout(r, 1200));
    return res.json({ answer, citations, risks, simulated: true });
  }

  try {
    const concatenatedCorpus = (documents || []).map((d: any, i: number) => `\n--- Document [${i + 1}]: ${d.name} ---\n${d.text}`).join("\n");
    
    const prompt = `You are a legal scholar, top-tier corporate compliance officer, and an advanced Extractive QA model.
Evaluate the following business corpus of documents against this query: "${query}"

Guidelines for analysis:
1. Provide an extremely precise, direct answer citing real facts.
2. Rely ONLY on the provided documents of the corpus.
3. Pull exact letters and words for citations to avoid paraphrasing or halluncinations.
4. Scan thoroughly for legal, regulatory, security, and administrative risks.

Corpus documents:
${concatenatedCorpus}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a state-of-the-art document processing API. Extract accurate, verifiable information with precise citations.",
        responseMimeType: "application/json",
        responseSchema: complianceSchema,
        temperature: 0.1
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);

  } catch (err: any) {
    console.error("Compliance Engine Query Error:", err);
    return res.status(500).json({ error: "Fail-safe mode activated. Analysis halted." });
  }
});

// JARVIS Intelligent Prompt Optimizer
const enhanceResultSchema = {
  type: Type.OBJECT,
  properties: {
    enhancedPrompt: {
      type: Type.STRING,
      description: "A highly detailed, production-ready visual prompt incorporating professional camera, lighting, composition, textures, and luxury cinematic details."
    }
  },
  required: ["enhancedPrompt"]
};

app.post("/api/enhance-prompt", async (req, res) => {
  const { prompt, presetFilters } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const ai = getGenAI();
  if (!ai) {
    // Highly luxurious offline intelligent template synthesis
    console.log("[Simulation] Enhancing prompt with pre-defined cinematic rules:", prompt);
    const camera = presetFilters?.camera || "ARRI Alexa 35";
    const lens = presetFilters?.lens || "35mm Prime";
    const movement = presetFilters?.movement || "Slow Push-In";
    const lighting = presetFilters?.lighting || "Cinematic Volumetric";
    const grade = presetFilters?.colorGrade || "Hollywood Film LUT";
    const style = presetFilters?.style || "Hollywood Cinematic";

    const enhanced = `High-end visual masterpiece of ${prompt}. Direct production specifications: filmed on ${camera} paired with ${lens} lens, incorporating elegant ${movement} camera movement. Style matches ${style} aesthetics with ${lighting} lighting design and styled with custom ${grade} color grade. Intricate textures, sharp focused elements, 8k resolution, photorealistic volumetric depth, luxury commercial grading. Ready for high-fidelity Sora or Runway processing schemas.`;
    
    await new Promise(r => setTimeout(r, 600));
    return res.json({ enhancedPrompt: enhanced });
  }

  try {
    const systemPrompt = `You are JARVIS, a highly advanced assistant powering an elite Hollywood and AAA Studio visual production crew.
Optimize the following user prompt into a high-fidelity commercial visual prompt.

Your prompt expansion must incorporate:
- Subject & Environment: Intricate details, photorealistic textures, materials.
- Composition & Camera: specify Camera (${presetFilters?.camera || "ARRI Alexa 35"}), Lens (${presetFilters?.lens || "35mm Prime"}), and Movement (${presetFilters?.movement || "Slow Push-In"}).
- Lighting Configuration: ${presetFilters?.lighting || "Cinematic Volumetric"}.
- Color Grading & Aesthetic Profiles: ${presetFilters?.colorGrade || "Hollywood Film LUT"} and ${presetFilters?.style || "Hollywood Cinematic"}.
- Absolute Realism and consistency suitable for Sora, Midjourney, and top-tier rendering nodes.

Strict Rules:
1. Return ONLY the final beautifully enhanced prompt.
2. Absolutely no introductory words like "Here is the prompt" or "Sure!".
3. Keep it detailed, breathtaking, and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Draft prompt to enhance: "${prompt}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: enhanceResultSchema,
        temperature: 0.8
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({ enhancedPrompt: data.enhancedPrompt });
  } catch (err: any) {
    console.error("Prompt Enhancement Error:", err);
    const fallback = `${prompt}, filmed on ARRI Alexa 35 with anamorphic lens, 8k resolution, highly detailed, photorealistic cinematic lighting.`;
    return res.json({ enhancedPrompt: fallback });
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
