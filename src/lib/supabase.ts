import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          subject: string;
          topic: string;
          difficulty: string;
          duration_minutes: number;
          content: any;
          summary: string | null;
          resources: any;
          exercises: any;
          tags: string[];
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          subject: string;
          topic: string;
          difficulty: string;
          duration_minutes: number;
          content: any;
          summary?: string | null;
          resources?: any;
          exercises?: any;
          tags?: string[];
          created_at?: string;
          created_by: string;
        };
        Update: {
          title?: string;
          subject?: string;
          topic?: string;
          difficulty?: string;
          duration_minutes?: number;
          content?: any;
          summary?: string | null;
          resources?: any;
          exercises?: any;
          tags?: string[];
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          progress: number;
          time_spent: number;
          completed: boolean;
          score: number | null;
          last_position: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          progress?: number;
          time_spent?: number;
          completed?: boolean;
          score?: number | null;
          last_position?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          progress?: number;
          time_spent?: number;
          completed?: boolean;
          score?: number | null;
          last_position?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      qa_history: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          answer: string;
          lesson_id: string | null;
          references: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          answer: string;
          lesson_id?: string | null;
          references?: any;
          created_at?: string;
        };
        Update: {
          question?: string;
          answer?: string;
          lesson_id?: string | null;
          references?: any;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];