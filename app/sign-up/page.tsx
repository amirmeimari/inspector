"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { PhoneInput } from "@/components/auth/phone-input"
import { EmailInput } from "@/components/auth/email-input"
import { OtpInput } from "@/components/auth/otp-input"
import { SignupForm, type SignupData } from "@/components/auth/signup-form"
import { Button } from "@/components/ui/button"
import { Mail, Phone, User, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type AuthMethod = "phone" | "email"
type Step = "method" | "otp" | "complete"

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("method")
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email")
  const [contact, setContact] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [tempPassword, setTempPassword] = useState("")
  const [userCreated, setUserCreated] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  const handleSendOtp = async (contactInfo: string) => {
    if (cooldown > 0) {
      alert(`Please wait ${cooldown} seconds before requesting another code.`)
      return
    }

    setLoading(true)
    setErrorMessage("")
    try {
      // Generate a temporary password for the user
      const tempPass = `TempPass${Math.random().toString(36).substring(2, 10)}!`
      setTempPassword(tempPass)

      // Create user account with signUp (not OTP)
      const { data, error } = await supabase.auth.signUp({
        [authMethod]: contactInfo,
        password: tempPass,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            temp_signup: true, // Mark as temporary signup
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          alert(`An account with this ${authMethod} already exists. Please sign in instead.`)
          router.push("/sign-in")
          return
        }
        throw error
      }

      console.log("User created successfully:", data)
      setUserCreated(true)

      if (data.user) {
        setUserId(data.user.id)

        // Try to send OTP for verification
        try {
          const { error: otpError } = await supabase.auth.signInWithOtp({
            [authMethod]: contactInfo,
          })

          if (otpError) {
            console.warn("OTP sending failed:", otpError)

            // Check if it's a rate limiting error but OTP was actually sent
            if (otpError.message.includes("security purposes") || otpError.message.includes("rate limit")) {
              // Even if there's a rate limit error, the OTP might have been sent
              console.log("Rate limit detected, but proceeding to OTP verification")
              setContact(contactInfo)
              setStep("otp")
              setCooldown(30)
              return
            }

            // For other OTP errors, proceed to completion
            console.log("OTP failed with non-rate-limit error, proceeding to completion")
            setStep("complete")
            return
          }

          // OTP sent successfully
          console.log("OTP sent successfully")
          setCooldown(60)
          setContact(contactInfo)
          setStep("otp")
        } catch (otpError) {
          console.warn("OTP request failed, proceeding to completion:", otpError)
          setStep("complete")
        }
      }
    } catch (error: any) {
      console.error("Error during signup:", error)
      setErrorMessage(`Signup error: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setLoading(true)
    setErrorMessage("")
    try {
      // First try to sign in with the OTP
      const { data, error } = await supabase.auth.verifyOtp({
        [authMethod]: contact,
        token: otp,
        type: authMethod === "phone" ? "sms" : "email",
      })

      if (error) {
        console.error("OTP verification failed:", error)

        // If token expired, show specific message and option to skip
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          setErrorMessage(
            "Verification code has expired or is invalid. You can request a new code or continue without verification.",
          )
          return
        }

        setErrorMessage("Invalid verification code. Please try again or skip verification.")
        return
      }

      console.log("OTP verified successfully:", data)
      setStep("complete")
    } catch (error: any) {
      console.error("Error verifying OTP:", error)
      setErrorMessage("Verification failed. Please try again or skip verification.")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSignup = async (data: SignupData) => {
    setLoading(true)
    setErrorMessage("")
    try {
      // Get current session first
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        // If no session, try to sign in with the temporary password
        console.log("No session found, signing in with temp password")
        const { error: signInError } = await supabase.auth.signInWithPassword({
          [authMethod]: contact,
          password: tempPassword,
        })

        if (signInError) {
          console.error("Sign in with temp password failed:", signInError)

          // Try to sign in with admin access if we have the user ID
          if (userId) {
            console.log("Trying to create profile directly with user ID:", userId)

            // Insert profile data directly using the user ID
            const { error: profileError } = await supabase.from("profiles").insert({
              id: userId,
              first_name: data.firstName,
              last_name: data.lastName,
              phone: authMethod === "phone" ? contact : data.phone,
              email: authMethod === "email" ? contact : data.email,
              account_type: data.accountType,
            })

            if (profileError) {
              console.error("Profile insert error:", profileError)
              throw new Error("Unable to create profile. Please try again.")
            }

            // Try to sign in again with the new password
            const { error: finalSignInError } = await supabase.auth.signInWithPassword({
              [authMethod]: contact,
              password: data.password,
            })

            if (finalSignInError) {
              throw new Error("Account created but unable to sign in. Please try signing in manually.")
            }

            router.replace("/home")
            return
          }

          throw new Error("Unable to authenticate. Please try signing up again.")
        }
      }

      // Update user with proper password and metadata
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          account_type: data.accountType,
          temp_signup: false, // Remove temp flag
        },
      })

      if (updateError) throw updateError

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (userData.user) {
        // Insert profile data
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: userData.user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: authMethod === "phone" ? contact : data.phone,
          email: authMethod === "email" ? contact : data.email,
          account_type: data.accountType,
        })

        if (profileError) {
          console.error("Profile insert error:", profileError)
          // Continue even if profile insert fails
        }
      }

      router.replace("/home")
    } catch (error: any) {
      console.error("Error completing signup:", error)
      setErrorMessage(`Profile creation error: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (cooldown > 0) {
      alert(`Please wait ${cooldown} seconds before requesting another code.`)
      return
    }

    setLoading(true)
    setErrorMessage("")
    try {
      const { error } = await supabase.auth.signInWithOtp({
        [authMethod]: contact,
      })

      if (error) {
        if (error.message.includes("security purposes") || error.message.includes("rate limit")) {
          const waitTimeMatch = error.message.match(/(\d+) seconds/)
          const waitTime = waitTimeMatch ? Number.parseInt(waitTimeMatch[1]) : 60
          setCooldown(waitTime)
          setErrorMessage(`Please wait ${waitTime} seconds before requesting another code.`)
          return
        }
        throw error
      }

      setCooldown(60)
    } catch (error: any) {
      console.error("Error resending OTP:", error)
      setErrorMessage(`Failed to resend code: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSkipOtp = () => {
    // Allow users to skip OTP verification and go directly to profile completion
    setStep("complete")
  }

  const getStepIcon = () => {
    switch (step) {
      case "method":
        return authMethod === "phone" ? (
          <Phone className="w-8 h-8 text-white" />
        ) : (
          <Mail className="w-8 h-8 text-white" />
        )
      case "otp":
        return <div className="w-4 h-4 bg-white rounded-full" />
      case "complete":
        return <User className="w-8 h-8 text-white" />
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case "method":
        return "Welcome to Crack Capture"
      case "otp":
        return "Verify Your Account"
      case "complete":
        return "Complete Your Profile"
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case "method":
        return "Create your account to start inspecting and documenting structural issues"
      case "otp":
        return `Enter the verification code sent to your ${authMethod}`
      case "complete":
        return "Fill in your details to complete your account setup"
    }
  }

  return (
    <MobileLayout title="Create Account" showBackButton={false} showBottomNav={false}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto">
            {getStepIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
            <p className="text-gray-600">{getStepDescription()}</p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {step === "method" && (
          <div className="space-y-6">
            {/* Input Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {authMethod === "phone" ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                <h2 className="font-semibold">
                  {authMethod === "phone" ? "Phone Verification" : "Email Verification"}
                </h2>
              </div>

              {authMethod === "phone" ? (
                <PhoneInput onSubmit={handleSendOtp} loading={loading} cooldown={cooldown} />
              ) : (
                <EmailInput onSubmit={handleSendOtp} loading={loading} cooldown={cooldown} />
              )}
            </div>

            {/* Switch method */}
            <div className="text-center">
              <Button variant="link" onClick={() => setAuthMethod(authMethod === "phone" ? "email" : "phone")}>
                {authMethod === "phone" ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Use Email instead
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Use Phone instead
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <h2 className="font-semibold">Enter Verification Code</h2>
            </div>

            <OtpInput onSubmit={handleVerifyOtp} onResend={handleResendOtp} loading={loading} cooldown={cooldown} />

            {/* Skip OTP option */}
            <div className="text-center">
              <Button variant="link" onClick={handleSkipOtp}>
                Skip verification and continue
              </Button>
              <p className="text-xs text-gray-500 mt-1">You can verify your {authMethod} later</p>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <h2 className="font-semibold">Personal Information</h2>
            </div>

            <SignupForm
              onSubmit={handleCompleteSignup}
              loading={loading}
              initialEmail={authMethod === "email" ? contact : undefined}
              initialPhone={authMethod === "phone" ? contact : undefined}
            />
          </div>
        )}

        {/* Footer Links */}
        {step !== "complete" && (
          <div className="space-y-4 text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
