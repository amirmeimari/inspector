"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, ExternalLink } from "lucide-react"
import { initializeGemini } from "@/lib/gemini"

interface ApiKeySetupProps {
  onApiKeySet?: (apiKey: string) => void
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isStored, setIsStored] = useState(false)

  useEffect(() => {
    // Check if API key is already stored
    const storedKey = localStorage.getItem("gemini_api_key")
    if (storedKey) {
      setApiKey(storedKey)
      setIsStored(true)
      initializeGemini(storedKey)
      onApiKeySet?.(storedKey)
    }
  }, [onApiKeySet])

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim())
      initializeGemini(apiKey.trim())
      setIsStored(true)
      onApiKeySet?.(apiKey.trim())
    }
  }

  const handleClearApiKey = () => {
    localStorage.removeItem("gemini_api_key")
    setApiKey("")
    setIsStored(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Gemini AI Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            To enable AI-powered crack analysis, you need a Google Gemini API key.{" "}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              Get your free API key here
              <ExternalLink className="w-3 h-3" />
            </a>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <label className="text-sm font-medium">Gemini API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
              Save
            </Button>
          </div>
        </div>

        {isStored && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-green-700">✓ API key configured and ready</span>
            <Button variant="outline" size="sm" onClick={handleClearApiKey}>
              Clear
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Your API key is stored locally in your browser</p>
          <p>• It's used only for crack analysis and never shared</p>
          <p>• You can clear it anytime using the button above</p>
        </div>
      </CardContent>
    </Card>
  )
}
