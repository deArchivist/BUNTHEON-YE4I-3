## Plan for Chat Interface Revision

This plan focuses on simplifying and ensuring the core chat flow, rendering, and streaming are working correctly for the chat interface.

**1. Gemini Service Review and Simplification (`src\services\gemini\geminiService.ts`)**
*   **Goal:**  Ensure robust chat session management and streaming logic, with simplified error handling.
*   **Actions:**
    *   Re-examine the `streamChatWithHistory` function for overly complex logic and simplify it.
    *   Focus on clear and effective error handling within the streaming process.
    *   Verify that chat session creation and retrieval are efficient and reliable.
    *   Review the session cleanup mechanism to ensure it's not interfering with active chats.

**2. StableChat Component Review and Simplification (`src\components\StableChat.tsx`)**
*   **Goal:** Streamline the component logic for message rendering and UI streaming, ensuring smooth user experience.
*   **Actions:**
    *   Simplify state management within `StableChat.tsx`, focusing on essential states like `messages`, `input`, `isLoading`, and `error`.
    *   Review and simplify the `useEffect` hooks, especially those related to loading state and scrolling.
    *   Carefully examine the `handleSendMessage` function and the stream callbacks (`onStart`, `onToken`, `onComplete`, `onError`) to ensure they are efficient and error-free.
    *   Optimize the message streaming UI for smoothness, potentially reducing non-essential re-renders.

**3. LaTeX and Khmer Rendering Verification**
*   **Goal:** Confirm correct rendering of LaTeX and Khmer text in chat messages.
*   **Actions:**
    *   Double-check the `containsLatex` and `containsKhmerText` utility functions in `StableChat.tsx` for accuracy.
    *   Verify that `ReactMarkdown` with `remarkMath` and `rehypeKatex` is correctly rendering LaTeX formulas.
    *   Ensure that Khmer text is rendered using Noto Sans font by reviewing the CSS and component styling.
    *   Test the chat with messages containing various LaTeX formulas (including advanced math like integrals and limits) and Khmer text to confirm correct rendering.

**4. Basic Error Handling in UI**
*   **Goal:** Ensure user-friendly display of errors from the Gemini API.
*   **Actions:**
    *   Verify that error messages from `geminiService` are properly passed and displayed in the `StableChat.tsx` component.
    *   Review the error handling logic in `handleSendMessage` and the `onError` callback to ensure all potential errors are caught and displayed to the user.

**Simplified Implementation Focus:**

Throughout these steps, we will prioritize keeping the implementation as simple and straightforward as possible. This means avoiding unnecessary complexity, focusing on clear and readable code, and ensuring the core functionalities are robust without adding extra features or optimizations that are not essential for the basic chat flow.

**Plan Diagram:**

\`\`\`mermaid
graph LR
    A[Start] --> B{Step 1: Gemini Service Review};
    B -- Review &amp; Simplify geminiService.ts --> C{Step 2: StableChat Component Review};
    C -- Simplify StableChat.tsx --> D{Step 3: Rendering Verification};
    D -- Verify LaTeX &amp; Khmer Rendering --> E{Step 4: Basic Error Handling};
    E -- Ensure UI Error Display --> F[End];
    style B fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
\`\`\`