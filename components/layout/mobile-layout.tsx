"use client"

import { cn } from "@/lib/utils"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { Header } from "./header"
import { BottomNavigation } from "./bottom-navigation"

interface MobileLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  showBottomNav?: boolean
}

export function MobileLayout({
  children,
  title = "Crack Capture",
  showBackButton = false,
  onBack,
  showBottomNav = true,
}: MobileLayoutProps) {
  const { user, loading, isConfigured } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  // In demo mode (Supabase not configured), don't show bottom nav for auth-required pages
  const shouldShowBottomNav = showBottomNav && (isConfigured ? user : true)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={title} showBackButton={showBackButton} onBack={onBack} />
      <main className={cn("flex-1", shouldShowBottomNav && "pb-16")}>{children}</main>
      {shouldShowBottomNav && <BottomNavigation />}
    </div>
  )
}
