import React from 'react';
import { Textarea, Box, ActionIcon } from '@mantine/core';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Ask Bun Theon AI...'
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <Box pos="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autosize
        minRows={2}
        maxRows={5}
        radius="md"
        styles={{
          input: {
            border: '1px solid #e2e8f0',
            paddingRight: '3rem',
            '&:focus': {
              borderColor: 'var(--mantine-color-primary-5)',
              boxShadow: '0 0 0 2px rgba(172, 184, 247, 0.2)'
            }
          }
        }}
      />
      <ActionIcon
        pos="absolute"
        bottom={8}
        right={8}
        color="primary"
        variant="subtle"
        radius="xl"
        size="lg"
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        style={{
          opacity: !value.trim() || disabled ? 0.5 : 1,
          transition: 'opacity 0.2s ease'
        }}
      >
        <Send size={20} />
      </ActionIcon>
    </Box>
  );
}
