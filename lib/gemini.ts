import { GoogleGenerativeAI } from "@google/generative-ai"

let genAI: GoogleGenerativeAI | null = null

export function initializeGemini(apiKey?: string) {
  // Use provided API key or environment variable
  const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!key) {
    throw new Error("Gemini API key not found. Please check your environment variables.")
  }

  genAI = new GoogleGenerativeAI(key)
}

export function getGeminiClient() {
  // Auto-initialize with environment variable if not already initialized
  if (!genAI && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    initializeGemini()
  }

  if (!genAI) {
    throw new Error("Gemini AI not initialized. Please provide an API key.")
  }
  return genAI
}

export interface CrackAnalysis {
  severity: "low" | "medium" | "high"
  confidence: number
  description: string
  details: string[]
  recommendations: string[]
  structuralConcerns: string[]
  immediateActions: string[]
}

export async function analyzeCrackImages(
  images: Array<{ url: string; areaName: string }>,
  structureInfo: { buildingType: string; floors: number; address: string },
): Promise<CrackAnalysis[]> {
  // Auto-initialize if needed
  if (!genAI && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    initializeGemini()
  }

  if (!genAI) {
    throw new Error("Gemini AI not initialized")
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const results: CrackAnalysis[] = []

  for (const image of images) {
    try {
      // Convert data URL to base64
      const base64Data = image.url.split(",")[1]

      const prompt = `You are a professional structural engineer analyzing cracks in building structures. 

BUILDING INFORMATION:
- Type: ${structureInfo.buildingType}
- Floors: ${structureInfo.floors}
- Location: ${structureInfo.address}
- Area being inspected: ${image.areaName}

ANALYSIS REQUIREMENTS:
Please analyze this crack image and provide a detailed structural assessment. Consider:

1. CRACK CHARACTERISTICS:
   - Length, width, and pattern
   - Direction (horizontal, vertical, diagonal)
   - Location and context within the structure
   - Surface vs structural depth indicators

2. SEVERITY ASSESSMENT:
   - Low: Cosmetic/surface cracks, minimal concern
   - Medium: Potential structural concern, monitoring needed
   - High: Immediate structural concern, professional inspection required

3. STRUCTURAL IMPLICATIONS:
   - Potential causes (settling, thermal expansion, moisture, structural stress)
   - Risk to building integrity
   - Progression likelihood

4. RECOMMENDATIONS:
   - Immediate actions needed
   - Monitoring requirements
   - Repair methods
   - Professional consultation needs

Please respond in this exact JSON format:
{
  "severity": "low|medium|high",
  "confidence": 0-100,
  "description": "Brief description of the crack",
  "details": ["Detail 1", "Detail 2", "Detail 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "structuralConcerns": ["Concern 1", "Concern 2"],
  "immediateActions": ["Action 1", "Action 2"]
}

Be specific, professional, and prioritize safety. If the image quality is poor, mention it in your analysis.`

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      }

      const result = await model.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0])
          results.push(analysis)
        } else {
          // Fallback if JSON parsing fails
          results.push({
            severity: "medium",
            confidence: 70,
            description: "Analysis completed but response format was unexpected",
            details: [text.substring(0, 200) + "..."],
            recommendations: ["Professional inspection recommended"],
            structuralConcerns: ["Unable to parse detailed analysis"],
            immediateActions: ["Review image quality and retake if necessary"],
          })
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError)
        results.push({
          severity: "medium",
          confidence: 50,
          description: "Analysis completed but response parsing failed",
          details: ["Raw response: " + text.substring(0, 100) + "..."],
          recommendations: ["Professional inspection recommended"],
          structuralConcerns: ["Unable to parse AI analysis"],
          immediateActions: ["Consider retaking photos with better quality"],
        })
      }
    } catch (error) {
      console.error("Gemini analysis failed:", error)
      results.push({
        severity: "medium",
        confidence: 0,
        description: "AI analysis failed",
        details: ["Error occurred during analysis"],
        recommendations: ["Manual inspection recommended"],
        structuralConcerns: ["AI analysis unavailable"],
        immediateActions: ["Consult with a structural engineer"],
      })
    }
  }

  return results
}
