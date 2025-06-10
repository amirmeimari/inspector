"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, FileText, ImageIcon, TrendingUp } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in")
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <MobileLayout title="Home">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Welcome back, {user?.user_metadata?.first_name || "User"}!</h1>
          <p className="text-gray-600">Ready to document structural issues?</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Inspections</CardTitle>
              <FileText className="h-4 w-4 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Photos Captured</CardTitle>
              <Camera className="h-4 w-4 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">+8 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues Documented</CardTitle>
              <TrendingUp className="h-4 w-4 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">+5 from last week</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Camera className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">New Inspection</span>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-50">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">View Gallery</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
