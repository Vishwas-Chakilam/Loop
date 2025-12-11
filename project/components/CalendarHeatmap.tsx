import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { getThemeColors } from '@/utils/theme';
import type { Habit, HabitCompletion } from '@/types/habit';

interface CalendarHeatmapProps {
  habit: Habit;
  completions: HabitCompletion[];
  currentDate: Date;
}

export function CalendarHeatmap({ habit, completions, currentDate }: CalendarHeatmapProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const completionDates = new Set(completions.map(c => c.date));
  
  const styles = getStyles(colors, habit.color);

  const renderDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isCompleted = completionDates.has(dateStr);
    const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
    
    return (
      <TouchableOpacity
        key={day}
        style={[
          styles.dayCell,
          isCompleted && styles.completedDay,
          isToday && styles.todayDay
        ]}
      >
        <Text style={[
          styles.dayText,
          isCompleted && styles.completedDayText,
          isToday && styles.todayText
        ]}>
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekDayLabel}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.calendar}>
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }, (_, i) => (
          <View key={`empty-${i}`} style={styles.emptyCell} />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </View>
    </View>
  );
}

const getStyles = (colors: any, habitColor: string) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingVertical: 4,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    margin: 1,
    backgroundColor: colors.background,
  },
  emptyCell: {
    width: '14.285%',
    aspectRatio: 1,
  },
  completedDay: {
    backgroundColor: habitColor,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  completedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '700',
  },
});