import { ChatMessage } from "./types";
import { TOKEN_LIMIT, RESERVE_TOKENS } from "./config";

/**
 * Utility functions for Gemini API integration
 */

/**
 * Estimate token count for a message (rough estimation)
 * @param text The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // Very rough estimate: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4);
}

/**
 * Prune message history to fit token limit
 * @param messages Array of chat messages
 * @param systemPrompt System prompt text
 * @returns Pruned array of chat messages
 */
export function pruneMessageHistory(messages: ChatMessage[], systemPrompt: string): ChatMessage[] {
  // Calculate available tokens
  const systemPromptTokens = estimateTokenCount(systemPrompt);
  const availableTokens = TOKEN_LIMIT - systemPromptTokens - RESERVE_TOKENS;
  
  let totalTokens = 0;
  const prunedMessages: ChatMessage[] = [];
  
  // Start from the most recent messages and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokenCount(message.parts);
    
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
