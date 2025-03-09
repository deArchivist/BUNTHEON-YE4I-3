import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { formatISO } from 'date-fns';

interface Reminder {
  id: string;
  title: string;
  date: string; // ISO string
  time: string; // HH:MM format
  subject: string;
  priority: string; // 'low', 'medium', 'high'
  completed: boolean;
}

interface RemindersContextType {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleComplete: (id: string) => void;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

// Example reminders
const getExampleReminders = (): Reminder[] => [
  {
    id: '1',
    title: 'Math Homework - Chapter 5',
    date: formatISO(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
    time: '14:30',
    subject: 'Mathematics',
    priority: 'high',
    completed: false
  },
  {
    id: '2',
    title: 'Physics Lab Report',
    date: formatISO(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
    time: '09:00',
    subject: 'Physics',
    priority: 'medium',
    completed: false
  },
  {
    id: '3',
    title: 'English Essay Submission',
    date: formatISO(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    time: '23:59',
    subject: 'English',
    priority: 'high',
    completed: true
  },
  {
    id: '4',
    title: 'Chemistry Quiz',
    date: formatISO(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
    time: '10:45',
    subject: 'Chemistry',
    priority: 'high',
    completed: false
  }
];

export const RemindersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Load reminders from local storage on initial render
  useEffect(() => {
    try {
      const storedReminders = localStorage.getItem('buntheon_reminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      } else {
        // If no stored reminders, use examples
        const exampleReminders = getExampleReminders();
        setReminders(exampleReminders);
        localStorage.setItem('buntheon_reminders', JSON.stringify(exampleReminders));
      }
    } catch (error) {
      console.error("Error loading reminders from localStorage:", error);
      setReminders(getExampleReminders());
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('buntheon_reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error("Error saving reminders to localStorage:", error);
    }
  }, [reminders]);

  // Add a new reminder
  const addReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString()
    };
    setReminders(prev => [...prev, newReminder]);
  };

  // Update an existing reminder
  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id ? { ...reminder, ...updates } : reminder
      )
    );
  };

  // Delete a reminder
  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  // Toggle reminder completion status
  const toggleComplete = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
  };

  return (
    <RemindersContext.Provider 
      value={{ 
        reminders, 
        addReminder, 
        updateReminder, 
        deleteReminder, 
        toggleComplete 
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
};
