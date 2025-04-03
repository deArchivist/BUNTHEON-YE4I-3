import React, { useState, useRef, useEffect } from 'react';
import { Box, Group, Text, ActionIcon, Stack, Title, Alert, Paper, Button } from '@mantine/core';
import { Send, Trash, Bot, User, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '../styles/stableChat.css'; // Reusing existing styles
import geminiService from '../services/gemini';
import { ChatMessage as GeminiChatMessage } from '../services/gemini/types';

// Simple message type
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isComplete?: boolean;
  containsLatex?: boolean; // Add property to track LaTeX content
}

interface ChatInterfaceProps {
  systemPrompt?: string;
  placeholder?: string;
  chatId?: string;
  showDemoWarning?: boolean;
}

// Improved utility function to detect Khmer text
const containsKhmerText = (text: string): boolean => {
  const khmerRegex = /[\u1780-\u17FF]/;
  return khmerRegex.test(text);
};

// Enhanced utility function to detect LaTeX with more comprehensive patterns
const containsLatex = (text: string): boolean => {
  return /(\$\$|\$|\\begin\{|\\frac|\\sum|\\int|\\lim|\\alpha|\\beta|\\gamma|\\delta)/.test(text);
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  systemPrompt = "You are a helpful assistant.",
  placeholder = "Type your message...",
  chatId = "default-chat",
  showDemoWarning = false
}) => {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Generate a unique ID for messages
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
  
  // Convert internal messages to Gemini format
  const convertToGeminiMessages = (msgs: Message[]): GeminiChatMessage[] => {
    return msgs.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.content
    }));
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  // Handle key press (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Send message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      isComplete: true,
      containsLatex: containsLatex(input.trim())
    };
    
    // Create empty assistant message
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      isComplete: false,
      containsLatex: false
    };
    
    // Update UI
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert messages for API
      const geminiMessages = convertToGeminiMessages([...messages, userMessage]);
      
      // Create a reference to store accumulated content
      const contentRef = { current: '' };
      
      // Stream the response
      await geminiService.streamChatWithHistory(
        chatId,
        geminiMessages,
        systemPrompt,
        {
          onStart: () => {
            console.log('Stream started');
          },
          onToken: (token) => {
            // Update assistant message with each token
            contentRef.current += token;
            
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              
              if (lastMessage && lastMessage.role === 'assistant') {
                // Set the full content instead of appending
                lastMessage.content = contentRef.current;
                
                // Check for LaTeX content and update flag if needed
                if (!lastMessage.containsLatex && containsLatex(contentRef.current)) {
                  lastMessage.containsLatex = true;
                }
              }
              
              return updatedMessages;
            });
          },
          onComplete: (fullResponse) => {
            // Mark assistant message as complete with final content
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.isComplete = true;
                // Set the complete content directly to ensure accuracy
                lastMessage.content = fullResponse;
                // Final check for LaTeX content
                lastMessage.containsLatex = containsLatex(fullResponse);
              }
              
              return updatedMessages;
            });
            
            setIsLoading(false);
            
            // Focus input for next message
            inputRef.current?.focus();
          },
          onError: (err) => {
            console.error('Error in stream:', err);
            setError(err.message);
            setIsLoading(false);
            
            // Mark assistant message as complete but with error
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.isComplete = true;
                if (!lastMessage.content) {
                  lastMessage.content = 'An error occurred. Please try again.';
                }
              }
              
              return updatedMessages;
            });
          }
        }
      );
    } catch (err) {
      console.error('Error sending message:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      
      setIsLoading(false);
    }
  };
  
  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    geminiService.cancelStream();
  };
  
  return (
    <Box className="stable-chat-container">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Title order={3}>Chat</Title>
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
            You're in demo mode. The AI responses are simulated.
          </Text>
        </Alert>
      )}
      
      {/* Messages Area */}
      <Box className="stable-chat-messages" style={{ overflowY: 'auto', height: 'calc(100% - 120px)' }}>
        {messages.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: '2rem' }}>
            <Text color="dimmed">Start a conversation by typing a message below.</Text>
          </Box>
        ) : (
          <Stack gap="md" p="md">
            {messages.map(message => (
              <Paper
                key={message.id}
                className={`stable-chat-message ${
                  message.role === 'user' ? 'stable-chat-message-user' : 'stable-chat-message-assistant'
                } ${message.containsLatex ? 'contains-latex' : ''}`}
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
                      <Text size="sm" fw={500}>Assistant</Text>
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
                    ) : isLoading ? (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <Text color="dimmed">No response</Text>
                    )}
                  </Box>
                )}
              </Paper>
            ))}
            
            {/* Error Message */}
            {error && (
              <Alert color="red" title="Error" variant="light">
                {error}
              </Alert>
            )}
            
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </Box>
      
      {/* Input Area */}
      <Box className="stable-chat-input-container" style={{ position: 'relative', marginTop: '1rem' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="stable-chat-input"
          style={{ paddingRight: '40px' }}
        />
        <ActionIcon
          color="blue"
          variant="filled"
          size="lg"
          radius="xl"
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          style={{ position: 'absolute', right: '10px', bottom: '10px' }}
        >
          <Send size={16} />
        </ActionIcon>
      </Box>
    </Box>
  );
};

export default ChatInterface;