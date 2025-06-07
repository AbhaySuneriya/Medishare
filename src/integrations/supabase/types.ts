export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      medicines: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          expiry: string
          id: string
          image_url: string
          is_free: boolean
          latitude: number | null
          locality: string
          longitude: number | null
          name: string
          price: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          expiry: string
          id?: string
          image_url: string
          is_free?: boolean
          latitude?: number | null
          locality: string
          longitude?: number | null
          name: string
          price?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          expiry?: string
          id?: string
          image_url?: string
          is_free?: boolean
          latitude?: number | null
          locality?: string
          longitude?: number | null
          name?: string
          price?: number | null
          user_id?: string
        }
        Relationships: []
      }
      saved_medicines: {
        Row: {
          id: string
          medicine_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          medicine_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          medicine_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_medicines_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_medicines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_info"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      auth_users_info: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: never
          avatar_url?: never
          created_at?: string | null
          display_name?: never
          email?: string | null
          id?: string | null
          phone_number?: never
          updated_at?: string | null
        }
        Update: {
          address?: never
          avatar_url?: never
          created_at?: string | null
          display_name?: never
          email?: string | null
          id?: string | null
          phone_number?: never
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_user_account: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      get_user_donation_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      get_user_info: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      remove_expired_medicines: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
