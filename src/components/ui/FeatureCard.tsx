import React from 'react';
import { Card, Text, Group, ThemeIcon, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

export function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  path, 
  colorScheme = 'primary' 
}: FeatureCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card 
      onClick={() => navigate(path)}
      className="cursor-pointer h-full"
      withBorder
    >
      <Group align="flex-start" wrap="nowrap">
        <ThemeIcon 
          radius="md" 
          size="lg" 
          variant="light" 
          color={colorScheme}
        >
          <Icon size={18} />
        </ThemeIcon>
        
        <Stack gap="xs">
          <Text fw={600} size="md" lh={1.2}>
            {title}
          </Text>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
