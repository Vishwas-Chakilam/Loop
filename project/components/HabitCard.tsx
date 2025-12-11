import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { CircleCheck as CheckCircle2, Circle, Target, Heart, Zap, Book, Coffee, Dumbbell, Moon, Sun, Droplets, Leaf, Star, Flame, MoreVertical } from 'lucide-react-native';
import { getThemeColors } from '@/utils/theme';
import type { Habit } from '@/types/habit';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  onEdit?: (habitId: string) => void;
}

const iconMap = {
  target: Target,
  heart: Heart,
  zap: Zap,
  book: Book,
  coffee: Coffee,
  dumbbell: Dumbbell,
  moon: Moon,
  sun: Sun,
  droplets: Droplets,
  leaf: Leaf,
  star: Star,
  flame: Flame,
};

export function HabitCard({ habit, onToggle, onEdit }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [checkAnim] = useState(new Animated.Value(1));

  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completions.some(c => c.date === today);

  const IconComponent = iconMap[habit.icon as keyof typeof iconMap] || Target;

  const handlePress = () => {
    // Card press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Check button animation
    Animated.sequence([
      Animated.timing(checkAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle(habit.id);
  };

  const handleLongPress = () => {
    if (onEdit) {
      onEdit(habit.id);
    }
  };

  const styles = getStyles(colors, habit.color, isCompleted);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <IconComponent size={20} color={habit.color} strokeWidth={2} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{habit.title}</Text>
          {habit.description ? (
            <Text style={styles.description}>{habit.description}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleLongPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreVertical size={20} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handlePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isCompleted ? (
              <CheckCircle2 size={28} color={habit.color} strokeWidth={2} />
            ) : (
              <Circle size={28} color={colors.textSecondary} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const getStyles = (colors: any, habitColor: string, isCompleted: boolean) => StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${habitColor}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
    textDecorationLine: isCompleted ? 'line-through' : 'none',
    opacity: isCompleted ? 0.7 : 1,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  menuButton: {
    padding: 8,
    marginRight: 4,
  },
  checkButton: {
    padding: 4,
  },
});