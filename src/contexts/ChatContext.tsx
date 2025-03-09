import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import defaultPersonas from '../config/personas';

// Define types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface ChatSession {
  id: string;
  name: string;
  personaId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatContextType {
  currentChatId: string | null;
  personas: Persona[];
  selectedPersona: Persona;
  chatSessions: ChatSession[];
  setCurrentChatId: (id: string | null) => void;
  setSelectedPersona: (persona: Persona) => void;
  createNewChat: (personaId?: string) => string;
  addMessage: (message: { role: 'user' | 'assistant', content: string }) => string;
  clearCurrentChat: () => void;
  clearAllChats: () => void; // New function
  renameChatSession: (chatId: string, newName: string) => void;
  deleteChatSession: (chatId: string) => void;
  getCurrentChat: () => ChatSession | undefined;
  updateLastAssistantMessage: (messageId: string, content: string) => void;
}

// Redundant defaultPersonas array removed. Using defaultPersonas from src/config/personas.ts

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [personas] = useState<Persona[]>(defaultPersonas); // Use imported defaultPersonas
  const [selectedPersona, setSelectedPersona] = useState<Persona>(defaultPersonas[0]); // Use imported defaultPersonas
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Load chat sessions from localStorage on initial render
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions));
    }
    
    // Auto-select the first chat for the default persona, or create one if none exists
    const defaultPersonaChats = JSON.parse(savedSessions || '[]').filter(
      (chat: ChatSession) => chat.personaId === defaultPersonas[0].id
    );
    
    if (defaultPersonaChats.length > 0) {
      setCurrentChatId(defaultPersonaChats[0].id);
    } else {
      const newChatId = createNewChat(defaultPersonas[0].id);
      setCurrentChatId(newChatId);
    }
  }, []);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // When persona changes, switch to the first chat of that persona or create a new one
  useEffect(() => {
    const personaChats = chatSessions.filter(chat => chat.personaId === selectedPersona.id);
    if (personaChats.length > 0) {
      setCurrentChatId(personaChats[0].id);
    } else {
      const newChatId = createNewChat(selectedPersona.id);
      setCurrentChatId(newChatId);
    }
  }, [selectedPersona.id]);

  // Create a new chat session
  const createNewChat = (personaId?: string): string => {
    const id = uuidv4();
    const newChat: ChatSession = {
      id,
      name: `Chat ${new Date().toLocaleString()}`,
      personaId: personaId || selectedPersona.id,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setChatSessions(prev => [...prev, newChat]);
    return id;
  };

  // Get the current chat session
  const getCurrentChat = (): ChatSession | undefined => {
    return chatSessions.find(chat => chat.id === currentChatId);
  };

  // Add a message to the current chat and return its ID
  const addMessage = (message: { role: 'user' | 'assistant', content: string }): string => {
    if (!currentChatId) return '';
    
    const messageId = uuidv4();
    
    setChatSessions(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: messageId,
              ...message,
              timestamp: Date.now()
            }
          ],
          updatedAt: Date.now()
        };
      }
      return chat;
    }));
    
    return messageId;
  };

  // Update a specific assistant message by ID
  const updateLastAssistantMessage = (messageId: string, content: string) => {
    if (!currentChatId) return;
    
    setChatSessions(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        const messages = chat.messages.map(msg => 
          msg.id === messageId ? { ...msg, content } : msg
        );
        
        return {
          ...chat,
          messages,
          updatedAt: Date.now()
        };
      }
      return chat;
    }));
  };

  // Clear the current chat
  const clearCurrentChat = () => {
    if (!currentChatId) return;
    
    setChatSessions(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [],
          updatedAt: Date.now()
        };
      }
      return chat;
    }));
  };

  // Clear all chat sessions
  const clearAllChats = () => {
    setChatSessions([]);
    // Create a new empty chat for the current persona
    const newChatId = createNewChat(selectedPersona.id);
    setCurrentChatId(newChatId);
  };

  // Rename a chat session
  const renameChatSession = (chatId: string, newName: string) => {
    setChatSessions(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          name: newName,
          updatedAt: Date.now()
        };
      }
      return chat;
    }));
  };

  // Delete a chat session
  const deleteChatSession = (chatId: string) => {
    setChatSessions(prev => {
      const newSessions = prev.filter(chat => chat.id !== chatId);
      
      // If we're deleting the current chat, select another one
      if (chatId === currentChatId) {
        const personaChats = newSessions.filter(chat => chat.personaId === selectedPersona.id);
        if (personaChats.length > 0) {
          setCurrentChatId(personaChats[0].id);
        } else {
          const newChatId = createNewChat(selectedPersona.id);
          setCurrentChatId(newChatId);
        }
      }
      
      return newSessions;
    });
  };
  
  return (
    <ChatContext.Provider value={{
      currentChatId,
      personas,
      selectedPersona,
      chatSessions,
      setCurrentChatId,
      setSelectedPersona,
      createNewChat,
      addMessage,
      clearCurrentChat,
      clearAllChats, // Add new function
      renameChatSession,
      deleteChatSession,
      updateLastAssistantMessage,
      getCurrentChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};