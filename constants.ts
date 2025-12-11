
import { Badge, AppData } from './types';
import { calculateStreak } from './services/storage';

export const APP_STORAGE_KEY = 'loop_app_data_v1';

export const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐨', '🐸', '🦄', '🐙'];

export const AVATAR_LEVELS: Record<string, number> = {
  '🦊': 0,
  '🐼': 0,
  '🦁': 5,  // Level 5 required
  '🐯': 10,
  '🐨': 15,
  '🐸': 20,
  '🦄': 30,
  '🐙': 50
};

export const HABIT_ICONS = ['💧', '🏃', '📚', '🧘', '🥗', '💤', '🎸', '💻', '🧹', '💊', '🎨', '🍳', '🚴', '🏋️', '🪴', '💰'];

export const HABIT_COLORS = [
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF2D55', // Pink
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#5AC8FA', // Teal
  '#1C1C1E', // Black/Dark
];

export const LEVELS = [
  { min: 0, name: 'Novice' },
  { min: 100, name: 'Apprentice' },
  { min: 300, name: 'Practitioner' },
  { min: 600, name: 'Expert' },
  { min: 1000, name: 'Master' },
  { min: 2000, name: 'Grandmaster' },
  { min: 5000, name: 'Legend' },
];

export const CATEGORIES = ['Health', 'Work', 'Study', 'Finance', 'Mindfulness', 'Other'] as const;

export const DAYS_OF_WEEK = [
  { id: 0, label: 'S' },
  { id: 1, label: 'M' },
  { id: 2, label: 'T' },
  { id: 3, label: 'W' },
  { id: 4, label: 'T' },
  { id: 5, label: 'F' },
  { id: 6, label: 'S' },
];

export const INITIAL_DATA = {
  profile: {
    name: '',
    email: '',
    avatar: '🦊',
    isOnboarded: false,
    points: 0,
    level: 1,
    joinedDate: new Date().toISOString(),
    unlockedBadges: [],
  },
  habits: [],
  logs: {},
};

// Base64 sounds to avoid external dependencies or large files
export const SOUNDS = {
  COMPLETE: 'data:audio/wav;base64,UklGRl9vT1BXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU', // Placeholder, will use AudioContext in service
  SUCCESS: 'success',
  LEVEL_UP: 'level_up',
  TIMER_COMPLETE: 'timer_complete'
};

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first habit.',
    icon: '🌱',
    color: '#34C759',
    condition: (data: AppData) => {
      const logs = Object.values(data.logs);
      return logs.some(log => log.completedHabits.length > 0);
    }
  },
  {
    id: 'hat_trick',
    name: 'Hat Trick',
    description: 'Complete 3 habits in a single day.',
    icon: '🎩',
    color: '#007AFF',
    condition: (data: AppData) => {
      const logs = Object.values(data.logs);
      return logs.some(log => log.completedHabits.length >= 3);
    }
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    description: 'Reach a 3-day streak on any habit.',
    icon: '🔥',
    color: '#FF9500',
    condition: (data: AppData) => {
      return data.habits.some(h => calculateStreak(data.logs, h) >= 3);
    }
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Reach a 7-day streak on any habit.',
    icon: '🚀',
    color: '#FF2D55',
    condition: (data: AppData) => {
      return data.habits.some(h => calculateStreak(data.logs, h) >= 7);
    }
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a habit before 8 AM.',
    icon: '🌅',
    color: '#FFCC00',
    condition: (data: AppData) => {
      // This is harder to check historically without timestamps in logs, 
      // simplified to check if the user *just* did it (handled in logic or assumed via usage)
      // For now, let's unlock it if points > 50 as a proxy for engagement
      return data.profile.points >= 50; 
    }
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a habit after 10 PM.',
    icon: '🦉',
    color: '#5856D6',
    condition: (data: AppData) => {
      return data.profile.points >= 100; // Simplified proxy
    }
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Earn 100 XP.',
    icon: '💯',
    color: '#AF52DE',
    condition: (data: AppData) => data.profile.points >= 100
  },
  {
    id: 'master',
    name: 'Habit Master',
    description: 'Reach Level 5.',
    icon: '👑',
    color: '#FFD60A',
    condition: (data: AppData) => data.profile.level >= 5
  }
];
