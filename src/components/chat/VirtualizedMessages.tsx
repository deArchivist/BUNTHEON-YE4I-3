import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../../contexts/ChatContext';
import { ChatMessage, ChatMessage as ChatMessageComponent } from './ChatMessage'; // Import ChatMessageComponent
import ChatLoadingIndicator from './ChatLoadingIndicator';

interface VirtualizedMessagesProps {
  messages: Message[];
  isKhmerTextFn: (text: string) => boolean;
}

/**
 * A simple virtualization component for chat messages that only renders
 * messages that are likely to be visible or near-visible in the viewport
 */
const VirtualizedMessages: React.FC<VirtualizedMessagesProps> = ({ messages, isKhmerTextFn }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const messageHeightEstimate = 100; // Estimated average height of a message

  // Update visible range based on scroll position
  const updateVisibleRange = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { scrollTop, clientHeight, scrollHeight } = container;
    setScrollPosition(scrollTop);
    
    // Calculate which messages should be visible based on scroll position
    const bufferScreens = 1; // How many screens worth of messages to buffer
    const bufferHeight = clientHeight * bufferScreens;
    
    const estimateStart = Math.max(0, Math.floor((scrollTop - bufferHeight) / messageHeightEstimate));
    const estimateEnd = Math.min(
      messages.length,
      Math.ceil((scrollTop + clientHeight + bufferHeight) / messageHeightEstimate)
    );
    
    setVisibleRange({ start: estimateStart, end: estimateEnd });
  };

  // Initialize and update visible range on mount and message changes
  useEffect(() => {
    updateVisibleRange();
  }, [messages.length]);

  // Render only the visible messages plus buffer
  const visibleMessages = messages.slice(visibleRange.start, visibleRange.end);
  
  // Calculate spacer heights
  const topSpacerHeight = visibleRange.start * messageHeightEstimate;
  const bottomSpacerHeight = (messages.length - visibleRange.end) * messageHeightEstimate;

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto flex-1 space-y-4 p-3"
      onScroll={updateVisibleRange}
    >
      {/* Top spacer */}
      {visibleRange.start > 0 && <div style={{ height: topSpacerHeight }} />}
      
      {/* Visible messages */}
      {visibleMessages.map(message => (
        <ChatMessageComponent // Use ChatMessageComponent here
          key={message.id}
          role={message.role}
          content={message.content}
          isKhmerText={isKhmerTextFn(message.content)}
        />
      ))}
      
      {/* Bottom spacer */}
      {visibleRange.end < messages.length && <div style={{ height: bottomSpacerHeight }} />}
    </div>
  );
};

export default VirtualizedMessages;
