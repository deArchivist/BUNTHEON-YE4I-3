# Enhancing Pomodoro Timer with Ringtone, Streaks, and Encouragement

I'll implement the requested features for the Pomodoro timer page - adding a ringtone system, a streak gamification feature, and personalized encouragement messages.

## 1. Create Audio Files Directory & Add Timer Sound

### [timer-complete.mp3](file:///c%3A/Users/thypa/OneDrive/Documents/GitHub/BUNTHEON-YE4I-2/src/assets/audio/timer-complete.mp3)

You'll need to add an audio file like "timer-complete.mp3" to this location. This file should be a short sound that plays when the timer completes.

## 2. Enhance Pomodoro Timer Page

### [Pomodoro.tsx](file:///c%3A/Users/thypa/OneDrive/Documents/GitHub/BUNTHEON-YE4I-2/src/pages/Pomodoro.tsx)

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Title, Text, Button, Stack, Group, 
  Progress, Card, RingProgress, Badge, ThemeIcon,
  Switch, ActionIcon, Tooltip, SegmentedControl,
  Paper, Box, Transition
} from '@mantine/core';
import { 
  Play, Pause, RotateCcw, VolumeX, Volume2, 
  Trophy, Flame, Calendar, Wind
} from 'lucide-react';
import { getShadow } from '../theme/mantineTheme';

// Import the timer sound
import timerCompleteSound from '../assets/audio/timer-complete.mp3';

// Timer modes with durations in minutes
const TIMER_MODES = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15
};

// Colors for different modes
const MODE_COLORS = {
  pomodoro: 'primary',
  shortBreak: 'success',
  longBreak: 'accent'
};

// Encouragement messages based on context
const ENCOURAGEMENT_MESSAGES = {
  start: [
    "You've got this! Time to focus.",
    "Let's make the most of this session!",
    "Ready to achieve great things today!",
    "Clear mind, full focus. Let's go!",
    "Your future self will thank you for this session."
  ],
  during: [
    "Stay focused, you're doing great!",
    "Keep going, you're making progress!",
    "Concentration is your superpower right now.",
    "Every minute of focus is bringing you closer to your goals.",
    "You're building momentum with each passing minute!"
  ],
  break: [
    "Great work! Take a moment to rest.",
    "Breaks are important! Let your mind recharge.",
    "Rest and reflect on what you've accomplished.",
    "Refresh your mind for the next round of focus.",
    "A well-deserved break to keep your momentum going!"
  ],
  complete: [
    "Excellent work! You've completed another session.",
    "Session complete! You should be proud of yourself.",
    "Another productive session in the books!",
    "Well done! Your consistency is building towards success.",
    "Fantastic job! Keep up the great work."
  ],
  streak: [
    "Amazing streak! Your consistency is inspiring.",
    "Your daily commitment is paying off!",
    "Your streak shows your dedication to growth.",
    "Consistency is key, and you're nailing it!",
    "Your streak is building powerful habits!"
  ]
};

// Interface for streak data
interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
  longestStreak: number;
  totalCompletions: number;
}

