"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RotateCcw, AlertCircle } from "lucide-react"

interface CameraViewProps {
  onCapture: (imageData: string) => void
  isCapturing: boolean
  disabled?: boolean
}

export function CameraView({ onCapture, isCapturing, disabled }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string>("")
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  useEffect(() => {
    const startCamera = async () => {
      try {
        // FORCE camera access immediately
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          // FORCE play immediately - no waiting
          videoRef.current.play().then(() => {
            setIsReady(true)
          })

          // BACKUP - set ready after 500ms regardless
          setTimeout(() => {
            setIsReady(true)
          }, 500)
        }
      } catch (err: any) {
        setError("Camera access denied or not available")
      }
    }

    startCamera()
  }, [])

  const switchCamera = async () => {
    try {
      const newFacing = facingMode === "user" ? "environment" : "user"
      setFacingMode(newFacing)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error("Switch camera failed:", err)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || disabled) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    onCapture(imageData)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="font-semibold mb-2 text-white">Camera Error</h3>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} size="sm">
              Reload Page
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <Button size="icon" className="w-20 h-20 rounded-full bg-gray-400 cursor-not-allowed" disabled>
            <Camera className="w-8 h-8" />
          </Button>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="space-y-6">
        <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm text-gray-300">Starting camera...</p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button size="icon" className="w-20 h-20 rounded-full bg-gray-400 cursor-not-allowed" disabled>
            <Camera className="w-8 h-8" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: facingMode === "user" ? "scaleX(-1)" : "none",
            }}
          />

          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 border-2 border-white/80 rounded-lg"></div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-black/50 border-white/20 text-white hover:bg-black/70"
            onClick={switchCamera}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          size="icon"
          className={`w-20 h-20 rounded-full ${
            disabled ? "bg-gray-400 cursor-not-allowed" : "bg-slate-600 hover:bg-slate-700"
          }`}
          onClick={capturePhoto}
          disabled={isCapturing || disabled}
        >
          <Camera className="w-8 h-8" />
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
