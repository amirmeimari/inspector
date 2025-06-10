"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, type AuthUser, isSupabaseConfigured } from "@/lib/supabase"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isConfigured: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    // Skip auth setup if Supabase is not configured
    if (!configured) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((session?.user as AuthUser) || null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser((session?.user as AuthUser) || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [configured])

  // Update the signOut function to properly clear session and redirect
  const signOut = async () => {
    if (configured) {
      await supabase.auth.signOut()
    }
    // Force a page reload to clear any cached state
    window.location.href = "/sign-in"
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isConfigured: configured }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