const Pomodoro: React.FC = () => {
  // Timer state
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [muted, setMuted] = useState(false);
  
  // Streak state
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastCompletedDate: null,
    longestStreak: 0,
    totalCompletions: 0
  });
  
  // Message state
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'start' | 'during' | 'break' | 'complete' | 'streak'>('start');
  const [showMessage, setShowMessage] = useState(false);
  
  // Audio ref
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Interval ref
  const timerRef = useRef<number>();
  
  // Load streak data from localStorage on component mount
  useEffect(() => {
    const savedStreakData = localStorage.getItem('pomodoro_streak');
    if (savedStreakData) {
      const parsedData = JSON.parse(savedStreakData);
      setStreakData(parsedData);
      
      // Check if a day was missed and reset streak if needed
      if (parsedData.lastCompletedDate) {
        const lastDate = new Date(parsedData.lastCompletedDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last completion was before yesterday, reset streak
        if (lastDate < yesterday && lastDate.getDate() !== yesterday.getDate()) {
          setStreakData(prev => ({
            ...prev,
            currentStreak: 0
          }));
        }
      }
    }
  }, []);
  
  // Save streak data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pomodoro_streak', JSON.stringify(streakData));
  }, [streakData]);
  
  // Set timer based on selected mode
  useEffect(() => {
    setTimeLeft(TIMER_MODES[mode] * 60);
    setIsActive(false);
  }, [mode]);
  
  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prevTime => {
          // Show encouraging message during the session
          if (prevTime === Math.floor(TIMER_MODES[mode] * 60 / 2)) {
            displayMessage('during');
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      if (mode === 'pomodoro') {
        handlePomodoroComplete();
      } else {
        // Break completed
        displayMessage('break');
      }
      setIsActive(false);
      playTimerCompleteSound();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, mode]);
  
  // Toggle timer
  const toggleTimer = () => {
    if (!isActive && timeLeft === TIMER_MODES[mode] * 60) {
      // Display start message when timer begins
      displayMessage('start');
    }
    setIsActive(!isActive);
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TIMER_MODES[mode] * 60);
  };
  
  // Handle pomodoro completion
  const handlePomodoroComplete = () => {
    const newCompletedPomodoros = completedPomodoros + 1;
    setCompletedPomodoros(newCompletedPomodoros);
    
    // Update streak data
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    setStreakData(prev => {
      // Check if this is the first completion of the day
      const isFirstTodayCompletion = prev.lastCompletedDate !== todayString;
      
      // Update streak only if this is the first completion today
      const newCurrentStreak = isFirstTodayCompletion 
        ? prev.currentStreak + 1 
        : prev.currentStreak;
      
      // Update longest streak if needed
      const newLongestStreak = Math.max(newCurrentStreak, prev.longestStreak);
      
      return {
        currentStreak: newCurrentStreak,
        lastCompletedDate: todayString,
        longestStreak: newLongestStreak,
        totalCompletions: prev.totalCompletions + 1
      };
    });
    
    // Display completion message
    displayMessage('complete');
    
    // If streak reached a milestone (multiple of 5), show streak message
    if ((streakData.currentStreak + 1) % 5 === 0) {
      setTimeout(() => {
        displayMessage('streak');
      }, 5000);
    }
  };
  
  // Play timer complete sound
  const playTimerCompleteSound = () => {
    if (audioRef.current && !muted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
  };
  
  // Test sound button function
  const testSound = () => {
    playTimerCompleteSound();
  };
  
  // Toggle mute function
  const toggleMute = () => {
    setMuted(!muted);
  };
  
  // Display encouragement message
  const displayMessage = (type: 'start' | 'during' | 'break' | 'complete' | 'streak') => {
    const messages = ENCOURAGEMENT_MESSAGES[type];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
    setMessageType(type);
    setShowMessage(true);
    
    // Hide message after delay
    setTimeout(() => {
      setShowMessage(false);
    }, 5000);
  };
  
  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const totalSeconds = TIMER_MODES[mode] * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };
  
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1} ta="center">Pomodoro Timer</Title>
        
        {/* Timer Controls */}
        <SegmentedControl
          value={mode}
          onChange={(value: 'pomodoro' | 'shortBreak' | 'longBreak') => setMode(value)}
          data={[
            { label: 'Focus', value: 'pomodoro' },
            { label: 'Short Break', value: 'shortBreak' },
            { label: 'Long Break', value: 'longBreak' },
          ]}
          color={MODE_COLORS[mode]}
          size="md"
          radius="md"
          fullWidth
        />
        
        {/* Encouragement Message */}
        <Transition
          mounted={showMessage}
          transition="fade"
          duration={300}
        >
          {(styles) => (
            <Paper
              p="md"
              radius="md"
              withBorder
              style={{
                ...styles,
                backgroundColor: 'var(--mantine-color-gray-0)',
                boxShadow: getShadow('sm'),
              }}
            >
              <Group align="center" justify="center" gap="sm">
                {messageType === 'streak' ? (
                  <ThemeIcon color="yellow" size="md" radius="xl">
                    <Trophy size={16} />
                  </ThemeIcon>
                ) : messageType === 'complete' ? (
                  <ThemeIcon color={MODE_COLORS.pomodoro} size="md" radius="xl">
                    <Flame size={16} />
                  </ThemeIcon>
                ) : messageType === 'break' ? (
                  <ThemeIcon color={MODE_COLORS.shortBreak} size="md" radius="xl">
                    <Wind size={16} />
                  </ThemeIcon>
                ) : (
                  <ThemeIcon color={MODE_COLORS.pomodoro} size="md" radius="xl">
                    <Flame size={16} />
                  </ThemeIcon>
                )}
                <Text fw={500}>{message}</Text>
              </Group>
            </Paper>
          )}
        </Transition>
        
        {/* Main Timer */}
        <Card withBorder shadow="sm" radius="lg" p="xl">
          <Stack align="center" gap="lg">
            {/* Timer Display */}
            <RingProgress
              size={250}
              thickness={12}
              roundCaps
              sections={[{ value: calculateProgress(), color: MODE_COLORS[mode] }]}
              label={
                <Text fz={48} fw={700} ta="center">
                  {formatTime(timeLeft)}
                </Text>
              }
              style={{ marginTop: 20 }}
            />
            
            {/* Timer Controls */}
            <Group justify="center" gap="sm">
              <Button
                size="lg"
                radius="md"
                color={MODE_COLORS[mode]}
                leftSection={isActive ? <Pause size={20} /> : <Play size={20} />}
                onClick={toggleTimer}
              >
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="light"
                size="lg"
                radius="md"
                color="gray"
                leftSection={<RotateCcw size={20} />}
                onClick={resetTimer}
              >
                Reset
              </Button>
            </Group>
          </Stack>
        </Card>
        
        {/* Stats and Streak Section */}
        <Group grow>
          <Card withBorder shadow="sm" radius="md" p="md">
            <Stack>
              <Group justify="space-between">
                <Text fw={500}>Current Streak</Text>
                <Badge leftSection={<Trophy size={14} />} size="lg" color="yellow">
                  {streakData.currentStreak} days
                </Badge>
              </Group>
              <Progress 
                value={Math.min((streakData.currentStreak / 10) * 100, 100)} 
                color="yellow"
                size="lg"
                radius="md"
              />
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  <Box component="span" c="yellow" fw={600}>
                    {streakData.totalCompletions}
                  </Box> total sessions
                </Text>
                <Text size="sm" c="dimmed">
                  Best streak: <Box component="span" c="yellow" fw={600}>
                    {streakData.longestStreak}
                  </Box> days
                </Text>
              </Group>
            </Stack>
          </Card>
          
          <Card withBorder shadow="sm" radius="md" p="md">
            <Stack>
              <Group justify="space-between">
                <Text fw={500}>Today's Sessions</Text>
                <Badge leftSection={<Flame size={14} />} size="lg" color={MODE_COLORS.pomodoro}>
                  {completedPomodoros}
                </Badge>
              </Group>
              <Text size="sm" mt="xs">
                Completing a focus session every day maintains your streak! You've completed 
                <Box component="span" fw={600} px={5}>{completedPomodoros}</Box> 
                pomodoro sessions today.
              </Text>
              {/* Audio Controls */}
              <Group justify="space-between" mt="auto">
                <Button 
                  variant="subtle" 
                  size="xs"
                  leftSection={<Volume2 size={14} />}
                  onClick={testSound}
                >
                  Test Sound
                </Button>
                <Tooltip label={muted ? "Unmute" : "Mute"}>
                  <ActionIcon color="gray" onClick={toggleMute}>
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          </Card>
        </Group>
        
        {/* Hidden audio element */}
        <audio ref={audioRef} src={timerCompleteSound} />
      </Stack>
    </Container>
  );
};

