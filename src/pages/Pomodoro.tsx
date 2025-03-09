import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Title, Text, Button, Stack, Group, 
  Progress, Card, RingProgress, Badge, ThemeIcon,
  ActionIcon, Tooltip, SegmentedControl,
  Paper, Box, Transition
} from '@mantine/core';
import { 
  Play, Pause, RotateCcw, VolumeX, Volume2, 
  Trophy, Flame, Wind
} from 'lucide-react';
import { getShadow } from '../theme/mantineTheme';
import { usePomodoro, TIMER_MODES } from '../contexts/PomodoroContext';

// Import the timer sound
import timerCompleteSound from '../assets/audio/timer-complete.mp3';

// Colors for different modes
const MODE_COLORS = {
  pomodoro: 'accent',
  shortBreak: 'primary',
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

const Pomodoro: React.FC = () => {
  // Get state from context
  const { 
    mode, setMode,
    timeLeft, setTimeLeft,
    isActive, setIsActive,
    completedPomodoros, setCompletedPomodoros,
    muted, setMuted,
    streakData,
    resetTimer, toggleTimer, handlePomodoroComplete
  } = usePomodoro();
  
  // Local state for UI
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'start' | 'during' | 'break' | 'complete' | 'streak'>('start');
  const [showMessage, setShowMessage] = useState(false);
  
  // Audio ref
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Play timer complete sound
  const playTimerCompleteSound = () => {
    if (audioRef.current && !muted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
  };
  
  // Monitor timeLeft for showing messages and playing sounds
  useEffect(() => {
    // Show mid-session message
    if (timeLeft === Math.floor(TIMER_MODES[mode] * 60 / 2) && isActive) {
      displayMessage('during');
    }
    
    // Play sound and show message when timer completes
    if (timeLeft === 0 && !isActive) {
      playTimerCompleteSound();
      if (mode === 'pomodoro') {
        displayMessage('complete');
        
        // If streak reached a milestone (multiple of 5), show streak message
        if ((streakData.currentStreak) % 5 === 0 && streakData.currentStreak > 0) {
          setTimeout(() => {
            displayMessage('streak');
          }, 5000);
        }
      } else {
        displayMessage('break');
      }
    }
  }, [timeLeft, isActive, mode, streakData.currentStreak]);
  
  // Display message when starting timer
  useEffect(() => {
    if (isActive && timeLeft === TIMER_MODES[mode] * 60) {
      displayMessage('start');
    }
  }, [isActive, timeLeft, mode]);
  
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
  
  // Handle the custom toggle timer that shows messages
  const handleToggleTimer = () => {
    toggleTimer();
  };
  
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1} ta="center">Pomodoro Timer</Title>
        
        {/* Timer Controls */}
        <SegmentedControl
          value={mode}
          onChange={(value) => setMode(value as 'pomodoro' | 'shortBreak' | 'longBreak')}
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
                onClick={handleToggleTimer}
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
        
        {/* Stats and Streak Section - Now in vertical Stack */}
        <Stack>
          {/* Today's Sessions Card - Now on top */}
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
          
          {/* Current Streak Card - Now below */}
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
        </Stack>
        
        {/* Hidden audio element */}
        <audio ref={audioRef} src={timerCompleteSound} />
      </Stack>
    </Container>
  );
};

export default Pomodoro;
