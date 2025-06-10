"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useInspection } from "@/hooks/use-inspection"
import { Check, X, Camera, ChevronLeft, ChevronRight } from "lucide-react"
import type { AssessmentQuestion, InspectionArea } from "@/types/inspection"

// Questions for each photo
const getQuestionsForPhoto = (photoIndex: number): AssessmentQuestion[] => [
  {
    id: `photo_${photoIndex}_visibility`,
    question: `Is the crack clearly visible in photo ${photoIndex + 1}?`,
  },
  {
    id: `photo_${photoIndex}_lighting`,
    question: `Is photo ${photoIndex + 1} well-lit and in focus?`,
  },
  {
    id: `photo_${photoIndex}_quality`,
    question: `Does photo ${photoIndex + 1} show the crack detail clearly?`,
  },
]

export default function AreaReviewPage() {
  const {
    session,
    getCurrentArea,
    updateAssessment,
    nextStep,
    getCurrentAreaPhotos,
    getAreasFromLocalStorage,
    getDefaultArea,
    updateSelectedAreas,
  } = useInspection()
  const router = useRouter()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [allQuestions, setAllQuestions] = useState<Record<number, AssessmentQuestion[]>>({})
  const [currentArea, setCurrentArea] = useState<InspectionArea | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
  }, [getCurrentArea, updateSelectedAreas, getAreasFromLocalStorage, getDefaultArea])

  const areaPhotos = useMemo(() => {
    return currentArea ? getCurrentAreaPhotos() : []
  }, [currentArea, getCurrentAreaPhotos, session?.photos])

  // Initialize questions when photos change
  useEffect(() => {
    if (areaPhotos.length > 0) {
      const questionsMap: Record<number, AssessmentQuestion[]> = {}

      // Create questions for each photo
      for (let i = 0; i < areaPhotos.length; i++) {
        questionsMap[i] = getQuestionsForPhoto(i)
      }

      // Load existing answers if available
      if (currentArea && session?.assessments[currentArea.id]) {
        const existingQuestions = session.assessments[currentArea.id]

        // Map existing answers to the new structure
        for (let i = 0; i < areaPhotos.length; i++) {
          questionsMap[i] = questionsMap[i].map((q) => {
            const existing = existingQuestions.find((eq) => eq.id === q.id)
            return existing ? { ...q, answer: existing.answer } : q
          })
        }
      }

      setAllQuestions(questionsMap)
    }
  }, [areaPhotos, currentArea, session?.assessments])

  const handleAnswerQuestion = useCallback((photoIndex: number, questionId: string, answer: boolean) => {
    setAllQuestions((prev) => ({
      ...prev,
      [photoIndex]: prev[photoIndex]?.map((q) => (q.id === questionId ? { ...q, answer } : q)) || [],
    }))
  }, [])

  const handleNext = useCallback(() => {
    if (currentArea) {
      // Flatten all questions into a single array for storage
      const flatQuestions = Object.values(allQuestions).flat()
      updateAssessment(currentArea.id, flatQuestions)
    }
    nextStep()
    router.push("/camera/results")
  }, [currentArea, allQuestions, updateAssessment, nextStep, router])

  const handleTryAgain = useCallback(() => {
    router.push("/camera/capture")
  }, [router])

  const handleSave = useCallback(() => {
    if (currentArea) {
      const flatQuestions = Object.values(allQuestions).flat()
      updateAssessment(currentArea.id, flatQuestions)
    }
    router.push("/home")
  }, [currentArea, allQuestions, updateAssessment, router])

  const currentQuestions = allQuestions[currentPhotoIndex] || []

  const allQuestionsAnswered = useMemo(() => {
    return Object.values(allQuestions).every((questions) => questions.every((q) => q.answer !== undefined))
  }, [allQuestions])

  const goToPreviousPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goToNextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => Math.min(areaPhotos.length - 1, prev + 1))
  }, [areaPhotos.length])

  if (isLoading) {
    return (
      <MobileLayout title="Loading Review" showBackButton>
        <div className="p-6 flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      </MobileLayout>
    )
  }

  if (!currentArea || areaPhotos.length === 0) {
    return (
      <MobileLayout title="Area Review" showBackButton>
        <div className="p-6 text-center">
          <p>No photos found for review</p>
          <Button onClick={() => router.push("/camera/capture")} className="mt-4">
            Take Photos
          </Button>
        </div>
      </MobileLayout>
    )
  }

  const currentPhoto = areaPhotos[currentPhotoIndex]

  return (
    <MobileLayout title="Area Review" showBackButton>
      <div className="p-6 space-y-6">
        {/* Area Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">{currentArea.name}</h1>
          <p className="text-gray-600">{currentArea.description}</p>
        </div>

        {/* Photo Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={goToPreviousPhoto} disabled={currentPhotoIndex === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm font-medium">
            Photo {currentPhotoIndex + 1} of {areaPhotos.length}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPhoto}
            disabled={currentPhotoIndex === areaPhotos.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Photo */}
        <div className="relative">
          <div className="aspect-square bg-slate-600 rounded-lg overflow-hidden">
            {currentPhoto?.url ? (
              <img
                src={currentPhoto.url || "/placeholder.svg"}
                alt={`Crack photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Photo {currentPhotoIndex + 1}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photo indicators */}
        <div className="flex justify-center gap-2">
          {areaPhotos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPhotoIndex(index)}
              className={`w-3 h-3 rounded-full ${index === currentPhotoIndex ? "bg-slate-600" : "bg-gray-300"}`}
            />
          ))}
        </div>

        {/* Assessment Questions for Current Photo */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Assessment Questions - Photo {currentPhotoIndex + 1}</h3>
            <div className="space-y-4">
              {currentQuestions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <p className="text-sm font-medium">
                    {index + 1}. {question.question}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant={question.answer === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAnswerQuestion(currentPhotoIndex, question.id, true)}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Yes
                    </Button>
                    <Button
                      variant={question.answer === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAnswerQuestion(currentPhotoIndex, question.id, false)}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      No
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" onClick={handleNext} disabled={!allQuestionsAnswered}>
            NEXT
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleTryAgain}>
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button variant="outline" className="flex-1" onClick={handleSave}>
              SAVE
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
