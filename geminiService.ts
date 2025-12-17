
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getRaceCommentary = async (event: string, playerPosition: number, totalRacers: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high-energy, futuristic racing commentator for the "HyperDrive Championship". 
      Keep it brief (max 15 words). 
      Context: The player is currently in position ${playerPosition} out of ${totalRacers}. 
      Event happening: ${event}. 
      Style: Hype, synthwave, 80s sci-fi aesthetic.`,
      config: {
        temperature: 0.9,
        maxOutputTokens: 50,
      }
    });

    return response.text?.trim() || "And they're burning up the track!";
  } catch (error) {
    console.error("Gemini Commentary Error:", error);
    return "The race heats up!";
  }
};
