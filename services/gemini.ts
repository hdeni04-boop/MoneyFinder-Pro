
import { GoogleGenAI, Type } from "@google/genai";
import { Opportunity, CollectorType, Language } from "../types.ts";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const cleanJsonResponse = (text: string): string => {
  // Remove markdown code blocks if present
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const callWithRetry = async (fn: () => Promise<any>, maxRetries = 3) => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota');
      if (isQuotaError) {
        await sleep(Math.pow(2, i) * 1000 + Math.random() * 1000);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

const OPPORTUNITY_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      score: { type: Type.NUMBER },
      reasoning: { type: Type.STRING },
      category: { type: Type.STRING },
      financialValue: { type: Type.NUMBER },
      riskLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Extreme'] },
      timeHorizon: { type: Type.STRING, enum: ['Immediate', 'Short-term', 'Mid-term', 'Long-term'] }
    },
    required: ['title', 'description', 'score', 'reasoning', 'category', 'financialValue', 'riskLevel', 'timeHorizon']
  }
};

export const scoreOpportunities = async (rawItems: any[], sourceType: CollectorType, sourceName: string, lang: Language): Promise<Partial<Opportunity>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these market signals. Lang: ${lang}. Signals: ${JSON.stringify(rawItems)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: OPPORTUNITY_SCHEMA,
      },
    }));

    const text = response.text || "[]";
    return JSON.parse(cleanJsonResponse(text)).map((r: any) => ({ 
      ...r, 
      isPremium: r.score > 85,
      id: `opt-${Math.random().toString(36).substr(2, 9)}`
    }));
  } catch (error) {
    console.error("Scoring Error:", error);
    return [];
  }
};

export const simulateScraping = async (sourceName: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await callWithRetry(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 3 high-impact business signals for ${sourceName}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            raw_title: { type: Type.STRING },
                            raw_content: { type: Type.STRING }
                        },
                        required: ["raw_title", "raw_content"]
                    }
                }
            }
        }));
        const text = response.text || "[]";
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error("Scraping Error:", error);
        return [];
    }
};
