import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ChatMessage, ChatSession, StreamCallbacks, GeminiServiceOptions } from './types';
import { streamDemoResponse } from './demoMode';

/**
 * Simplified Gemini service for handling chat sessions and streaming responses
 */
export class GeminiService {
  private apiKey: string;
  private modelName: string;
  private maxOutputTokens: number;
  private temperature: number;
  private isDemoMode: boolean;
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private chatSessions: Map<string, ChatSession> = new Map();
  private abortController: AbortController | null = null;
  
  constructor(options: GeminiServiceOptions = {}) {
    this.apiKey = options.apiKey || 'AIzaSyA2wL-yp7MLu8Vr_svn9JclddevLTcor54';
    this.modelName = options.modelName || 'gemini-2.0-pro-exp-02-05';
    this.maxOutputTokens = options.maxOutputTokens || 2048;
    this.temperature = options.temperature || 0.7;
    this.isDemoMode = options.isDemoMode || this.apiKey === 'demo_mode';
    
    // Initialize the API client if not in demo mode
    if (!this.isDemoMode) {
      this.initializeClient();
    }
    
    // Set up session cleanup
    this.setupSessionCleanup();
  }
  
  private initializeClient(): void {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          maxOutputTokens: this.maxOutputTokens,
          temperature: this.temperature
        }
      });
      console.log('Gemini API client initialized');
    } catch (error) {
      console.error('Failed to initialize Gemini API client:', error);
      this.isDemoMode = true;
    }
  }
  
  private setupSessionCleanup(): void {
    // Clean up inactive sessions every 10 minutes
    setInterval(() => {
      const now = Date.now();
      const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
      
      this.chatSessions.forEach((session, id) => {
        if (now - session.lastActive > SESSION_TIMEOUT) {
          console.log(`Removing inactive chat session: ${id}`);
          this.chatSessions.delete(id);
        }
      });
    }, 10 * 60 * 1000);
  }
  
  /**
   * Get or create a chat session
   */
  private async getOrCreateChatSession(sessionId: string, systemPrompt?: string): Promise<ChatSession> {
    // Log system prompt received
    console.log('getOrCreateChatSession received systemPrompt:', systemPrompt ? systemPrompt.substring(0, 50) + '...' : 'empty');
    
    // Return existing active session if available
    if (this.chatSessions.has(sessionId)) {
      const session = this.chatSessions.get(sessionId)!;
      session.lastActive = Date.now();
      return session;
    }
    
    // Create a new session
    console.log(`Creating new chat session: ${sessionId}`);
    
    if (this.isDemoMode) {
      // For demo mode, create a simulated session
      const demoSession: ChatSession = {
        chat: { demoMode: true },
        lastActive: Date.now()
      };
      this.chatSessions.set(sessionId, demoSession);
      return demoSession;
    }
    
    if (!this.model) {
      throw new Error('Gemini API client not initialized');
    }
    
    try {
      // Format the systemPrompt properly for the API
      const chatOptions: any = {
        history: [],
        generationConfig: {
          maxOutputTokens: this.maxOutputTokens,
          temperature: this.temperature
        }
      };

      // Only add systemInstruction if we have a prompt
      if (systemPrompt) {
        console.log('Adding full system prompt with length:', systemPrompt.length);
        
        // Use the exact full prompt provided by the user
        // FORMAT FIX: The API expects an object with parts, not a string
        chatOptions.systemInstruction = {
          role: "system",
          parts: [{ text: systemPrompt }]
        };
        
        console.log('System instruction set with full prompt');
      }

      try {
        const chat = this.model.startChat(chatOptions);
        
        const session: ChatSession = {
          chat,
          lastActive: Date.now()
        };
        
        this.chatSessions.set(sessionId, session);
        return session;
      } catch (error) {
        // If the full prompt fails, try with a fallback shorter prompt
        console.error('Error creating chat with full system prompt, trying with shorter version:', error);
        
        // Create a shortened fallback prompt
        const shortenedPrompt = `You are Mr. Bun Theon, an expert Khmer science tutor using the Feynman Technique. Always respond in Khmer language. Explain concepts step-by-step. Use LaTeX for math formulas.`;
        
        chatOptions.systemInstruction = {
          role: "system",
          parts: [{ text: shortenedPrompt }]
        };
        
        console.log('Falling back to shorter system prompt');
        const chat = this.model.startChat(chatOptions);
        
        const session: ChatSession = {
          chat,
          lastActive: Date.now()
        };
        
        this.chatSessions.set(sessionId, session);
        return session;
      }
      
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }
  
  /**
   * Stream a chat response with history
   */
  public async streamChatWithHistory(
    sessionId: string,
    messages: ChatMessage[],
    systemPrompt?: string, // Change to a regular string parameter
    callbacks: StreamCallbacks = {}
  ): Promise<string> {
    // Log received system prompt
    console.log('streamChatWithHistory received systemPrompt:', systemPrompt ? systemPrompt.substring(0, 50) + '...' : 'empty');
    
    // Cancel any existing stream
    this.cancelStream();
    
    // Create a new abort controller for this stream
    this.abortController = new AbortController();
    const { signal } = this.abortController;
    
    try {
      // Find the last user message (compatible with older JS versions)
      const getLastUserMessage = (msgs: ChatMessage[]) => {
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === 'user') {
            return msgs[i];
          }
        }
        return undefined;
      };

      // Handle demo mode
      if (this.isDemoMode) {
        const lastUserMessage = getLastUserMessage(messages);
        if (!lastUserMessage) {
          throw new Error('No user message found');
        }
        
        return streamDemoResponse(
          lastUserMessage.parts,
          callbacks,
          signal
        );
      }
      
      // Get or create the chat session
      const session = await this.getOrCreateChatSession(sessionId, systemPrompt);
      
      // Get the last user message
      const lastUserMessage = getLastUserMessage(messages);
      if (!lastUserMessage) {
        throw new Error('No user message found');
      }
      
      // Call onStart if provided
      if (callbacks.onStart) {
        callbacks.onStart();
      }
      
      let fullResponse = '';
      
      // Stream the response
      const result = await session.chat.sendMessageStream(lastUserMessage.parts, { signal });
      
      for await (const chunk of result.stream) {
        const token = chunk.text();
        fullResponse += token;
        
        // Call onToken if provided
        if (callbacks.onToken) {
          callbacks.onToken(token);
        }
        
        // Check if the stream has been aborted
        if (signal.aborted) {
          console.log('Stream aborted');
          break;
        }
      }
      
      // Call onComplete if provided
      if (callbacks.onComplete && !signal.aborted) {
        callbacks.onComplete(fullResponse);
      }
      
      return fullResponse;
    } catch (error) {
      // Handle errors
      console.error('Error streaming chat response:', error);
      
      // Only call onError if the stream wasn't purposely aborted
      if (!signal.aborted && callbacks.onError) {
        if (error instanceof Error) {
          callbacks.onError(error);
        } else {
          callbacks.onError(new Error('Unknown error occurred'));
        }
      }
      
      // Rethrow the error for the caller to handle
      throw error;
    } finally {
      // Clean up the abort controller
      this.abortController = null;
    }
  }
  
  /**
   * Cancel any ongoing stream
   */
  public cancelStream(): void {
    if (this.abortController) {
      console.log('Cancelling ongoing stream');
      this.abortController.abort();
      this.abortController = null;
    }
  }
  
  /**
   * Update service configuration
   */
  public updateConfig(options: GeminiServiceOptions): void {
    const configChanged = 
      options.apiKey !== undefined && options.apiKey !== this.apiKey ||
      options.modelName !== undefined && options.modelName !== this.modelName ||
      options.maxOutputTokens !== undefined && options.maxOutputTokens !== this.maxOutputTokens ||
      options.temperature !== undefined && options.temperature !== this.temperature;
    
    if (configChanged) {
      // Update configuration
      this.apiKey = options.apiKey || this.apiKey;
      this.modelName = options.modelName || this.modelName;
      this.maxOutputTokens = options.maxOutputTokens || this.maxOutputTokens;
      this.temperature = options.temperature || this.temperature;
      this.isDemoMode = options.isDemoMode !== undefined ? options.isDemoMode : this.apiKey === 'demo_mode';
      
      // Reinitialize client if needed
      if (!this.isDemoMode) {
        this.initializeClient();
      }
      
      // Clear existing sessions as they may have different configurations
      this.chatSessions.clear();
    }
  }
}

// Create and export a singleton instance
const geminiService = new GeminiService();
export default geminiService;
