"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useInspection } from "@/hooks/use-inspection"
import { Home, Building, LayoutGrid, TrendingUp, CheckSquare } from "lucide-react"
import type { InspectionArea } from "@/types/inspection"

const availableAreas: InspectionArea[] = [
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

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "building":
      return Building
    case "grid":
      return LayoutGrid
    case "trending-up":
      return TrendingUp
    case "home":
      return Home
    default:
      return Building
  }
}

export default function InspectionAreasPage() {
  const { session, updateSelectedAreas, nextStep } = useInspection()
  const router = useRouter()
  const [areas, setAreas] = useState<InspectionArea[]>(availableAreas)

  useEffect(() => {
    if (session?.selectedAreas.length > 0) {
      setAreas((prev) =>
        prev.map((area) => ({
          ...area,
          selected: session.selectedAreas.some((selected) => selected.id === area.id),
        })),
      )
    }
  }, [session])

  const toggleArea = (areaId: string) => {
    setAreas((prev) => prev.map((area) => (area.id === areaId ? { ...area, selected: !area.selected } : area)))
  }

  const selectedAreas = areas.filter((area) => area.selected)

  const handleContinue = () => {
    // Make sure we have at least one area selected
    if (selectedAreas.length === 0) {
      // Force select the first area if none selected
      const updatedAreas = [...areas]
      updatedAreas[0].selected = true
      setAreas(updatedAreas)
      updateSelectedAreas([updatedAreas[0]])
    } else {
      updateSelectedAreas(selectedAreas)
    }

    // Debug log
    console.log("Selected areas before navigation:", selectedAreas)

    // Save to localStorage as a backup
    localStorage.setItem("selectedAreas", JSON.stringify(selectedAreas))

    nextStep()
    router.push("/camera/capture")
  }

  return (
    <MobileLayout title="Choose Inspection Area" showBackButton>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Select Area to Inspect</h1>
            <p className="text-gray-600">Choose one or more areas where you want to capture cracks</p>
          </div>
        </div>

        {/* Inspection Areas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            <h2 className="font-semibold">Inspection Areas</h2>
          </div>

          <div className="space-y-3">
            {areas.map((area) => {
              const Icon = getIcon(area.icon)
              return (
                <Card
                  key={area.id}
                  className={`cursor-pointer transition-colors ${
                    area.selected ? "border-slate-600 bg-slate-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleArea(area.id)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{area.name}</h3>
                        <p className="text-sm text-gray-600">{area.description}</p>
                      </div>
                    </div>
                    <Checkbox checked={area.selected} onChange={() => toggleArea(area.id)} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Selected Areas Summary */}
        {selectedAreas.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  <h3 className="font-semibold">Selected Areas</h3>
                </div>
                <span className="text-sm text-gray-600">{selectedAreas.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAreas.map((area) => (
                  <span key={area.id} className="px-3 py-1 bg-slate-600 text-white text-sm rounded-full">
                    {area.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="space-y-2">
          <Button className="w-full" onClick={handleContinue}>
            Continue to Camera
          </Button>
          {selectedAreas.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No areas selected. Clicking continue will select the first area by default.
            </p>
          ) : (
            <p className="text-sm text-gray-500 text-center">You can change your selection anytime</p>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
