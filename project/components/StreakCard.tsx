import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Flame } from 'lucide-react-native';
import { getThemeColors } from '@/utils/theme';

interface StreakCardProps {
  streaks: Array<{
    habit: any;
    currentStreak: number;
    longestStreak: number;
  }>;
}

export function StreakCard({ streaks }: StreakCardProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  
  if (streaks.length === 0) return null;

  const topStreak = streaks.sort((a, b) => b.currentStreak - a.currentStreak)[0];
  
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Flame size={20} color="#FF6B35" strokeWidth={2} />
        </View>
        <Text style={styles.title}>Active Streaks</Text>
      </View>
      
      <View style={styles.topStreak}>
        <Text style={styles.habitName}>{topStreak.habit.title}</Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{topStreak.currentStreak}</Text>
          <Text style={styles.streakLabel}>days</Text>
        </View>
      </View>
      
      {streaks.length > 1 && (
        <View style={styles.otherStreaks}>
          {streaks.slice(1, 4).map((streak) => (
            <View key={streak.habit.id} style={styles.miniStreak}>
              <Text style={styles.miniHabitName}>{streak.habit.title}</Text>
              <Text style={styles.miniStreakNumber}>{streak.currentStreak}d</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FF6B3520',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  topStreak: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
  },
  streakLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  otherStreaks: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 8,
  },
  miniStreak: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniHabitName: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  miniStreakNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
});