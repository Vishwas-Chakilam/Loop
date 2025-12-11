import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Calendar, Clock, Settings } from 'lucide-react-native';
import { getThemeColors } from '@/utils/theme';

interface FrequencySelectorProps {
  frequency: 'daily' | 'weekly' | 'custom';
  onFrequencyChange: (frequency: 'daily' | 'weekly' | 'custom') => void;
}

export function FrequencySelector({ frequency, onFrequencyChange }: FrequencySelectorProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tracking Frequency</Text>
      <View style={styles.infoBox}>
        <Calendar size={18} color={colors.primary} strokeWidth={2} />
        <Text style={styles.infoText}>
          Track this habit daily. You can mark it complete each day.
        </Text>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});