import React from 'react';
import { Box, Title, Text } from '@mantine/core';
import ChatInterface from '../components/ChatInterface';
import { ENV } from '../config/env';
import '../styles/animations.css';

const ChatPage: React.FC = () => {
  const apiKeyConfigured = ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== 'demo_mode';
  
  return (
    <Box style={{ height: 'calc(100vh - 60px)' }}>
      <Box mb="md">
        <Title ta="center" mb="sm">Bun Theon AI Chat</Title>
        
        {!apiKeyConfigured && (
          <Box mb="md" p="md" style={{ backgroundColor: '#fff8e1', borderRadius: '4px', borderLeft: '4px solid #ffc107' }}>
            <Text>
              <strong>Note:</strong> You're currently in demo mode because the Gemini API key is not configured.
              The AI responses are simulated in this mode.
            </Text>
            <Text size="sm" mt="xs">
              To use the real Gemini API, please set your API key in the environment variables.
            </Text>
          </Box>
        )}
      </Box>
      
      <Box style={{ height: 'calc(100% - 80px)' }}>
        <ChatInterface 
          systemPrompt="You are Bun Theon, a helpful AI assistant specialized in education. You can solve problems step-by-step and explain concepts clearly. You support math using LaTeX formatting."
          placeholder="Ask Bun Theon something..."
        />
      </Box>
    </Box>
  );
};

export default ChatPage;
