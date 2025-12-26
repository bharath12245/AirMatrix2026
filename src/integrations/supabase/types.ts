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
      bookings: {
        Row: {
          aircraft: string | null
          airline: string
          airline_code: string
          arrival_time: string
          base_fare: number
          booking_reference: string
          cancellation_reason: string | null
          cancelled_at: string | null
          class_type: string
          convenience_fee: number
          created_at: string
          departure_time: string
          destination_city: string
          destination_code: string
          duration: string
          flight_id: string
          flight_number: string
          id: string
          origin_city: string
          origin_code: string
          passengers: Json
          payment_method: string | null
          refund_amount: number | null
          refund_status: string | null
          seat_charges: number
          seats: Json
          status: string
          taxes: number
          total_amount: number
          updated_at: string
          user_email: string
        }
        Insert: {
          aircraft?: string | null
          airline: string
          airline_code: string
          arrival_time: string
          base_fare: number
          booking_reference: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          class_type?: string
          convenience_fee?: number
          created_at?: string
          departure_time: string
          destination_city: string
          destination_code: string
          duration: string
          flight_id: string
          flight_number: string
          id?: string
          origin_city: string
          origin_code: string
          passengers?: Json
          payment_method?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          seat_charges?: number
          seats?: Json
          status?: string
          taxes?: number
          total_amount: number
          updated_at?: string
          user_email: string
        }
        Update: {
          aircraft?: string | null
          airline?: string
          airline_code?: string
          arrival_time?: string
          base_fare?: number
          booking_reference?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          class_type?: string
          convenience_fee?: number
          created_at?: string
          departure_time?: string
          destination_city?: string
          destination_code?: string
          duration?: string
          flight_id?: string
          flight_number?: string
          id?: string
          origin_city?: string
          origin_code?: string
          passengers?: Json
          payment_method?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          seat_charges?: number
          seats?: Json
          status?: string
          taxes?: number
          total_amount?: number
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      fare_history: {
        Row: {
          airline: string | null
          cabin_class: string | null
          created_at: string
          departure_date: string
          destination_code: string
          duration_minutes: number | null
          fare_inr: number
          flight_number: string | null
          id: string
          origin_code: string
          search_timestamp: string
          stops: number | null
        }
        Insert: {
          airline?: string | null
          cabin_class?: string | null
          created_at?: string
          departure_date: string
          destination_code: string
          duration_minutes?: number | null
          fare_inr: number
          flight_number?: string | null
          id?: string
          origin_code: string
          search_timestamp?: string
          stops?: number | null
        }
        Update: {
          airline?: string | null
          cabin_class?: string | null
          created_at?: string
          departure_date?: string
          destination_code?: string
          duration_minutes?: number | null
          fare_inr?: number
          flight_number?: string | null
          id?: string
          origin_code?: string
          search_timestamp?: string
          stops?: number | null
        }
        Relationships: []
      }
      flight_searches: {
        Row: {
          cabin_class: string | null
          departure_date: string
          destination_city: string
          destination_code: string
          id: string
          lowest_fare_found: number | null
          origin_city: string
          origin_code: string
          passengers: number | null
          return_date: string | null
          search_timestamp: string
        }
        Insert: {
          cabin_class?: string | null
          departure_date: string
          destination_city: string
          destination_code: string
          id?: string
          lowest_fare_found?: number | null
          origin_city: string
          origin_code: string
          passengers?: number | null
          return_date?: string | null
          search_timestamp?: string
        }
        Update: {
          cabin_class?: string | null
          departure_date?: string
          destination_city?: string
          destination_code?: string
          id?: string
          lowest_fare_found?: number | null
          origin_city?: string
          origin_code?: string
          passengers?: number | null
          return_date?: string | null
          search_timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
