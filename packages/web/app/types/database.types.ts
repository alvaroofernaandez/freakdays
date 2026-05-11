export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anime_list: {
        Row: {
          cover_url: string | null
          created_at: string | null
          current_episode: number | null
          end_date: string | null
          id: string
          notes: string | null
          rewatch_count: number | null
          score: number | null
          start_date: string | null
          status: string
          title: string
          total_episodes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          current_episode?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          rewatch_count?: number | null
          score?: number | null
          start_date?: string | null
          status: string
          title: string
          total_episodes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          current_episode?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          rewatch_count?: number | null
          score?: number | null
          start_date?: string | null
          status?: string
          title?: string
          total_episodes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_list_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manga_collection: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string | null
          id: string
          notes: string | null
          owned_volumes: number[] | null
          price_per_volume: number | null
          score: number | null
          status: string | null
          title: string
          total_cost: number | null
          total_volumes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          owned_volumes?: number[] | null
          price_per_volume?: number | null
          score?: number | null
          status?: string | null
          title: string
          total_cost?: number | null
          total_volumes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          owned_volumes?: number[] | null
          price_per_volume?: number | null
          score?: number | null
          status?: string | null
          title?: string
          total_cost?: number | null
          total_volumes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manga_collection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          invite_code: string | null
          max_members: number | null
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          max_members?: number | null
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          max_members?: number | null
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      party_anime_items: {
        Row: {
          added_by: string | null
          cover_url: string | null
          created_at: string
          current_episode: number
          end_date: string | null
          id: string
          list_id: string
          notes: string | null
          rewatch_count: number
          score: number | null
          start_date: string | null
          status: string
          title: string
          total_episodes: number | null
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          cover_url?: string | null
          created_at?: string
          current_episode?: number
          end_date?: string | null
          id?: string
          list_id: string
          notes?: string | null
          rewatch_count?: number
          score?: number | null
          start_date?: string | null
          status: string
          title: string
          total_episodes?: number | null
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          cover_url?: string | null
          created_at?: string
          current_episode?: number
          end_date?: string | null
          id?: string
          list_id?: string
          notes?: string | null
          rewatch_count?: number
          score?: number | null
          start_date?: string | null
          status?: string
          title?: string
          total_episodes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_anime_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_anime_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "party_shared_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      party_members: {
        Row: {
          id: string
          joined_at: string | null
          party_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          party_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          party_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_members_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      party_shared_lists: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string
          id: string
          list_type: string
          name: string
          party_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by: string
          id?: string
          list_type: string
          name: string
          party_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string
          id?: string
          list_type?: string
          name?: string
          party_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_shared_lists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_shared_lists_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          favorite_anime_id: string | null
          favorite_manga_id: string | null
          id: string
          level: number | null
          location: string | null
          social_links: Json | null
          total_exp: number | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          favorite_anime_id?: string | null
          favorite_manga_id?: string | null
          id: string
          level?: number | null
          location?: string | null
          social_links?: Json | null
          total_exp?: number | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          favorite_anime_id?: string | null
          favorite_manga_id?: string | null
          id?: string
          level?: number | null
          location?: string | null
          social_links?: Json | null
          total_exp?: number | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_favorite_anime_id_fkey"
            columns: ["favorite_anime_id"]
            isOneToOne: false
            referencedRelation: "anime_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_favorite_manga_id_fkey"
            columns: ["favorite_manga_id"]
            isOneToOne: false
            referencedRelation: "manga_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_completions: {
        Row: {
          completed_at: string | null
          exp_earned: number
          id: string
          quest_id: string
          streak_count: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          exp_earned: number
          id?: string
          quest_id: string
          streak_count?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          exp_earned?: number
          id?: string
          quest_id?: string
          streak_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_completions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          notification_type: string
          quest_id: string
          read_at: string | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          notification_type: string
          quest_id: string
          read_at?: string | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          quest_id?: string
          read_at?: string | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_notifications_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          difficulty: string
          due_date: string | null
          due_time: string | null
          exp_reward: number
          id: string
          is_recurring: boolean | null
          recurrence_pattern: string | null
          reminder_minutes_before: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          difficulty: string
          due_date?: string | null
          due_time?: string | null
          exp_reward: number
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          reminder_minutes_before?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          difficulty?: string
          due_date?: string | null
          due_time?: string | null
          exp_reward?: number
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          reminder_minutes_before?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      release_calendar: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_global: boolean | null
          notified: boolean | null
          release_date: string
          release_type: string
          title: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_global?: boolean | null
          notified?: boolean | null
          release_date: string
          release_type: string
          title: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_global?: boolean | null
          notified?: boolean | null
          release_date?: string
          release_type?: string
          title?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_calendar_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_modules: {
        Row: {
          enabled: boolean | null
          enabled_at: string | null
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          enabled?: boolean | null
          enabled_at?: string | null
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          enabled?: boolean | null
          enabled_at?: string | null
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_modules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          exercise_name: string
          id: string
          notes: string | null
          order_index: number | null
          reps: number | null
          sets: number | null
          weight_kg: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          order_index?: number | null
          reps?: number | null
          sets?: number | null
          weight_kg?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          order_index?: number | null
          reps?: number | null
          sets?: number | null
          weight_kg?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          reps: number | null
          rest_seconds: number | null
          set_number: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          set_number: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          set_number?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
          notes: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          workout_date: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          workout_date: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_overdue_quests: { Args: never; Returns: undefined }
      check_quests_due_soon: { Args: never; Returns: undefined }
      increment_exp: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      is_party_member: {
        Args: { party_uuid: string; user_uuid: string }
        Returns: boolean
      }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
      trigger_quest_notifications_check: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
