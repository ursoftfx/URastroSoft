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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          active: boolean
          active_date: string
          author_id: string
          created_at: string
          id: string
          message: string
          rasi: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          active_date?: string
          author_id: string
          created_at?: string
          id?: string
          message: string
          rasi?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          active_date?: string
          author_id?: string
          created_at?: string
          id?: string
          message?: string
          rasi?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      astrologer_profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          charges_note: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string
          display_name: string
          earnings: number
          experience_years: number
          id: string
          is_online: boolean
          languages: string[]
          photo_url: string | null
          rate_per_minute: number
          rating_avg: number
          rating_count: number
          specialties: string[]
          status: Database["public"]["Enums"]["astrologer_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          charges_note?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          display_name: string
          earnings?: number
          experience_years?: number
          id?: string
          is_online?: boolean
          languages?: string[]
          photo_url?: string | null
          rate_per_minute?: number
          rating_avg?: number
          rating_count?: number
          specialties?: string[]
          status?: Database["public"]["Enums"]["astrologer_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          charges_note?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          display_name?: string
          earnings?: number
          experience_years?: number
          id?: string
          is_online?: boolean
          languages?: string[]
          photo_url?: string | null
          rate_per_minute?: number
          rating_avg?: number
          rating_count?: number
          specialties?: string[]
          status?: Database["public"]["Enums"]["astrologer_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      astrologer_reviews: {
        Row: {
          astrologer_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          session_id: string
          user_id: string
        }
        Insert: {
          astrologer_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          session_id: string
          user_id: string
        }
        Update: {
          astrologer_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "astrologer_reviews_astrologer_id_fkey"
            columns: ["astrologer_id"]
            isOneToOne: false
            referencedRelation: "astrologer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astrologer_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          session_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id: string
          session_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          amount: number
          astrologer_id: string
          created_at: string
          ended_at: string | null
          id: string
          minutes: number
          rate: number
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          astrologer_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          minutes?: number
          rate: number
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          astrologer_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          minutes?: number
          rate?: number
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_astrologer_id_fkey"
            columns: ["astrologer_id"]
            isOneToOne: false
            referencedRelation: "astrologer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_messages: {
        Row: {
          body: string
          consultation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          consultation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          consultation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          astrologer_id: string
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["consultation_mode"]
          question: string
          status: Database["public"]["Enums"]["consultation_status"]
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          astrologer_id: string
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["consultation_mode"]
          question: string
          status?: Database["public"]["Enums"]["consultation_status"]
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          astrologer_id?: string
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["consultation_mode"]
          question?: string
          status?: Database["public"]["Enums"]["consultation_status"]
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_astrologer_id_fkey"
            columns: ["astrologer_id"]
            isOneToOne: false
            referencedRelation: "astrologer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jathagam_leads: {
        Row: {
          birth_date: string
          birth_time: string
          created_at: string
          gender: string | null
          id: string
          lagna: string | null
          latitude: number | null
          longitude: number | null
          nakshatra: string | null
          name: string
          phone: string
          place_name: string
          rasi: string | null
          tz_offset_hours: number | null
          user_agent: string | null
        }
        Insert: {
          birth_date: string
          birth_time: string
          created_at?: string
          gender?: string | null
          id?: string
          lagna?: string | null
          latitude?: number | null
          longitude?: number | null
          nakshatra?: string | null
          name: string
          phone: string
          place_name: string
          rasi?: string | null
          tz_offset_hours?: number | null
          user_agent?: string | null
        }
        Update: {
          birth_date?: string
          birth_time?: string
          created_at?: string
          gender?: string | null
          id?: string
          lagna?: string | null
          latitude?: number | null
          longitude?: number | null
          nakshatra?: string | null
          name?: string
          phone?: string
          place_name?: string
          rasi?: string | null
          tz_offset_hours?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          body: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string
          photo_url: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone: string
          photo_url?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string
          photo_url?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_recharges: {
        Row: {
          amount: number
          created_at: string
          id: string
          reviewed_at: string | null
          status: string
          user_id: string
          utr: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          user_id: string
          utr: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          user_id?: string
          utr?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_recharge: {
        Args: { _approve: boolean; _id: string }
        Returns: undefined
      }
      end_chat: { Args: { _session: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      request_chat: { Args: { _astrologer_id: string }; Returns: string }
      respond_chat: {
        Args: { _accept: boolean; _session: string }
        Returns: undefined
      }
      submit_review: {
        Args: { _comment: string; _rating: number; _session: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      astrologer_status: "pending" | "approved" | "rejected"
      consultation_mode: "text" | "voice"
      consultation_status: "open" | "answered" | "closed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      astrologer_status: ["pending", "approved", "rejected"],
      consultation_mode: ["text", "voice"],
      consultation_status: ["open", "answered", "closed"],
    },
  },
} as const
