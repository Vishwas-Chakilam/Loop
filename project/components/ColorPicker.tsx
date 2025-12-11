import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { getThemeColors, HABIT_COLORS } from '@/utils/theme';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Color</Text>
      <View style={styles.colorRow}>
        {HABIT_COLORS.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor
            ]}
            onPress={() => onColorSelect(color)}
          />
        ))}
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: colors.text,
  },
});