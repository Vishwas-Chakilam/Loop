
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isOnboarded: boolean;
  points: number;
  level: number;
  joinedDate: string;
  theme?: 'light' | 'dark';
  unlockedBadges: string[]; // Array of Badge IDs
}

export type Category = 'Health' | 'Work' | 'Study' | 'Finance' | 'Mindfulness' | 'Other';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  category: Category;
  frequency: number[]; // Array of days (0=Sun, 1=Mon, ..., 6=Sat)
  reminderTime?: string; // Format: "HH:mm" (24h)
  created_at: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  completedHabits: string[]; // Array of Habit IDs
  sleepHours: number;
  mood?: 'great' | 'good' | 'neutral' | 'bad';
}

export interface AppData {
  profile: UserProfile;
  habits: Habit[];
  logs: Record<string, DailyLog>; // Keyed by date YYYY-MM-DD
}

export enum Tab {
  DASHBOARD = 'dashboard',
  ANALYTICS = 'analytics',
  PROFILE = 'profile',
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: (data: AppData) => boolean;
}
