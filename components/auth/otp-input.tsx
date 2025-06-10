"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OtpInputProps {
  onSubmit: (otp: string) => void
  onResend: () => void
  loading?: boolean
  expiresIn?: number
  cooldown?: number
}

export function OtpInput({ onSubmit, onResend, loading, expiresIn = 300, cooldown = 0 }: OtpInputProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(expiresIn)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleChange = (index: number, value: string) => {
    // Handle pasting of full OTP code
    if (value.length > 1) {
      // This might be a paste operation
      if (value.length === 6 && /^\d{6}$/.test(value)) {
        // If it's a 6-digit code, distribute it across inputs
        const digits = value.split("")
        const newOtp = [...otp]

        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit
        })

        setOtp(newOtp)

        // Focus the last input
        inputRefs.current[5]?.focus()
        return
      }

      // Otherwise just take the first character
      value = value.charAt(0)
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if all digits are filled
    if (value && index === 5 && newOtp.every((digit) => digit)) {
      // Small timeout to allow state to update
      setTimeout(() => {
        onSubmit(newOtp.join(""))
      }, 100)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")
    if (otpString.length === 6) {
      onSubmit(otpString)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="text-sm font-medium">6-Digit Code</label>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6} // Allow pasting full code
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg"
                autoComplete="one-time-code"
              />
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={loading || otp.join("").length !== 6}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </form>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">{"Didn't receive the code?"}</p>
        <Button variant="link" onClick={onResend} disabled={cooldown > 0 || loading}>
          {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Code"}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">Code expires in</p>
        <p className="text-2xl font-mono">{formatTime(timeLeft)}</p>
        {timeLeft === 0 && (
          <p className="text-sm text-red-500 mt-1">Code has expired. Please request a new one or skip verification.</p>
        )}
      </div>
    </div>
  )
}
