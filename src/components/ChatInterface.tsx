import React, { useState, useRef, useEffect } from 'react';
import { Box, Group, Text, ActionIcon, Stack, Title, ScrollArea, Alert, Paper } from '@mantine/core';
import { Send, Trash, Bot, User, RefreshCw, AlertTriangle, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '../styles/fonts.css'; // Import the fonts CSS
import geminiService from '../services/gemini';

// Define types for messages
type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

interface ChatInterfaceProps {
  apiKey?: string;
  systemPrompt?: string;
  placeholder?: string;
  chatId?: string;
  initialMessages?: Message[];
  showDemoWarning?: boolean;
}

// Add a utility function to detect Khmer text
const containsKhmerText = (text: string): boolean => {
  // Unicode range for Khmer: \u1780-\u17FF
  const khmerRegex = /[\u1780-\u17FF]/;
  return khmerRegex.test(text);
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiKey,
  systemPrompt = "You are a helpful AI assistant that can answer questions and provide information on a wide range of topics. Use Markdown for formatting and KaTeX for mathematical expressions.",
  placeholder = "Ask a question...",
  chatId = "default-chat",
  initialMessages = [],
  showDemoWarning = false
}) => {
  // State for messages, input, and UI states
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<any>(null);
  
  // Add new state for scroll management
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Simplified: Just keep track of whether we're scrolling automatically or not
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  
  // Simplified math content detection
  const hasMathContent = (text: string): boolean => {
    return /(\$|\\\(|\\\[|\\begin)/.test(text);
  };

  // Check if user is at bottom of chat
  const isUserAtBottom = () => {
    if (!scrollAreaRef.current?.viewport) return true;
    
    const viewport = scrollAreaRef.current.viewport;
    const scrollBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    return scrollBottom < 30; // A bit more threshold for better experience
  };

  // Handle scroll events
  const handleScroll = () => {
    // Update auto-scroll based on user position
    setIsAutoScrolling(isUserAtBottom());
    setShowScrollButton(!isUserAtBottom());
  };

  // Force scroll to bottom
  const scrollToBottom = () => {
    if (!scrollAreaRef.current?.viewport) return;
    
    const viewport = scrollAreaRef.current.viewport;
    viewport.scrollTop = viewport.scrollHeight;
    setIsAutoScrolling(true);
    setShowScrollButton(false);
  };

  // Simple scroll-to-bottom effect 
  useEffect(() => {
    // Only auto-scroll if user hasn't manually scrolled up
    if (isAutoScrolling && messagesEndRef.current) {
      // Use timeout to let content render first, especially math
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages, isAutoScrolling]);
  
  // Set up scroll event listener once
  useEffect(() => {
    const viewport = scrollAreaRef.current?.viewport;
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Cancel any ongoing stream when component unmounts
  useEffect(() => {
    return () => {
      geminiService.cancelStream();
    };
  }, []);
  
  // Generate a unique ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Define the ChatMessage type to match what the Gemini API expects
  interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
  }

  // Helper to convert our messages to the format expected by the Gemini API
  const convertToGeminiMessages = (msgs: Message[]): ChatMessage[] => {
    return msgs.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.content
    }));
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Create a new user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim()
    };
    
    // Add to messages and clear input
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    
    // Create a placeholder for the assistant's response
    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: ''
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(true);
    
    try {
      // Convert messages for the API
      const geminiMessages = convertToGeminiMessages([...messages, userMessage]);
      
      // Stream the response from Gemini - removed persona parameter
      await geminiService.streamChatWithHistory(
        chatId,
        geminiMessages,
        systemPrompt,
        {
          onStart: () => {
            console.log('Stream started');
          },
          onToken: (token) => {
            // Update the assistant message with each token
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              if (lastMessage && lastMessage.id === assistantMessageId) {
                lastMessage.content += token;
              }
              return updatedMessages;
            });
          },
          onComplete: (fullResponse) => {
            setIsLoading(false);
            console.log('Stream completed');
            
            // Final scroll attempt after everything is done
            setTimeout(scrollToBottom, 300);
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
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    geminiService.cancelStream();
  };
  
  // Handle retrying after an error
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
  
  // Handle key press in input (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Box style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative' // Ensure positioning context
    }}>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Title order={3}>AI Chat</Title>
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
      
      {/* Messages Area - Adjusted to leave space for input */}
      <Box 
        style={{ 
          flex: 1, 
          overflow: 'hidden',
          marginBottom: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'  // For scroll button positioning
        }}
      >
        <ScrollArea 
          style={{ 
            height: '100%',
            width: '100%'
          }} 
          scrollbarSize={8}
          type="auto"
          offsetScrollbars
          ref={scrollAreaRef}
          viewportRef={(viewport) => {
            if (scrollAreaRef.current && viewport) {
              scrollAreaRef.current.viewport = viewport;
            }
          }}
        >
          {messages.length === 0 ? (
            <Box py="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Text color="dimmed" ta="center">Start a conversation by typing a message below.</Text>
            </Box>
          ) : (
            <Stack gap="md" p="md"> {/* Added padding */}
              {messages.map(message => (
                <Paper
                  key={message.id}
                  p="md"
                  shadow="xs"
                  radius="md"
                  style={{
                    maxWidth: '80%',
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: message.role === 'user' ? '#f0f8ff' : 'white',
                    borderColor: message.role === 'user' ? '#d8e8f9' : '#e0e0e0',
                    borderWidth: 1,
                    borderStyle: 'solid'
                  }}
                >
                  <Group gap="xs" mb={6}>
                    {message.role === 'user' ? (
                      <>
                        <User size={16} />
                        <Text size="sm" fw={500}>You</Text>
                      </>
                    ) : (
                      <>
                        <Bot size={16} />
                        <Text size="sm" fw={500}>AI Assistant</Text>
                      </>
                    )}
                  </Group>
                  
                  {message.role === 'user' ? (
                    <Text className={containsKhmerText(message.content) ? 'khmer-text' : ''}>
                      {message.content}
                    </Text>
                  ) : (
                    <Box className={`prose prose-sm max-w-none ${containsKhmerText(message.content) ? 'khmer-text' : ''}`}>
                      {message.content ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <Group justify="center" py="sm">
                          <div className="dot-1" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#909090', marginRight: 4, animation: 'pulse 1s infinite' }}></div>
                          <div className="dot-2" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#909090', marginRight: 4, animation: 'pulse 1s infinite 0.2s' }}></div>
                          <div className="dot-3" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#909090', animation: 'pulse 1s infinite 0.4s' }}></div>
                        </Group>
                      )}
                    </Box>
                  )}
                </Paper>
              ))}
              
              {/* Error Message */}
              {error && (
                <Paper
                  p="md"
                  shadow="xs"
                  radius="md"
                  style={{
                    maxWidth: '80%',
                    alignSelf: 'flex-start',
                    backgroundColor: '#fff0f0',
                    borderColor: '#ffcccc',
                    borderWidth: 1,
                    borderStyle: 'solid'
                  }}
                >
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
              
              <div ref={messagesEndRef} />
            </Stack>
          )}
        </ScrollArea>
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <ActionIcon
            color="blue"
            variant="filled"
            radius="xl"
            size="lg"
            onClick={scrollToBottom}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              zIndex: 10,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}
          >
            <ChevronDown size={18} />
          </ActionIcon>
        )}
      </Box>
      
      {/* Input Area - Guaranteed to be visible above navigation */}
      <Box style={{ 
        position: 'relative',
        flexShrink: 0,
        marginBottom: '8px', // Extra space at bottom to ensure visibility
        backgroundColor: 'white', // Ensure background is opaque
        zIndex: 10 // Keep above content but below page container
      }}>
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          style={{
            width: '100%',
            minHeight: '57px',
            maxHeight: '120px', // Limit max height to prevent overflow
            padding: '10px',
            paddingRight: '3rem',
            borderRadius: 'var(--mantine-radius-md)',
            border: '1px solid rgb(226, 232, 240)',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
        />
        <ActionIcon
          color="primary"
          variant="subtle"
          size="lg"
          radius="xl"
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          style={{
            position: 'absolute',
            bottom: 'calc(0.5rem * var(--mantine-scale))',
            right: 'calc(0.5rem * var(--mantine-scale))',
            opacity: input.trim() && !isLoading ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          <Send size={20} />
        </ActionIcon>
      </Box>
    </Box>
  );
};

export default ChatInterface;
