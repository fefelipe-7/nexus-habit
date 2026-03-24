import { Habit, Completion } from '../types';
import { differenceInDays, parseISO, format, subDays, startOfDay, isSameDay } from 'date-fns';

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  successRate: number;
  last7Days: { date: Date; completed: boolean }[];
  heatmap: { date: string; value: number }[];
}

export const calculateHabitStats = (habit: Habit, completions: Completion[]): HabitStats => {
  const habitCompletions = completions
    .filter(c => c.habitId === habit.id)
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  // A completion counts as "done" for streak/rate if amount >= duration
  const fullyCompletedDates = habitCompletions
    .filter(c => c.amount >= (habit.duration || 1))
    .map(c => c.date);

  const totalCompletions = fullyCompletedDates.length;
  
  // Success Rate calculation
  const startDate = parseISO(habit.createdAt);
  const totalDaysSinceCreation = Math.max(differenceInDays(new Date(), startDate) + 1, 1);
  const scheduledDaysCount = Array.from({ length: totalDaysSinceCreation }).filter((_, i) => {
    const d = subDays(new Date(), i);
    return habit.repeatDays.includes(d.getDay());
  }).length;
  
  const successRate = scheduledDaysCount > 0 ? Math.round((totalCompletions / scheduledDaysCount) * 100) : 0;

  // Longest Streak calculation
  let longestStreak = 0;
  let currentCalcStreak = 0;
  const sortedDates = [...new Set(fullyCompletedDates)].sort().reverse();
  
  // Note: Simple version, ideally accounts for scheduled days gap
  // But since we have habit.streak from DB (triggered), we use that for current
  const currentStreak = habit.streak || 0;
  
  // For longest, we'd ideally iterate history. For now, max(current, previous_max)
  // Since we don't store historical max in DB yet, we'll approximate or calculate here
  // calculating here:
  let tempLongest = 0;
  let tempCurrent = 0;
  let lastDate: Date | null = null;

  const allCompletionsSorted = [...fullyCompletedDates].sort().sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime());
  
  allCompletionsSorted.forEach(dateStr => {
    const d = parseISO(dateStr);
    if (!lastDate) {
      tempCurrent = 1;
    } else {
      const diff = differenceInDays(d, lastDate);
      if (diff === 1) {
        tempCurrent++;
      } else if (diff > 1) {
        // Check if missing days were scheduled. If not, streak might continue.
        // For simplicity in MVP, we gap it.
        tempCurrent = 1;
      }
    }
    lastDate = d;
    if (tempCurrent > tempLongest) tempLongest = tempCurrent;
  });
  longestStreak = Math.max(tempLongest, currentStreak);

  // Last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const completion = habitCompletions.find(c => c.date === dateStr);
    return {
      date: d,
      completed: !!completion && completion.amount >= (habit.duration || 1),
      amount: completion?.amount || 0
    };
  });

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    successRate: Math.min(successRate, 100),
    last7Days,
    heatmap: [] // Will calc globally
  };
};

export const calculateGlobalStats = (habits: Habit[], completions: Completion[]) => {
  const totalCompletions = completions.length;
  const currentStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  
  // Group completions by date for faster heatmap and habit stats
  const completionsByDate = new Map<string, Completion[]>();
  completions.forEach(c => {
    const list = completionsByDate.get(c.date) || [];
    list.push(c);
    completionsByDate.set(c.date, list);
  });

  // Calculate habit stats once per habit
  const habitStats = habits.map(h => calculateHabitStats(h, completions));

  // Longest streak across all habits
  const longestStreak = habitStats.length > 0 
    ? Math.max(...habitStats.map(s => s.longestStreak)) 
    : 0;

  // Global Success Rate
  const totalSuccessRate = habitStats.length > 0 
    ? Math.round(habitStats.reduce((acc, s) => acc + s.successRate, 0) / habitStats.length)
    : 0;

  // Heatmap (Last 105 days) - O(days)
  const heatmap = Array.from({ length: 105 }).map((_, i) => {
    const d = subDays(new Date(), i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayCompletions = completionsByDate.get(dateStr) || [];
    return {
      date: dateStr,
      value: dayCompletions.length // number of habits done that day
    };
  }).reverse();

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    successRate: totalSuccessRate,
    heatmap
  };
};
