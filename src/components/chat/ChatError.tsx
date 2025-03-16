import React from 'react';
import { Paper, Group, Text, Button, Box } from '@mantine/core';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChatErrorProps {
  message: string;
  onRetry?: () => void;
}

const ChatError: React.FC<ChatErrorProps> = ({ message, onRetry }) => {
  return (
    <Paper 
      p="md" 
      radius="md" 
      bg="error.0" 
      withBorder
      style={{ borderColor: 'var(--mantine-color-error-3)' }}
    >
      <Group align="flex-start" gap="sm">
        <Box mt={2}>
          <AlertCircle size={18} color="var(--mantine-color-error-7)" />
        </Box>
        <Box style={{ flex: '1' }}>
          <Text fw={600} size="sm" mb={4} c="error.9">
            Error
          </Text>
          <Text size="sm" c="error.7" mb={onRetry ? 'xs' : 0}>
            {message}
          </Text>
          {onRetry && (
            <Button 
              variant="subtle" 
              color="error" 
              size="xs" 
              leftSection={<RefreshCw size={14} />}
              onClick={onRetry}
              px={8}
            >
              Retry
            </Button>
          )}
        </Box>
      </Group>
    </Paper>
  );
};

export default React.memo(ChatError);
