import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Group, Text, ActionIcon, Stack, Title, Alert, Paper, Button } from '@mantine/core';
import { Send, Trash, Bot, User, RefreshCw, AlertTriangle, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '../styles/stableChat.css';
import geminiService from '../services/gemini';
import { ChatMessage as GeminiChatMessage } from '../services/gemini/types';

// Define types for messages
type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
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

// Utility functions for text detection
const containsKhmerText = (text: string): boolean => {
  const khmerRegex = /[\u1780-\u17FF]/;
  return khmerRegex.test(text);
};

const containsLatex = (text: string): boolean => {
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
  // Core state - simplified to essential states
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [manualScrolling, setManualScrolling] = useState(false);
  const [inputTooLong, setInputTooLong] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Utility function to generate unique message IDs
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
  
  // Convert messages for Gemini API
  const convertToGeminiMessages = (msgs: Message[]): GeminiChatMessage[] => {
    return msgs.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.content
    }));
  };

  // Simplified scroll management
  const isNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
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
    setManualScrolling(!nearBottom && !isLoading);
  }, [isNearBottom, isLoading]);
  
  // Simplified and consolidated effects
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  useEffect(() => {
    if (messages.length === 0) return;
    if (!manualScrolling) {
      scrollToBottom(true);
    }
  }, [messages, scrollToBottom, manualScrolling]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      geminiService.cancelStream();
    };
  }, []);
  
  // Simplified input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    setInputTooLong(newInput.length > 8000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Simplified error recovery handler
  const handleTryShorterPrompt = () => {
    if (!input.trim() && messages.length >= 2) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        const shortenedContent = lastUserMessage.content.substring(
          0, Math.floor(lastUserMessage.content.length / 2)
        ) + "... (shortened)";
        setInput(shortenedContent);
      }
    }
    setError(null);
  };
  
  // Streamlined message handling
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (input.length > 12000) {
      setError("Your message is extremely long and may exceed token limits. Try sending a shorter message or breaking it into multiple messages.");
      return;
    }
    
    // Create messages
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      containsLatex: containsLatex(input.trim()),
      renderComplete: true
    };
    
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
    setManualScrolling(false);
    
    // Force scroll to bottom
    setTimeout(() => scrollToBottom(false), 0);
    
    // Safety timeout
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => handleResponseTimeout(assistantMessageId), 30000);
    
    try {
      // Stream the response with simplified callbacks
      const geminiMessages = convertToGeminiMessages([...messages, userMessage]);
      
      // Use a ref to track content to prevent duplicate tokens
      const contentRef = useRef('');
      contentRef.current = '';
      
      await geminiService.streamChatWithHistory(
        chatId,
        geminiMessages,
        systemPrompt,
        {
          onStart: () => {
            console.log('Stream started');
          },
          onToken: (token) => {
            // Reset timeout on token received
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = setTimeout(() => handleResponseTimeout(assistantMessageId), 30000);
            }
            
            // Update message content with new token
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              
              if (lastMessage && lastMessage.id === assistantMessageId) {
                // Instead of appending to existing content (which could cause duplication),
                // update the ref and set the full content
                contentRef.current += token;
                lastMessage.content = contentRef.current;
                
                // Update LaTeX flag if needed
                if (containsLatex(contentRef.current) && !lastMessage.containsLatex) {
                  lastMessage.containsLatex = true;
                }
              }
              
              return updatedMessages;
            });
            
            // Auto-scroll if not manually scrolling
            if (!manualScrolling) {
              scrollToBottom(false);
            }
          },
          onComplete: (fullResponse) => {
            handleStreamComplete(assistantMessageId, fullResponse);
          },
          onError: (err) => {
            handleStreamError(assistantMessageId, err);
          }
        }
      );
    } catch (err) {
      // Handle errors outside the stream callbacks
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      setIsLoading(false);
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error sending message:', err);
    }
  };
  
  // Helper functions to clean up handleSendMessage
  const handleResponseTimeout = (messageId: string) => {
    console.warn('Loading timeout reached - resetting loading state');
    setIsLoading(false);
    
    setMessages(prev => {
      const updatedMessages = [...prev];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      
      if (lastMessage && lastMessage.id === messageId && !lastMessage.renderComplete) {
        lastMessage.renderComplete = true;
        if (lastMessage.content === '') {
          lastMessage.content = 'The response was incomplete. Please try again.';
        } else {
          lastMessage.content += ' (Note: This response may be incomplete due to a timeout)';
        }
      }
      
      return updatedMessages;
    });
    
    setError('Response timed out. The message may be incomplete.');
  };
  
  const handleStreamComplete = (messageId: string, fullResponse: string) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    console.log('Stream completed - resetting loading state');
    setIsLoading(false);
    
    setMessages(prev => {
      const updatedMessages = [...prev];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      
      if (lastMessage && lastMessage.id === messageId) {
        lastMessage.renderComplete = true;
        
        // Ensure content is properly set
        if ((lastMessage.content.trim() === '' || lastMessage.content === undefined) && 
            fullResponse && fullResponse.trim() !== '') {
          lastMessage.content = fullResponse;
        }
        
        // Final verification of LaTeX detection
        lastMessage.containsLatex = containsLatex(lastMessage.content || '');
      }
      
      return updatedMessages;
    });
    
    // Final smooth scroll and focus input
    if (!manualScrolling) {
      setTimeout(() => scrollToBottom(true), 100);
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleStreamError = (messageId: string, err: Error) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setIsLoading(false);
    console.error('Stream error:', err);
    
    // Set appropriate error message based on error type
    if (err.name === "EmptyResponseError") {
      setError("The AI couldn't generate a response. Your message may be too long or complex. Try with a shorter or simpler message.");
    } else {
      setError(`Error: ${err.message}`);
    }
    
    // Update the message to show the error
    setMessages(prev => {
      const updatedMessages = [...prev];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      
      if (lastMessage && lastMessage.id === messageId && !lastMessage.renderComplete) {
        lastMessage.renderComplete = true;
        
        if (lastMessage.content.trim() === '') {
          lastMessage.content = 'An error occurred while generating the response. Please try again.';
        }
      }
      
      return updatedMessages;
    });
  };
  
  // Simple action handlers
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    geminiService.cancelStream();
    setManualScrolling(false);
    setShowScrollButton(false);
  };
  
  const handleRetry = () => {
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
                  <Box className={`stable-chat-markdown ${containsKhmerText(message.content || '') ? 'khmer-text' : ''}`}>
                    {message.content && (message.renderComplete || !isLoading) ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {message.content || 'No content available'}
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
            
            {/* Error Message with recovery options */}
            {error && (
              <Paper className="stable-chat-error">
                <Group gap="xs" mb={6}>
                  <Text color="red" size="sm" fw={500}>Error</Text>
                </Group>
                <Text color="red" size="sm" mb={error ? 'xs' : 0}>{error}</Text>
                <Group mt="xs">
                  {error.includes("too long") || error.includes("token limit") || error.includes("couldn't generate") ? (
                    <Button
                      variant="light" 
                      color="red" 
                      size="xs"
                      onClick={handleTryShorterPrompt}
                    >
                      Try with shorter prompt
                    </Button>
                  ) : (
                    <Button
                      variant="light" 
                      color="red" 
                      size="xs"
                      onClick={handleRetry}
                    >
                      Retry
                    </Button>
                  )}
                </Group>
              </Paper>
            )}
            
            {/* End marker for scrolling */}
            <div ref={bottomRef} className="stable-chat-bottom-marker" />
          </Stack>
        )}
        
        {/* Additional loading indicator - shows exact state for debugging */}
        {isLoading && (
          <Text size="xs" c="dimmed" ta="center" pos="absolute" bottom={10} left={0} right={0}>
            Loading response...
          </Text>
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
        {/* Warning for very long inputs */}
        {inputTooLong && (
          <Text size="xs" c="orange" mb={5}>
            Warning: Your message is very long. This might exceed token limits.
          </Text>
        )}
        
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={`stable-chat-input ${inputTooLong ? 'input-too-long' : ''}`}
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
