import React, { useState, useEffect } from 'react';
import { 
  Title,
  Text,
  Stack,
  TextInput,
  Card,
  Group,
  Button,
  Chip,
  ActionIcon,
  Box,
  ThemeIcon,
  Badge,
  ScrollArea,
  Tooltip,
  Tabs
} from '@mantine/core';
import { 
  Search, 
  Heart, 
  Copy, 
  Check, 
  BookOpen, 
  Filter, // Changed from SlidersHorizontal to Filter
  X,
  ListFilter
} from 'lucide-react';
import { getShadow } from '../theme/mantineTheme';

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

// This would come from an API in a real application
const initialPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Explain a Complex Topic Simply',
    content: 'Can you explain [topic] as if I were 12 years old? Use simple analogies and examples.',
    category: 'Learning',
    tags: ['explanation', 'simplified', 'learning']
  },
  {
    id: '2',
    title: 'Math Problem Breakdown',
    content: 'Can you break down this math problem step-by-step? [insert problem]. Explain each step clearly.',
    category: 'Math',
    tags: ['problem solving', 'step-by-step', 'tutorial']
  },
  {
    id: '3',
    title: 'Essay Structure Guidance',
    content: 'I need to write an essay about [topic]. Can you suggest a structure with main points and potential supporting arguments?',
    category: 'Writing',
    tags: ['essay', 'structure', 'academic']
  },
  {
    id: '4',
    title: 'Science Experiment Design',
    content: 'Help me design a simple science experiment to demonstrate [concept] using household materials.',
    category: 'Science',
    tags: ['experiment', 'practical', 'demonstration']
  },
  {
    id: '5',
    title: 'Historical Events Timeline',
    content: 'Can you create a timeline of key events related to [historical period/event]? Include dates and brief descriptions.',
    category: 'History',
    tags: ['timeline', 'events', 'chronology']
  },
  {
    id: '6',
    title: 'Vocabulary Practice Dialog',
    content: 'Create a conversation between two people that uses these vocabulary words: [list of words]. The conversation should be about [topic].',
    category: 'Language',
    tags: ['vocabulary', 'conversation', 'practice']
  },
  {
    id: '7',
    title: 'Study Schedule Creation',
    content: 'I need to prepare for [exam/subject] in [timeframe]. Can you suggest a daily study schedule that covers all relevant topics?',
    category: 'Study Skills',
    tags: ['planning', 'schedule', 'organization']
  },
];

const categories = ["All", "Learning", "Math", "Writing", "Science", "History", "Language", "Study Skills"];

const PromptLibrary: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter prompts based on search term and category
  const filteredPrompts = prompts.filter(prompt => {
    // Category filter
    if (selectedCategory !== 'All' && prompt.category !== selectedCategory) {
      return false;
    }
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        prompt.title.toLowerCase().includes(term) ||
        prompt.content.toLowerCase().includes(term) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    return true;
  });

  // Sort prompts with favorites at the top
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    const aFavorite = favorites.includes(a.id);
    const bFavorite = favorites.includes(b.id);
    
    if (aFavorite && !bFavorite) return -1;
    if (!aFavorite && bFavorite) return 1;
    return 0;
  });

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('promptFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('promptFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(promptId => promptId !== id)
        : [...prev, id]
    );
  };

  // Copy to clipboard and show confirmation
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('All');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCategory !== 'All';

  return (
    <Stack gap="xl">
      {/* Header with filter button - no outline */}
      <Box pos="relative" pb={8}>
        <div>
          <Title order={1} size="h3">Prompt Library</Title>
          <Text c="dimmed">Educational prompts to use with Bun Theon AI</Text>
        </div>
        <ActionIcon 
          bg={hasActiveFilters ? "primary.1" : "gray.1"}
          c={hasActiveFilters ? "primary.7" : "gray.7"}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Show filters"
          size="lg"
          radius="md"
          pos="absolute"
          top={0}
          right={0}
          style={{
            boxShadow: getShadow('xs'),
            transition: 'all 0.2s ease',
            border: 'none', // Remove outline
          }}
          className="hover-lift"
        >
          <Filter size={18} />
        </ActionIcon>
      </Box>

      {/* Search input */}
      <TextInput
        leftSection={<Search size={16} />}
        placeholder="Search prompts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        radius="md"
      />

      {/* Filters section */}
      {showFilters && (
        <Card withBorder radius="md" pt="xs">
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">Filter by Category</Text>
              <Button
                variant="subtle"
                size="xs"
                color="gray"
                onClick={clearFilters}
                rightSection={<X size={12} />}
              >
                Clear
              </Button>
            </Group>
            <Group gap="xs">
              {categories.map(category => (
                <Chip
                  key={category}
                  checked={selectedCategory === category}
                  onChange={() => setSelectedCategory(category)}
                  color="secondary"
                  variant="outline"
                  size="sm"
                  radius="sm"
                >
                  {category}
                </Chip>
              ))}
            </Group>
          </Box>
        </Card>
      )}

      {/* Results */}
      <Stack gap="md">
        {sortedPrompts.length > 0 ? (
          sortedPrompts.map(prompt => {
            const isFavorite = favorites.includes(prompt.id);
            const isCopied = copiedId === prompt.id;
            
            return (
              <Card key={prompt.id} withBorder radius="md" p="md">
                <Stack gap="md">
                  <Group justify="space-between" wrap="nowrap">
                    <Text fw={600} size="md">{prompt.title}</Text>
                    <Group gap="xs">
                      {/* Fix: Wrap ActionIcon with Tooltip instead of the other way around */}
                      <Tooltip label={isFavorite ? "Remove from favorites" : "Add to favorites"} withArrow>
                        <ActionIcon 
                          variant="subtle" 
                          color="secondary"
                          onClick={() => toggleFavorite(prompt.id)}
                        >
                          {isFavorite ? 
                            <Heart size={18} fill="currentColor" color="var(--mantine-color-secondary-6)" /> : 
                            <Heart size={18} />
                          }
                               
                        </ActionIcon>
                      </Tooltip>
                      
                      {/* Fix: Wrap ActionIcon with Tooltip instead of the other way around */}
                      <Tooltip label={isCopied ? "Copied!" : "Copy to clipboard"} withArrow>
                        <ActionIcon 
                          variant="subtle" 
                          color={isCopied ? "success" : "gray"}
                          onClick={() => copyToClipboard(prompt.content, prompt.id)}
                        >
                          {isCopied ? <Check size={18} /> : <Copy size={18} />}
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                  
                  <Box 
                    style={{ 
                      backgroundColor: 'var(--mantine-color-gray-0)', 
                      padding: '0.75rem', 
                      borderRadius: 'var(--mantine-radius-sm)',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9rem'
                    }}
                  >
                    {prompt.content}
                  </Box>
                  
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs">
                      {prompt.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          color="secondary" 
                          variant="dot" 
                          size="sm" 
                          radius="sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                    <Badge color="primary" variant="light">
                      {prompt.category}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            );
          })
        ) : (
          <Card withBorder p="xl" ta="center">
            <ThemeIcon size="xl" radius="xl" color="gray" variant="light" mx="auto" mb="md">
              <BookOpen size={24} />
            </ThemeIcon>
            <Text fw={500}>No prompts found</Text>
            <Text size="sm" c="dimmed" maw={400} mx="auto" mt="xs">
              Try adjusting your search term or selecting a different category
            </Text>
          </Card>
        )}
      </Stack>
    </Stack>
  );
};

export default PromptLibrary;