import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';

// Timer modes with durations in minutes
export const TIMER_MODES = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15
};

// Interface for streak data
export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
  longestStreak: number;
  totalCompletions: number;
}

interface PomodoroContextType {
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  setMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  completedPomodoros: number;
  setCompletedPomodoros: (count: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  streakData: StreakData;
  setStreakData: React.Dispatch<React.SetStateAction<StreakData>>;
  resetTimer: () => void;
  toggleTimer: () => void;
  handlePomodoroComplete: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  
  // Interval ref
  const timerRef = useRef<number | null>(null);
  
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
    if (isActive) {
      setIsActive(false);
    }
  }, [mode]);
  
  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      if (mode === 'pomodoro') {
        handlePomodoroComplete();
      }
      setIsActive(false);
    }
    
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, timeLeft, mode]);
  
  // Toggle timer
  const toggleTimer = () => {
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
  };

  return (
    <PomodoroContext.Provider value={{
      mode,
      setMode,
      timeLeft,
      setTimeLeft,
      isActive,
      setIsActive,
      completedPomodoros,
      setCompletedPomodoros,
      muted,
      setMuted,
      streakData,
      setStreakData,
      resetTimer,
      toggleTimer,
      handlePomodoroComplete
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
