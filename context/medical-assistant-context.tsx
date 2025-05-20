"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import apiService from "@/lib/api"

// Types
export type DocumentType = "policy" | "procedure" | "guideline" | "form" | "other"

export interface Document {
  id: string
  filename: string
  type: DocumentType
  uploadedAt: string
}

export interface StandardType {
  id: string
  name: string
}

export type ContentType = "policy" | "procedure" | "guideline" | "summary" | "other"

export interface ValidationResult {
  valid?: boolean;
  issues?: string[];
  "Consistency"?: boolean;
  "Language Tone"?: boolean;
  "Clinical Relevance"?: boolean;
  "Potential Issues"?: string[];
}

export interface SourceChunk {
  text: string
  source: string
}

export interface GeneratedContent {
  id: string
  topic: string
  content_type: ContentType
  contentType?: ContentType // Frontend property (derived from content_type)
  llm_model_used: string
  modelName?: string // Frontend property (derived from llm_model_used)
  generated_text: string
  content?: string // Frontend property (derived from generated_text)
  created_at: string
  createdAt?: string // Frontend property (derived from created_at)
  validation_results?: ValidationResult
  validationResults?: ValidationResult // Frontend property (derived from validation_results)
  source_chunk_ids?: SourceChunk[]
  sourceChunks?: SourceChunk[] // Frontend property (derived from source_chunk_ids)
}

export interface StandardData {
  standard_title: string;
  standard_type: string;
  content: string;
  version: string;
  generated_content: string | null;
}

export interface SavedStandard {
  id: string;
  standard_title: string;
  standard_type: string;
  standard_type_name: string;
  content: string;
  version: string;
  generated_content: string | null;
  llm_model_used: string | null;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to convert API response to frontend format
function convertToFrontendFormat(apiContent: any): GeneratedContent {
  return {
    ...apiContent,
    // Add frontend properties
    contentType: apiContent.content_type,
    modelName: apiContent.llm_model_used,
    content: apiContent.generated_text,
    createdAt: apiContent.created_at,
    validationResults: apiContent.validation_results,
    sourceChunks: apiContent.source_chunk_ids,
  }
}

// Helper function to get mock data in the correct format
function getMockGeneratedContents(): GeneratedContent[] {
  return [
    {
      id: "1",
      topic: "Diabetes Management Protocol",
      content_type: "procedure",
      contentType: "procedure",
      llm_model_used: "gpt-4-medical",
      modelName: "gpt-4-medical",
      generated_text: "This is a sample diabetes management protocol...",
      content: "This is a sample diabetes management protocol...",
      created_at: "2023-05-15T10:30:00Z",
      createdAt: "2023-05-15T10:30:00Z",
      validation_results: { valid: true },
      validationResults: { valid: true },
    },
    {
      id: "2",
      topic: "COVID-19 Vaccination Guidelines",
      content_type: "guideline",
      contentType: "guideline",
      llm_model_used: "med-llama",
      modelName: "med-llama",
      generated_text: "Guidelines for COVID-19 vaccination...",
      content: "Guidelines for COVID-19 vaccination...",
      created_at: "2023-05-14T14:45:00Z",
      createdAt: "2023-05-14T14:45:00Z",
      validation_results: { valid: true },
      validationResults: { valid: true },
    },
    {
      id: "3",
      topic: "Patient Privacy Policy",
      content_type: "policy",
      contentType: "policy",
      llm_model_used: "clinical-bert",
      modelName: "clinical-bert",
      generated_text: "Privacy policy for patient data...",
      content: "Privacy policy for patient data...",
      created_at: "2023-05-13T09:15:00Z",
      createdAt: "2023-05-13T09:15:00Z",
      validation_results: { valid: false, issues: ["Missing required section on data retention"] },
      validationResults: { valid: false, issues: ["Missing required section on data retention"] },
    },
  ]
}

export interface Model {
  name: string;
  description?: string;
}

// Add a type for the API response
export type ModelsApiResponse = Model[] | string[] | { models: (Model[] | string[]) };

interface MedicalAssistantContextType {
  // State
  documents: Document[]
  generatedContents: GeneratedContent[]
  availableModels: Model[]
  standardTypes: StandardType[]
  isLoading: boolean
  error: string | null

