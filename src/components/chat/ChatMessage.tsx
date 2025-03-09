import React from 'react';
import { Box, Text, Flex } from '@mantine/core';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { getShadow } from '../../theme/mantineTheme';
import '../../styles/chat.css'; // Import chat.css

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  isKhmerText?: boolean;
}

// Enhanced chat message bubbles with consistent depth/shadow treatment
export function ChatMessage({ content, role, isKhmerText }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <Flex 
      justify={isUser ? 'flex-end' : 'flex-start'}
      mb="md"
      w="100%"
      className="fade-in"
    >
      <Box className={`chat-message-bubble ${isUser ? 'user' : 'assistant'} hover-lift`} >
        <Flex align="center" mb={6} className="role-icon-container">
          {isUser ? (
            <User size={14} className="role-icon" />
          ) : (
            <Bot size={14} className="role-icon" />
          )}
          <Text size="xs" fw={500}>
            {isUser ? 'You' : 'Bun Theon AI'}
          </Text>
        </Flex>

        {isUser ? (
          <Text className={`chat-message-content ${isKhmerText ? 'khmer-text' : ''}`}>
            {content}
          </Text>
        ) : (
          <Box className={`prose prose-sm max-w-none chat-message-content ${isKhmerText ? 'khmer-text' : ''}`}>
            <ReactMarkdown 
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {content}
            </ReactMarkdown>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

// Enhanced loading message with consistent shadow treatment
export function ChatLoadingMessage() {
  return (
    <Flex 
      justify="flex-start"
      mb="md"
      w="100%"
      className="fade-in"
    >
      <Box 
        style={{
          maxWidth: '80%',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'white', 
          border: '1px solid rgba(219, 193, 247, 0.2)',
          // Consistent shadow with other elements
          boxShadow: getShadow('sm'),
        }}
      >
        <Flex align="center" mb={6}>
          <Bot size={14} style={{ marginRight: '4px' }} />
          <Text size="xs" fw={500}>Bun Theon AI</Text>
        </Flex>

        <Flex align="center" mt={8}>
          <Box 
            w={8}
            h={8}
            ml={6}
            style={{ 
              borderRadius: '50%', 
              backgroundColor: 'rgba(172, 184, 247, 0.6)',
              boxShadow: '0 0 5px rgba(172, 184, 247, 0.3)',
            }}
            className="dot-1"
          />
          <Box 
            w={8}
            h={8}
            ml={6}
            style={{ 
              borderRadius: '50%', 
              backgroundColor: 'rgba(172, 184, 247, 0.6)',
              boxShadow: '0 0 5px rgba(172, 184, 247, 0.3)',
            }}
            className="dot-2"
          />
          <Box 
            w={8}
            h={8}
            ml={6}
            style={{ 
              borderRadius: '50%', 
              backgroundColor: 'rgba(172, 184, 247, 0.6)',
              boxShadow: '0 0 5px rgba(172, 184, 247, 0.3)',
            }}
            className="dot-3"
          />
        </Flex>
      </Box>
    </Flex>
  );
}
