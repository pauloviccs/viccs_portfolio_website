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
                    id: string
                    client_id: string
                    title: string
                    description: string | null
                    priority: string
                    whatsapp: string | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    title: string
                    description?: string | null
                    priority?: string
                    whatsapp?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    title?: string
                    description?: string | null
                    priority?: string
                    whatsapp?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            order_messages: {
                Row: {
                    id: string
                    order_id: string
                    user_id: string
                    content: string
                    is_admin: boolean
                    attachments: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    user_id: string
                    content: string
                    is_admin?: boolean
                    attachments?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    user_id?: string
                    content?: string
                    is_admin?: boolean
                    attachments?: string[] | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "order_messages_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    }
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
