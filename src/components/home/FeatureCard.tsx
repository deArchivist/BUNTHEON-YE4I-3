import React from 'react';
import { Card, Text, ThemeIcon, Group, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { getGlow, getShadow } from '../../theme/mantineTheme';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  colorScheme: 'primary' | 'secondary' | 'accent' | 'warning' | 'error' | 'success';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, to, colorScheme }) => {
  // Map color schemes to appropriate Mantine values
  const colorMap = {
    primary: 'primary',
    secondary: 'secondary',
    accent: 'accent',
    warning: 'warning',
    error: 'error',
    success: 'success'
  };
  
  // Set color for the gradient based on colorScheme
  const getColorValue = () => {
    switch (colorScheme) {
      case 'primary': return 'rgba(172, 184, 247, 0.8)';
      case 'secondary': return 'rgba(219, 193, 247, 0.8)';
      case 'accent': return 'rgba(153, 183, 240, 0.8)';
      case 'warning': return 'rgba(252, 147, 77, 0.8)';
      case 'error': return 'rgba(253, 164, 164, 0.8)';
      case 'success': return 'rgba(150, 255, 150, 0.8)';
      default: return 'rgba(172, 184, 247, 0.8)';
    }
  };

  return (
    <Card
        component={Link}
        to={to}
        p="lg"
        radius="md"
        withBorder
        className="hover-lift"
        style={{
            textDecoration: 'none',
            color: 'inherit',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${getColorValue().replace('0.8', '0.15')}`,
            boxShadow: getShadow('sm'),
            transition: 'all 0.3s ease',
            height: '100%',
        }}
        styles={{
            root: {
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: `${getShadow('md')}, ${getGlow(colorScheme)}`,
                }
            }
        }}
    >
        <Group align="flex-start" gap="md">
            <ThemeIcon 
                size={40} 
                radius="md" 
                color={colorMap[colorScheme]}
                variant="light"
                style={{
                    boxShadow: getGlow(colorScheme),
                    background: `linear-gradient(135deg, ${getColorValue().replace('0.8', '0.4')}, ${getColorValue()})`,
                }}
            >
                <Icon size={24} strokeWidth={1.5} />
            </ThemeIcon>
            
            <Box style={{ flex: 1 }}>
                <Text size="lg" fw={600} mb={4}>
                    {title}
                </Text>
                <Text size="sm" c="dimmed">
                    {description}
                </Text>
            </Box>
        </Group>
    </Card>
  );
};

export default FeatureCard;