export default Pomodoro;
```

## 3. Create a Types File for the Timer Features

### [pomodoro.ts](file:///c%3A/Users/thypa/OneDrive/Documents/GitHub/BUNTHEON-YE4I-2/src/types/pomodoro.ts)

```typescript


Made changes.

export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
  longestStreak: number;
  totalCompletions: number;
}

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
export type MessageType = 'start' | 'during' | 'break' | 'complete' | 'streak';

export interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

export interface ColorScheme {
  [key: string]: string;
}
```

## 4. Update Navigation to Include Timer

### [BottomNavigation.tsx](file:///c%3A/Users/thypa/OneDrive/Documents/GitHub/BUNTHEON-YE4I-2/src/components/navigation/BottomNavigation.tsx)

```tsx


Made changes.

import { Clock } from 'lucide-react';

// ... existing imports ...

const BottomNavigation: React.FC = () => {
  // ... existing code ...

  const navItems = [
    { path: '/ai-chat', label: 'Chat', icon: Brain },
    { path: '/prompts', label: 'Prompts', icon: BookOpen },
    { path: '/dictionary', label: 'Dictionary', icon: BookText },
    { path: '/exam-papers', label: 'Exams', icon: File },
    { path: '/reminders', label: 'Reminders', icon: CalendarCheck },
    { path: '/pomodoro', label: 'Timer', icon: Clock }, // Make sure this is included
  ];
  
  // ... existing code ...
};

export default BottomNavigation;
```

## 5. Add Module Declaration for Audio Files

### [vite-env.d.ts](file:///c%3A/Users/thypa/OneDrive/Documents/GitHub/BUNTHEON-YE4I-2/src/vite-env.d.ts)

```typescript


Made changes.

/// <reference types="vite/client" />

// Add declarations for audio files
declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}
```

## Feature Implementation Details

### 1. Ringtone for Timer:
- Added an audio element that plays when the timer completes
- Included sound testing functionality
- Added a mute/unmute toggle
- Ensured proper error handling for audio playback

### 2. Gamification Streak Feature:
- Created a streak tracking system that records:
  - Current streak (number of consecutive days with at least one completed session)
  - Last completion date
  - Longest streak achieved
  - Total number of completions
- Implemented streak reset logic if a day is missed
- Added visual indicators for streak status
- Created a progress bar to show progress toward streak milestones
- Persisted streak data using localStorage for consistency across sessions

### 3. Personalized Encouragement Messages:
- Created different categories of encouragement messages:
  - Start messages when beginning a session
  - During messages displayed halfway through a session
  - Break messages for when a break starts
  - Completion messages after finishing a pomodoro session
  - Streak messages for milestone achievements
- Implemented randomized message selection from each category
- Added smooth animations for message appearance and disappearance
- Used contextual icons matched to the message type

### Additional UI Improvements:
- Used Mantine UI components for consistent styling
- Added color coding for different timer modes (focus, short break, long break)
- Created a visual ring progress indicator for the timer
- Implemented responsive layout with card-based design
- Added proper shadow and elevation for visual depth

To complete this implementation, you'll need to:
1. Add a timer sound file at the specified location
2. Create the types directory if it doesn't exist
3. Make sure the Pomodoro route is properly set up in your routing configuration

These changes will significantly enhance the timer functionality with audio feedback, gamification elements to encourage consistent use, and motivational messages to keep users engaged.

Made changes.

Similar code found with 2 license types