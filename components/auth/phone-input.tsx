"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PhoneInputProps {
  onSubmit: (phone: string) => void
  loading?: boolean
  cooldown?: number
}

export function PhoneInput({ onSubmit, loading, cooldown = 0 }: PhoneInputProps) {
  const [phoneNumber, setPhoneNumber] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.trim()) {
      // Format the phone number properly for Supabase
      // Remove any non-digit characters and add +1
      const formattedPhone = "+1" + phoneNumber.replace(/\D/g, "")
      onSubmit(formattedPhone)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone Number</label>
        <div className="flex gap-2">
          <div className="w-16 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">+1</div>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1"
            required
          />
        </div>
        <p className="text-sm text-gray-600">{"We'll send you a verification code via SMS"}</p>
      </div>
      <Button type="submit" className="w-full" disabled={loading || cooldown > 0}>
        {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Send Verification Code"}
      </Button>
    </form>
  )
}
