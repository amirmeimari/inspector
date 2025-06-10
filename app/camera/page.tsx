"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useInspection } from "@/hooks/use-inspection"

export default function CameraPage() {
  const { user, loading } = useAuth()
  const { session, startInspection } = useInspection()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in")
      return
    }

    // Start inspection if no session exists
    if (user && !session) {
      console.log("Starting new inspection session")
      startInspection()
      setIsInitializing(false)
      return
    }

    setIsInitializing(false)

    // Redirect based on inspection status
    if (session) {
      console.log("Redirecting based on session status:", session.status)
      switch (session.status) {
        case "structure":
          router.replace("/camera/structure")
          break
        case "areas":
          router.replace("/camera/areas")
          break
        case "camera":
          router.replace("/camera/capture")
          break
        case "review":
          router.replace("/camera/review")
          break
        case "results":
          router.replace("/camera/results")
          break
        default:
          router.replace("/camera/structure")
      }
    } else {
      // Default to structure if no session status
      router.replace("/camera/structure")
    }
  }, [user, loading, session, router, startInspection])

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>
  )
}
