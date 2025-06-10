"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Camera, Settings } from "lucide-react"

export default function RootPage() {
  const { user, loading, isConfigured } = useAuth()
  const router = useRouter()

  // Add proper redirect logic to prevent accessing private pages when logged out
  useEffect(() => {
    if (!loading && isConfigured) {
      if (user) {
        router.push("/home")
      } else {
        router.replace("/sign-in") // Use replace instead of push to prevent back navigation
      }
    }
  }, [user, loading, router, isConfigured])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  // Show demo mode if Supabase is not configured
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">Crack Capture</h1>
              <p className="text-gray-600">Professional structural inspection tool</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Demo Mode</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Supabase is not configured. You can still test the camera and AI analysis features.
              </p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => router.push("/camera")}>
                <Camera className="w-4 h-4 mr-2" />
                Start Demo Inspection
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open("https://supabase.com/docs/guides/getting-started", "_blank")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Setup Supabase
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Camera and photo upload functionality</p>
              <p>• AI-powered crack analysis with Gemini</p>
              <p>• Full inspection workflow</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
