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
      audit_log: {
        Row: {
          action: string
          action_type: string
          created_at: string
          id: string
          item_id: string | null
          new_value: Json | null
          old_value: Json | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          action_type?: string
          created_at?: string
          id?: string
          item_id?: string | null
          new_value?: Json | null
          old_value?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string
          created_at?: string
          id?: string
          item_id?: string | null
          new_value?: Json | null
          old_value?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          claim_date: string | null
          claimant_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          item_id: string
          last_name: string | null
          lost_date: string | null
          lost_location: string | null
          message: string
          phone: string | null
          reference_number: string | null
          staff_notes: string | null
          status: string | null
          updated_at: string | null
          venue: string | null
          verification_status: string | null
        }
        Insert: {
          claim_date?: string | null
          claimant_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          item_id: string
          last_name?: string | null
          lost_date?: string | null
          lost_location?: string | null
          message: string
          phone?: string | null
          reference_number?: string | null
          staff_notes?: string | null
          status?: string | null
          updated_at?: string | null
          venue?: string | null
          verification_status?: string | null
        }
        Update: {
          claim_date?: string | null
          claimant_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          item_id?: string
          last_name?: string | null
          lost_date?: string | null
          lost_location?: string | null
          message?: string
          phone?: string | null
          reference_number?: string | null
          staff_notes?: string | null
          status?: string | null
          updated_at?: string | null
          venue?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category: Database["public"]["Enums"]["item_category"]
          color: string | null
          contact_info: string | null
          container: string | null
          created_at: string | null
          date_lost_found: string
          description: string
          expiry_date: string | null
          id: string
          identifying_details: string | null
          image_url: string | null
          is_active: boolean | null
          is_anonymous: boolean | null
          location: string
          status: Database["public"]["Enums"]["item_status"]
          storage_date: string | null
          storage_location: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          venue: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["item_category"]
          color?: string | null
          contact_info?: string | null
          container?: string | null
          created_at?: string | null
          date_lost_found: string
          description: string
          expiry_date?: string | null
          id?: string
          identifying_details?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_anonymous?: boolean | null
          location: string
          status: Database["public"]["Enums"]["item_status"]
          storage_date?: string | null
          storage_location?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["item_category"]
          color?: string | null
          contact_info?: string | null
          container?: string | null
          created_at?: string | null
          date_lost_found?: string
          description?: string
          expiry_date?: string | null
          id?: string
          identifying_details?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_anonymous?: boolean | null
          location?: string
          status?: Database["public"]["Enums"]["item_status"]
          storage_date?: string | null
          storage_location?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          found_item_id: string | null
          id: string
          lost_item_id: string | null
          match_algorithm: string | null
          match_date: string | null
          match_score: number
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          found_item_id?: string | null
          id?: string
          lost_item_id?: string | null
          match_algorithm?: string | null
          match_date?: string | null
          match_score?: number
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          found_item_id?: string | null
          id?: string
          lost_item_id?: string | null
          match_algorithm?: string | null
          match_date?: string | null
          match_score?: number
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_found_item_id_fkey"
            columns: ["found_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_lost_item_id_fkey"
            columns: ["lost_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      storage: {
        Row: {
          created_at: string
          expiry_date: string | null
          item_id: string
          location: string
          notes: string | null
          storage_date: string
          storage_id: string
          stored_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          item_id: string
          location: string
          notes?: string | null
          storage_date?: string
          storage_id?: string
          stored_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          item_id?: string
          location?: string
          notes?: string | null
          storage_date?: string
          storage_id?: string
          stored_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "staff" | "student"
      item_category:
        | "electronics"
        | "clothing"
        | "accessories"
        | "books"
        | "keys"
        | "bags"
        | "documents"
        | "sports"
        | "other"
      item_status: "lost" | "found" | "claimed" | "returned"
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
      app_role: ["staff", "student"],
      item_category: [
        "electronics",
        "clothing",
        "accessories",
        "books",
        "keys",
        "bags",
        "documents",
        "sports",
        "other",
      ],
      item_status: ["lost", "found", "claimed", "returned"],
    },
  },
} as const
