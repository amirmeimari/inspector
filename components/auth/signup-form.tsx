"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"

interface SignupFormProps {
  onSubmit: (data: SignupData) => void
  loading?: boolean
  initialEmail?: string
  initialPhone?: string
}

export interface SignupData {
  firstName: string
  lastName: string
  email: string
  phone: string
  accountType: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
  receiveUpdates: boolean
}

export function SignupForm({ onSubmit, loading, initialEmail, initialPhone }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    email: initialEmail || "",
    phone: initialPhone || "",
    accountType: "inspector", // Set a default value
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    receiveUpdates: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy")
      return
    }
    onSubmit(formData)
  }

  const updateFormData = (field: keyof SignupData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => updateFormData("firstName", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => updateFormData("lastName", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email Address</label>
          <Input
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            disabled={!!initialEmail}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <Input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => updateFormData("phone", e.target.value)}
            disabled={!!initialPhone}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Account Type</label>
          <Select value={formData.accountType} onValueChange={(value) => updateFormData("accountType", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inspector">Inspector</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="homeowner">Homeowner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
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

        <div>
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData("confirmPassword", e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => updateFormData("agreeToTerms", !!checked)}
          />
          <label htmlFor="terms" className="text-sm leading-none">
            I agree to the{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="updates"
            checked={formData.receiveUpdates}
            onCheckedChange={(checked) => updateFormData("receiveUpdates", !!checked)}
          />
          <label htmlFor="updates" className="text-sm leading-none">
            Send me updates about new features and inspection tips
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !formData.agreeToTerms}>
        Create Account
      </Button>
    </form>
  )
}
