"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, BookOpen, Video } from "lucide-react"

export default function InstructionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in")
    }
  }, [user, loading, router])

  if (loading) {
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
    <MobileLayout title="Instructions">
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <FileText className="w-16 h-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold">Instructions</h1>
          <p className="text-gray-600">Learn how to use Crack Capture effectively</p>
        </div>

        <div className="grid gap-4">
          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Getting Started</h3>
                <p className="text-sm text-gray-600">Basic setup and first inspection</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <Video className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Video Tutorials</h3>
                <p className="text-sm text-gray-600">Step-by-step video guides</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <FileText className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Best Practices</h3>
                <p className="text-sm text-gray-600">Tips for effective documentation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  )
}
