import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Target, Heart, Zap, Book, Coffee } from 'lucide-react-native';
import { getThemeColors } from '@/utils/theme';
import type { Habit } from '@/types/habit';

interface HabitSelectorProps {
  habits: Habit[];
  selectedHabitId: string | null;
  onHabitSelect: (habitId: string) => void;
}

const iconMap = {
  target: Target,
  heart: Heart,
  zap: Zap,
  book: Book,
  coffee: Coffee,
};

export function HabitSelector({ habits, selectedHabitId, onHabitSelect }: HabitSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Habit</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {habits.map(habit => {
          const isSelected = selectedHabitId === habit.id;
          const IconComponent = iconMap[habit.icon as keyof typeof iconMap] || Target;
          
          return (
            <TouchableOpacity
              key={habit.id}
              style={[
                styles.habitButton,
                isSelected && styles.selectedHabit,
                { borderColor: habit.color }
              ]}
              onPress={() => onHabitSelect(habit.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${habit.color}20` }]}>
                <IconComponent size={16} color={habit.color} strokeWidth={2} />
              </View>
              <Text style={[
                styles.habitTitle,
                isSelected && styles.selectedHabitTitle
              ]}>
                {habit.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  habitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
  },
  selectedHabit: {
    backgroundColor: colors.background,
    borderWidth: 2,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  selectedHabitTitle: {
    fontWeight: '600',
  },
});