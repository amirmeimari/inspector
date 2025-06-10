"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useInspection } from "@/hooks/use-inspection"
import { Building, Home, Building2, Store, MapPin, Minus, Plus } from "lucide-react"
import type { StructureInfo } from "@/types/inspection"

const buildingTypes = [
  { id: "house", name: "House", icon: Home },
  { id: "apartment", name: "Apartment", icon: Building },
  { id: "condo", name: "Condo", icon: Building2 },
  { id: "commercial", name: "Commercial", icon: Store },
] as const

const sampleAddresses = [
  "123 Main Street, Springfield, IL 62701",
  "123 Main Avenue, Springfield, IL 62702",
  "123 Main Plaza, Springfield, IL 62703",
]

export default function StructureInfoPage() {
  const { session, updateStructureInfo, nextStep } = useInspection()
  const router = useRouter()

  const [formData, setFormData] = useState<StructureInfo>({
    address: "",
    buildingType: "house",
    floors: 2,
  })
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)

  useEffect(() => {
    if (session?.structureInfo) {
      setFormData(session.structureInfo)
    }
  }, [session])

  const handleAddressChange = (value: string) => {
    setFormData((prev) => ({ ...prev, address: value }))
    setShowAddressSuggestions(value.length > 0)
  }

  const selectAddress = (address: string) => {
    setFormData((prev) => ({ ...prev, address }))
    setShowAddressSuggestions(false)
  }

  const handleBuildingTypeChange = (type: StructureInfo["buildingType"]) => {
    setFormData((prev) => ({ ...prev, buildingType: type }))
  }

  const handleFloorsChange = (change: number) => {
    setFormData((prev) => ({
      ...prev,
      floors: Math.max(1, Math.min(20, prev.floors + change)),
    }))
  }

  const handleContinue = () => {
    updateStructureInfo(formData)
    nextStep()
    router.push("/camera/areas")
  }

  const isFormValid = formData.address.trim().length > 0

  return (
    <MobileLayout title="Structure Information" showBackButton>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto">
            <Building className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Building Details</h1>
            <p className="text-gray-600">Provide information about the structure you're inspecting</p>
          </div>
        </div>

        {/* Property Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <h2 className="font-semibold">Property Address</h2>
          </div>

          <div className="relative">
            <Input
              placeholder="Start typing your address..."
              value={formData.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="pr-10"
            />

            {showAddressSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-10">
                {sampleAddresses.map((address, index) => (
                  <button
                    key={index}
                    onClick={() => selectAddress(address)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{address.split(",")[0]}</div>
                        <div className="text-sm text-gray-500">{address.split(",").slice(1).join(",").trim()}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Building Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            <h2 className="font-semibold">Building Type</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {buildingTypes.map((type) => {
              const Icon = type.icon
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-colors ${
                    formData.buildingType === type.id
                      ? "border-slate-600 bg-slate-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleBuildingTypeChange(type.id)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                        formData.buildingType === type.id ? "bg-slate-600" : "bg-gray-600"
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-medium">{type.name}</span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Number of Floors */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <h2 className="font-semibold">Number of Floors</h2>
          </div>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFloorsChange(-1)}
                disabled={formData.floors <= 1}
                className="rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <div className="text-3xl font-bold">{formData.floors}</div>
                <div className="text-sm text-gray-500">floors</div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFloorsChange(1)}
                disabled={formData.floors >= 20}
                className="rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4" />
              <h3 className="font-semibold">Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-right">{formData.address || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span>Building Type:</span>
                <span className="capitalize">{formData.buildingType}</span>
              </div>
              <div className="flex justify-between">
                <span>Floors:</span>
                <span>{formData.floors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="space-y-2">
          <Button className="w-full" onClick={handleContinue} disabled={!isFormValid}>
            Continue to Area Selection
          </Button>
          {!isFormValid && <p className="text-sm text-gray-500 text-center">Complete all fields to proceed</p>}
        </div>
      </div>
    </MobileLayout>
  )
}
