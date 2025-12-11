export interface Habit {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekly' | 'custom';
  reminderTime: string;
  createdAt: Date;
  completions: HabitCompletion[];
  isActive: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completedAt: Date;
  notes?: string;
}

export interface HabitStats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  lastCompleted?: Date;
}