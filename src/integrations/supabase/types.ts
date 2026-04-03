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
      birthday_spins: {
        Row: {
          created_at: string
          id: string
          location_id: string | null
          prize_type: string
          prize_value: string
          spin_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id?: string | null
          prize_type: string
          prize_value: string
          spin_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string | null
          prize_type?: string
          prize_value?: string
          spin_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "birthday_spins_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_owner_access: {
        Row: {
          created_at: string
          id: string
          location_id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_owner_access_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          city: string
          created_at: string
          hours: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          pin_code: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          hours?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          pin_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          hours?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          pin_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          related_visit_id: string | null
          type: Database["public"]["Enums"]["points_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          related_visit_id?: string | null
          type: Database["public"]["Enums"]["points_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_visit_id?: string | null
          type?: Database["public"]["Enums"]["points_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_related_visit_id_fkey"
            columns: ["related_visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      prepaid_balances: {
        Row: {
          balance: number
          bonus_credits: number
          created_at: string
          id: string
          last_load_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          bonus_credits?: number
          created_at?: string
          id?: string
          last_load_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          bonus_credits?: number
          created_at?: string
          id?: string
          last_load_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          favorite_location_id: string | null
          id: string
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          name: string | null
          phone: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          favorite_location_id?: string | null
          id?: string
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          name?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          favorite_location_id?: string | null
          id?: string
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          name?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_favorite_location"
            columns: ["favorite_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          location_id: string | null
          members_only: boolean
          start_date: string
          title: string
          type: Database["public"]["Enums"]["promo_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          members_only?: boolean
          start_date?: string
          title: string
          type?: Database["public"]["Enums"]["promo_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          members_only?: boolean
          start_date?: string
          title?: string
          type?: Database["public"]["Enums"]["promo_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_cards: {
        Row: {
          completed_cards: number
          created_at: string
          id: string
          last_punch_at: string | null
          punches_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_cards?: number
          created_at?: string
          id?: string
          last_punch_at?: string | null
          punches_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_cards?: number
          created_at?: string
          id?: string
          last_punch_at?: string | null
          punches_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vip_memberships: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          plan_type: Database["public"]["Enums"]["vip_plan"]
          start_date: string
          status: Database["public"]["Enums"]["vip_status"]
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["vip_plan"]
          start_date?: string
          status?: Database["public"]["Enums"]["vip_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["vip_plan"]
          start_date?: string
          status?: Database["public"]["Enums"]["vip_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          amount_spent: number
          created_at: string
          id: string
          location_id: string
          points_earned: number
          user_id: string
          visited_at: string
        }
        Insert: {
          amount_spent?: number
          created_at?: string
          id?: string
          location_id: string
          points_earned?: number
          user_id: string
          visited_at?: string
        }
        Update: {
          amount_spent?: number
          created_at?: string
          id?: string
          location_id?: string
          points_earned?: number
          user_id?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_location_owner: {
        Args: { _location_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "location_owner" | "user"
      membership_tier: "free" | "vip"
      points_type: "earn" | "redeem"
      promo_type: "discount" | "points_multiplier" | "free_item" | "flash_deal"
      vip_plan: "monthly" | "yearly"
      vip_status: "active" | "canceled" | "expired"
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
    Enums: {
      app_role: ["admin", "location_owner", "user"],
      membership_tier: ["free", "vip"],
      points_type: ["earn", "redeem"],
      promo_type: ["discount", "points_multiplier", "free_item", "flash_deal"],
      vip_plan: ["monthly", "yearly"],
      vip_status: ["active", "canceled", "expired"],
    },
  },
} as const
