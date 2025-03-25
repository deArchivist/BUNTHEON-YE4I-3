import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Group, Paper, Text, ActionIcon, Stack, Title, ScrollArea } from '@mantine/core';
import { Send, Trash, Bot, User, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiKey,
  systemPrompt = "You are a helpful AI assistant that can answer questions and provide information on a wide range of topics. Use Markdown for formatting and KaTeX for mathematical expressions.",
  placeholder = "Ask a question...",
  chatId = "default-chat",
  initialMessages = []
}) => {
  // State for messages, input, and UI states
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
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
      
      // Stream the response from Gemini
      await geminiService.streamChatWithHistory(
        chatId,
        geminiMessages,
        systemPrompt,
        'default-persona', // Use a default persona ID
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
    <Box style={{ height: '100%' }}>
      <Paper shadow="sm" p="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack gap="md" style={{ height: '100%' }}>
          {/* Header */}
          <Group justify="space-between">
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
          
          {/* Messages Area */}
          <ScrollArea style={{ flex: 1 }} ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <Box py="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Text color="dimmed" ta="center">Start a conversation by typing a message below.</Text>
              </Box>
            ) : (
              <Stack gap="md">
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
                      <Text>{message.content}</Text>
                    ) : (
                      <Box className="prose prose-sm max-w-none">
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
                      <Button 
                        variant="subtle" 
                        color="red" 
                        size="xs" 
                        leftSection={<RefreshCw size={14} />}
                        onClick={handleRetry}
                      >
                        Retry
                      </Button>
                    )}
                  </Paper>
                )}
                
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </ScrollArea>
          
          {/* Input Area - Redesigned with side-by-side layout */}
          <Group align="flex-start" gap="xs">
            <Box style={{ flex: 1 }}>
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  maxHeight: '200px',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              />
            </Box>
            <ActionIcon
              size="lg"
              color="blue"
              variant="light"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                marginTop: '10px',
                opacity: input.trim() && !isLoading ? 1 : 0.5,
                transition: 'opacity 0.2s ease',
              }}
            >
              <Send size={18} />
            </ActionIcon>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChatInterface;
