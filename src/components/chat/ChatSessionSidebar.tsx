import React, { useState } from 'react';
import { 
  Drawer, 
  Title, 
  Stack, 
  Text, 
  Button, 
  Group, 
  Card, 
  ActionIcon, 
  ThemeIcon, 
  TextInput,
  Divider,
  Box,
  Modal
} from '@mantine/core';
import { 
  X, 
  Edit, 
  Trash2, 
  Plus, 
  MessageCircle, 
  Check, 
  ChevronRight, 
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { useChatContext, ChatSession } from '../../contexts/ChatContext';
import { PersonaSelector } from './PersonaSelector';

interface ChatSessionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function for safe date comparison
const sortByUpdatedAt = (a: ChatSession, b: ChatSession): number => {
  // Default to 0 timestamp if updatedAt doesn't exist
  const getTimestamp = (value: any): number => {
    if (!value) return 0;
    // Check if it's already a number
    if (typeof value === 'number') return value;
    // Try to convert to Date and get timestamp
    try {
      return new Date(value).getTime();
    } catch (e) {
      return 0;
    }
  };
  
  const timeA = getTimestamp(a.updatedAt);
  const timeB = getTimestamp(b.updatedAt);
  
  return timeB - timeA; // Most recent first
};

const ChatSessionSidebar: React.FC<ChatSessionSidebarProps> = ({ isOpen, onClose }) => {
  const { 
    chatSessions, 
    currentChatId,
    selectedPersona,
    setSelectedPersona,
    personas,
    setCurrentChatId,
    createNewChat,
    renameChatSession,
    deleteChatSession,
    clearAllChats
  } = useChatContext();
  
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState('');
  const [expandedSection, setExpandedSection] = useState<'active' | null>('active');
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  
  // Filter chats to only show those for the selected persona
  const personaChats = chatSessions.filter(chat => 
    chat && chat.personaId === selectedPersona.id
  ).sort(sortByUpdatedAt);
  
  const handleStartEditing = (chat: ChatSession) => {
    setEditingChatId(chat.id);
    setNewChatName(chat.name);
  };
  
  const handleSaveEdit = () => {
    if (editingChatId && newChatName.trim()) {
      renameChatSession(editingChatId, newChatName.trim());
      setEditingChatId(null);
      setNewChatName('');
    }
  };
  
  // Format dates safely
  const formatDate = (date: any) => {
    try {
      const dateObj = typeof date === 'number' || typeof date === 'string' 
        ? new Date(date) 
        : date;
      return format(dateObj, 'MMM d, h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setNewChatName('');
    }
  };
  
  const handleCreateNewChat = () => {
    const newChatId = createNewChat();
    setCurrentChatId(newChatId);
    onClose(); // Close sidebar after creating a new chat
  };
  
  const toggleSectionExpansion = (section: 'active') => {
    setExpandedSection(prev => prev === section ? null : section);
  };
  
  // Handle persona change
  const handlePersonaChange = (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      setSelectedPersona(persona);
    }
  };
  
  // Handler for clear all chats confirmation
  const handleClearAllChats = () => {
    clearAllChats();
    setShowClearConfirmation(false);
  };
  
  return (
    <Drawer 
      opened={isOpen} 
      onClose={onClose} 
      position="right"
      size="md"
    >
      {/* Custom title without heading element nesting */}
      <Box mb="md" px="md">
        <Text fw={700} size="lg">Chat History</Text>
      </Box>
      
      <Stack gap="md" px="md">
        {/* Persona selector */}
        <Card withBorder p="md" radius="md">
          <Stack gap="xs">
            <Text fw={500} size="sm">Current AI Persona</Text>
            <PersonaSelector 
              personas={personas}
              selectedPersonaId={selectedPersona.id}
              onPersonaChange={handlePersonaChange}
            />
            <Button 
              leftSection={<Plus size={16} />}
              variant="light"
              color="primary"
              onClick={handleCreateNewChat}
              mt="xs"
              fullWidth
            >
              New Conversation
            </Button>
          </Stack>
        </Card>
        
        {/* Active chats section */}
        <div>
          <Group 
            justify="space-between" 
            onClick={() => toggleSectionExpansion('active')}
            className="cursor-pointer"
            mb="xs"
          >
            <Group gap="xs">
              {expandedSection === 'active' ? 
                <ChevronDown size={18} /> : 
                <ChevronRight size={18} />
              }
              <Text fw={600}>Conversations</Text>
            </Group>
            <Text size="sm" c="dimmed">{personaChats.length}</Text>
          </Group>
          
          {expandedSection === 'active' && (
            <Stack gap="xs">
              {personaChats.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="sm">
                  No conversations
                </Text>
              ) : (
                personaChats.map(chat => (
                  <Card 
                    key={chat.id}
                    withBorder
                    p="sm"
                    radius="md"
                    className={`transition-all ${
                      currentChatId === chat.id 
                        ? 'bg-primary-50 border-primary-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {editingChatId === chat.id ? (
                      <TextInput
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyDown}
                        size="sm"
                        rightSection={
                          <ActionIcon size="sm" onClick={handleSaveEdit}>
                            <Check size={16} />
                          </ActionIcon>
                        }
                        autoFocus
                      />
                    ) : (
                      <div onClick={() => {
                        setCurrentChatId(chat.id);
                        onClose();
                      }}>
                        <Group justify="space-between" wrap="nowrap">
                          <Text fw={currentChatId === chat.id ? 600 : 500} lineClamp={1}>
                            {chat.name}
                          </Text>
                          <Group gap="xs">
                            <ActionIcon 
                              size="sm" 
                              variant="subtle" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditing(chat);
                              }}
                            >
                              <Edit size={14} />
                            </ActionIcon>
                            <ActionIcon 
                              size="sm" 
                              variant="subtle" 
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to delete this chat?")) {
                                  deleteChatSession(chat.id);
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="xs" c="dimmed">
                            {chat.updatedAt ? formatDate(chat.updatedAt) : 'No date'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {chat.messages?.length || 0} {(chat.messages?.length || 0) === 1 ? 'message' : 'messages'}
                          </Text>
                        </Group>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </Stack>
          )}
        </div>
        
        {/* Empty state */}
        {personaChats.length === 0 && (
          <Box py="xl" ta="center">
            <ThemeIcon size="xl" radius="xl" color="gray" variant="light" mx="auto" mb="md">
              <MessageCircle size={24} />
            </ThemeIcon>
            <Text fw={500}>No conversations yet</Text>
            <Text size="sm" c="dimmed" mx="auto" maw={250} mt="xs">
              Start a new conversation with Bun Theon AI to get help with your studies
            </Text>
          </Box>
        )}
        
        {/* Footer with clear all button */}
        <Divider my="xs" />
        
        <Button
          color="red"
          variant="light"
          leftSection={<Trash2 size={16} />}
          onClick={() => setShowClearConfirmation(true)}
          className="clear-all-button"
          fullWidth
        >
          Clear All Chat History
        </Button>
      </Stack>
      
      {/* Confirmation Modal */}
      <Modal
        opened={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        title="Clear All Chat History"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete all chat history across all personas? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setShowClearConfirmation(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleClearAllChats}>
              Clear All History
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Drawer>
  );
};

export default ChatSessionSidebar;
