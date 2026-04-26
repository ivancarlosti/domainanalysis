
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeDomainsWithGemini = async (domains: string[]): Promise<AnalysisResult[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Limit batch size to avoid token limits in this demo context
  const domainsToAnalyze = domains.slice(0, 30); 

  const prompt = `
    Analyze the following list of domains. For each domain, provide:
    1. A short analysis of its potential use (brandable, SEO, generic, etc.).
    2. A likely category (Tech, Commerce, Personal, etc.).
    3. A valuation rating (Low, Medium, High).
    
    List: ${domainsToAnalyze.join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              domain: { type: Type.STRING },
              analysis: { type: Type.STRING },
              category: { type: Type.STRING },
              valuation: { type: Type.STRING }
            },
            required: ["domain", "analysis", "category", "valuation"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
