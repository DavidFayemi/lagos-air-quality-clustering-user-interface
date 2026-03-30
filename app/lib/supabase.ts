import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Only warn in development, don't throw during build to prevent prerendering errors
if (
  process.env.NODE_ENV === "development" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
) {
  console.warn(
    "Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
        };
        Update: {
          email?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: "light" | "dark" | "system";
          default_filters: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: "light" | "dark" | "system";
          default_filters?: Record<string, unknown> | null;
        };
        Update: {
          theme?: "light" | "dark" | "system";
          default_filters?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
      saved_filters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          filters: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          filters: Record<string, unknown>;
        };
        Update: {
          name?: string;
          filters?: Record<string, unknown>;
        };
      };
      bookmarked_locations: {
        Row: {
          id: string;
          user_id: string;
          location_name: string;
          coordinates: {
            lat: number;
            lng: number;
          };
          cluster_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location_name: string;
          coordinates: {
            lat: number;
            lng: number;
          };
          cluster_id?: string | null;
        };
        Update: {
          location_name?: string;
          coordinates?: {
            lat: number;
            lng: number;
          };
          cluster_id?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          description: string | null;
          metadata: Record<string, unknown> | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          description?: string | null;
          metadata?: Record<string, unknown> | null;
        };
      };
    };
  };
};
