import React, { useState, useEffect } from 'react';
import { 
  Title, 
  Text, 
  Stack, 
  TextInput, 
  Card,  
  Group, 
  ActionIcon, 
  Box,
  ThemeIcon,
  Badge,
  Select,
  Tooltip,
  Tabs,
  Button,
  Chip
} from '@mantine/core';
import { 
  Search, 
  Heart, 
  Download, 
  FileText,
  CalendarIcon,
  GraduationCap,
  Filter, // Made sure we're using Filter icon
  X
} from 'lucide-react';
import { getShadow } from '../theme/mantineTheme';

interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  grade: string;
  year: number;
  fileUrl: string;
  googleDriveUrl: string; // Added Google Drive URL property
}

interface ExamPapersProps {
  isEmbedded?: boolean;
  forcedShowFilters?: boolean;
}

// This would come from an API in a real application
const initialExamPapers: ExamPaper[] = [
  {
    id: '1',
    title: 'BACII Chemistry Mock Exam',
    subject: 'Chemistry',
    grade: 'Grade 12',
    year: 2024,
    fileUrl: '/path/to/file1.pdf',
    googleDriveUrl: 'https://drive.google.com/file/d/1QF2I6ObtgSedmjGVPVY8gatbxMq7EJXy/view?usp=drive_link' // Placeholder Google Drive link
  },
  {
    id: '2',
    title: 'BACII Chemistry Exam',
    subject: 'Chemistry',
    grade: 'Grade 12',
    year: 2023,
    fileUrl: '/path/to/file2.pdf',
    googleDriveUrl: 'https://drive.google.com/file/d/1EOm_p62SQ1FtbUtucI4Vo9RoRp_Z7ZLx/view?usp=drive_link' // Placeholder Google Drive link
  },
  {
    id: '3',
    title: 'BACII Biology Test Paper',
    subject: 'Biology',
    grade: 'Grade 12',
    year: 2022,
    fileUrl: '/path/to/file3.pdf',
    googleDriveUrl: 'https://drive.google.com/file/d/1jxaIoSuDChx0Cg2cH_vi5x9W5JqJLWgT/view?usp=drive_link' // Placeholder Google Drive link
  },
  {
    id: '4',
    title: 'BACII Biology Test Paper #2',
    subject: 'Biology',
    grade: 'Grade 12',
    year: 2023,
    fileUrl: '/path/to/file4.pdf',
    googleDriveUrl: 'https://drive.google.com/file/d/1MUcT5JkxJX1lg9TULSwZ-lyqf0f8TL4V/view?usp=drive_link' // Placeholder Google Drive link
  },
  {
    id: '5',
    title: 'Grade 9 Earth Science Exam',
    subject: 'Earth Science',
    grade: 'Grade 9',
    year: 2022,
    fileUrl: '/path/to/file5.pdf',
    googleDriveUrl: 'https://drive.google.com/file/d/1jBi1Lgx1Sylx80_-QEQRBT-t2_diQ1du/view?usp=drive_link' // Placeholder Google Drive link
  },
  {
    id: '6',
    title: 'Grade 9 Moral Civics Semester Exam',
    subject: 'Moral Civics',
    grade: 'Grade 9',
    year: 2021,
    fileUrl: '/path/to/file5.pdf',
    googleDriveUrl: 'https://drive.google.com/file/d/1fWxAPxb7wjF1-njRX0r7MFYAgDwZLZuB/view?usp=drive_link' // Placeholder Google Drive link
  }, 
  
];

