import React from 'react';
import { Title, Text, Grid, Card, Group, ThemeIcon, Stack, Box, Badge } from '@mantine/core';
import { 
  MessageCircle, 
  BookOpen, 
  Calendar, 
  Clock,
  ChevronRight,
  Library,
  ShieldCheck 
} from 'lucide-react';
import { useTelegram } from '../contexts/TelegramContext';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { FeatureCard } from '../components/ui/FeatureCard';
import { useReminders } from '../contexts/RemindersContext';

// Helper function to get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'gray';
  }
};

const Home: React.FC = () => {
  const { user } = useTelegram();
  const navigate = useNavigate();
  const { reminders } = useReminders();
  
  // Get user's first name for personalized greeting
  const firstName = user?.first_name || 'Student';
  
  // Get only upcoming, non-completed reminders, sorted by date (nearest first)
  const upcomingReminders = reminders
    .filter(reminder => !reminder.completed)
    .sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 2); // Show only 2 upcoming reminders
  
  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Title order={1} size="h3">CappyBuddy</Title>
        <Text c="dimmed">Your Educational Companion</Text>
      </Box>

      {/* Personalized greeting */}
      <Text size="lg" fw={500}>
        Hello, {firstName}! What would you like to learn today?
      </Text>
      {/* Reminders card */}
      <Card withBorder radius="md">
        <Stack gap="md">
          <Group justify="space-between">
        <Group gap="xs">
          <ThemeIcon radius="md" size="md" variant="light" color="primary">
            <Calendar size={16} />
          </ThemeIcon>
          <Text fw={600}>Upcoming Reminders</Text>
        </Group>
        <Text 
          size="sm" 
          c="primary.6"
          className="cursor-pointer flex items-center"
          onClick={() => navigate('/reminders')}
        >
          View all <ChevronRight size={14} />
        </Text>
          </Group>

          {upcomingReminders.length > 0 ? (
        <Stack gap="sm">
          {upcomingReminders.map(reminder => {
            const reminderDate = parseISO(reminder.date);
            
            return (
          <Group key={reminder.id} className="border-b border-gray-100 pb-2" justify="space-between">
            <Group gap="sm">
              <ThemeIcon 
            radius="xl" 
            size="md" 
            variant="light" 
            color="primary"
              >
            <Calendar size={16} />
              </ThemeIcon>
              <div>
            <Text size="sm" fw={500} lineClamp={1}>{reminder.title}</Text>
            <Text size="xs" c="dimmed">
              Due: {format(reminderDate, 'MMM d')} at {reminder.time}
            </Text>
              </div>
            </Group>
            <Badge variant="light" size="sm">
              {reminder.subject}
            </Badge>
          </Group>
            );
          })}
        </Stack>
          ) : (
        <Text size="sm" c="dimmed" ta="center" py="md">No upcoming reminders</Text>
          )}
        </Stack>
      </Card>

      {/* Feature Cards */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 6 }}>
          <FeatureCard
            title="AI Chat"
            description="Get homework help from our AI tutor"
            icon={MessageCircle}
            path="/ai-chat"
            colorScheme="primary"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6 }}>
          <FeatureCard
            title="Prompts"
            description="Browse educational prompt collections"
            icon={BookOpen}
            path="/prompts"
            colorScheme="secondary"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6 }}>
          <FeatureCard
            title="Resources"
            description="Access dictionary and exam papers for your studies"
            icon={Library}
            path="/resources"
            colorScheme="accent"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6 }}>
          <FeatureCard
            title="Reminders"
            description="Track homework and exam deadlines"
            icon={Calendar}
            path="/reminders"
            colorScheme="error"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6 }}>
          <FeatureCard
            title="Pomodoro"
            description="Focus timer for effective studying"
            icon={Clock}
            path="/pomodoro"
            colorScheme="success"
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default Home;