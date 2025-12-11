import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from 'react-native';
import { toast } from '@/utils/toast';

interface UserPreferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  reminderSound: string;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const systemColorScheme = useColorScheme();
  const [preferences, setPreferences] = useState<UserPreferences>({
    darkMode: systemColorScheme === 'dark',
    notificationsEnabled: true,
    reminderSound: 'default',
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          darkMode: data.dark_mode,
          notificationsEnabled: data.notifications_enabled,
          reminderSound: data.reminder_sound,
        });
      } else {
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const defaultPrefs = {
        user_id: user.id,
        dark_mode: systemColorScheme === 'dark',
        notifications_enabled: true,
        reminder_sound: 'default',
      };

      const { error } = await supabase
        .from('user_preferences')
        .insert(defaultPrefs);

      if (error) {
        console.error('Failed to create default preferences:', error);
        return;
      }

      setPreferences({
        darkMode: defaultPrefs.dark_mode,
        notificationsEnabled: defaultPrefs.notifications_enabled,
        reminderSound: defaultPrefs.reminder_sound,
      });
    } catch (error) {
      console.error('Failed to create default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) {
      toast.error('Error', 'You must be signed in to update preferences');
      return;
    }

    try {
      const updateData: any = {};
      if (updates.darkMode !== undefined) updateData.dark_mode = updates.darkMode;
      if (updates.notificationsEnabled !== undefined) updateData.notifications_enabled = updates.notificationsEnabled;
      if (updates.reminderSound !== undefined) updateData.reminder_sound = updates.reminderSound;

      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updateData,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Failed to update preferences:', error);
        toast.error('Error', 'Failed to update preferences');
        throw error;
      }

      // Update local state
      setPreferences(prev => ({ ...prev, ...updates }));

      // Show success message
      if (updates.darkMode !== undefined) {
        toast.success('Theme Updated', `Switched to ${updates.darkMode ? 'dark' : 'light'} mode.`);
      }
      if (updates.notificationsEnabled !== undefined) {
        toast.success(
          'Notifications Updated', 
          `Notifications ${updates.notificationsEnabled ? 'enabled' : 'disabled'}.`
        );
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    refresh: loadPreferences,
  };
}