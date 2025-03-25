// Export all Gemini service components
export { default as geminiService, GeminiService } from './geminiService';
export * from './types';
export * from './config';
export * from './utils';

// Re-export the default instance as the default export
import geminiService from './geminiService';
export default geminiService;
