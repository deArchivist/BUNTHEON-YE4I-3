import { GenerationConfig, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";

/**
 * Configuration defaults for Gemini API
 */

// Default generation configuration
export const defaultGenerationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40, 
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Default safety settings
export const defaultSafetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }
];

// Estimated token counts and limits
export const TOKEN_LIMIT = 30000; // Conservative estimate for Gemini models
export const RESERVE_TOKENS = 1000; // Reserve tokens for the response
