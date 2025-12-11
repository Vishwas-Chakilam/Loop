import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Trophy, Flame, Calendar } from 'lucide-react-native';
import { getThemeColors } from '@/utils/theme';
import type { Habit } from '@/types/habit';

interface StreakAnalyticsProps {
  habits: Habit[];
}

export function StreakAnalytics({ habits }: StreakAnalyticsProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  
  const calculateStreaks = () => {
    let totalActiveStreaks = 0;
    let longestOverallStreak = 0;
    let bestHabit = null;
    
    habits.forEach(habit => {
      const completions = habit.completions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      let checkDate = new Date(today);
      
      // Calculate current streak
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completions.some(c => c.date === dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      // Calculate longest streak
      completions.forEach((completion, index) => {
        if (index === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(completions[index - 1].date);
          const currDate = new Date(completion.date);
          const dayDiff = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      });
      longestStreak = Math.max(longestStreak, tempStreak);
      
      if (currentStreak > 0) {
        totalActiveStreaks++;
      }
      
      if (longestStreak > longestOverallStreak) {
        longestOverallStreak = longestStreak;
        bestHabit = habit;
      }
    });
    
    return {
      totalActiveStreaks,
      longestOverallStreak,
      bestHabit,
    };
  };
  
  const stats = calculateStreaks();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Flame size={24} color="#FF6B35" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.totalActiveStreaks}</Text>
          <Text style={styles.statLabel}>Active Streaks</Text>
        </View>
        
        <View style={styles.statCard}>
          <Trophy size={24} color="#FFD700" strokeWidth={2} />
          <Text style={styles.statNumber}>{stats.longestOverallStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Calendar size={24} color={colors.primary} strokeWidth={2} />
          <Text style={styles.statNumber}>
            {Math.round((stats.totalActiveStreaks / habits.length) * 100) || 0}%
          </Text>
          <Text style={styles.statLabel}>Habits on Track</Text>
        </View>
      </View>
      
      {stats.bestHabit && (
        <View style={styles.bestHabitCard}>
          <Text style={styles.bestHabitTitle}>🏆 Best Performing Habit</Text>
          <Text style={styles.bestHabitName}>{stats.bestHabit.title}</Text>
          <Text style={styles.bestHabitStreak}>
            {stats.longestOverallStreak} day streak record
          </Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bestHabitCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  bestHabitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  bestHabitName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  bestHabitStreak: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});