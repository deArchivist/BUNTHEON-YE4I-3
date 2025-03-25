import { StreamCallbacks } from "./types";

/**
 * Demo mode functionality for Gemini API
 */

/**
 * Generate a demo response (non-streaming)
 * @param prompt The user prompt
 * @returns Promise with demo response
 */
export async function generateDemoResponse(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`This is a demo response to: "${prompt}". For real AI responses, please configure your Gemini API key.`);
    }, 1000);
  });
}

/**
 * Stream a demo response with character-by-character delivery
 * @param prompt The user prompt
 * @param callbacks Callbacks for streaming events
 * @param abortSignal AbortSignal for cancellation
 * @returns Promise with full demo response
 */
export async function streamDemoResponse(
  prompt: string, 
  callbacks: StreamCallbacks,
  abortSignal?: AbortSignal
): Promise<string> {
  return new Promise((resolve) => {
    // Call onStart callback if provided
    if (callbacks.onStart) {
      console.log("Demo: Calling onStart callback");
      callbacks.onStart();
    }
    
    // Prepare the demo response
    const demoResponse = `This is a demo response to: "${prompt}". For real AI responses, please configure your Gemini API key.

Here's a LaTeX formula example:
$E = mc^2$

And a more complex one:
$$\\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)$$`;

    let fullResponse = '';
    let index = 0;
    
    console.log("Demo: Starting character stream simulation");
    
    // Function to stream the next character
    const streamNextChar = () => {
      // Stop if aborted
      if (abortSignal?.aborted) {
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
        resolve(fullResponse);
      }
    };
    
    // Start the streaming process
    streamNextChar();
  });
}
