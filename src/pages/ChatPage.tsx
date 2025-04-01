import React from 'react';
import { Box } from '@mantine/core';
import StableChat from '../components/StableChat';
import { ENV } from '../config/env';
import '../styles/animations.css';
import '../styles/fonts.css';

const ChatPage: React.FC = () => {
  const apiKeyConfigured = ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== 'demo_mode';
  
  // Calculate height to account for navigation bar (typically 60px)
  const navbarHeight = 60;
  
  return (
    <Box style={{ 
      height: `calc(100vh - ${navbarHeight}px)`,
      padding: '16px',
      paddingBottom: '16px',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: `${navbarHeight}px`,
      zIndex: 100
    }}>
      <StableChat 
        systemPrompt="You are Bun Theon, a helpful AI assistant specialized in education. You can solve problems step-by-step and explain concepts clearly. You support math using LaTeX formatting."
        placeholder="Ask Bun Theon something..."
        showDemoWarning={!apiKeyConfigured}
      />
    </Box>
  );
};

export default ChatPage;
