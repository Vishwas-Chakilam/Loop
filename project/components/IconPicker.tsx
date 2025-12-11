import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Target, Heart, Zap, Book, Coffee, Dumbbell, Moon, Sun, Droplets, Leaf, Star, Flame } from 'lucide-react-native';
import { getThemeColors, HABIT_ICONS } from '@/utils/theme';

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  color: string;
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

export function IconPicker({ selectedIcon, onIconSelect, color }: IconPickerProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  
  const styles = getStyles(colors, color);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Icon</Text>
      <View style={styles.iconRow}>
        {HABIT_ICONS.map(iconName => {
          const IconComponent = iconMap[iconName as keyof typeof iconMap];
          const isSelected = selectedIcon === iconName;
          
          return (
            <TouchableOpacity
              key={iconName}
              style={[
                styles.iconButton,
                isSelected && styles.selectedIcon
              ]}
              onPress={() => onIconSelect(iconName)}
            >
              <IconComponent 
                size={20} 
                color={isSelected ? color : colors.textSecondary} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (colors: any, habitColor: string) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedIcon: {
    backgroundColor: `${habitColor}20`,
    borderColor: habitColor,
  },
});