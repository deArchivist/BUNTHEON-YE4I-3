import React, { useState, useRef, useEffect } from 'react';
import { Box, Title, Group, ActionIcon, Paper, Stack, ScrollArea } from '@mantine/core';
import { RefreshCw, List, AlertCircle } from 'lucide-react';
import geminiService from '../services/geminiService';
import { useChatContext } from '../contexts/ChatContext';
import { ChatMessage, ChatLoadingMessage } from '../components/chat/ChatMessage';
import { PersonaSelector } from '../components/chat/PersonaSelector';
import { ChatInput } from '../components/chat/ChatInput';
import ChatSessionSidebar from '../components/chat/ChatSessionSidebar';
import ChatError from '../components/chat/ChatError';
import EnvValidator from '../components/chat/EnvValidator';
import { validateEnv } from '../config/env';

const AIChat: React.FC = () => {
  const { 
    currentChatId,
    personas,
    selectedPersona, 
    setSelectedPersona,
    addMessage: contextAddMessage,
    updateLastAssistantMessage,
    clearCurrentChat,
    getCurrentChat,
  } = useChatContext();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentChat = getCurrentChat();
  const messages = currentChat?.messages || [];
  const isEnvValid = validateEnv();

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // If environment not valid, show a mock response
    if (!isEnvValid) {
      const userMessageId = contextAddMessage({
        role: 'user',
        content: input
      });
      setInput('');
      
      // Simulate loading
      setIsLoading(true);
      setTimeout(() => {
        contextAddMessage({
          role: 'assistant',
          content: "I'm currently running in demo mode. To get real AI responses, please set up your Gemini API key in the environment variables."
        });
        setIsLoading(false);
      }, 1500);
      
      return;
    }
    
    // Add user message
    const userMessageId = contextAddMessage({
      role: 'user',
      content: input
    });
    setInput('');
    setErrorMessage(null);
    
    // Convert message history to format expected by Gemini API
    const messageHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: msg.content
    }));
    
    // Add current user message
    messageHistory.push({
      role: 'user' as const,
      parts: input
    });
    
    setIsLoading(true);
    
    try {
      // First, add an empty assistant message that will be streamed into
      const assistantMessageId = contextAddMessage({
        role: 'assistant',
        content: ''
      });
      
      // Set this as the currently streaming message
      setStreamingMessageId(assistantMessageId);
      
      // Stream response with more reliable handling
      let streamedResponse = '';
      
      // Clear any previous error
      setErrorMessage(null);
      
      // Cancel any ongoing stream from previous requests
      geminiService.cancelStream();
      
      // Use the chat ID to maintain session continuity
      await geminiService.streamChatWithHistory(
        currentChatId || 'default-chat',
        messageHistory,
        selectedPersona.systemPrompt,
        selectedPersona.id,
        {
          onStart: () => {
            // Nothing needed here
          },
          onToken: (token) => {
            streamedResponse += token;
            
            // Update the streaming message with accumulated response
            if (assistantMessageId) {
              updateLastAssistantMessage(assistantMessageId, streamedResponse);
            }
          },
          onError: (error) => {
            // Add more descriptive error message based on error type
            let errorMessage = "An error occurred while communicating with the AI.";
            
            if (error.message?.includes('network')) {
              errorMessage = "Network error. Please check your internet connection.";
            } else if (error.message?.includes('timeout')) {
              errorMessage = "Request timed out. Please try again.";
            } else if (error.message?.includes('rate')) {
              errorMessage = "Rate limit exceeded. Please try again in a moment.";
            } else if (error.message?.includes('token limit') || error.message?.includes('context length')) {
              errorMessage = "This conversation has become too long. Some older messages had to be summarized.";
            } else {
              errorMessage = `Error: ${error.message || "Unknown error"}`;
            }
            
            setErrorMessage(errorMessage);
            setIsLoading(false);
            setStreamingMessageId(null);
          },
          onComplete: (fullResponse) => {
            // Ensure the final response is set
            if (assistantMessageId) {
              updateLastAssistantMessage(assistantMessageId, fullResponse);
            }
            setIsLoading(false);
            setStreamingMessageId(null);
          }
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("Failed to communicate with the AI. Please check your internet connection and try again.");
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  // Handle persona change
  const handlePersonaChange = (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      setSelectedPersona(persona);
    }
  };

  // Add language detection function
  const isKhmerText = (text: string): boolean => {
    const khmerPattern = /[\u1780-\u17FF]/;
    return khmerPattern.test(text);
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      geminiService.cancelStream();
    };
  }, []);

  // Show notification when persona changes
  const [showPersonaChangeNotification, setShowPersonaChangeNotification] = useState(false);
  const previousPersonaRef = useRef(selectedPersona);

  useEffect(() => {
    if (previousPersonaRef.current.id !== selectedPersona.id) {
      setShowPersonaChangeNotification(true);
      
      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowPersonaChangeNotification(false);
      }, 3000);
      
      previousPersonaRef.current = selectedPersona;
      return () => clearTimeout(timer);
    }
  }, [selectedPersona]);

  return (
    <Stack h="calc(100vh - 8rem)" gap="md">
      {/* Header section */}
      <Group justify="space-between">
        <Title order={2} size="h4">Bun Theon AI Chat</Title>
        <Group gap="xs"> {/* Fix: Changed 'spacing' to 'gap' */}
          <ActionIcon 
            variant="subtle" 
            color="gray" 
            onClick={() => setShowSidebar(true)}
            aria-label="Chat history"
          >
            <List size={20} />
          </ActionIcon>
          <ActionIcon 
            variant="subtle" 
            color="gray" 
            onClick={clearCurrentChat}
            aria-label="Clear chat"
          >
            <RefreshCw size={20} />
          </ActionIcon>
        </Group>
      </Group>
      
      {/* Persona selector */}
      <PersonaSelector
        personas={personas}
        selectedPersonaId={selectedPersona.id}
        onPersonaChange={handlePersonaChange}
      />
      
      {/* Notifications */}
      <EnvValidator />
      
      {showPersonaChangeNotification && (
        <Paper p="sm" radius="md" bg="primary.0" withBorder style={{ borderColor: 'var(--mantine-color-primary-3)' }}>
          <Group gap="sm"> {/* Fix: Changed 'spacing' to 'gap' */}
            <AlertCircle size={18} color="var(--mantine-color-primary-7)" />
            <Box>Switched to <b>{selectedPersona.name}</b> persona.</Box>
          </Group>
        </Paper>
      )}
      
      {/* Chat messages */}
      <ScrollArea 
        flex={1}
        style={{
          backgroundColor: 'var(--mantine-color-gray-0)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
        p="md"
        viewportRef={chatContainerRef}
      >
        {messages.length === 0 ? (
          <Box 
            style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--mantine-color-gray-6)',
              textAlign: 'center',
              padding: 'var(--mantine-spacing-xl)'
            }}
          >
            <Box mb="md" p="md" bg="primary.0" style={{ borderRadius: '50%' }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 10C22.7614 10 25 7.76142 25 5C25 2.23858 22.7614 0 20 0C17.2386 0 15 2.23858 15 5C15 7.76142 17.2386 10 20 10Z"
                  fill="var(--mantine-color-primary-6)"
                />
                <path
                  d="M30 35H10C8.89543 35 8 34.1046 8 33V23C8 20.7909 9.79086 19 12 19H28C30.2091 19 32 20.7909 32 23V33C32 34.1046 31.1046 35 30 35Z"
                  fill="var(--mantine-color-primary-5)"
                />
                <path
                  d="M20 16C26.6274 16 32 13.3137 32 10C32 6.68629 26.6274 4 20 4C13.3726 4 8 6.68629 8 10C8 13.3137 13.3726 16 20 16Z"
                  fill="var(--mantine-color-primary-4)"
                />
              </svg>
            </Box>
            <Box mb="xs" fz="lg" fw={500}>
              Start a conversation with Bun Theon AI
            </Box>
            <Box fz="sm" c="dimmed">
              Selected persona: {selectedPersona.name}
            </Box>
          </Box>
        ) : (
          <Stack gap="md">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                isKhmerText={isKhmerText(message.content)}
              />
            ))}
            
            {isLoading && !streamingMessageId && <ChatLoadingMessage />}
            
            {errorMessage && (
              <ChatError 
                message={errorMessage} 
                onRetry={() => {
                  if (input.trim()) {
                    handleSendMessage();
                  }
                }} 
              />
            )}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </ScrollArea>
      
      {/* Input area */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSendMessage}
        disabled={isLoading}
        placeholder={isEnvValid ? "Ask Bun Theon AI..." : "Ask Bun Theon AI (Demo Mode)"}
      />
      
      {/* Sidebar */}
      <ChatSessionSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </Stack>
  );
};

export default AIChat;