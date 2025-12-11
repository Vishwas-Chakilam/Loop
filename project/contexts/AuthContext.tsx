import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          await createUserPreferences(session?.user?.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserPreferences = async (userId?: string) => {
    if (!userId) return;

    try {
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingPrefs) {
        await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            dark_mode: false,
            notifications_enabled: true,
            reminder_sound: 'default',
          });
      }
    } catch (error) {
      console.log('User preferences already exist or error creating them');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error('Sign Up Failed', error.message);
        return { error };
      }

      if (data.user && !data.session) {
        toast.success(
          'Account Created!',
          'Please check your email to verify your account before signing in.'
        );
      } else {
        toast.success('Welcome!', 'Your account has been created successfully.');
      }

      return { error: null };
    } catch (error: any) {
      toast.error('Error', 'An unexpected error occurred');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Sign In Failed', error.message);
        return { error };
      }

      toast.success('Welcome back!', 'You have successfully signed in.');
      return { error: null };
    } catch (error: any) {
      toast.error('Error', 'An unexpected error occurred');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Sign Out Failed', error.message);
        throw error;
      }

      // Clear any stored data
      await AsyncStorage.clear();
      
      // Reset state
      setSession(null);
      setUser(null);
      
      toast.success('Signed Out', 'You have been successfully signed out.');
    } catch (error: any) {
      toast.error('Error', 'Failed to sign out');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myapp://reset-password',
      });

      if (error) {
        toast.error('Reset Failed', error.message);
        return { error };
      }

      toast.success(
        'Reset Link Sent',
        'Check your email for a password reset link.'
      );
      return { error: null };
    } catch (error: any) {
      toast.error('Error', 'An unexpected error occurred');
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}