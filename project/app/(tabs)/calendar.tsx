import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { HabitSelector } from '@/components/HabitSelector';
import { useSupabaseHabits } from '@/hooks/useSupabaseHabits';
import { useTheme } from '@/contexts/ThemeContext';

export default function CalendarScreen() {
  const { colors, isDark } = useTheme();
  const { habits, getHabitCompletions } = useSupabaseHabits();

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(
    habits.length > 0 ? habits[0].id : null
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  const selectedHabit = habits.find(h => h.id === selectedHabitId);
  const completions = selectedHabit ? getHabitCompletions(selectedHabit.id) : [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.title}>Calendar View</Text>
        <Text style={styles.subtitle}>Track your habit progress over time</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={48} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No habits to display</Text>
            <Text style={styles.emptyDescription}>
              Create some habits first to see your progress calendar
            </Text>
          </View>
        ) : (
          <>
            {/* Habit Selector */}
            <HabitSelector
              habits={habits}
              selectedHabitId={selectedHabitId}
              onHabitSelect={setSelectedHabitId}
            />

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('prev')}
              >
                <ChevronLeft size={20} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>

              <Text style={styles.monthTitle}>{monthYear}</Text>

              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('next')}
              >
                <ChevronRight size={20} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Calendar Heatmap */}
            {selectedHabit && (
              <CalendarHeatmap
                habit={selectedHabit}
                completions={completions}
                currentDate={currentDate}
              />
            )}

            {/* Statistics */}
            {selectedHabit && (
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>This Month</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {completions.filter(c => {
                        const compDate = new Date(c.date);
                        return compDate.getMonth() === currentDate.getMonth() &&
                          compDate.getFullYear() === currentDate.getFullYear();
                      }).length}
                    </Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.round(
                        (completions.filter(c => {
                          const compDate = new Date(c.date);
                          return compDate.getMonth() === currentDate.getMonth() &&
                            compDate.getFullYear() === currentDate.getFullYear();
                        }).length / new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) * 100
                      )}%
                    </Text>
                    <Text style={styles.statLabel}>Success Rate</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.max(...completions
                        .map((_, index, arr) => {
                          let streak = 1;
                          for (let i = index - 1; i >= 0; i--) {
                            const current = new Date(arr[i].date);
                            const next = new Date(arr[i + 1].date);
                            if (current.getTime() === next.getTime() - 86400000) {
                              streak++;
                            } else {
                              break;
                            }
                          }
                          return streak;
                        }), 0) || 0}
                    </Text>
                    <Text style={styles.statLabel}>Best Streak</Text>
                  </View>
                </View>
              </View>
            )}
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
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  statsSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});