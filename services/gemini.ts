
import { GoogleGenAI, Type } from "@google/genai";
import { Opportunity, CollectorType, Language } from "../types.ts";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async (fn: () => Promise<any>, maxRetries = 3) => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota');
      const isServerError = error?.status >= 500;
      
      if (isQuotaError || isServerError) {
        const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await sleep(waitTime);
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
      contents: `You are the Alpha Intelligence Engine. Analyze these market signals for extreme business value.
      Language: ${lang === 'id' ? 'Bahasa Indonesia' : 'English'}.
      
      Evaluation Criteria:
      - Score (0-100): 90+ means high urgency/alpha.
      - financialValue: Estimated USD impact if executed correctly.
      - riskLevel: Likelihood of failure.
      
      Signals to analyze: ${JSON.stringify(rawItems)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: OPPORTUNITY_SCHEMA,
      },
    }));

    const text = response.text || "[]";
    return JSON.parse(text).map((r: any) => ({ ...r, isPremium: r.score > 85 }));
  } catch (error) {
    throw new Error("Analysis engine failed to process signals.");
  }
};

export const simulateScraping = async (sourceName: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await callWithRetry(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Simulate high-value market data for a professional alpha hunter.
            Target Source: ${sourceName}
            Requirement: Generate 3 realistic, high-impact business signals (funding, tech breakthroughs, arbitrage, or acquisitions).`,
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
        return JSON.parse(text);
    } catch (error) {
        throw new Error("Network simulation error.");
    }
};
