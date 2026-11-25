// Gerado com o gerador de tipos do Supabase (projeto kyn-kids-loja). Gere de novo após mudar o schema.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      melhor_envio_credentials: {
        Row: {
          access_token: string
          expires_at: string
          id: string
          refresh_expires_at: string
          refresh_token: string
          scope: string | null
          token_type: string
          updated_at: string
        }
        Insert: {
          access_token: string
          expires_at: string
          id?: string
          refresh_expires_at: string
          refresh_token: string
          scope?: string | null
          token_type?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          expires_at?: string
          id?: string
          refresh_expires_at?: string
          refresh_token?: string
          scope?: string | null
          token_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_admins: {
        Row: {
          created_at: string
          email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          user_id?: string
        }
        Relationships: []
      }
      store_catalog_variants: {
        Row: {
          active: boolean
          color: string
          product_id: string
          product_name: string
          size_label: string
          stock: number
          unit_price: number
          variant_index: number
        }
        Insert: {
          active?: boolean
          color?: string
          product_id: string
          product_name: string
          size_label: string
          stock?: number
          unit_price: number
          variant_index: number
        }
        Update: {
          active?: boolean
          color?: string
          product_id?: string
          product_name?: string
          size_label?: string
          stock?: number
          unit_price?: number
          variant_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_catalog_variants_product_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_order_items: {
        Row: {
          color: string
          id: string
          line_total: number
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          size_label: string
          unit_price: number
          variant_index: number | null
        }
        Insert: {
          color?: string
          id?: string
          line_total: number
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          size_label: string
          unit_price: number
          variant_index?: number | null
        }
        Update: {
          color?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          size_label?: string
          unit_price?: number
          variant_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "store_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          address_line: string
          address_number: string
          city: string
          complement: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_document: string | null
          customer_phone: string
          delivery_method: string
          fulfillment_status: string
          id: string
          neighborhood: string
          order_number: string
          payment_method: string
          payment_status: string
          shipping_fee: number
          shipping_status: string
          state: string
          subtotal: number
          total: number
          zip_code: string
        }
        Insert: {
          address_line: string
          address_number: string
          city: string
          complement?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_document?: string | null
          customer_phone: string
          delivery_method: string
          fulfillment_status?: string
          id?: string
          neighborhood: string
          order_number?: string
          payment_method: string
          payment_status?: string
          shipping_fee?: number
          shipping_status?: string
          state: string
          subtotal: number
          total: number
          zip_code: string
        }
        Update: {
          address_line?: string
          address_number?: string
          city?: string
          complement?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_document?: string | null
          customer_phone?: string
          delivery_method?: string
          fulfillment_status?: string
          id?: string
          neighborhood?: string
          order_number?: string
          payment_method?: string
          payment_status?: string
          shipping_fee?: number
          shipping_status?: string
          state?: string
          subtotal?: number
          total?: number
          zip_code?: string
        }
        Relationships: []
      }
      store_products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          name: string
          position: number
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description?: string | null
          id: string
          image_url: string
          name: string
          position?: number
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_store_admin: { Args: never; Returns: boolean }
      is_valid_cpf: { Args: { p_cpf: string }; Returns: boolean }
      submit_store_order: {
        Args: {
          p_customer: Json
          p_delivery_method: string
          p_items: Json
          p_payment_method: string
        }
        Returns: Json
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
