import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Animated, Share, Platform, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Moon, Sun, Download, Upload, Bell, Settings, LogOut, Award, Github, Linkedin } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { useSupabaseHabits } from '@/hooks/useSupabaseHabits';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/utils/toast';
import { requestNotificationPermissions } from '@/utils/notifications';

export default function ProfileScreen() {
  const { theme, colors, toggleTheme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const { habits, exportData } = useSupabaseHabits();
  const { preferences, updatePreferences, isLoading: preferencesLoading } = useUserPreferences();
  const [buttonScale] = useState(new Animated.Value(1));
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleDarkModeToggle = async () => {
    try {
      await toggleTheme();
    } catch (error) {
      console.error('Failed to update dark mode:', error);
      toast.error('Error', 'Failed to update theme setting');
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      if (value) {
        const { granted } = await requestNotificationPermissions();
        if (!granted) {
          toast.error('Permission Denied', 'Please enable notifications in your device settings.');
          return;
        }
      }

      await updatePreferences({ notificationsEnabled: value });
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast.error('Error', 'Failed to update notification setting');
    }
  };

  const generatePDFReport = async () => {
    try {
      const totalCompletions = habits.reduce((acc, habit) => acc + habit.completions.length, 0);
      const activeHabits = habits.filter(h => h.isActive).length;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Habit Tracker Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .title { font-size: 28px; font-weight: bold; color: #2E7D32; margin-bottom: 10px; }
            .subtitle { font-size: 16px; color: #666; }
            .stats { display: flex; justify-content: space-around; margin: 30px 0; }
            .stat { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #2E7D32; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            .section { margin: 30px 0; }
            .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
            .habit-item { margin: 15px 0; padding: 15px; border-left: 4px solid #2E7D32; background: #f9f9f9; }
            .habit-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
            .habit-description { font-size: 14px; color: #666; margin-bottom: 10px; }
            .habit-stats { font-size: 12px; color: #888; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Habit Tracker Report</div>
            <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-number">${activeHabits}</div>
              <div class="stat-label">Active Habits</div>
            </div>
            <div class="stat">
              <div class="stat-number">${totalCompletions}</div>
              <div class="stat-label">Total Completions</div>
            </div>
            <div class="stat">
              <div class="stat-number">${habits.length > 0 ? Math.round(totalCompletions / habits.length) : 0}</div>
              <div class="stat-label">Avg. Per Habit</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Your Habits</div>
            ${habits.map(habit => `
              <div class="habit-item" style="border-left-color: ${habit.color};">
                <div class="habit-title">${habit.title}</div>
                <div class="habit-description">${habit.description || 'No description'}</div>
                <div class="habit-stats">
                  Completions: ${habit.completions.length} | 
                  Frequency: ${habit.frequency} | 
                  Created: ${new Date(habit.createdAt).toLocaleDateString()}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <div>Generated by Loop - Habit Tracker</div>
            <div>Keep building better habits! 🌟</div>
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        // Create a temporary container to render the HTML
        const printWindow = window.open('', '', 'width=800,height=600');

        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();

          // Wait for content to load
          printWindow.onload = () => {
            // Trigger print dialog which allows "Save as PDF"
            printWindow.print();

            // Close the window after printing
            setTimeout(() => {
              printWindow.close();
            }, 1000);
          };

          // Manual trigger if onload doesn't fire
          setTimeout(() => {
            if (printWindow.document.readyState === 'complete') {
              printWindow.print();
            }
          }, 500);
        }
      } else {
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your habit report',
        });
      }

      toast.success('Report Generated', 'Your habit report has been created successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Error', 'Failed to generate PDF report');
    }
  };

  const handleExportData = async () => {
    try {
      const exportedData = await exportData();

      if (!exportedData) {
        return;
      }

      if (Platform.OS === 'web') {
        const blob = new Blob([exportedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `habit-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const fileName = `habit-data-${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(fileUri, exportedData, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Habit Data',
          UTI: 'public.json',
        });
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Error', 'Failed to export data');
    }
  };

  const handleImportData = () => {
    toast.info(
      'Import Data',
      'Import functionality will be available in a future update. You can manually restore from exported JSON files.'
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your habits and progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) return;

              // Delete all completions first
              await supabase
                .from('habit_completions')
                .delete()
                .eq('user_id', user.id);

              // Then delete all habits
              await supabase
                .from('habits')
                .delete()
                .eq('user_id', user.id);

              toast.success('Data Cleared', 'All your habits and progress have been deleted.');
            } catch (error) {
              console.error('Failed to clear data:', error);
              toast.error('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await signOut();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const totalCompletions = habits.reduce((acc, habit) => acc + habit.completions.length, 0);
  const activeHabits = habits.filter(h => h.isActive).length;

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info */}
        <Animated.View style={[styles.userSection, { opacity: 1 }]}>
          <View style={styles.avatar}>
            <User size={32} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.userName}>
            {user?.user_metadata?.full_name || 'Habit Tracker User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeHabits}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCompletions}</Text>
            <Text style={styles.statLabel}>Total Completions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {habits.length > 0 ? Math.round(totalCompletions / habits.length) : 0}
            </Text>
            <Text style={styles.statLabel}>Avg. Per Habit</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementCard}>
            <Award size={24} color="#FFD700" strokeWidth={2} />
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>Habit Builder</Text>
              <Text style={styles.achievementDescription}>
                You've created {activeHabits} habit{activeHabits !== 1 ? 's' : ''}!
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {isDark ? (
                <Moon size={20} color={colors.text} strokeWidth={2} />
              ) : (
                <Sun size={20} color={colors.text} strokeWidth={2} />
              )}
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.surface, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.text} strokeWidth={2} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              disabled={preferencesLoading}
              trackColor={{ false: colors.surface, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.actionButton} onPress={generatePDFReport}>
            <Download size={20} color={colors.primary} strokeWidth={2} />
            <Text style={styles.actionButtonText}>Export PDF Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <Download size={20} color={colors.primary} strokeWidth={2} />
            <Text style={styles.actionButtonText}>Export Data (JSON)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleImportData}>
            <Upload size={20} color={colors.primary} strokeWidth={2} />
            <Text style={styles.actionButtonText}>Import Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Settings size={20} color="#FF3B30" strokeWidth={2} />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut size={20} color="#FF3B30" strokeWidth={2} />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>


        {/* Developer Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <View style={styles.developerCard}>
            <View style={styles.developerHeader}>
              <View style={styles.developerAvatar}>
                <Text style={styles.developerInitials}>VC</Text>
              </View>
              <View>
                <Text style={styles.developerName}>Vishwas Chakilam</Text>
                <Text style={styles.developerRole}>Full Stack Developer</Text>
              </View>
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://github.com/vishwas-chakilam')}
              >
                <Github size={20} color={colors.text} />
                <Text style={styles.socialText}>GitHub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://linkedin.com/in/vishwas-chakilam')}
              >
                <Linkedin size={20} color="#0077B5" />
                <Text style={styles.socialText}>LinkedIn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Loop v1.0.0</Text>
          <Text style={styles.footerText}>Build better habits, one day at a time</Text>
        </View>
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
  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  achievementText: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: colors.surface,
  },
  dangerText: {
    color: '#FF3B30',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  developerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  developerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  developerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  developerInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  developerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  developerRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});