"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MobileLayout } from "@/components/layout/mobile-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useInspection } from "@/hooks/use-inspection"
import { Share, Wrench, Camera, Brain, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { analyzeCrackImages, type CrackAnalysis, initializeGemini } from "@/lib/gemini"

export default function InspectionResultsPage() {
  const { session, resetInspection, getCurrentArea, getCurrentAreaPhotos } = useInspection()
  const router = useRouter()
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiResults, setAiResults] = useState<CrackAnalysis[]>([])
  const [analysisError, setAnalysisError] = useState<string>("")
  const [geminiReady, setGeminiReady] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const currentArea = getCurrentArea()
  const areaPhotos = getCurrentAreaPhotos()

  // Initialize Gemini when component mounts
  useEffect(() => {
    const initializeAI = async () => {
      try {
        // Try to get API key from localStorage first
        const storedKey = localStorage.getItem("gemini_api_key")

        if (storedKey) {
          initializeGemini(storedKey)
          setGeminiReady(true)
        } else if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
          initializeGemini()
          setGeminiReady(true)
        } else {
          setAnalysisError("Gemini API key not configured. Please add your API key in settings.")
        }
      } catch (error: any) {
        setAnalysisError(error.message)
      } finally {
        setInitialLoadComplete(true)
      }
    }

    initializeAI()
  }, [])

  // Auto-start analysis when Gemini is ready and photos are available
  useEffect(() => {
    const autoStartAnalysis = async () => {
      if (geminiReady && areaPhotos.length > 0 && !isAnalyzing && aiResults.length === 0 && initialLoadComplete) {
        await handleAnalyzeWithAI()
      }
    }

    autoStartAnalysis()
  }, [geminiReady, areaPhotos, initialLoadComplete])

  const handleAnalyzeWithAI = async () => {
    if (!session || !currentArea || areaPhotos.length === 0) {
      setAnalysisError("No photos available for analysis")
      return
    }

    if (!geminiReady) {
      setAnalysisError("Gemini AI is not properly configured")
      return
    }

    setIsAnalyzing(true)
    setAnalysisError("")

    try {
      const imagesToAnalyze = areaPhotos.map((photo) => ({
        url: photo.url,
        areaName: currentArea.name,
      }))

      const results = await analyzeCrackImages(imagesToAnalyze, session.structureInfo)
      setAiResults(results)
    } catch (error: any) {
      console.error("AI analysis failed:", error)
      setAnalysisError(error.message || "AI analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleResolve = () => {
    resetInspection()
    router.push("/home")
  }

  const handleShare = () => {
    // In a real app, this would share the results
    alert("Sharing inspection results...")
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-50 border-green-200"
      case "medium":
        return "bg-yellow-50 border-yellow-200"
      case "high":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (!currentArea || areaPhotos.length === 0) {
    return (
      <MobileLayout title="Inspection Results" showBackButton>
        <div className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">No Results Available</h2>
          <p className="text-gray-600 mb-4">No photos found for analysis</p>
          <Button onClick={() => router.push("/camera/capture")}>Take Photos</Button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Inspection Results" showBackButton>
      <div className="p-6 space-y-6">
        {/* Overall Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Inspection Status</h2>
              <div className="flex items-center gap-2">
                {isAnalyzing ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-medium">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <div className={`w-3 h-3 rounded-full ${geminiReady ? "bg-green-500" : "bg-yellow-500"}`} />
                    <span className="text-sm font-medium">{geminiReady ? "AI Ready" : "Configuring AI"}</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-gray-600">Area Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{areaPhotos.length}</div>
                <div className="text-sm text-gray-600">Photos Taken</div>
              </div>
              <div className="text-center">
                {isAnalyzing ? (
                  <div className="text-2xl font-bold flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="text-2xl font-bold">{aiResults.length > 0 ? aiResults.length : "—"}</div>
                )}
                <div className="text-sm text-gray-600">AI Analysis</div>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isAnalyzing ? "bg-blue-50" : "bg-gray-100"}`}>
              <p className="text-sm text-gray-700">
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI is analyzing your photos. This may take a moment...
                  </span>
                ) : aiResults.length > 0 ? (
                  "AI analysis completed. Review the detailed findings below."
                ) : geminiReady ? (
                  "Photos captured successfully. Analysis starting automatically..."
                ) : (
                  "Setting up AI analysis..."
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">AI Analysis</h3>
                {geminiReady && !isAnalyzing && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Ready</span>
                )}
                {isAnalyzing && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-pulse">
                    Processing
                  </span>
                )}
              </div>
              {aiResults.length === 0 && geminiReady && !isAnalyzing && (
                <Button onClick={handleAnalyzeWithAI} disabled={isAnalyzing} size="sm">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Photos
                    </>
                  )}
                </Button>
              )}
            </div>

            {analysisError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{analysisError}</AlertDescription>
              </Alert>
            )}

            {!geminiReady && !analysisError && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                <p className="text-sm text-gray-600">Initializing AI analysis...</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
                <p className="text-sm text-gray-600">AI is analyzing your photos...</p>
                <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
              </div>
            )}

              {geminiReady && !isAnalyzing && (
                  <div className="text-center py-8">
                <p className="text-sm text-gray-600">AI analyzing done</p>
                <p className="text-xs text-gray-500 mt-1">Your results are ready!</p>
              </div>
                )}
          </CardContent>
        </Card>

        {/* Photo Navigation */}
        {areaPhotos.length > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentResultIndex(Math.max(0, currentResultIndex - 1))}
              disabled={currentResultIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-sm font-medium">
              Photo {currentResultIndex + 1} of {areaPhotos.length}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentResultIndex(Math.min(areaPhotos.length - 1, currentResultIndex + 1))}
              disabled={currentResultIndex === areaPhotos.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Current Photo and Analysis */}
        <Card
          className={
            aiResults[currentResultIndex] ? getSeverityBg(aiResults[currentResultIndex].severity) : "bg-gray-50"
          }
        >
          <CardContent className="p-4">
            {/* Photo */}
            <div className="bg-slate-600 rounded-lg h-64 overflow-hidden mb-4">
              {areaPhotos[currentResultIndex]?.url ? (
                <img
                  src={areaPhotos[currentResultIndex].url || "/placeholder.svg"}
                  alt={`${currentArea.name} photo ${currentResultIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">
                      {currentArea.name} - Photo {currentResultIndex + 1}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Results */}
            {isAnalyzing ? (
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-4 w-full">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : aiResults[currentResultIndex] ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {currentArea.name} - Photo {currentResultIndex + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium capitalize ${getSeverityColor(aiResults[currentResultIndex].severity)}`}
                    >
                      {aiResults[currentResultIndex].severity} Risk
                    </span>
                    <span className="text-xs text-gray-500">
                      {aiResults[currentResultIndex].confidence}% confidence
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">AI Assessment:</p>
                  <p className="text-sm text-gray-700">{aiResults[currentResultIndex].description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Analysis Details:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {aiResults[currentResultIndex].details.map((detail, index) => (
                      <li key={index}>• {detail}</li>
                    ))}
                  </ul>
                </div>

                {aiResults[currentResultIndex].structuralConcerns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Structural Concerns:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {aiResults[currentResultIndex].structuralConcerns.map((concern, index) => (
                        <li key={index}>⚠️ {concern}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-2">Recommendations:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {aiResults[currentResultIndex].recommendations.map((rec, index) => (
                      <li key={index}>✓ {rec}</li>
                    ))}
                  </ul>
                </div>

                {aiResults[currentResultIndex].immediateActions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Immediate Actions:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {aiResults[currentResultIndex].immediateActions.map((action, index) => (
                        <li key={index}>🚨 {action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">
                  {geminiReady ? "Analysis will begin automatically..." : "Waiting for AI to initialize..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Dots */}
        {areaPhotos.length > 1 && (
          <div className="flex justify-center gap-2">
            {areaPhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentResultIndex(index)}
                className={`w-2 h-2 rounded-full ${index === currentResultIndex ? "bg-slate-600" : "bg-gray-300"}`}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" onClick={handleResolve} disabled={isAnalyzing && aiResults.length === 0}>
            <Wrench className="w-4 h-4 mr-2" />
            Complete Inspection
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleShare}
            disabled={isAnalyzing && aiResults.length === 0}
          >
            <Share className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
