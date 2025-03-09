import React from 'react';
import { Bot } from 'lucide-react';

const ChatLoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start max-w-[80%]">
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center mb-1">
          <Bot size={16} className="mr-1" />
          <span className="text-xs font-medium">Bun Theon AI</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;