  // Actions
  uploadDocument: (file: File, documentType: DocumentType) => Promise<Document>
  generateContent: (topic: string, contentType: ContentType, modelName: string) => Promise<GeneratedContent>
  fetchAvailableModels: () => Promise<Model[]>
  fetchStandardTypes: () => Promise<StandardType[]>
  fetchGeneratedContents: (page?: number, filters?: Record<string, any>) => Promise<GeneratedContent[]>
  fetchGeneratedContentById: (id: string) => Promise<GeneratedContent>
  saveStandard: (standardData: StandardData) => Promise<SavedStandard>
  clearError: () => void
}

const MedicalAssistantContext = createContext<MedicalAssistantContextType | undefined>(undefined)

export function MedicalAssistantProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([])
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [standardTypes, setStandardTypes] = useState<StandardType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const uploadDocument = async (file: File, documentType: DocumentType): Promise<Document> => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("standard_type_id", documentType)

      const response = await apiService.uploadDocument(formData)
      const newDocument = response.data

      setDocuments((prev) => [...prev, newDocument])
      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })

      return newDocument
    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred"
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
      const response = await apiService.generateContent({
        topic,
        content_type: contentType,
        model_name: modelName
      })
      
      const newContent = response.data
      setGeneratedContents((prev) => [...prev, newContent])
      
      toast({
        title: "Content generated successfully",
        description: `${contentType} on "${topic}" has been generated.`,
      })
      
      return newContent
    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred"
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
      const response = await apiService.fetchModels()
      console.log("API response for models:", response.data)
      
      // Handle different response formats
      let models: Model[] = []
      
      if (Array.isArray(response.data)) {
        models = response.data.map(model => 
          typeof model === 'string' ? { name: model } : model
        )
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.models && Array.isArray(response.data.models)) {
          models = response.data.models.map((model: string | Model) => 
            typeof model === 'string' ? { name: model } : model
          )
        }
      }
      
      setAvailableModels(models)
      return models
    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred"
      setError(errorMessage)
      
      // Fallback to hardcoded models if API fails
      const fallbackModels = [
        { name: "llama3-8b-instruct" },
        { name: "mistral-7b-instruct" },
        { name: "phi-3-mini-instruct" },
        { name: "tinyllama-1.1b-chat" }
      ]
      
      setAvailableModels(fallbackModels)
      return fallbackModels
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeneratedContents = async (page = 1, filters: Record<string, any> = {}): Promise<GeneratedContent[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.fetchGeneratedContents(page, filters)
      const contents = response.data

      // Only update state if we have valid data
      if (Array.isArray(contents) && contents.length > 0) {
        // Map API response to frontend format
        const frontendContents = contents.map(content => {
          return {
            ...content,
            contentType: content.content_type,
            modelName: content.llm_model_used,
            content: content.generated_text,
            createdAt: content.created_at,
            validationResults: content.validation_results,
            sourceChunks: content.source_chunk_ids,
          }
        })

        setGeneratedContents(frontendContents)
        return frontendContents
      }

      return contents
    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to fetch content history",
        description: errorMessage,
        variant: "destructive",
      })

      // Return mock data instead of throwing error
      return getMockGeneratedContents()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeneratedContentById = async (id: string): Promise<GeneratedContent> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.fetchGeneratedContentById(id)
      const content = response.data

      // Map API response to frontend format
      const frontendContent = {
        ...content,
        contentType: content.content_type,
        modelName: content.llm_model_used,
        content: content.generated_text,
        createdAt: content.created_at,
        validationResults: content.validation_results,
        sourceChunks: content.source_chunk_ids,
      }

      return frontendContent
    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to fetch content details",
        description: errorMessage,
        variant: "destructive",
      })

      // Return mock data for ID 1 if API fails
      if (id === "1") {
        return getMockGeneratedContents()[0]
      }

      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStandardTypes = async (): Promise<StandardType[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.fetchStandardTypes()
      console.log("API response for standard types:", response.data)
      
      // Check if response has results array
      if (response.data && response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
        setStandardTypes(response.data.results)
        return response.data.results
      }
      
      // Fallback to empty array if no results
      setStandardTypes([])
      return []
    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred"
      setError(errorMessage)
      setStandardTypes([])
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const saveStandard = async (standardData: StandardData): Promise<SavedStandard> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.saveStandard(standardData)
      const savedStandard = response.data
      toast({
        title: "Standard saved successfully",
        description: `"${savedStandard.standard_title}" has been saved.`,
      })
      return savedStandard
    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Failed to save standard",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Load standard types on context initialization
  useEffect(() => {
    fetchStandardTypes().catch(err => 
      console.error("Failed to load standard types during initialization:", err)
    );
  }, []);

  const clearError = () => {
    setError(null)
  }

  const value = {
    documents,
    generatedContents,
    availableModels,
    standardTypes,
    isLoading,
    error,
    uploadDocument,
    generateContent,
    fetchAvailableModels,
    fetchStandardTypes,
    fetchGeneratedContents,
    fetchGeneratedContentById,
    saveStandard,
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
