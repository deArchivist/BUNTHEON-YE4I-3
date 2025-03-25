/**
 * Types for Gemini API integration
 */

// Message format for chat interactions
export type ChatMessage = {
  role: 'user' | 'model';
  parts: string;
};

// Callbacks for streaming responses
export type StreamCallbacks = {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
};

// Chat session for managing persistent conversations
export type ChatSession = {
  chat: any; // GenerativeModel.startChat result
  lastActive: number;
};

// Configuration options for the Gemini service
export type GeminiServiceOptions = {
  apiKey?: string;
  modelName?: string;
  maxOutputTokens?: number;
  temperature?: number;
  isDemoMode?: boolean;
};
