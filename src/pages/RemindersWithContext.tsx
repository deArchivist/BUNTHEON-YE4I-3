import React, { useState } from 'react';
import { 
  Title, 
  Text, 
  Stack, 
  Card, 
  Group, 
  ActionIcon, 
  Box, 
  Button, 
  Checkbox, 
  Badge, 
  TextInput, 
  Select, 
  Modal
} from '@mantine/core';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Filter,
  X,
  Tag
} from 'lucide-react';
import { format, parseISO, formatISO } from 'date-fns';
import { DateInput, TimeInput } from '@mantine/dates';
import { getShadow } from '../theme/mantineTheme';
import { useReminders } from '../contexts/RemindersContext';

const subjects = [
  "Mathematics", 
  "Physics", 
  "Chemistry", 
  "Biology", 
  "Literature", 
  "History", 
  "Geography", 
  "English", 
  "Computer Science", 
  "Other"
];

const RemindersWithContext: React.FC = () => {
  const { reminders, addReminder: addReminderToContext, deleteReminder, toggleComplete } = useReminders();
  
  // Local state for UI
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState('12:00');
  const [subject, setSubject] = useState(subjects[0]);
  const [priority, setPriority] = useState('medium');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter reminders based on subject filter only
  const filteredReminders = reminders.filter(reminder => {
    // Subject filter only
    if (subjectFilter && reminder.subject !== subjectFilter) {
      return false;
    }
    
    return true;
  });

  // Sort only by date, maintain original order otherwise
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  });

  // Add a new reminder
  const addReminder = () => {
    if (!title || !date) return;
    
    addReminderToContext({
      title,
      date: date ? formatISO(date) : formatISO(new Date()),
      time,
      subject,
      priority,
      completed: false
    });
    
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDate(new Date());
    setTime('12:00');
    setSubject(subjects[0]);
    setPriority('medium');
    setShowForm(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSubjectFilter(null);
  };

  // Check if any filters are active
  const hasAdvancedFilters = subjectFilter !== null;

  return (
    <Stack gap="xl">
      {/* Header with filter button */}
      <Box pos="relative" pb={8}>
        <div>
          <Title order={1} size="h3">Reminders</Title>
          <Text c="dimmed">Keep track of your homework and exams</Text>
        </div>
        
        {/* Filter button */}
        <ActionIcon 
          bg={hasAdvancedFilters ? "primary.1" : "gray.1"}
          c={hasAdvancedFilters ? "primary.7" : "gray.7"}
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
            border: 'none',
          }}
          className="hover-lift"
        >
          <Filter size={18} />
        </ActionIcon>
      </Box>

      {/* Add Reminder Button */}
      <Box>
        <Button 
          leftSection={<Plus size={18} />}
          onClick={() => setShowForm(true)}
          radius="md"
          color="primary"
          fullWidth
          style={{
            boxShadow: getShadow('sm'),
            background: 'linear-gradient(135deg, rgba(172, 184, 247, 0.9), rgba(150, 165, 235, 0.95))',
            transition: 'all 0.2s ease',
          }}
          className="hover-lift"
        >
          Add Reminder
        </Button>
      </Box>

      {/* Filters panel */}
      {showFilters && (
        <Card 
          withBorder 
          radius="md" 
          pt="xs" 
          pb="xs"
          style={{
            boxShadow: getShadow('sm'),
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm">Filter by Subject</Text>
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              onClick={clearFilters}
              rightSection={<X size={12} />}
              disabled={!subjectFilter}
            >
              Clear
            </Button>
          </Group>
          
          <Select
            data={['All', ...subjects]}
            value={subjectFilter || 'All'}
            onChange={(value) => setSubjectFilter(value === 'All' ? null : value)}
            placeholder="Select subject"
            clearable={false}
            size="sm"
            styles={{
              input: {
                transition: 'all 0.2s ease',
                '&:focus': {
                  boxShadow: '0 0 0 2px rgba(172, 184, 247, 0.25)'
                }
              }
            }}
          />
        </Card>
      )}

      {/* Reminders List */}
      <Stack gap="md">
        {sortedReminders.length > 0 ? (
          sortedReminders.map(reminder => {
            const reminderDate = parseISO(reminder.date);
            
            return (
              <Card 
                key={reminder.id} 
                withBorder 
                radius="md" 
                p="md"
                style={{
                  opacity: reminder.completed ? 0.65 : 1,
                  backgroundColor: reminder.completed ? 'var(--mantine-color-gray-0)' : undefined,
                  borderColor: reminder.completed ? 'var(--mantine-color-gray-3)' : undefined,
                  transition: 'all 0.3s ease',
                }}
              >
                <Stack gap="sm">
                  {/* Top row with checkbox and title */}
                  <Group gap="sm" wrap="nowrap" align="flex-start">
                    <Checkbox
                      checked={reminder.completed}
                      onChange={() => toggleComplete(reminder.id)}
                      radius="xs"
                      size="md"
                      mt={3}
                    />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text 
                        fw={500}
                        style={{
                          textDecoration: reminder.completed ? 'line-through' : 'none',
                          color: reminder.completed ? 'var(--mantine-color-gray-6)' : undefined,
                        }}
                      >
                        {reminder.title}
                      </Text>
                      <Group gap="xs" mt={4}>
                        <Group gap={4}>
                          <Calendar size={14} strokeWidth={1.5} style={{
                            opacity: reminder.completed ? 0.6 : 1
                          }} />
                          <Text size="xs" c={reminder.completed ? "dimmed" : undefined}>
                            {format(reminderDate, 'MMM d, yyyy')}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">•</Text>
                        <Group gap={4}>
                          <Clock size={14} strokeWidth={1.5} style={{
                            opacity: reminder.completed ? 0.6 : 1
                          }} />
                          <Text size="xs" c={reminder.completed ? "dimmed" : undefined}>
                            {reminder.time}
                          </Text>
                        </Group>
                      </Group>
                    </Box>
                  </Group>
                  
                  {/* Bottom row with subject badge and delete button */}
                  <Group gap="xs" justify="apart" wrap="wrap">
                    <Badge
                      size="sm"
                      radius="sm"
                      variant="outline"
                      color="gray"
                      leftSection={<Tag size={10} style={{
                        opacity: reminder.completed ? 0.6 : 1
                      }} />}
                      style={{
                        opacity: reminder.completed ? 0.6 : 1
                      }}
                    >
                      {reminder.subject}
                    </Badge>
                    <ActionIcon 
                      color="red" 
                      variant="subtle" 
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Card>
            );
          })
        ) : (
          <Card withBorder p="xl" ta="center">
            <Calendar size={48} strokeWidth={1.5} style={{ opacity: 0.5, margin: '0 auto', marginBottom: '1rem' }} />
            <Text fw={500} size="lg">No reminders found</Text>
            <Text size="sm" c="dimmed" maw={400} mx="auto" mt="xs">
              No reminders match your current filters or you haven't added any yet.
            </Text>
          </Card>
        )}
      </Stack>

      {/* Add Reminder Modal */}
      <Modal 
        opened={showForm} 
        onClose={resetForm} 
        title="Add New Reminder" 
        centered
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Homework, exam, quiz, etc."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <Group grow>
            <DateInput
              label="Date"
              placeholder="Select date"
              value={date}
              onChange={setDate}
              required
            />
            
            <TimeInput
              label="Time"
              placeholder="Select time"
              value={time}
              onChange={(event) => setTime(event.currentTarget.value)}
              required
            />
          </Group>
          
          <Select
            label="Subject"
            data={subjects}
            value={subject}
            onChange={(value) => value && setSubject(value)}
            required
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={resetForm}>Cancel</Button>
            <Button onClick={addReminder}>Add Reminder</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default RemindersWithContext;
