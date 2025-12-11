import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Calendar, Award, Target } from 'lucide-react-native';
import { ProgressChart } from '@/components/ProgressChart';
import { StreakAnalytics } from '@/components/StreakAnalytics';
import { CompletionRateCard } from '@/components/CompletionRateCard';
import { useSupabaseHabits } from '@/hooks/useSupabaseHabits';
import { useTheme } from '@/contexts/ThemeContext';

type TimeRange = 'week' | 'month' | 'year';

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const { habits, getAllCompletions, getOverallStats } = useSupabaseHabits();

  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');

  const overallStats = getOverallStats();
  const allCompletions = getAllCompletions();

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Insights into your habit journey</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <TrendingUp size={48} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No data to analyze yet</Text>
            <Text style={styles.emptyDescription}>
              Complete some habits to see your progress analytics
            </Text>
          </View>
        ) : (
          <>
            {/* Time Range Selector */}
            <View style={styles.timeRangeSelector}>
              {timeRanges.map(range => (
                <TouchableOpacity
                  key={range.key}
                  style={[
                    styles.rangeButton,
                    selectedRange === range.key && styles.rangeButtonActive
                  ]}
                  onPress={() => setSelectedRange(range.key)}
                >
                  <Text style={[
                    styles.rangeButtonText,
                    selectedRange === range.key && styles.rangeButtonTextActive
                  ]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Overall Stats */}
            <View style={styles.overallStats}>
              <View style={styles.statCard}>
                <Target size={24} color={colors.primary} strokeWidth={2} />
                <Text style={styles.statNumber}>{overallStats.totalHabits}</Text>
                <Text style={styles.statLabel}>Active Habits</Text>
              </View>

              <View style={styles.statCard}>
                <Award size={24} color="#FF6B35" strokeWidth={2} />
                <Text style={styles.statNumber}>{overallStats.totalCompletions}</Text>
                <Text style={styles.statLabel}>Total Completions</Text>
              </View>

              <View style={styles.statCard}>
                <Calendar size={24} color="#8E24AA" strokeWidth={2} />
                <Text style={styles.statNumber}>
                  {Math.round(overallStats.averageCompletionRate)}%
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>

            {/* Progress Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress Over Time</Text>
              <ProgressChart
                completions={allCompletions}
                timeRange={selectedRange}
                color={colors.primary}
              />
            </View>

            {/* Completion Rate by Habit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habit Performance</Text>
              {habits.map(habit => (
                <CompletionRateCard
                  key={habit.id}
                  habit={habit}
                  timeRange={selectedRange}
                />
              ))}
            </View>

            {/* Streak Analytics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Streak Analysis</Text>
              <StreakAnalytics habits={habits} />
            </View>

            {/* Best Performing Days */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Best Days</Text>
              <View style={styles.dayPerformance}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const dayCompletions = allCompletions.filter(c =>
                    new Date(c.date).getDay() === (index + 1) % 7
                  ).length;
                  const maxCompletions = Math.max(...['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((_, i) =>
                    allCompletions.filter(c => new Date(c.date).getDay() === (i + 1) % 7).length
                  ));

                  return (
                    <View key={day} style={styles.dayItem}>
                      <Text style={styles.dayLabel}>{day}</Text>
                      <View style={styles.dayBar}>
                        <View
                          style={[
                            styles.dayBarFill,
                            {
                              height: `${maxCompletions > 0 ? (dayCompletions / maxCompletions) * 100 : 0}%`,
                              backgroundColor: colors.primary
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.dayCount}>{dayCompletions}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeButtonActive: {
    backgroundColor: colors.primary,
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
  },
  overallStats: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  dayPerformance: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dayBar: {
    width: 20,
    height: 60,
    backgroundColor: colors.background,
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  dayBarFill: {
    borderRadius: 10,
    minHeight: 2,
  },
  dayCount: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
});