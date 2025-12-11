import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') {
    try {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return { granted: false };
      }

      const permission = await Notification.requestPermission();
      return { granted: permission === 'granted' };
    } catch (error) {
      console.error('Failed to request web permissions:', error);
      return { granted: false };
    }
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return { granted: finalStatus === 'granted' };
  } catch (error) {
    console.error('Failed to request permissions:', error);
    return { granted: false };
  }
}

export async function scheduleHabitReminder(
  habitId: string,
  habitTitle: string,
  reminderTime: string
) {
  if (Platform.OS === 'web') {
    // For web, store the reminder info in localStorage
    try {
      const reminders = JSON.parse(localStorage.getItem('habitReminders') || '[]');
      const existingIndex = reminders.findIndex((r: any) => r.habitId === habitId);

      const reminder = {
        habitId,
        habitTitle,
        reminderTime,
        lastChecked: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        reminders[existingIndex] = reminder;
      } else {
        reminders.push(reminder);
      }

      localStorage.setItem('habitReminders', JSON.stringify(reminders));

      // Start the notification checker
      startNotificationChecker();

      return habitId;
    } catch (error) {
      console.error('Failed to schedule web notification:', error);
      return null;
    }
  }

  // Native platform scheduling
  try {
    // Cancel existing notification for this habit
    await cancelHabitReminder(habitId);

    // Parse reminder time (format: "HH:MM")
    const [hours, minutes] = reminderTime.split(':').map(Number);

    // Calculate 5 minutes before
    let reminderHour = hours;
    let reminderMinute = minutes - 5;

    if (reminderMinute < 0) {
      reminderMinute += 60;
      reminderHour -= 1;
    }

    if (reminderHour < 0) {
      reminderHour += 24;
    }

    // Schedule daily notification 5 minutes before habit time
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Habit Reminder',
        body: `Time to complete: ${habitTitle} (in 5 minutes)`,
        data: { habitId },
        sound: true,
      },
      trigger: {
        hour: reminderHour,
        minute: reminderMinute,
        repeats: true,
      } as any, // Type workaround for expo-notifications calendar trigger
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

export async function cancelHabitReminder(habitId: string) {
  if (Platform.OS === 'web') {
    try {
      const reminders = JSON.parse(localStorage.getItem('habitReminders') || '[]');
      const filtered = reminders.filter((r: any) => r.habitId !== habitId);
      localStorage.setItem('habitReminders', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to cancel web notification:', error);
    }
    return;
  }

  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.habitId === habitId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

export async function cancelAllNotifications() {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem('habitReminders');
    } catch (error) {
      console.error('Failed to cancel all web notifications:', error);
    }
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

// Web notification checker
let checkerInterval: any = null;

function startNotificationChecker() {
  if (Platform.OS !== 'web') return;

  // Clear existing interval
  if (checkerInterval) {
    clearInterval(checkerInterval);
  }

  // Check every minute
  checkerInterval = setInterval(() => {
    checkAndShowNotifications();
  }, 60000);

  // Also check immediately
  checkAndShowNotifications();
}

function checkAndShowNotifications() {
  if (Platform.OS !== 'web' || !('Notification' in window)) return;

  try {
    const reminders = JSON.parse(localStorage.getItem('habitReminders') || '[]');
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    reminders.forEach((reminder: any) => {
      const [hours, minutes] = reminder.reminderTime.split(':').map(Number);
      let reminderHour = hours;
      let reminderMinute = minutes - 5;

      if (reminderMinute < 0) {
        reminderMinute += 60;
        reminderHour -= 1;
      }

      if (reminderHour < 0) {
        reminderHour += 24;
      }

      const notificationTime = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;

      // Check if it's time to show notification
      if (currentTime === notificationTime) {
        // Check if we already showed notification today
        const lastShown = localStorage.getItem(`notif_shown_${reminder.habitId}`);
        const today = now.toISOString().split('T')[0];

        if (lastShown !== today) {
          if (Notification.permission === 'granted') {
            new Notification('🔔 Habit Reminder', {
              body: `Time to complete: ${reminder.habitTitle} (in 5 minutes)`,
              icon: '/icon.png',
              badge: '/icon.png',
            });

            // Mark as shown today
            localStorage.setItem(`notif_shown_${reminder.habitId}`, today);
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to check notifications:', error);
  }
}

// Initialize notification checker on web
if (Platform.OS === 'web') {
  startNotificationChecker();
}