const subjects = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "Literature", "History", "Geography", "Earth Science", "Moral Civics"];
const years = ["All", "2023", "2022", "2021", "2020"];
const grades = ["All", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

const ExamPapers: React.FC<ExamPapersProps> = ({ isEmbedded = false, forcedShowFilters }) => {
  const [examPapers, setExamPapers] = useState<ExamPaper[]>(initialExamPapers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterTab, setFilterTab] = useState<string | null>('subject');
  const [showFilters, setShowFilters] = useState(false);

  // Use forcedShowFilters if provided, otherwise use local state
  const displayFilters = forcedShowFilters !== undefined ? forcedShowFilters : showFilters;

  // Filter exam papers based on search term and filters
  const filteredPapers = examPapers.filter(paper => {
    // Subject filter
    if (selectedSubject !== 'All' && paper.subject !== selectedSubject) return false;
    
    // Year filter
    if (selectedYear !== 'All' && paper.year !== parseInt(selectedYear)) return false;
    
    // Grade filter
    if (selectedGrade !== 'All' && paper.grade !== selectedGrade) return false;
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return paper.title.toLowerCase().includes(term);
    }
    
    return true;
  });

  // Sort papers with favorites at the top
  const sortedPapers = [...filteredPapers].sort((a, b) => {
    const aFavorite = favorites.includes(a.id);
    const bFavorite = favorites.includes(b.id);
    
    if (aFavorite && !bFavorite) return -1;
    if (!aFavorite && bFavorite) return 1;
    
    // Then by year (most recent first)
    return b.year - a.year;
  });

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('examPaperFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('examPaperFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(paperId => paperId !== id)
        : [...prev, id]
    );
  };

  // Updated function to open Google Drive link in a new tab
  const downloadPaper = (paper: ExamPaper) => {
    window.open(paper.googleDriveUrl, '_blank');
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSubject('All');
    setSelectedYear('All');
    setSelectedGrade('All');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedSubject !== 'All' || selectedYear !== 'All' || selectedGrade !== 'All';

  return (
    <Stack gap="xl">
      {/* Only show title when not embedded */}
      {!isEmbedded && (
        <Box pos="relative" pb={8}>
          <div style={{ paddingRight: '60px' }}>
            <Title order={1} size="h3" style={{ hyphens: 'auto', wordBreak: 'break-word' }}>
              Past Exam Papers
            </Title>
            <Text c="dimmed" style={{ hyphens: 'auto', wordBreak: 'break-word' }}>
              Browse past examination papers by subject, grade and year
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
        placeholder="Search exam papers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        radius="md"
      />

      {/* Filters - Tab-based approach with year and grade swapped */}
      {displayFilters && (
        <Card withBorder radius="md" pt="xs">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm">Filters</Text>
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
          
          <Tabs value={filterTab} onChange={setFilterTab}>
            <Tabs.List grow>
                <Tabs.Tab 
                  value="subject" 
                  leftSection={<FileText size={16} />}
                >
                  Subject
                </Tabs.Tab>
                <Tabs.Tab 
                  value="year" 
                  leftSection={<CalendarIcon size={16} />}
                >
                  Year
                </Tabs.Tab>
                <Tabs.Tab 
                  value="grade" 
                  leftSection={<GraduationCap size={16} />}
                >
                  Grade
                </Tabs.Tab>
              </Tabs.List>

            <Tabs.Panel value="subject" pt="xs" pb="xs">
              <Group gap="xs">
                {subjects.map(subject => (
                  <Chip
                    key={subject}
                    checked={selectedSubject === subject}
                    onChange={() => setSelectedSubject(subject)}
                    color="primary"
                    variant="outline"
                    size="sm"
                    radius="sm"
                  >
                    {subject}
                  </Chip>
                ))}
              </Group>
            </Tabs.Panel>

            <Tabs.Panel value="year" pt="xs" pb="xs">
              <Group gap="xs">
                {years.map(year => (
                  <Chip
                    key={year}
                    checked={selectedYear === year}
                    onChange={() => setSelectedYear(year)}
                    color="accent"
                    variant="outline"
                    size="sm"
                    radius="sm"
                  >
                    {year}
                  </Chip>
                ))}
              </Group>
            </Tabs.Panel>

            <Tabs.Panel value="grade" pt="xs" pb="xs">
              <Group gap="xs">
                {grades.map(grade => (
                  <Chip
                    key={grade}
                    checked={selectedGrade === grade}
                    onChange={() => setSelectedGrade(grade)}
                    color="secondary"
                    variant="outline"
                    size="sm"
                    radius="sm"
                  >
                    {grade}
                  </Chip>
                ))}
              </Group>
            </Tabs.Panel>
          </Tabs>
        </Card>
      )}

      {/* Results as a compact list */}
      <Stack gap="xs">
        {sortedPapers.length > 0 ? (
          sortedPapers.map(paper => {
            const isFavorite = favorites.includes(paper.id);
            
            return (
              <Card key={paper.id} withBorder radius="md" p="sm" className="transition-all hover:bg-gray-50">
                <Group justify="space-between" wrap="nowrap" align="center">
                  <Box>
                    <Text fw={500} size="sm">{paper.title}</Text>
                    <Group gap="xs" mt="xs">
                      <Badge color="primary" variant="light" size="sm">
                        {paper.subject}
                      </Badge>
                      <Badge color="accent" variant="light" size="sm">
                        {paper.year}
                      </Badge>
                      <Badge color="secondary" variant="light" size="sm">
                        {paper.grade}
                      </Badge>
                    </Group>
                  </Box>
                  
                  <Group gap="xs">
                    <Tooltip label={isFavorite ? "Remove from favorites" : "Add to favorites"} withArrow position="top">
                      <ActionIcon
                        variant="subtle"
                        color={isFavorite ? "secondary" : "gray"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(paper.id);
                        }}
                      >
                        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="Download" withArrow position="top">
                      <ActionIcon
                        variant="subtle"
                        color="primary"
                        onClick={() => downloadPaper(paper)}
                      >
                        <Download size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Card>
            );
          })
        ) : (
          <Card withBorder p="xl" ta="center">
            <ThemeIcon size="xl" radius="xl" color="gray" variant="light" mx="auto" mb="md">
              <FileText size={24} />
            </ThemeIcon>
            <Text fw={500}>No exam papers found</Text>
            <Text size="sm" c="dimmed" maw={400} mx="auto" mt="xs">
              Try adjusting your search term or filters to find more exam papers
            </Text>
          </Card>
        )}
      </Stack>
    </Stack>
  );
};

export default ExamPapers;