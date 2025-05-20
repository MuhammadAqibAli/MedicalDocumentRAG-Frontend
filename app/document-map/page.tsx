"use client"

import { useEffect, useState } from "react"
import apiService from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
"use client"
import dynamic from "next/dynamic"
import { useMedicalAssistant } from "@/context/medical-assistant-context"
import { SavedStandard } from "@/context/medical-assistant-context"

// Import ReactFlow components dynamically to avoid SSR issues
const DocumentMapViewer = dynamic(
  () => import("@/components/document-map-viewer"), 
  { ssr: false }
)

export default function DocumentMapPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [standards, setStandards] = useState<SavedStandard[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { standardTypes } = useMedicalAssistant()

  // Fetch all standards
  useEffect(() => {
    const fetchAllStandards = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.fetchStandards()
        
        if (Array.isArray(response.data)) {
          setStandards(response.data)
        } else {
          setStandards([])
          setError("No standards found")
        }
      } catch (err) {
        console.error("Failed to fetch standards:", err)
        setError("Failed to load standards. Please try again later.")
        setStandards([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllStandards()
  }, [])

  // Group standards by type
  const standardsByType = standards.reduce((acc, standard) => {
    const typeName = standard.standard_type_name
    if (!acc[typeName]) {
      acc[typeName] = []
    }
    acc[typeName].push(standard)
    return acc
  }, {} as Record<string, SavedStandard[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading document map...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => router.refresh()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold mb-6 px-4">Document Map</h1>
      <div className="w-full h-[calc(100vh-180px)]">
        <DocumentMapViewer 
          standards={standards} 
          standardTypes={standardTypes}
          onStandardClick={(standard) => {
            router.push(`/history?standard=${standard.id}`)
          }}
          showNodeControls={false} // Hide node controls in document map view
        />
      </div>
    </div>
  )
}


