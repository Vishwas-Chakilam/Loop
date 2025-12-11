export const COLORS = {
  primary: '#2E7D32',
  secondary: '#1A237E',
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    border: '#333333',
  },
};

export const getThemeColors = (colorScheme: 'light' | 'dark' | null | undefined) => {
  const isDark = colorScheme === 'dark';
  return {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    ...(isDark ? COLORS.dark : COLORS.light),
  };
};

export const HABIT_COLORS = [
  '#2E7D32', // Green
  '#1A237E', // Blue
  '#7B1FA2', // Purple
  '#C62828', // Red
  '#EF6C00', // Orange
  '#795548', // Brown
  '#455A64', // Blue Grey
  '#E91E63', // Pink
  '#FF5722', // Deep Orange
  '#009688', // Teal
  '#3F51B5', // Indigo
  '#607D8B', // Blue Grey
];

export const HABIT_ICONS = [
  'target',
  'heart',
  'zap',
  'book',
  'coffee',
  'dumbbell',
  'moon',
  'sun',
  'droplets',
  'leaf',
  'star',
  'flame',
];