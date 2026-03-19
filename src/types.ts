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

export type Completion = {
  habitId: string;
  date: string; // YYYY-MM-DD
};
