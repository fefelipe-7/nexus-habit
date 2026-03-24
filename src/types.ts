export type Priority = 'low' | 'medium' | 'high';

export type Habit = {
  id: string;
  name: string;
  emojiUrl: string;
  color: string;
  repeatDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  reminders: boolean;
  createdAt: string;
  duration?: number; // amount of the goal
  unit?: string; // unit labels like 'kg', 'l', 'mins', etc.
  streak?: number;
  categoryId?: string;
};

export type Task = {
  id: string;
  name: string;
  description?: string;
  deadline: string; // ISO date
  estimatedTime: number; // minutes
  emojiUrl: string;
  color: string;
  priority: Priority;
  createdAt: string;
  completedAt?: string; // ISO date when completed
  projectId?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  emojiUrl: string;
  color: string;
  status: 'active' | 'completed' | 'archived';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
};

export type Completion = {
  habitId: string;
  date: string; // YYYY-MM-DD
  amount: number;
};

export type UserSettings = {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en';
  dailyHabitGoal: number;
  showMascotPhrases: boolean;
};

export type Profile = {
  id: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  settings: UserSettings;
  updatedAt: string;
};
