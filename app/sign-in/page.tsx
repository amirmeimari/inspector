"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Mail, Phone, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type AuthMethod = "email" | "phone"

export default function SignInPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        [authMethod]: authMethod === "email" ? email : `+1${phone.replace(/\D/g, "")}`,
        password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          alert("Invalid email/phone or password. Please check your credentials.")
        } else {
          alert(`Sign in error: ${error.message}`)
        }
        return
      }

      router.replace("/home")
    } catch (error: any) {
      console.error("Error signing in:", error)
      alert(`Sign in error: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileLayout title="Sign In" showBackButton={false} showBottomNav={false}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue documenting structural issues</p>
          </div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          {authMethod === "email" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="flex gap-2">
                <div className="w-16 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                  +1
                </div>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="space-y-4 text-center">
          <p className="text-sm">
            {"Don't have an account?"}{" "}
            <Link href="/sign-up" className="underline font-medium">
              Create Account
            </Link>
          </p>

          <Button variant="link" onClick={() => setAuthMethod(authMethod === "email" ? "phone" : "email")}>
            {authMethod === "email" ? (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Sign in with Phone instead
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Sign in with Email instead
              </>
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
