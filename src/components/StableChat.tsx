import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Group, Text, ActionIcon, Stack, Title, Alert, Paper } from '@mantine/core';
import { Send, Trash, Bot, User, RefreshCw, AlertTriangle, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '../styles/stableChat.css';
import geminiService from '../services/gemini';

// Define types for messages
type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  // New properties for stable rendering
  containsLatex?: boolean;
  renderComplete?: boolean;
}

interface StableChatProps {
  apiKey?: string;
  systemPrompt?: string;
  placeholder?: string;
  chatId?: string;
  initialMessages?: Message[];
  showDemoWarning?: boolean;
}

// Utility function to detect Khmer text
const containsKhmerText = (text: string): boolean => {
  const khmerRegex = /[\u1780-\u17FF]/;
  return khmerRegex.test(text);
};

// Utility function to detect LaTeX content
const containsLatex = (text: string): boolean => {
  // Comprehensive LaTeX pattern detection
  return /(\$\$|\$|\\begin\{|\\frac|\\sum|\\int|\\lim|\\alpha|\\beta|\\gamma|\\delta)/.test(text);
};

const StableChat: React.FC<StableChatProps> = ({
  apiKey,
  systemPrompt = "You are a helpful AI assistant that can answer questions and provide information on a wide range of topics. Use Markdown for formatting and KaTeX for mathematical expressions.",
  placeholder = "Ask a question...",
  chatId = "default-chat",
  initialMessages = [],
  showDemoWarning = false
}) => {
  // Core state
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Scroll state
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [manualScrolling, setManualScrolling] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Utility function to generate unique message IDs
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Define the ChatMessage type expected by Gemini API
  interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
  }

  // Convert messages to the format expected by the Gemini API
  const convertToGeminiMessages = (msgs: Message[]): ChatMessage[] => {
    return msgs.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.content
    }));
  };

  // Scroll management
  const isNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    
    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    // Consider "near bottom" if within 50px of bottom
    return scrollHeight - scrollTop - clientHeight < 50;
  }, []);
  
  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end' 
      });
    }
    setShowScrollButton(false);
  }, []);
  
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const nearBottom = isNearBottom();
    setShowScrollButton(!nearBottom);
    
    // Only track manual scrolling when not near bottom and not loading
    setManualScrolling(!nearBottom && !isLoading);
  }, [isNearBottom, isLoading]);
  
  // Effect to set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  // Effect to scroll to bottom on new messages, respecting manual scrolling
  useEffect(() => {
    // Always scroll on first load
    if (messages.length === 0) return;
    
    // If user is manually scrolling and not at bottom, don't auto-scroll
    if (manualScrolling) {
      return;
    }
    
    // If new message or loading, scroll to bottom
    scrollToBottom(true);
  }, [messages, scrollToBottom, manualScrolling]);
  
  // Cleanup effect for ongoing streams
  useEffect(() => {
    return () => {
      geminiService.cancelStream();
    };
  }, []);
  
  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Message handlers
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      containsLatex: containsLatex(input.trim()),
      renderComplete: true
    };
    
    // Create empty assistant message
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      containsLatex: false,
      renderComplete: false
    };
    
    // Update state
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);
    setManualScrolling(false); // Reset manual scrolling to ensure we scroll to the new message
    
    // Immediate scroll to bottom (forced)
    setTimeout(() => scrollToBottom(false), 0);
    
    try {
      // Stream the response
      const geminiMessages = convertToGeminiMessages([...messages, userMessage]);
      
      await geminiService.streamChatWithHistory(
        chatId,
        geminiMessages,
        systemPrompt,
        {
          onStart: () => {
            console.log('Stream started');
          },
          onToken: (token) => {
            // Update message content with new token
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              
              if (lastMessage && lastMessage.id === assistantMessageId) {
                // Update the message content
                const newContent = lastMessage.content + token;
                
                // Check if content now contains LaTeX
                const hasLatex = containsLatex(newContent);
                
                // Apply updates
                lastMessage.content = newContent;
                
                // If we just detected LaTeX, mark it
                if (hasLatex && !lastMessage.containsLatex) {
                  lastMessage.containsLatex = true;
                }
              }
              
              return updatedMessages;
            });
            
            // If not manually scrolling, scroll to bottom
            if (!manualScrolling) {
              // Use a non-smooth scroll during streaming for better performance
              scrollToBottom(false);
            }
          },
          onComplete: (fullResponse) => {
            setIsLoading(false);
            console.log('Stream completed');
            
            // Mark message rendering as complete
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              
              if (lastMessage && lastMessage.id === assistantMessageId) {
                lastMessage.renderComplete = true;
              }
              
              return updatedMessages;
            });
            
            // Final smooth scroll to bottom
            if (!manualScrolling) {
              setTimeout(() => scrollToBottom(true), 100);
            }
            
            // Focus input for next message
            if (inputRef.current) {
              inputRef.current.focus();
            }
          },
          onError: (err) => {
            setIsLoading(false);
            setError(`Error: ${err.message}`);
            console.error('Stream error:', err);
          }
        }
      );
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error sending message:', err);
    }
  };
  
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    geminiService.cancelStream();
    setManualScrolling(false);
    setShowScrollButton(false);
  };
  
  const handleRetry = () => {
    // Remove the last assistant message if it exists
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });
    
    setError(null);
    handleSendMessage();
  };

  // Render the chat interface
  return (
    <Box className="stable-chat-container">
      {/* Header */}
      <Group justify="space-between" mb="md" className="stable-chat-header">
        <Title order={3}>AI Buddy</Title>
        <ActionIcon 
          color="red" 
          variant="subtle" 
          onClick={handleClearChat}
          disabled={isLoading || messages.length === 0}
        >
          <Trash size={18} />
        </ActionIcon>
      </Group>
      
      {/* Demo Mode Warning */}
      {showDemoWarning && (
        <Alert 
          icon={<AlertTriangle size={16} />}
          title="Demo Mode"
          color="yellow"
          variant="light"
          mb="md"
        >
          <Text size="sm">
            You're currently in demo mode because the API key is not configured.
            The AI responses are simulated in this mode.
          </Text>
        </Alert>
      )}
      
      {/* Messages Area */}
      <Box 
        className="stable-chat-messages"
        ref={containerRef}
      >
        {messages.length === 0 ? (
          <Box className="stable-chat-empty-state">
            <Text color="dimmed" ta="center">Start a conversation by typing a message below.</Text>
          </Box>
        ) : (
          <Stack gap="md" p="md" className="stable-chat-message-stack">
            {messages.map(message => (
              <Paper
                key={message.id}
                className={`stable-chat-message ${
                  message.role === 'user' ? 'stable-chat-message-user' : 'stable-chat-message-assistant'
                } ${message.containsLatex ? 'contains-latex' : ''}`}
              >
                <Group gap="xs" mb={6} className="stable-chat-message-header">
                  {message.role === 'user' ? (
                    <>
                      <User size={16} />
                      <Text size="sm" fw={500}>You</Text>
                    </>
                  ) : (
                    <>
                      <Bot size={16} />
                      <Text size="sm" fw={500}>Bun Theon</Text>
                    </>
                  )}
                </Group>
                
                {message.role === 'user' ? (
                  <Text className={containsKhmerText(message.content) ? 'khmer-text' : ''}>
                    {message.content}
                  </Text>
                ) : (
                  <Box className={`stable-chat-markdown ${containsKhmerText(message.content) ? 'khmer-text' : ''}`}>
                    {message.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <Group justify="center" py="sm" className="stable-chat-loading">
                        <div className="dot-1"></div>
                        <div className="dot-2"></div>
                        <div className="dot-3"></div>
                      </Group>
                    )}
                  </Box>
                )}
              </Paper>
            ))}
            
            {/* Error Message */}
            {error && (
              <Paper className="stable-chat-error">
                <Group gap="xs" mb={6}>
                  <Text color="red" size="sm" fw={500}>Error</Text>
                </Group>
                <Text color="red" size="sm" mb={error ? 'xs' : 0}>{error}</Text>
                {error && (
                  <ActionIcon
                    variant="subtle" 
                    color="red" 
                    size="sm"
                    onClick={handleRetry}
                  >
                    <RefreshCw size={14} />
                    Retry
                  </ActionIcon>
                )}
              </Paper>
            )}
            
            {/* End marker for scrolling */}
            <div ref={bottomRef} className="stable-chat-bottom-marker" />
          </Stack>
        )}
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <ActionIcon
            color="blue"
            variant="filled"
            radius="xl"
            size="lg"
            onClick={() => scrollToBottom(true)}
            className="stable-chat-scroll-button"
          >
            <ChevronDown size={18} />
          </ActionIcon>
        )}
      </Box>
      
      {/* Input Area */}
      <Box className="stable-chat-input-container">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="stable-chat-input"
        />
        <ActionIcon
          color="primary"
          variant="subtle"
          size="lg"
          radius="xl"
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          className={`stable-chat-send-button ${input.trim() && !isLoading ? 'active' : ''}`}
        >
          <Send size={20} />
        </ActionIcon>
      </Box>
    </Box>
  );
};

export default StableChat;
