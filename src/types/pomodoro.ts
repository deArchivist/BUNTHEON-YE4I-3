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
