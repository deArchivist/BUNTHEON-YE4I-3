import React from 'react';
import { Alert, Group, Text } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { validateEnv } from '../../config/env';

const EnvValidator: React.FC = () => {
  const isEnvValid = validateEnv();

  if (isEnvValid) return null;

  return (
    <Alert 
      variant="light" 
      color="warning" 
      radius="md" 
      title="Running in Demo Mode"
      icon={<AlertCircle size={16} />}
    >
      <Text size="sm">
        API key not configured. The AI will provide simulated responses only.
      </Text>
    </Alert>
  );
};

export default EnvValidator;
