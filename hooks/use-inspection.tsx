"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type {
  InspectionSession,
  StructureInfo,
  InspectionArea,
  CapturedPhoto,
  AssessmentQuestion,
} from "@/types/inspection"

interface InspectionContextType {
  session: InspectionSession | null
  startInspection: () => void
  updateStructureInfo: (info: StructureInfo) => void
  updateSelectedAreas: (areas: InspectionArea[]) => void
  addPhoto: (photo: CapturedPhoto) => void
  deletePhoto: (photoId: string) => void
  updateAssessment: (areaId: string, questions: AssessmentQuestion[]) => void
  nextStep: () => void
  goToStep: (step: InspectionSession["status"]) => void
  getCurrentArea: () => InspectionArea | null
  getDefaultArea: () => InspectionArea
  getAreasFromLocalStorage: () => InspectionArea[] | null
  getCurrentAreaPhotos: () => CapturedPhoto[]
  resetInspection: () => void
}

const InspectionContext = createContext<InspectionContextType | null>(null)

const defaultAreas: InspectionArea[] = [
  {
    id: "balcony",
    name: "Balcony",
    description: "Outdoor balcony walls and railings",
    icon: "building",
    selected: false,
  },
  {
    id: "deck",
    name: "Deck",
    description: "Deck flooring and support structures",
    icon: "grid",
    selected: false,
  },
  {
    id: "stairway",
    name: "Stairway",
    description: "Steps, handrails, and stair walls",
    icon: "trending-up",
    selected: false,
  },
  {
    id: "porch",
    name: "Porch",
    description: "Front or back porch areas",
    icon: "home",
    selected: false,
  },
]

// Create a key for localStorage
const SESSION_STORAGE_KEY = "inspection_session"

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InspectionSession | null>(null)

  // Load session from localStorage on initial render
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY)
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession)
        setSession(parsedSession)
        console.log("Loaded session from localStorage:", parsedSession)
      } catch (e) {
        console.error("Error parsing saved session:", e)
      }
    }
  }, [])

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      console.log("Saved session to localStorage:", session)
    }
  }, [session])

  const startInspection = () => {
    const newSession: InspectionSession = {
      id: `inspection_${Date.now()}`,
      structureInfo: {
        address: "",
        buildingType: "house",
        floors: 2,
      },
      selectedAreas: [],
      photos: [],
      assessments: {},
      status: "structure",
      currentAreaIndex: 0,
    }
    setSession(newSession)
  }

  const updateStructureInfo = (info: StructureInfo) => {
    if (!session) return
    setSession({ ...session, structureInfo: info })
  }

  const updateSelectedAreas = (areas: InspectionArea[]) => {
    if (!session) return
    console.log("Updating selected areas:", areas)
    setSession({ ...session, selectedAreas: areas })
  }

  const addPhoto = (photo: CapturedPhoto) => {
    if (!session) return
    console.log("Adding photo:", photo.id)
    setSession({
      ...session,
      photos: [...session.photos, photo],
    })
  }

  const deletePhoto = (photoId: string) => {
    if (!session) return
    console.log("Deleting photo:", photoId)
    const updatedPhotos = session.photos.filter((photo) => photo.id !== photoId)
    setSession({
      ...session,
      photos: updatedPhotos,
    })
  }

  const updateAssessment = (areaId: string, questions: AssessmentQuestion[]) => {
    if (!session) return
    setSession({
      ...session,
      assessments: {
        ...session.assessments,
        [areaId]: questions,
      },
    })
  }

  const nextStep = () => {
    if (!session) return

    const steps: InspectionSession["status"][] = ["structure", "areas", "camera", "review", "results"]
    const currentIndex = steps.indexOf(session.status)

    if (currentIndex < steps.length - 1) {
      setSession({ ...session, status: steps[currentIndex + 1] })
    }
  }

  const goToStep = (step: InspectionSession["status"]) => {
    if (!session) return
    setSession({ ...session, status: step })
  }

  // Pure function that just returns the current area without side effects
  const getCurrentArea = (): InspectionArea | null => {
    if (!session) return null
    return session.selectedAreas[0] || null
  }

  // Helper function to get areas from localStorage
  const getAreasFromLocalStorage = (): InspectionArea[] | null => {
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

  // Helper function to get a default area
  const getDefaultArea = (): InspectionArea => {
    return {
      id: "deck",
      name: "Deck",
      description: "Deck flooring and support structures",
      icon: "grid",
      selected: true,
    }
  }

  const getCurrentAreaPhotos = (): CapturedPhoto[] => {
    const currentArea = getCurrentArea()
    if (!session || !currentArea) return []

    return session.photos.filter((photo) => photo.areaId === currentArea.id)
  }

  const resetInspection = () => {
    setSession(null)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem("selectedAreas")
  }

  return (
    <InspectionContext.Provider
      value={{
        session,
        startInspection,
        updateStructureInfo,
        updateSelectedAreas,
        addPhoto,
        deletePhoto,
        updateAssessment,
        nextStep,
        goToStep,
        getCurrentArea,
        getDefaultArea,
        getAreasFromLocalStorage,
        getCurrentAreaPhotos,
        resetInspection,
      }}
    >
      {children}
    </InspectionContext.Provider>
  )
}

export const useInspection = () => {
  const context = useContext(InspectionContext)
  if (!context) {
    throw new Error("useInspection must be used within InspectionProvider")
  }
  return context
}
