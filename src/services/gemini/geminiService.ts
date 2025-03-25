import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";
import { ChatMessage, StreamCallbacks, ChatSession, GeminiServiceOptions } from "./types";
import { defaultGenerationConfig, defaultSafetySettings } from "./config";
import { pruneMessageHistory } from "./utils";
import { generateDemoResponse, streamDemoResponse } from "./demoMode";
import { ENV } from "../../config/env";

/**
 * GeminiService class for interacting with the Google Gemini API
 */
class GeminiService {
  private model: GenerativeModel;
  private isDemoMode: boolean;
  private streamAbortController: AbortController | null = null;
  private chatSessions: Map<string, ChatSession> = new Map();
  
  /**
   * Create a new GeminiService instance
   * @param options Configuration options
   */
  constructor(options: GeminiServiceOptions = {}) {
    const modelName = options.modelName || "gemini-2.0-pro-exp-02-05";
    const apiKey = options.apiKey || ENV.GEMINI_API_KEY;
    
    this.isDemoMode = !apiKey || apiKey === 'demo_mode';
    
    try {
      // Initialize the Google Generative AI with the API key
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Create the generative model
      this.model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          ...defaultGenerationConfig,
          maxOutputTokens: options.maxOutputTokens || defaultGenerationConfig.maxOutputTokens,
          temperature: options.temperature || defaultGenerationConfig.temperature,
        },
      });
      
      console.log("Gemini model initialized successfully");
    } catch (error) {
      console.error("Error initializing Gemini model:", error);
      // Create a placeholder model for demo mode
      this.model = {} as GenerativeModel;
      this.isDemoMode = true;
    }
    
    // Clean up expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Clean up sessions that haven't been used in the last hour
   */
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
  
  /**
   * Get or create a chat session for a specific chat ID
   */
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
  
  /**
   * Create a new chat session
   */
  private async createNewChatSession(chatId: string, personaId: string, systemPrompt: string): Promise<any> {
    console.log(`Creating new chat session for ${chatId} with persona ${personaId}`);
    
    // Create the chat session
    const chat = this.model.startChat({
      generationConfig: defaultGenerationConfig,
      safetySettings: defaultSafetySettings,
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

  /**
   * Cancel any ongoing stream request
   */
  cancelStream() {
    if (this.streamAbortController) {
      console.log("Cancelling ongoing stream");
      this.streamAbortController.abort();
      this.streamAbortController = null;
    }
  }

  /**
   * Generate content (non-streaming)
   * @param prompt User prompt
   * @param config Optional generation config
   * @returns Generated content text
   */
  async generateContent(prompt: string, config?: Partial<GenerationConfig>) {
    if (this.isDemoMode) {
      return generateDemoResponse(prompt);
    }
    
    try {
      const generationConfig = {
        ...defaultGenerationConfig,
        ...config,
      };
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings: defaultSafetySettings,
      });
      
      return result.response.text();
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }
  
  /**
   * Chat with history (non-streaming)
   * @param messages Chat message history
   * @param systemPrompt System prompt for the assistant
   * @param config Optional generation config
   * @returns Assistant's response text
   */
  async chatWithHistory(
    messages: ChatMessage[], 
    systemPrompt: string, 
    config?: Partial<GenerationConfig>
  ) {
    if (this.isDemoMode) {
      return generateDemoResponse(messages[messages.length - 1]?.parts || "");
    }
    
    try {
      // Create a chat session
      const chat = this.model.startChat({
        generationConfig: {
          ...defaultGenerationConfig,
          ...config,
        },
        safetySettings: defaultSafetySettings,
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
  
  /**
   * Stream chat with history maintaining a continuous session
   * @param chatId Chat session ID
   * @param messages Chat message history
   * @param systemPrompt System prompt for the assistant
   * @param personaId Persona ID
   * @param callbacks Callbacks for streaming events
   * @param config Optional generation config
   * @returns Full response text
   */
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
      const abortController = new AbortController();
      this.streamAbortController = abortController;
      const response = await streamDemoResponse(
        messages[messages.length - 1]?.parts || "", 
        callbacks,
        abortController.signal
      );
      this.streamAbortController = null;
      return response;
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
      const prunedMessages = pruneMessageHistory(messages, systemPrompt);
      
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
}

// Export a singleton instance
export default new GeminiService();

// Also export the class for custom instantiation
export { GeminiService };
