import { LocalNotifications } from '@capacitor/local-notifications';
import { Habit, Task } from '../types';
import { format, parseISO, setHours, setMinutes, addDays, isBefore } from 'date-fns';

class NotificationService {
  async requestPermissions() {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  async scheduleHabitReminder(habit: Habit) {
    if (!habit.reminders) return;

    // Default reminder time: 9:00 AM
    // In a real app, this would be a user setting or per-habit setting
    const now = new Date();
    let scheduledTime = setMinutes(setHours(now, 9), 0);

    // If 9 AM has already passed today, schedule for tomorrow
    if (isBefore(scheduledTime, now)) {
      scheduledTime = addDays(scheduledTime, 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: `Time for ${habit.name}!`,
          body: `Keep up your streak! You've done this ${habit.streak} days in a row.`,
          id: this.generateId(habit.id),
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: 'day'
          },
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: { habitId: habit.id }
        }
      ]
    });
  }

  async scheduleTaskReminder(task: Task) {
    if (!task.deadline || !!task.completedAt) return;

    const deadlineDate = parseISO(task.deadline);
    const now = new Date();

    // Schedule for 9 AM on the deadline day
    let scheduledTime = setMinutes(setHours(deadlineDate, 9), 0);

    // If the deadline is in the past or 9 AM has passed, don't schedule or schedule for later?
    // For MVP, if it's in the past, we skip.
    if (isBefore(scheduledTime, now)) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'task Deadline!',
          body: `reminder: "${task.name}" is due today.`,
          id: this.generateId(task.id),
          schedule: { at: scheduledTime },
          sound: 'default',
          extra: { taskId: task.id }
        }
      ]
    });
  }

  async cancelNotification(id: string) {
    await LocalNotifications.cancel({
      notifications: [{ id: this.generateId(id) }]
    });
  }

  // Simple string to number conversion for Capacitor notification IDs
  private generateId(uuid: string): number {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

export const notificationService = new NotificationService();
