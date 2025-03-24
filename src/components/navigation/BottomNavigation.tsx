import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Group, UnstyledButton, Center, Stack, Text, rem } from '@mantine/core';
import { Home, BrainCircuit, TextSearch, Library, Calendar, Clock } from 'lucide-react';
import { getShadow } from '../../theme/mantineTheme';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Navigation items
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/ai-chat', icon: BrainCircuit, label: 'Chat' },
    { path: '/resources', icon: Library, label: 'Resources' },
    { path: '/reminders', icon: Calendar, label: 'Reminders' },
    { path: '/pomodoro', icon: Clock, label: 'Pomodoro' }
  ];

  return (
    <Group justify="space-around" w="100%" pt={4}>
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        
        return (
          <UnstyledButton
            key={item.path}
            component={Link}
            to={item.path}
            style={{
              flex: '1 1 0%',
              maxWidth: '20%',
              transition: 'all 0.2s ease',
            }}
          >
            <Stack gap={6} align="center">
              <Center
                style={{
                  width: rem(48),
                  height: rem(30),
                  borderRadius: rem(8),
                  backgroundColor: isActive ? 'var(--mantine-color-primary-light)' : 'transparent',
                  boxShadow: isActive ? getShadow('xs') : 'none',
                  transition: 'all 0.3s ease',
                  transform: isActive ? 'scale(1.12)' : 'scale(1)',
                }}
              >
                <item.icon
                  size={isActive ? 24 : 22}
                  color={isActive ? 'var(--mantine-color-primary-7)' : 'var(--mantine-color-gray-6)'}
                  style={{ 
                    transition: 'all 0.3s ease',
                    opacity: isActive ? 1 : 0.7,
                  }}
                />
              </Center>
              <Text 
                size="xs" 
                c={isActive ? 'primary.7' : 'gray.6'} 
                fw={isActive ? 600 : 400}
                ta="center"
                style={{ 
                  transition: 'all 0.2s ease',
                  opacity: isActive ? 1 : 0.7,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {item.label}
              </Text>
            </Stack>
          </UnstyledButton>
        );
      })}
    </Group>
  );
};

export default BottomNavigation;
