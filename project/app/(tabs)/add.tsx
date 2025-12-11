import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Bell, Clock } from 'lucide-react-native';
import { ColorPicker } from '@/components/ColorPicker';
import { IconPicker } from '@/components/IconPicker';
import { FrequencySelector } from '@/components/FrequencySelector';
import { useSupabaseHabits } from '@/hooks/useSupabaseHabits';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/utils/toast';
import type { Habit } from '@/types/habit';

export default function AddHabitScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { addHabit } = useSupabaseHabits();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors.primary);
  const [selectedIcon, setSelectedIcon] = useState('target');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showTimePicker, setShowTimePicker] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Error', 'You must be signed in to create habits');
      return;
    }

    if (!title.trim()) {
      toast.error('Error', 'Please enter a habit title');
      return;
    }

    setIsLoading(true);

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
      const newHabit: Omit<Habit, 'id' | 'completions'> = {
        title: title.trim(),
        description: description.trim(),
        color: selectedColor,
        icon: selectedIcon,
        frequency,
        reminderTime,
        createdAt: new Date(),
        isActive: true,
      };

      await addHabit(newHabit);

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedColor(colors.primary);
      setSelectedIcon('target');
      setFrequency('daily');
      setReminderTime('09:00');

      // Navigate back to home tab with a small delay to ensure data is loaded
      setTimeout(() => {
        router.push('/(tabs)');
      }, 500);
    } catch (error) {
      console.error('Failed to create habit:', error);
      toast.error('Error', 'Failed to create habit');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Create New Habit</Text>
        <Text style={styles.subtitle}>Build better routines, one habit at a time</Text>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Habit Name *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Drink 8 glasses of water"
                placeholderTextColor={colors.textSecondary}
                maxLength={50}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add some details about your habit..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>

          {/* Customization */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customization</Text>

            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />

            <IconPicker
              selectedIcon={selectedIcon}
              onIconSelect={setSelectedIcon}
              color={selectedColor}
            />
          </View>

          {/* Frequency & Reminders */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>

            <FrequencySelector
              frequency={frequency}
              onFrequencyChange={setFrequency}
            />

            <View style={styles.reminderContainer}>
              <View style={styles.reminderHeader}>
                <Bell size={20} color={colors.text} strokeWidth={2} />
                <Text style={styles.reminderLabel}>Daily Reminder</Text>
              </View>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={16} color={colors.primary} strokeWidth={2} />
                <Text style={styles.timeText}>{reminderTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.createButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating...' : 'Create Habit'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>Select Reminder Time</Text>

            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                value={reminderTime.split(':')[0]}
                onChangeText={(text) => {
                  const hours = parseInt(text) || 0;
                  if (hours >= 0 && hours <= 23) {
                    setReminderTime(`${text.padStart(2, '0')}:${reminderTime.split(':')[1]}`);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="HH"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={reminderTime.split(':')[1]}
                onChangeText={(text) => {
                  const minutes = parseInt(text) || 0;
                  if (minutes >= 0 && minutes <= 59) {
                    setReminderTime(`${reminderTime.split(':')[0]}:${text.padStart(2, '0')}`);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.timePickerButtons}>
              <TouchableOpacity
                style={[styles.timePickerButton, styles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timePickerButton, styles.confirmButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reminderContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  createButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  timePickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 300,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timeInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    minWidth: 60,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 8,
  },
  timePickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});