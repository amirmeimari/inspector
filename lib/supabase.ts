import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Provide fallback values or throw descriptive error
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables not configured. Using demo mode.")
}

// Use fallback URLs for demo purposes if env vars are missing
const url = supabaseUrl || "https://demo.supabase.co"
const key = supabaseAnonKey || "demo-key"

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false, // Disable auth persistence in demo mode
  },
})

export type AuthUser = {
  id: string
  email?: string
  phone?: string
  user_metadata: {
    first_name?: string
    last_name?: string
  }
}

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
