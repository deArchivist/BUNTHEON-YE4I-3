import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SmartScrollProps {
  children: React.ReactNode;
  dependencies: any[];
  threshold?: number;
  className?: string;
}

/**
 * A component that provides smart scrolling behavior:
 * - Auto scrolls to bottom when new content appears (if user is already near bottom)
 * - Shows a scroll-to-bottom button when user scrolls up
 */
const SmartScroll: React.FC<SmartScrollProps> = ({ 
  children, 
  dependencies, 
  threshold = 150,
  className = '' 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Handle auto scrolling when dependencies change
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    
    scrollToBottom();
  }, [dependencies, autoScroll]);
  
  // Handle scroll event to show/hide scroll button and determine auto-scroll behavior
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;
    
    setShowScrollButton(!isNearBottom);
    setAutoScroll(isNearBottom);
  };
  
  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    setShowScrollButton(false);
    setAutoScroll(true);
  };
  
  return (
    <div className="relative flex-1 flex flex-col">
      <div 
        ref={scrollRef} 
        className={`overflow-y-auto flex-1 ${className}`}
        onScroll={handleScroll}
      >
        {children}
      </div>
      
      {showScrollButton && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={18} />
        </button>
      )}
    </div>
  );
};

export default SmartScroll;
