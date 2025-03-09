import React, { useState, useEffect } from 'react';
import { 
  Title, 
  Text, 
  Stack,
  TextInput, 
  Card,
  Group, 
  ThemeIcon,
  Badge,
  Box,
  ActionIcon,
  Chip,
  Button,
  Tabs
} from '@mantine/core';
import { BookText, Search, Volume2, Filter, X } from 'lucide-react';
import { getShadow } from '../theme/mantineTheme';

interface DictionaryEntry {
  id: string;
  englishTerm: string;
  khmerTerm: string;
  phonetic: string;
  definition: string;
  example: string;
  subject: string;
}

// This would come from an API in a real application
const initialDictionary: DictionaryEntry[] = [
  {
    id: '1',
    englishTerm: 'Photosynthesis',
    khmerTerm: 'រស្មីសំយោគ',
    phonetic: '/ˌfoʊtoʊˈsɪnθəsɪs/',
    definition: 'The process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water.',
    example: 'Photosynthesis occurs in the chloroplasts of plant cells.',
    subject: 'Biology'
  },
  {
    id: '2',
    englishTerm: 'Equation',
    khmerTerm: 'សមីការ',
    phonetic: '/ɪˈkweɪʒən/',
    definition: 'A statement asserting the equality of two expressions, usually written as a linear array of symbols that are separated into left and right sides.',
    example: 'The equation 2x + 5 = 15 can be solved to find that x = 5.',
    subject: 'Mathematics'
  },
  {
    id: '3',
    englishTerm: 'Atom',
    khmerTerm: 'អាតូម',
    phonetic: '/ˈætəm/',
    definition: 'The basic unit of a chemical element, consisting of a positively charged nucleus surrounded by negatively charged electrons.',
    example: 'Water molecules consist of two hydrogen atoms and one oxygen atom.',
    subject: 'Chemistry'
  },
  {
    id: '4',
    englishTerm: 'Metaphor',
    khmerTerm: 'រូបភាពប្រៀបធៀប',
    phonetic: '/ˈmɛtəfɔːr/',
    definition: 'A figure of speech that describes an object or action in a way that isnt literally true, but helps explain an idea or make a comparison.',
    example: 'The world is a stage, and all people are merely actors on it.',
    subject: 'Literature'
  },
  {
    id: '5',
    englishTerm: 'Democracy',
    khmerTerm: 'លទ្ធិប្រជាធិបតេយ្យ',
    phonetic: '/dɪˈmɒkrəsi/',
    definition: 'A form of government in which the people have the authority to choose their governing legislators.',
    example: 'Ancient Athens is often referred to as the birthplace of democracy.',
    subject: 'Social Studies'
  },
];

const subjects = ["All", "Biology", "Chemistry", "Mathematics", "Literature", "Social Studies", "Physics"];

// Update interface and component to handle forcedShowFilters prop
interface DictionaryProps {
  isEmbedded?: boolean;
  forcedShowFilters?: boolean;
}

const Dictionary: React.FC<DictionaryProps> = ({ isEmbedded = false, forcedShowFilters }) => {
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(initialDictionary);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Use forcedShowFilters if provided, otherwise use local state
  const displayFilters = forcedShowFilters !== undefined ? forcedShowFilters : showFilters;

  const filteredEntries = dictionary.filter(entry => {
    // Subject filter
    if (selectedSubject !== 'All' && entry.subject !== selectedSubject) return false;
    
    // Search term filter - search in both languages
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        entry.englishTerm.toLowerCase().includes(term) || 
        entry.khmerTerm.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Play pronunciation using browser's text-to-speech
  const playPronunciation = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSubject('All');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedSubject !== 'All';

  return (
    <Stack gap="xl" style={{ 
      overflowX: 'hidden',
      maxWidth: '100%',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    }}>
      {/* Only show title when not embedded */}
      {!isEmbedded && (
        <Box pos="relative" pb={8}>
          <div style={{ paddingRight: '60px' }}>
            <Title order={1} size="h3" style={{ hyphens: 'auto', wordBreak: 'break-word' }}>
              Academic Dictionary
            </Title>
            <Text c="dimmed" style={{ hyphens: 'auto', wordBreak: 'break-word' }}>
              Khmer-English academic terminology
            </Text>
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
      )}

      {/* Search input */}
      <TextInput
        leftSection={<Search size={16} />}
        placeholder="Search dictionary..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        radius="md"
      />

      {/* Filters section */}
      {displayFilters && (
        <Card withBorder radius="md" pt="xs">
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">Filter by Subject</Text>
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
              {subjects.map(subject => (
                <Chip
                  key={subject}
                  checked={selectedSubject === subject}
                  onChange={() => setSelectedSubject(subject)}
                  color="accent"
                  variant="outline"
                  size="sm"
                  radius="sm"
                >
                  {subject}
                </Chip>
              ))}
            </Group>
          </Box>
        </Card>
      )}

      {/* Results */}
      <Stack gap="md" style={{ 
        overflowX: 'hidden', 
        maxWidth: '100%',
        wordBreak: 'break-word',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}>
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <Card 
              key={entry.id} 
              withBorder 
              radius="md" 
              p="md"
              style={{
                maxWidth: '100%',
                overflowWrap: 'break-word'
              }}
            >
              <Stack gap="md">
                <Group wrap="nowrap" align="flex-start" justify="space-between">
                  <div style={{ maxWidth: 'calc(100% - 80px)' }}>
                    <Group gap="xs">
                      <Text fw={700} size="lg" style={{ wordBreak: 'break-word' }}>
                        {entry.englishTerm}
                      </Text>
                      <ActionIcon 
                        variant="subtle" 
                        color="blue" 
                        onClick={() => playPronunciation(entry.englishTerm)}
                      >
                        <Volume2 size={16} />
                      </ActionIcon>
                    </Group>
                    <Text c="dimmed" size="lg" className="khmer-text" style={{ wordBreak: 'break-word' }}>
                      {entry.khmerTerm}
                    </Text>
                  </div>
                  <Badge color="accent" variant="light">
                    {entry.subject}
                  </Badge>
                </Group>

                <Box>
                  <Text size="sm" c="dimmed" mb={6} style={{ wordBreak: 'break-word' }}>
                    {entry.phonetic}
                  </Text>
                  <Text mb={8} style={{ wordBreak: 'break-word' }}>
                    {entry.definition}
                  </Text>
                  <Text fs="italic" size="sm" style={{ wordBreak: 'break-word' }}>
                    "{entry.example}"
                  </Text>
                </Box>
              </Stack>
            </Card>
          ))
        ) : (
          <Card withBorder p="xl" ta="center">
            <ThemeIcon size="xl" radius="xl" color="gray" variant="light" mx="auto" mb="md">
              <BookText size={24} />
            </ThemeIcon>
            <Text fw={500}>No dictionary entries found</Text>
            <Text size="sm" c="dimmed" maw={400} mx="auto" mt="xs">
              Try adjusting your search term or filters to find what you're looking for
            </Text>
          </Card>
        )}
      </Stack>
    </Stack>
  );
};

export default Dictionary;