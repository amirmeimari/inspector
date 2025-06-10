"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Settings, User, Bell, Shield, LogOut } from "lucide-react"

export default function SettingsPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in")
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    // signOut function now handles the redirect
  }

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
    <MobileLayout title="Settings">
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <Settings className="w-16 h-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid gap-4">
          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <User className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Profile</h3>
                <p className="text-sm text-gray-600">
                  {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <Bell className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-gray-600">Manage notification preferences</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="flex items-center p-6">
              <Shield className="h-8 w-8 mr-4" />
              <div>
                <h3 className="font-semibold">Privacy & Security</h3>
                <p className="text-sm text-gray-600">Account security settings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6">
          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
