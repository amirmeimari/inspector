"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, Folder, Search } from "lucide-react"

export default function GalleryPage() {
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
    <MobileLayout title="Gallery">
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-gray-600">View and manage your inspection photos</p>
        </div>

        <div className="grid gap-4">
          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <Folder className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Recent Photos</h3>
                <p className="text-sm text-gray-600">48 photos from this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <Search className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Search Photos</h3>
                <p className="text-sm text-gray-600">Find photos by date or tag</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <Folder className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">By Project</h3>
                <p className="text-sm text-gray-600">Organize by inspection project</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  )
}
