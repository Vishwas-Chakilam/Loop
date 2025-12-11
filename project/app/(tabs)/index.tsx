import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CircleCheck as CheckCircle2, Circle, Flame, Target, Plus } from 'lucide-react-native';
import { HabitCard } from '@/components/HabitCard';
import { StreakCard } from '@/components/StreakCard';
import { useSupabaseHabits } from '@/hooks/useSupabaseHabits';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function TodayScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { habits, toggleHabitCompletion, deleteHabit, getTodayStats, getStreakStats, refresh, isLoading } = useSupabaseHabits();
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        refresh();
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    }, [user, refresh, fadeAnim])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const todayStats = getTodayStats();
  const streakStats = getStreakStats();

  const handleToggle = async (habitId: string) => {
    try {
      await toggleHabitCompletion(habitId);
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const handleEdit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    Alert.alert(
      habit.title,
      'Choose an action',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
            } catch (error) {
              console.error('Failed to delete habit:', error);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.title}>Today's Habits</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Progress Overview */}
          <View style={styles.statsContainer}>
            <Animated.View style={[styles.statCard, {
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }]}>
              <Target size={24} color={colors.primary} strokeWidth={2} />
              <Text style={styles.statNumber}>{todayStats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Animated.View>

            <Animated.View style={[styles.statCard, {
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }]}>
              <Circle size={24} color={colors.textSecondary} strokeWidth={2} />
              <Text style={styles.statNumber}>{todayStats.remaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </Animated.View>

            <Animated.View style={[styles.statCard, {
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }]}>
              <Flame size={24} color="#FF6B35" strokeWidth={2} />
              <Text style={styles.statNumber}>{streakStats.longest}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </Animated.View>
          </View>

          {/* Current Streaks */}
          {streakStats.active.length > 0 && (
            <Animated.View style={{
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }}>
              <StreakCard streaks={streakStats.active} />
            </Animated.View>
          )}

          {/* Today's Habits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Habits</Text>

            {habits.length === 0 ? (
              <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
                <Circle size={48} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>No habits yet</Text>
                <Text style={styles.emptyDescription}>
                  Create your first habit to start building better routines
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push('/(tabs)/add')}
                >
                  <Plus size={20} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.createButtonText}>Create Habit</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              habits.map((habit, index) => (
                <Animated.View
                  key={habit.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50 + (index * 10), 0],
                      })
                    }],
                  }}
                >
                  <HabitCard
                    habit={habit}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                </Animated.View>
              ))
            )}
          </View>
        </ScrollView>
      </Animated.View>
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
  date: {
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});