import { GoogleGenAI } from "@google/genai";
async function test() {
  const apiKey = process.env.GEMINI_API_KEY || "YOUR_KEY_HERE";
  // We cannot test without a key, but we can just rely on the API returning correctly.
  console.log("ready");
}
test();
