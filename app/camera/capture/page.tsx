"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useInspection } from "@/hooks/use-inspection"
import { Lightbulb, Trash2, AlertCircle, Upload } from "lucide-react"
import type { CapturedPhoto, InspectionArea } from "@/types/inspection"

export default function CameraCapturePage() {
  const { session, getCurrentArea, getCurrentAreaPhotos, addPhoto, deletePhoto, nextStep, updateSelectedAreas } =
    useInspection()
  const router = useRouter()
  const [isCapturing, setIsCapturing] = useState(false)
  const [currentArea, setCurrentArea] = useState<InspectionArea | null>(null)
  const [areaPhotos, setAreaPhotos] = useState<CapturedPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize and get current area
  useEffect(() => {
    const initializeArea = async () => {
      setIsLoading(true)

      // Try to get the current area
      let area = getCurrentArea()
      console.log("Initial current area:", area)

      // If no area, try to get from localStorage
      if (!area) {
        const savedAreas = getAreasFromLocalStorage()
        if (savedAreas) {
          console.log("Using areas from localStorage:", savedAreas)
          updateSelectedAreas(savedAreas)
          area = savedAreas[0]
        }
      }

      // If still no area, use the first default area
      if (!area) {
        console.log("No areas found, using first default area")
        const defaultArea = getDefaultArea()
        updateSelectedAreas([defaultArea])
        area = defaultArea
      }

      setCurrentArea(area)
      setIsLoading(false)
    }

    initializeArea()
  }, [getCurrentArea, updateSelectedAreas])

  // Update photos when they change
  useEffect(() => {
    if (currentArea) {
      setAreaPhotos(getCurrentAreaPhotos())
    }
  }, [session?.photos, currentArea, getCurrentAreaPhotos])

  const handleCapture = (imageData: string) => {
    if (!currentArea || areaPhotos.length >= 3) return

    setIsCapturing(true)

    const newPhoto: CapturedPhoto = {
      id: `photo_${Date.now()}`,
      url: imageData,
      timestamp: new Date(),
      areaId: currentArea.id,
    }

    addPhoto(newPhoto)

    setTimeout(() => {
      setIsCapturing(false)
    }, 500)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentArea || areaPhotos.length >= 3 || !event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        const newPhoto: CapturedPhoto = {
          id: `photo_${Date.now()}`,
          url: e.target.result,
          timestamp: new Date(),
          areaId: currentArea.id,
        }

        addPhoto(newPhoto)
      }
    }

    reader.readAsDataURL(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDeletePhoto = (photoId: string) => {
    console.log("Deleting photo:", photoId)
    deletePhoto(photoId)
  }

  const handleNext = () => {
    nextStep()
    router.push("/camera/review")
  }

  const isPhotoLimitReached = areaPhotos.length >= 3

  // Helper functions
  const getAreasFromLocalStorage = () => {
    try {
      const savedAreas = localStorage.getItem("selectedAreas")
      if (savedAreas) {
        const parsedAreas = JSON.parse(savedAreas)
        if (parsedAreas.length > 0) {
          return parsedAreas
        }
      }
    } catch (e) {
      console.error("Error retrieving areas from localStorage:", e)
    }
    return null
  }

  const getDefaultArea = () => {
    return {
      id: "deck",
      name: "Deck",
      description: "Deck flooring and support structures",
      icon: "grid",
      selected: true,
    }
  }

  if (isLoading) {
    return (
      <MobileLayout title="Loading Camera" showBackButton>
        <div className="p-6 flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      </MobileLayout>
    )
  }

  if (!currentArea) {
    return (
      <MobileLayout title="Camera" showBackButton>
        <div className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold">Area Selection Error</h2>
          <p className="text-gray-600">Unable to load inspection area. Please try selecting an area again.</p>
          <Button onClick={() => router.push("/camera/areas")}>Select Areas</Button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title={`Inspect ${currentArea.name}`} showBackButton>
      <div className="p-6 space-y-6">
        {/* Area Info */}
        <div className="text-center">
          <h2 className="text-lg font-medium">{currentArea.name}</h2>
          <p className="text-sm text-gray-600">{currentArea.description}</p>
        </div>

        {/* Photo Tips */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-semibold">Photo Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Hold device steady</li>
              <li>• Ensure good lighting</li>
              <li>• Center crack in frame</li>
              <li>• Keep 12-18 inches away</li>
            </ul>
          </CardContent>
        </Card>

        {/* File Upload Button */}
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Upload photos from your device</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
              disabled={isPhotoLimitReached}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isPhotoLimitReached} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Select Photo
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              {isPhotoLimitReached ? "Photo limit reached (3/3)" : `${3 - areaPhotos.length} more photos allowed`}
            </p>
          </div>
        </div>

        {/* Photo Carousel */}
        {areaPhotos.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">
                Captured Photos ({areaPhotos.length}/3) - {currentArea.name}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {areaPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url || "/placeholder.svg"}
                      alt={`Crack photo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress indicator */}
        <div className="text-center text-sm text-gray-500">
          {areaPhotos.length < 3
            ? `Upload ${3 - areaPhotos.length} more photo${3 - areaPhotos.length !== 1 ? "s" : ""} to continue`
            : isPhotoLimitReached
              ? "Photo limit reached (3/3). Ready to review!"
              : "Ready to review photos"}
        </div>

        {/* Next Button */}
        {areaPhotos.length >= 3 && (
          <Button className="w-full" onClick={handleNext}>
            Continue to Review
          </Button>
        )}
      </div>
    </MobileLayout>
  )
}
