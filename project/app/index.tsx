import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const { session, loading } = useAuth();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading) return;

      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        if (!hasSeenOnboarding) {
          router.replace('/(auth)/onboarding');
          return;
        }

        if (session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/signin');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        router.replace('/(auth)/onboarding');
      }
    };

    checkOnboarding();
  }, [session, loading]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});