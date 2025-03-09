import React, { useState } from 'react';
import { Title, Text, Box, SegmentedControl, Stack, ActionIcon } from '@mantine/core';
import { Book, FileText, Filter } from 'lucide-react';
import Dictionary from './Dictionary'; 
import ExamPapers from './ExamPapers';
import { getShadow } from '../theme/mantineTheme';

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dictionary');
  const [showDictionaryFilters, setShowDictionaryFilters] = useState(false);
  const [showExamFilters, setShowExamFilters] = useState(false);

  // Pass filter state to components
  const handleDictionaryFilters = () => {
    setShowDictionaryFilters(!showDictionaryFilters);
  };

  const handleExamFilters = () => {
    setShowExamFilters(!showExamFilters);
  };

  return (
    <Stack gap="lg" style={{ 
      overflowX: 'hidden',
      maxWidth: '100%',
      msOverflowStyle: 'none', /* IE and Edge */
      scrollbarWidth: 'none', /* Firefox */
      '&::-webkit-scrollbar': {
        display: 'none' /* Chrome, Safari, Opera */
      }
    }}>
      <Box pos="relative" pb={8}>
        {/* Improve header layout to prevent overlap with filter button */}
        <div style={{ paddingRight: '60px' }}>
          <Title order={1} mb="xs" style={{ hyphens: 'auto', wordBreak: 'break-word' }}>
            Academic Resources
          </Title>
          <Text c="dimmed" mb="lg" style={{ hyphens: 'auto', wordBreak: 'break-word' }}>
            Dictionary and exam papers to help with your studies
          </Text>
        </div>
        
        {/* Add filter button */}
        <ActionIcon 
          bg="gray.1"
          c="gray.7"
          onClick={() => activeTab === 'dictionary' ? handleDictionaryFilters() : handleExamFilters()}
          aria-label="Show filters"
          size="lg"
          radius="md"
          pos="absolute"
          top={0}
          right={0}
          style={{
            boxShadow: getShadow('xs'),
            transition: 'all 0.2s ease',
            border: 'none',
          }}
          className="hover-lift"
        >
          <Filter size={18} />
        </ActionIcon>
      </Box>
      
      <SegmentedControl
        value={activeTab}
        onChange={(value) => {
          setActiveTab(value);
          // Reset filters when switching tabs
          setShowDictionaryFilters(false);
          setShowExamFilters(false);
        }}
        data={[
          { 
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Book size={18} />
                <span style={{ fontWeight: 500 }}>Dictionary</span>
              </div>
            ), 
            value: 'dictionary' 
          },
          { 
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} />
                <span style={{ fontWeight: 500 }}>Exam Papers</span>
              </div>
            ), 
            value: 'exam-papers' 
          },
        ]}
        fullWidth
        size="md"
        radius="md"
        color="primary"
        mb="md"
      />

      {/* Pass filter state to components */}
      <Box style={{ 
        overflowX: 'hidden',
        maxWidth: '100%',
        msOverflowStyle: 'none', /* IE and Edge */
        scrollbarWidth: 'none', /* Firefox */
        '&::-webkit-scrollbar': {
          display: 'none' /* Chrome, Safari, Opera */
        }
      }}>
        {activeTab === 'dictionary' && (
          <Dictionary isEmbedded={true} forcedShowFilters={showDictionaryFilters} />
        )}
        {activeTab === 'exam-papers' && (
          <ExamPapers isEmbedded={true} forcedShowFilters={showExamFilters} />
        )}
      </Box>
    </Stack>
  );
};

export default Resources;
