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
      debts: {
        Row: {
          amount: number
          created_at: string | null
          creditor_id: string
          debtor_id: string
          id: string
          is_settled: boolean | null
          origin_expense_id: string | null
          settled_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          creditor_id: string
          debtor_id: string
          id?: string
          is_settled?: boolean | null
          origin_expense_id?: string | null
          settled_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          creditor_id?: string
          debtor_id?: string
          id?: string
          is_settled?: boolean | null
          origin_expense_id?: string | null
          settled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debts_orig_creditor_id_fkey"
            columns: ["creditor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debts_orig_debtor_id_fkey"
            columns: ["debtor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debts_orig_origin_expense_id_fkey"
            columns: ["origin_expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          paid_by: string | null
          party_id: string | null
          restaurant_name: string | null
          tax_amount: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          paid_by?: string | null
          party_id?: string | null
          restaurant_name?: string | null
          tax_amount?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          paid_by?: string | null
          party_id?: string | null
          restaurant_name?: string | null
          tax_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "partys"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          follower_id: string
          followed_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          followed_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          followed_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          id: string
          item_name: string | null
          price: number | null
          restaurant_id: string
          verified_by_restaurant: boolean | null
        }
        Insert: {
          id?: string
          item_name?: string | null
          price?: number | null
          restaurant_id?: string
          verified_by_restaurant?: boolean | null
        }
        Update: {
          id?: string
          item_name?: string | null
          price?: number | null
          restaurant_id?: string
          verified_by_restaurant?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      partys: {
        Row: {
          created_at: string | null
          id: string
          leader_id: string | null
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          leader_id?: string | null
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          leader_id?: string | null
          name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partys_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: string
          is_official: boolean | null
          name: string
        }
        Insert: {
          id?: string
          is_official?: boolean | null
          name: string
        }
        Update: {
          id?: string
          is_official?: boolean | null
          name?: string
        }
        Relationships: []
      }
      splits: {
        Row: {
          amount_owed: number
          covered_by: string | null
          expense_id: string | null
          id: string
          payment_status:
            | Database["public"]["Enums"]["payment_status_types"]
            | null
          user_id: string | null
        }
        Insert: {
          amount_owed: number
          covered_by?: string | null
          expense_id?: string | null
          id?: string
          payment_status?:
            | Database["public"]["Enums"]["payment_status_types"]
            | null
          user_id?: string | null
        }
        Update: {
          amount_owed?: number
          covered_by?: string | null
          expense_id?: string | null
          id?: string
          payment_status?:
            | Database["public"]["Enums"]["payment_status_types"]
            | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "splits_covered_by_fkey"
            columns: ["covered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "splits_user_id_fkey"
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
      [_ in never]: never
    }
    Enums: {
      payment_status_types: "paid" | "unpaid" | "covered"
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
      payment_status_types: ["paid", "unpaid", "covered"],
    },
  },
} as const
