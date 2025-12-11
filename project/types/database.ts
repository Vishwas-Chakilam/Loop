export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          color: string;
          icon: string;
          frequency: 'daily' | 'weekly' | 'custom';
          reminder_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          color: string;
          icon: string;
          frequency: 'daily' | 'weekly' | 'custom';
          reminder_time: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          color?: string;
          icon?: string;
          frequency?: 'daily' | 'weekly' | 'custom';
          reminder_time?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          notes: string | null;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          notes?: string | null;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          date?: string;
          notes?: string | null;
          completed_at?: string;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          dark_mode: boolean;
          notifications_enabled: boolean;
          reminder_sound: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dark_mode?: boolean;
          notifications_enabled?: boolean;
          reminder_sound?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dark_mode?: boolean;
          notifications_enabled?: boolean;
          reminder_sound?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}