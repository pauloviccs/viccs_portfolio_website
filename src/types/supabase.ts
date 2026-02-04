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
            orders: {
                Row: {
                    budget_range: string | null
                    client_id: string
                    created_at: string | null
                    deadline: string | null
                    description: string
                    id: string
                    status: Database["public"]["Enums"]["order_status"] | null
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    budget_range?: string | null
                    client_id: string
                    created_at?: string | null
                    deadline?: string | null
                    description: string
                    id?: string
                    status?: Database["public"]["Enums"]["order_status"] | null
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    budget_range?: string | null
                    client_id?: string
                    created_at?: string | null
                    deadline?: string | null
                    description?: string
                    id?: string
                    status?: Database["public"]["Enums"]["order_status"] | null
                    title?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    full_name: string | null
                    id: string
                    role: Database["public"]["Enums"]["user_role"] | null
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id?: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            projects: {
                Row: {
                    category: string | null
                    client_name: string | null
                    completion_date: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    image_urls: string[] | null
                    tags: string[] | null
                    title: string
                }
                Insert: {
                    category?: string | null
                    client_name?: string | null
                    completion_date?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_urls?: string[] | null
                    tags?: string[] | null
                    title: string
                }
                Update: {
                    category?: string | null
                    client_name?: string | null
                    completion_date?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_urls?: string[] | null
                    tags?: string[] | null
                    title?: string
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
            order_status:
            | "pending"
            | "approved"
            | "in_progress"
            | "completed"
            | "cancelled"
            user_role: "admin" | "client"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
