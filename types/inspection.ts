export interface StructureInfo {
  address: string
  buildingType: "house" | "apartment" | "condo" | "commercial"
  floors: number
}

export interface InspectionArea {
  id: string
  name: string
  description: string
  icon: string
  selected: boolean
}

export interface CapturedPhoto {
  id: string
  url: string
  timestamp: Date
  areaId: string
}

export interface AssessmentQuestion {
  id: string
  question: string
  answer?: boolean
}

export interface InspectionResult {
  areaId: string
  areaName: string
  severity: "low" | "medium" | "high"
  confidence: number
  description: string
  recommendations: string[]
  photos: CapturedPhoto[]
}

export interface InspectionSession {
  id: string
  structureInfo: StructureInfo
  selectedAreas: InspectionArea[]
  photos: CapturedPhoto[]
  assessments: Record<string, AssessmentQuestion[]>
  results?: InspectionResult[]
  status: "structure" | "areas" | "camera" | "review" | "results"
  currentAreaIndex: number
}
