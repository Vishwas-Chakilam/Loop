import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { getThemeColors } from '@/utils/theme';
import type { HabitCompletion } from '@/types/habit';

interface ProgressChartProps {
  completions: HabitCompletion[];
  timeRange: 'week' | 'month' | 'year';
  color: string;
}

export function ProgressChart({ completions, timeRange, color }: ProgressChartProps) {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);
  const screenWidth = Dimensions.get('window').width - 48; // Account for padding
  
  const getDataPoints = () => {
    const now = new Date();
    let days: number;
    let format: (date: Date) => string;
    
    switch (timeRange) {
      case 'week':
        days = 7;
        format = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
        days = 30;
        format = (date) => date.getDate().toString();
        break;
      case 'year':
        days = 12;
        format = (date) => date.toLocaleDateString('en-US', { month: 'short' });
        break;
    }
    
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      if (timeRange === 'year') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setDate(date.getDate() - i);
      }
      
      const dateStr = date.toISOString().split('T')[0];
      const count = completions.filter(c => {
        if (timeRange === 'year') {
          const compDate = new Date(c.date);
          return compDate.getMonth() === date.getMonth() && 
                 compDate.getFullYear() === date.getFullYear();
        }
        return c.date === dateStr;
      }).length;
      
      data.push({
        label: format(date),
        value: count,
        date: dateStr,
      });
    }
    
    return data;
  };
  
  const dataPoints = getDataPoints();
  const maxValue = Math.max(...dataPoints.map(d => d.value), 1);
  const chartWidth = screenWidth - 32; // Account for chart padding
  const chartHeight = 120;
  const barWidth = chartWidth / dataPoints.length * 0.7;
  const barSpacing = chartWidth / dataPoints.length * 0.3;
  
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        <View style={styles.barsContainer}>
          {dataPoints.map((point, index) => {
            const barHeight = (point.value / maxValue) * chartHeight;
            
            return (
              <View 
                key={point.date} 
                style={[
                  styles.barColumn,
                  { width: chartWidth / dataPoints.length }
                ]}
              >
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar,
                      { 
                        height: barHeight || 2,
                        backgroundColor: point.value > 0 ? color : colors.surface,
                        width: barWidth,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{point.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  chart: {
    height: 160,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120,
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});