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
            languages: {
                Row: {
                    created_at: string | null
                    flag: string | null
                    id: string
                    level: number | null
                    name: string
                    sort_order: number | null
                }
                Insert: {
                    created_at?: string | null
                    flag?: string | null
                    id?: string
                    level?: number | null
                    name: string
                    sort_order?: number | null
                }
                Update: {
                    created_at?: string | null
                    flag?: string | null
                    id?: string
                    level?: number | null
                    name?: string
                    sort_order?: number | null
                }
                Relationships: []
            }
            order_messages: {
                Row: {
                    attachments: string[] | null
                    content: string
                    created_at: string
                    id: string
                    is_admin: boolean | null
                    order_id: string
                    user_id: string
                }
                Insert: {
                    attachments?: string[] | null
                    content: string
                    created_at?: string
                    id?: string
                    is_admin?: boolean | null
                    order_id: string
                    user_id: string
                }
                Update: {
                    attachments?: string[] | null
                    content?: string
                    created_at?: string
                    id?: string
                    is_admin?: boolean | null
                    order_id?: string
                    user_id?: string
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
            orders: {
                Row: {
                    budget_range: string | null
                    client_id: string
                    created_at: string | null
                    deadline: string | null
                    description: string
                    id: string
                    priority: string | null
                    status: Database["public"]["Enums"]["order_status"] | null
                    title: string
                    updated_at: string | null
                    whatsapp: string | null
                }
                Insert: {
                    budget_range?: string | null
                    client_id: string
                    created_at?: string | null
                    deadline?: string | null
                    description: string
                    id?: string
                    priority?: string | null
                    status?: Database["public"]["Enums"]["order_status"] | null
                    title: string
                    updated_at?: string | null
                    whatsapp?: string | null
                }
                Update: {
                    budget_range?: string | null
                    client_id?: string
                    created_at?: string | null
                    deadline?: string | null
                    description?: string
                    id?: string
                    priority?: string | null
                    status?: Database["public"]["Enums"]["order_status"] | null
                    title?: string
                    updated_at?: string | null
                    whatsapp?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
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
            site_settings: {
                Row: {
                    bio_text: string | null
                    id: string
                    profile_image_url: string | null
                    updated_at: string | null
                    years_experience: number | null
                }
                Insert: {
                    bio_text?: string | null
                    id?: string
                    profile_image_url?: string | null
                    updated_at?: string | null
                    years_experience?: number | null
                }
                Update: {
                    bio_text?: string | null
                    id?: string
                    profile_image_url?: string | null
                    updated_at?: string | null
                    years_experience?: number | null
                }
                Relationships: []
            }
            skills: {
                Row: {
                    category: string | null
                    created_at: string | null
                    id: string
                    level: number | null
                    name: string
                    sort_order: number | null
                }
                Insert: {
                    category?: string | null
                    created_at?: string | null
                    id?: string
                    level?: number | null
                    name: string
                    sort_order?: number | null
                }
                Update: {
                    category?: string | null
                    created_at?: string | null
                    id?: string
                    level?: number | null
                    name?: string
                    sort_order?: number | null
                }
                Relationships: []
            }
            tools: {
                Row: {
                    created_at: string | null
                    icon_url: string | null
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    icon_url?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string | null
                    icon_url?: string | null
                    id?: string
                    name?: string
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

// Helper types
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"]
export type Skill = Database["public"]["Tables"]["skills"]["Row"]
export type Language = Database["public"]["Tables"]["languages"]["Row"]
export type Tool = Database["public"]["Tables"]["tools"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type Project = Database["public"]["Tables"]["projects"]["Row"]
