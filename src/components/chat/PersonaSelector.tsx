import React from 'react';
import { Select, SelectProps, rem } from '@mantine/core';
import { Persona } from '../../contexts/ChatContext';
import { rgba } from '@mantine/core';

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersonaId: string;
  onPersonaChange: (personaId: string) => void;
}

export function PersonaSelector({ 
  personas, 
  selectedPersonaId, 
  onPersonaChange 
}: PersonaSelectorProps) {
  // Create data for the select component
  const data = personas.map((persona) => ({
    value: persona.id,
    label: persona.name,
    description: persona.description
  }));

  // Get emoji for the selected persona
  const getPersonaEmoji = (personaId: string) => {
    switch (personaId) {
      case 'tutor':
        return '✨';
      case 'math':
        return '🔢';
      case 'science':
        return '🧪';
      case 'writing':
        return '📝';
      default:
        return '✨';
    }
  };

  // Fix for line 44: Ensure we're correctly handling the string value returned by Mantine's Select
  const handlePersonaChange = (value: string | null) => {
    if (value) {
      onPersonaChange(value);
    }
  };
  
  return (
    <Select
      value={selectedPersonaId}
      onChange={handlePersonaChange}
      data={data}
      radius="md"
      size="md"
      leftSection={<span>{getPersonaEmoji(selectedPersonaId)}</span>}
      // Fix for line 57: Update styles to match Mantine v7's format
      // Fix for line 60: Use rgba function directly instead of theme.fn.rgba
      styles={(theme) => ({
        input: {
          border: '1px solid #e2e8f0',
          '&:focus': {
            borderColor: theme.colors.primary[5],
            boxShadow: `0 0 0 2px ${rgba(theme.colors.primary[5], 0.2)}`
          }
        },
        option: {
          '&[dataSelected="true"]': {
            backgroundColor: theme.colors.primary[1],
            color: theme.colors.primary[7]
          },
          '&[dataHovered="true"]': {
            backgroundColor: theme.colors.gray[0]
          }
        }
      })}
    />
  );
}
