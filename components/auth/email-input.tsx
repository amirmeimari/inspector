"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EmailInputProps {
  onSubmit: (email: string) => void
  loading?: boolean
  cooldown?: number
}

export function EmailInput({ onSubmit, loading, cooldown = 0 }: EmailInputProps) {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      onSubmit(email)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email Address</label>
        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-sm text-gray-600">{"We'll send you a verification code via email"}</p>
      </div>
      <Button type="submit" className="w-full" disabled={loading || cooldown > 0}>
        {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Send Verification Code"}
      </Button>
    </form>
  )
}
