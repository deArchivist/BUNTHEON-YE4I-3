import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ENV } from "../config/env";

// Initialize the Google Generative AI with your API key or use a fallback for demo mode
const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY || 'demo_mode');

// Default configuration for generation
const defaultConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Default safety settings
const safetySettings: SafetySetting[] = [
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

export type ChatMessage = {
  role: 'user' | 'model';
  parts: string;
};

export type StreamCallbacks = {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
};

// Estimated token counts for different content types
const TOKEN_LIMIT = 30000; // Conservative estimate for Gemini models
const RESERVE_TOKENS = 1000; // Reserve tokens for the response

// Persistent chat sessions
type ChatSession = {
  chat: any; // GenerativeModel.startChat result
  personaId: string;
  lastActive: number;
};

class GeminiService {
  private model: GenerativeModel;
  private isDemoMode: boolean;
  private streamAbortController: AbortController | null = null;
  private chatSessions: Map<string, ChatSession> = new Map();
  
  constructor(modelName: string = "gemini-2.0-pro-exp-02-05") {
    this.isDemoMode = !ENV.GEMINI_API_KEY || ENV.GEMINI_API_KEY === 'demo_mode';
    
    try {
      this.model = genAI.getGenerativeModel({ model: modelName });
      console.log("Gemini model initialized successfully");
    } catch (error) {
      console.error("Error initializing Gemini model:", error);
      // Create a placeholder model for demo mode
      this.model = {} as GenerativeModel;
    }
    
    // Clean up expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  // Clean up sessions that haven't been used in the last hour
  private cleanupExpiredSessions() {
    const now = Date.now();
    const expirationTime = 60 * 60 * 1000; // 1 hour
    
    for (const [chatId, session] of this.chatSessions.entries()) {
      if (now - session.lastActive > expirationTime) {
        this.chatSessions.delete(chatId);
        console.log(`Cleaning up expired chat session: ${chatId}`);
      }
    }
  }
  
  // Get or create a chat session for a specific chat ID
  private async getOrCreateChatSession(chatId: string, personaId: string, systemPrompt: string): Promise<any> {
    // If we have an existing session for this chat ID and the same persona
    if (this.chatSessions.has(chatId)) {
      const session = this.chatSessions.get(chatId)!;
      
      // If the persona changed, create a new session
      if (session.personaId !== personaId) {
        console.log(`Persona changed from ${session.personaId} to ${personaId}, creating new session`);
        return this.createNewChatSession(chatId, personaId, systemPrompt);
      }
      
      // Update the last active timestamp
      session.lastActive = Date.now();
      console.log(`Using existing chat session for ${chatId}`);
      return session.chat;
    }
    
    // Create a new session if one doesn't exist
    return this.createNewChatSession(chatId, personaId, systemPrompt);
  }
  
  // Create a new chat session
  private async createNewChatSession(chatId: string, personaId: string, systemPrompt: string): Promise<any> {
    console.log(`Creating new chat session for ${chatId} with persona ${personaId}`);
    
    // Create the chat session
    const chat = this.model.startChat({
      generationConfig: defaultConfig,
      safetySettings,
      history: [],
    });
    
    // Send the system prompt
    await chat.sendMessage(systemPrompt);
    console.log("System prompt sent to new chat session");
    
    // Store the session
    this.chatSessions.set(chatId, {
      chat,
      personaId,
      lastActive: Date.now(),
    });
    
    return chat;
  }

  // Estimate token count for a message (very rough estimation)
  private estimateTokenCount(text: string): number {
    // A very rough estimate: 1 token ≈ 4 characters for English
    // This is just a heuristic - actual tokenization depends on the model
    return Math.ceil(text.length / 4);
  }
  
  // Prune message history to fit token limit
  private pruneMessageHistory(messages: ChatMessage[], systemPrompt: string): ChatMessage[] {
    // Always keep system prompt + most recent messages
    const systemPromptTokens = this.estimateTokenCount(systemPrompt);
    const availableTokens = TOKEN_LIMIT - systemPromptTokens - RESERVE_TOKENS;
    
    let totalTokens = 0;
    const prunedMessages: ChatMessage[] = [];
    
    // Start from the most recent messages and work backwards
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = this.estimateTokenCount(message.parts);
      
      // If adding this message would exceed our limit, stop
      if (totalTokens + messageTokens > availableTokens) {
        // Insert a summary message at the start if we had to prune
        if (i > 0) {
          console.log(`Pruned ${i + 1} older messages due to token limits`);
          prunedMessages.unshift({
            role: 'model',
            parts: "...(Earlier parts of the conversation were summarized to save space)..."
          });
        }
        break;
      }
      
      // Add this message to our pruned list and continue
      totalTokens += messageTokens;
      prunedMessages.unshift(message); // Add to the start to maintain order
    }
    
    console.log(`Final message count after pruning: ${prunedMessages.length}, estimated tokens: ${totalTokens}`);
    return prunedMessages;
  }

  // Cancel any ongoing stream request
  cancelStream() {
    if (this.streamAbortController) {
      console.log("Cancelling ongoing stream");
      this.streamAbortController.abort();
      this.streamAbortController = null;
    }
  }

  // Generate content (non-streaming)
  async generateContent(prompt: string, config?: Partial<GenerationConfig>) {
    if (this.isDemoMode) {
      return this.generateDemoResponse(prompt);
    }
    
    try {
      const generationConfig = {
        ...defaultConfig,
        ...config,
      };
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });
      return result.response.text();
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }
  
  // Chat with history (non-streaming)
  async chatWithHistory(messages: ChatMessage[], systemPrompt: string, config?: Partial<GenerationConfig>) {
    if (this.isDemoMode) {
      return this.generateDemoResponse(messages[messages.length - 1]?.parts || "");
    }
    
    try {
      // Create a chat session
      const chat = this.model.startChat({
        generationConfig: {
          ...defaultConfig,
          ...config,
        },
        safetySettings,
        history: [],  // Start with empty history as we'll send messages manually
      });

      // Send the system prompt first
      await chat.sendMessage(systemPrompt);
      
      // Now send all messages in the history
      let result;
      for (const message of messages) {
        if (message.role === 'user') {
          result = await chat.sendMessage(message.parts);
        }
      }
      
      return result?.response.text() || "No response generated.";
    } catch (error) {
      console.error("Error in chat with history:", error);
      throw error;
    }
  }
  
  // Stream chat with history maintaining a continuous session
  async streamChatWithHistory(
    chatId: string,
    messages: ChatMessage[],
    systemPrompt: string,
    personaId: string,
    callbacks: StreamCallbacks,
    config?: Partial<GenerationConfig>
  ) {
    console.log(`Starting streamChatWithHistory for chat ${chatId}, persona ${personaId}`);
    
    // Cancel any ongoing stream before starting a new one
    this.cancelStream();
    
    if (this.isDemoMode) {
      console.log("Using demo mode for streaming");
      return this.streamDemoResponse(messages[messages.length - 1]?.parts || "", callbacks);
    }
    
    try {
      // Create new abort controller for this stream
      this.streamAbortController = new AbortController();
      const signal = this.streamAbortController.signal;
      
      // Start callback
      if (callbacks.onStart) {
        callbacks.onStart();
      }
      
      // Get or create a chat session for this chat ID
      const chat = await this.getOrCreateChatSession(chatId, personaId, systemPrompt);
      
      // Prune the message history to fit token limits
      const prunedMessages = this.pruneMessageHistory(messages, systemPrompt);
      
      // Find the last user message
      const lastUserMessage = [...prunedMessages].reverse().find(msg => msg.role === 'user');
      if (!lastUserMessage) {
        throw new Error("No user message found in history");
      }
      
      // Stream the response
      let fullResponse = '';
      
      try {
        console.log("Starting message stream");
        const result = await chat.sendMessageStream(lastUserMessage.parts);
        
        for await (const chunk of result.stream) {
          // Check if streaming was canceled
          if (signal.aborted) {
            console.log("Stream was aborted, breaking");
            break;
          }
          
          const chunkText = chunk.text();
          fullResponse += chunkText;
          
          // Call token callback if provided
          if (callbacks.onToken && !signal.aborted) {
            callbacks.onToken(chunkText);
          }
        }
        
        // Only call onComplete if not aborted
        if (!signal.aborted && callbacks.onComplete) {
          callbacks.onComplete(fullResponse);
        }
        
        // Update the session's last active timestamp
        if (this.chatSessions.has(chatId)) {
          this.chatSessions.get(chatId)!.lastActive = Date.now();
        }
        
        // Clear the abort controller
        this.streamAbortController = null;
        
        return fullResponse;
        
      } catch (error) {
        console.error("Error during streaming:", error);
        
        // If we hit a context length error, try recreating the session with only the latest message
        if (error instanceof Error && 
            (error.message.includes("context length") || 
             error.message.includes("token limit"))) {
          console.log("Token limit exceeded, recreating session with reduced history");
          
          // Remove the failed chat session
          this.chatSessions.delete(chatId);
          
          // Create a new session with just the system prompt
          const newChat = await this.createNewChatSession(chatId, personaId, systemPrompt);
          
          // Send only the last user message
          console.log("Retrying with only the last user message");
          const retryResult = await newChat.sendMessageStream(lastUserMessage.parts);
          
          // Handle the retry stream
          let retryResponse = '';
          for await (const chunk of retryResult.stream) {
            if (signal.aborted) break;
            
            const chunkText = chunk.text();
            retryResponse += chunkText;
            
            if (callbacks.onToken && !signal.aborted) {
              callbacks.onToken(chunkText);
            }
          }
          
          if (!signal.aborted && callbacks.onComplete) {
            callbacks.onComplete(retryResponse);
          }
          
          return retryResponse;
        } else {
          // For other errors, rethrow
          throw error;
        }
      }
    } catch (error) {
      // Don't report error if it was due to an intentional cancellation
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Stream was canceled");
        return "";
      }
      
      console.error("Error in streaming chat:", error);
      if (callbacks.onError) callbacks.onError(error as Error);
      
      // Clean up the session on error to avoid lingering issues
      this.chatSessions.delete(chatId);
      
      throw error;
    }
  }
  
  // Demo mode method for non-streaming responses
  private async generateDemoResponse(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`This is a demo response to: "${prompt}". For real AI responses, please configure your Gemini API key.`);
      }, 1000);
    });
  }
  
  // Demo mode method for streaming responses
  private async streamDemoResponse(prompt: string, callbacks: StreamCallbacks): Promise<string> {
    return new Promise((resolve) => {
      // Create a new abort controller for this demo stream
      this.streamAbortController = new AbortController();
      const signal = this.streamAbortController.signal;
      
      // Call onStart callback if provided
      if (callbacks.onStart) {
        console.log("Demo: Calling onStart callback");
        callbacks.onStart();
      }
      
      // Prepare the demo response
      const demoResponse = `This is a demo response to: "${prompt}". For real AI responses, please configure your Gemini API key.`;
      let fullResponse = '';
      let index = 0;
      
      console.log("Demo: Starting character stream simulation");
      
      // Function to stream the next character
      const streamNextChar = () => {
        // Stop if aborted
        if (signal.aborted) {
          console.log("Demo: Stream was aborted");
          resolve(fullResponse);
          return;
        }
        
        // If we still have characters to send
        if (index < demoResponse.length) {
          // Get the next character
          const chunk = demoResponse.charAt(index);
          fullResponse += chunk;
          
          // Call the token callback if provided
          if (callbacks.onToken) {
            callbacks.onToken(chunk);
          }
          
          // Move to next character
          index++;
          
          // Schedule the next character
          setTimeout(streamNextChar, 30);
        } else {
          // We're done, call complete and resolve
          console.log("Demo: Stream complete");
          if (callbacks.onComplete) {
            callbacks.onComplete(fullResponse);
          }
          this.streamAbortController = null;
          resolve(fullResponse);
        }
      };
      
      // Start the streaming process
      streamNextChar();
    });
  }
}

export default new GeminiService();
