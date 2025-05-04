"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"

// Types
export type DocumentType = "policy" | "procedure" | "guideline" | "form" | "other"

export interface Document {
  id: string
  filename: string
  type: DocumentType
  uploadedAt: string
}

export type ContentType = "policy" | "procedure" | "guideline" | "summary" | "other"

export interface ValidationResult {
  valid: boolean
  issues?: string[]
}

export interface SourceChunk {
  text: string
  source: string
}

export interface GeneratedContent {
  id: string
  topic: string
  contentType: ContentType
  modelName: string
  content: string
  createdAt: string
  validationResults: ValidationResult
  sourceChunks?: SourceChunk[]
}

export interface Model {
  name: string
  description?: string
}

interface MedicalAssistantContextType {
  // State
  documents: Document[]
  generatedContents: GeneratedContent[]
  availableModels: Model[]
  isLoading: boolean
  error: string | null

  // Actions
  uploadDocument: (file: File, documentType: DocumentType) => Promise<Document>
  generateContent: (topic: string, contentType: ContentType, modelName: string) => Promise<GeneratedContent>
  fetchAvailableModels: () => Promise<Model[]>
  fetchGeneratedContents: (page?: number, filters?: Record<string, any>) => Promise<GeneratedContent[]>
  fetchGeneratedContentById: (id: string) => Promise<GeneratedContent>
  clearError: () => void
}

const MedicalAssistantContext = createContext<MedicalAssistantContextType | undefined>(undefined)

export function MedicalAssistantProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([])
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Mock API for demonstration purposes
  // In a real application, these would call the actual API endpoints
  const api = {
    baseUrl: "/api",

    async uploadDocument(file: File, documentType: DocumentType): Promise<Document> {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("document_type", documentType)

      try {
        const response = await axios.post(`${api.baseUrl}/upload/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        return response.data
      } catch (error) {
        console.error("Error uploading document:", error)
        throw new Error("Failed to upload document")
      }
    },

    async generateContent(topic: string, contentType: ContentType, modelName: string): Promise<GeneratedContent> {
      try {
        const response = await axios.post(`${api.baseUrl}/generate/`, {
          topic,
          content_type: contentType,
          model_name: modelName,
        })
        return response.data
      } catch (error) {
        console.error("Error generating content:", error)
        throw new Error("Failed to generate content")
      }
    },

    async fetchAvailableModels(): Promise<Model[]> {
      try {
        const response = await axios.get(`${api.baseUrl}/models/`)
        return response.data
      } catch (error) {
        console.error("Error fetching available models:", error)
        throw new Error("Failed to fetch available models")
      }
    },

    async fetchGeneratedContents(page = 1, filters: Record<string, any> = {}): Promise<GeneratedContent[]> {
      try {
        const params = new URLSearchParams({ page: page.toString(), ...filters })
        const response = await axios.get(`${api.baseUrl}/generated-content/?${params}`)
        return response.data.results
      } catch (error) {
        console.error("Error fetching generated contents:", error)
        throw new Error("Failed to fetch generated contents")
      }
    },

    async fetchGeneratedContentById(id: string): Promise<GeneratedContent> {
      try {
        const response = await axios.get(`${api.baseUrl}/generated-content/${id}/`)
        return response.data
      } catch (error) {
        console.error(`Error fetching generated content with ID ${id}:`, error)
        throw new Error("Failed to fetch generated content")
      }
    },
  }

  const uploadDocument = async (file: File, documentType: DocumentType): Promise<Document> => {
    setIsLoading(true)
    setError(null)

    try {
      const newDocument = await api.uploadDocument(file, documentType)
      setDocuments((prev) => [...prev, newDocument])
      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been uploaded.`,
      })
      return newDocument
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const generateContent = async (
    topic: string,
    contentType: ContentType,
    modelName: string,
  ): Promise<GeneratedContent> => {
    setIsLoading(true)
    setError(null)

    try {
      const newContent = await api.generateContent(topic, contentType, modelName)
      setGeneratedContents((prev) => [...prev, newContent])
      toast({
        title: "Content generated successfully",
        description: `${contentType} on "${topic}" has been generated.`,
      })
      return newContent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableModels = async (): Promise<Model[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const models = await api.fetchAvailableModels()
      setAvailableModels(models)
      return models
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to fetch models",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeneratedContents = async (page = 1, filters: Record<string, any> = {}): Promise<GeneratedContent[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const contents = await api.fetchGeneratedContents(page, filters)
      setGeneratedContents(contents)
      return contents
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to fetch content history",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeneratedContentById = async (id: string): Promise<GeneratedContent> => {
    setIsLoading(true)
    setError(null)

    try {
      const content = await api.fetchGeneratedContentById(id)
      return content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to fetch content details",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    documents,
    generatedContents,
    availableModels,
    isLoading,
    error,
    uploadDocument,
    generateContent,
    fetchAvailableModels,
    fetchGeneratedContents,
    fetchGeneratedContentById,
    clearError,
  }

  return <MedicalAssistantContext.Provider value={value}>{children}</MedicalAssistantContext.Provider>
}

export function useMedicalAssistant() {
  const context = useContext(MedicalAssistantContext)
  if (context === undefined) {
    throw new Error("useMedicalAssistant must be used within a MedicalAssistantProvider")
  }
  return context
}
