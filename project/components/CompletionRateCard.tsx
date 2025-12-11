import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Target, Heart, Zap, Book, Coffee } from 'lucide-react-native';
import { getThemeColors } from '@/utils/theme';
import type { Habit } from '@/types/habit';

interface CompletionRateCardProps {
  habit: Habit;
  timeRange: 'week' | 'month' | 'year';
}

const iconMap = {
  target: Target,
  heart: Heart,
  zap: Zap,
  book: Book,
  coffee: Coffee,
};

export function CompletionRateCard({ habit, timeRange }: CompletionRateCardProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  
  const getCompletionRate = () => {
    const now = new Date();
    let startDate: Date;
    let totalDays: number;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        totalDays = 7;
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        totalDays = 30;
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 364);
        totalDays = 365;
        break;
    }
    
    const completionsInRange = habit.completions.filter(c => {
      const completionDate = new Date(c.date);
      return completionDate >= startDate && completionDate <= now;
    }).length;
    
    return Math.round((completionsInRange / totalDays) * 100);
  };
  
  const completionRate = getCompletionRate();
  const IconComponent = iconMap[habit.icon as keyof typeof iconMap] || Target;
  
  const styles = getStyles(colors, habit.color);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconComponent size={16} color={habit.color} strokeWidth={2} />
        </View>
        <Text style={styles.title}>{habit.title}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${completionRate}%`, backgroundColor: habit.color }
            ]}
          />
        </View>
        <Text style={styles.percentage}>{completionRate}%</Text>
      </View>
      
      <Text style={styles.completions}>
        {habit.completions.length} total completions
      </Text>
    </View>
  );
}

const getStyles = (colors: any, habitColor: string) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: `${habitColor}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    minWidth: 35,
  },
  completions: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});