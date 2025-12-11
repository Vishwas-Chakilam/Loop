import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';
import { scheduleHabitReminder, cancelHabitReminder } from '@/utils/notifications';
import type { Database } from '@/types/database';
import type { Habit, HabitCompletion } from '@/types/habit';

type HabitRow = Database['public']['Tables']['habits']['Row'];
type HabitCompletionRow = Database['public']['Tables']['habit_completions']['Row'];

export function useSupabaseHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (habitsError) {
        console.error('Failed to load habits:', habitsError);
        toast.error('Error', 'Failed to load habits');
        return;
      }

      // Load completions for all habits
      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (completionsError) {
        console.error('Failed to load completions:', completionsError);
        toast.error('Error', 'Failed to load habit completions');
        return;
      }

      // Combine habits with their completions
      const habitsWithCompletions: Habit[] = (habitsData || []).map((habit: HabitRow) => ({
        id: habit.id,
        title: habit.title,
        description: habit.description || '',
        color: habit.color,
        icon: habit.icon,
        frequency: habit.frequency,
        reminderTime: habit.reminder_time,
        createdAt: new Date(habit.created_at),
        isActive: habit.is_active,
        completions: (completionsData || [])
          .filter((comp: HabitCompletionRow) => comp.habit_id === habit.id)
          .map((comp: HabitCompletionRow) => ({
            id: comp.id,
            habitId: comp.habit_id,
            date: comp.date,
            completedAt: new Date(comp.completed_at),
            notes: comp.notes || undefined,
          })),
      }));

      setHabits(habitsWithCompletions);
    } catch (error) {
      console.error('Failed to load habits:', error);
      toast.error('Error', 'Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits, refreshKey]);

  const addHabit = async (habitData: Omit<Habit, 'id' | 'completions'>) => {
    if (!user) {
      toast.error('Error', 'You must be signed in to create habits');
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: habitData.title,
          description: habitData.description || null,
          color: habitData.color,
          icon: habitData.icon,
          frequency: habitData.frequency,
          reminder_time: habitData.reminderTime,
          is_active: habitData.isActive,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create habit:', error);
        toast.error('Error', 'Failed to create habit');
        throw error;
      }

      // Schedule notification for the habit
      await scheduleHabitReminder(data.id, habitData.title, habitData.reminderTime);
      
      toast.success('Habit Created!', `"${habitData.title}" has been added to your routine.`);
      
      // Refresh habits list
      setRefreshKey(prev => prev + 1);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) {
      toast.error('Error', 'You must be signed in to update habits');
      throw new Error('User not authenticated');
    }

    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
      if (updates.reminderTime !== undefined) updateData.reminder_time = updates.reminderTime;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase
        .from('habits')
        .update(updateData)
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update habit:', error);
        toast.error('Error', 'Failed to update habit');
        throw error;
      }

      // Update notification if reminder time changed
      if (updates.reminderTime && updates.title) {
        await scheduleHabitReminder(habitId, updates.title, updates.reminderTime);
      }
      
      toast.success('Habit Updated!', 'Your habit has been successfully updated.');
      
      // Refresh habits list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) {
      toast.error('Error', 'You must be signed in to delete habits');
      throw new Error('User not authenticated');
    }

    try {
      // Cancel notification
      await cancelHabitReminder(habitId);

      // Delete completions first
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id);

      // Then delete habit
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to delete habit:', error);
        toast.error('Error', 'Failed to delete habit');
        throw error;
      }
      
      toast.success('Habit Deleted', 'The habit has been removed from your routine.');
      
      // Refresh habits list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const toggleHabitCompletion = async (habitId: string, date?: string) => {
    if (!user) {
      toast.error('Error', 'You must be signed in to track habits');
      throw new Error('User not authenticated');
    }

    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const habit = habits.find(h => h.id === habitId);
      
      if (!habit) {
        toast.error('Error', 'Habit not found');
        return;
      }

      const existingCompletion = habit.completions.find(c => c.date === targetDate);
      
      if (existingCompletion) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existingCompletion.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Failed to remove completion:', error);
          toast.error('Error', 'Failed to update habit completion');
          throw error;
        }

        toast.info('Completion Removed', `Unmarked "${habit.title}" for today.`);
      } else {
        // Add completion
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            date: targetDate,
            completed_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Failed to add completion:', error);
          toast.error('Error', 'Failed to mark habit as complete');
          throw error;
        }

        toast.success('Great Job!', `"${habit.title}" completed for today! 🎉`);
      }
      
      // Refresh habits list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const getHabitCompletions = (habitId: string): HabitCompletion[] => {
    const habit = habits.find(h => h.id === habitId);
    return habit?.completions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompletions = habits.reduce((acc, habit) => 
      acc + (habit.completions.some(c => c.date === today) ? 1 : 0), 0
    );
    
    return {
      completed: todayCompletions,
      remaining: habits.length - todayCompletions,
      total: habits.length,
    };
  };

  const getStreakStats = () => {
    const activeStreaks = habits.map(habit => {
      const completions = habit.completions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      let checkDate = new Date(today);
      
      // Calculate current streak
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completions.some(c => c.date === dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      // Calculate longest streak
      completions.forEach((completion, index) => {
        if (index === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(completions[index - 1].date);
          const currDate = new Date(completion.date);
          const dayDiff = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      });
      longestStreak = Math.max(longestStreak, tempStreak);
      
      return { habit, currentStreak, longestStreak };
    });

    return {
      active: activeStreaks.filter(s => s.currentStreak > 0),
      longest: Math.max(...activeStreaks.map(s => s.longestStreak), 0),
    };
  };

  const getAllCompletions = (): HabitCompletion[] => {
    return habits.flatMap(habit => habit.completions)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getOverallStats = () => {
    const totalCompletions = habits.reduce((acc, habit) => acc + habit.completions.length, 0);
    const totalPossibleDays = habits.reduce((acc, habit) => {
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      return acc + daysSinceCreation;
    }, 0);

    return {
      totalHabits: habits.length,
      totalCompletions,
      averageCompletionRate: totalPossibleDays > 0 ? (totalCompletions / totalPossibleDays) * 100 : 0,
    };
  };

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const exportData = async () => {
    if (!user) {
      toast.error('Error', 'You must be signed in to export data');
      return null;
    }

    try {
      const exportData = {
        habits: habits.map(habit => ({
          title: habit.title,
          description: habit.description,
          color: habit.color,
          icon: habit.icon,
          frequency: habit.frequency,
          reminderTime: habit.reminderTime,
          createdAt: habit.createdAt.toISOString(),
          completions: habit.completions.map(comp => ({
            date: comp.date,
            completedAt: comp.completedAt.toISOString(),
            notes: comp.notes,
          })),
        })),
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      toast.success('Export Ready', 'Your habit data has been prepared for export.');
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Error', 'Failed to export habit data');
      return null;
    }
  };

  return {
    habits,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitCompletions,
    getTodayStats,
    getStreakStats,
    getAllCompletions,
    getOverallStats,
    refresh,
    exportData,
  };
}