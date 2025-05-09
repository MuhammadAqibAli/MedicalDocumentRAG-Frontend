"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
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

  // Mock API for demonstration purposes
  // In a real application, these would call the actual API endpoints
  const api = {
    baseUrl: "http://127.0.0.1:8000/api",

    async uploadDocument(file: File, documentType: DocumentType): Promise<Document> {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("document_type", documentType)

      try {
        const response = await axios.post(`${api.baseUrl}/upload/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000, // Increased to 120 seconds (2 minutes) timeout
        })
        return response.data
      } catch (error) {
        console.error("Error uploading document:", error)
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            throw new Error("Upload request timed out. Please try again.")
          }
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 413) {
              throw new Error("File too large. Maximum file size is 10MB.")
            } else if (error.response.status === 415) {
              throw new Error("Unsupported file format. Please upload PDF or DOCX files only.")
            } else if (error.response.status >= 400 && error.response.status < 500) {
              throw new Error(`Client error: ${error.response.data.message || error.message}`)
            } else if (error.response.status >= 500) {
              throw new Error("Server error. Please try again later.")
            }
          } else if (error.request) {
            // The request was made but no response was received
            throw new Error("No response from server. Please check your connection and try again.")
          }
        }
        throw new Error("Failed to upload document. Please try again.")
      }
    },

    async generateContent(topic: string, contentType: ContentType, modelName: string): Promise<GeneratedContent> {
      try {
        const response = await axios.post(`${api.baseUrl}/generate/`, {
          topic,
          content_type: contentType,
          model_name: modelName,
        }, {
          timeout: 180000, 
        })
        return response.data
      } catch (error) {
        console.error("Error generating content:", error)
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            throw new Error("Generation request timed out. Please try again with a simpler topic.")
          }
          if (error.response) {
            if (error.response.status >= 400 && error.response.status < 500) {
              throw new Error(`Client error: ${error.response.data.message || error.message}`)
            } else if (error.response.status >= 500) {
              throw new Error("Server error. Please try again later.")
            }
          } else if (error.request) {
            throw new Error("No response from server. Please check your connection and try again.")
          }
        }
        throw new Error("Failed to generate content. Please try again.")
      }
    },

    async fetchAvailableModels(): Promise<Model[]> {
      try {
        const response = await axios.get<string[] | Model[]>(`${api.baseUrl}/models/`, {
          timeout: 10000, // 10 seconds timeout
        });
        
        console.log("API response for models:", response.data);
        
        // Handle array of strings response
        if (Array.isArray(response.data)) {
          return response.data.map(model => 
            typeof model === 'string' ? { name: model } : model
          );
        }
        
        // If response is not an array, return fallback models
        return [
          { name: "llama3-8b-instruct" },
          { name: "mistral-7b-instruct" },
          { name: "phi-3-mini-instruct" },
          { name: "tinyllama-1.1b-chat" }
        ];
      } catch (error) {
        console.error("Error fetching available models:", error);
        // Return fallback models instead of throwing
        return [
          { name: "llama3-8b-instruct" },
          { name: "mistral-7b-instruct" },
          { name: "phi-3-mini-instruct" },
          { name: "tinyllama-1.1b-chat" }
        ];
      }
    },

    async fetchGeneratedContents(page = 1, filters: Record<string, any> = {}): Promise<GeneratedContent[]> {
      try {
        const params = new URLSearchParams({ page: page.toString(), ...filters })
        const response = await axios.get(`${api.baseUrl}/generated-content/?${params}`, {
          timeout: 30000, // 30 seconds timeout
        })
        return response.data.results
      } catch (error) {
        console.error("Error fetching generated contents:", error)
        if (axios.isAxiosError(error)) {
          console.log("API Error Details:", {
            code: error.code,
            message: error.message,
            config: error.config,
            status: error.response?.status
          })

          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.warn("API request timed out - using mock data")
            // Don't throw error for timeouts, just use mock data
            return getMockGeneratedContents().filter(content => {
              // Apply filters to mock data
              if (filters.content_type && content.content_type !== filters.content_type) {
                return false
              }
              if (filters.search && !content.topic.toLowerCase().includes(filters.search.toLowerCase())) {
                return false
              }
              return true
            })
          }

          if (error.response) {
            if (error.response.status >= 500) {
              console.warn("Server error - using mock data")
              return getMockGeneratedContents().filter(content => {
                // Apply filters to mock data
                if (filters.content_type && content.content_type !== filters.content_type) {
                  return false
                }
                if (filters.search && !content.topic.toLowerCase().includes(filters.search.toLowerCase())) {
                  return false
                }
                return true
              })
            }
          } else if (error.request) {
            console.warn("No response from server - using mock data")
            return getMockGeneratedContents().filter(content => {
              // Apply filters to mock data
              if (filters.content_type && content.content_type !== filters.content_type) {
                return false
              }
              if (filters.search && !content.topic.toLowerCase().includes(filters.search.toLowerCase())) {
                return false
              }
              return true
            })
          }
        }

        // Return filtered mock data if API fails
        return getMockGeneratedContents().filter(content => {
          // Apply filters to mock data
          if (filters.content_type && content.content_type !== filters.content_type) {
            return false
          }
          if (filters.search && !content.topic.toLowerCase().includes(filters.search.toLowerCase())) {
            return false
          }
          return true
        })
      }
    },

    async fetchGeneratedContentById(id: string): Promise<GeneratedContent> {
      try {
        const response = await axios.get(`${api.baseUrl}/generated-content/${id}/`, {
          timeout: 10000, // 10 seconds timeout
        })
        return response.data
      } catch (error) {
        console.error(`Error fetching generated content with ID ${id}:`, error)
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            throw new Error("Request timed out. Please try again.")
          }
          if (error.response) {
            if (error.response.status === 404) {
              throw new Error("Content not found. It may have been deleted.")
            } else if (error.response.status >= 500) {
              throw new Error("Server error. Please try again later.")
            }
          } else if (error.request) {
            throw new Error("No response from server. Please check your connection and try again.")
          }
        }

        // Return mock data for ID 1 if API fails
        if (id === "1") {
          return {
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
            source_chunk_ids: [
              {
                text: "Diabetes management should include regular monitoring of HbA1c levels every 3-6 months.",
                source: "NZ Diabetes Guidelines 2023.pdf",
              },
              {
                text: "Metformin is recommended as the first-line pharmacological therapy for type 2 diabetes.",
                source: "Clinical Pharmacy Handbook.pdf",
              },
            ],
            sourceChunks: [
              {
                text: "Diabetes management should include regular monitoring of HbA1c levels every 3-6 months.",
                source: "NZ Diabetes Guidelines 2023.pdf",
              },
              {
                text: "Metformin is recommended as the first-line pharmacological therapy for type 2 diabetes.",
                source: "Clinical Pharmacy Handbook.pdf",
              },
            ],
          }
        }

        throw new Error("Failed to fetch content details. Please try again.")
      }
    },

    async fetchStandardTypes(): Promise<StandardType[]> {
      try {
        const response = await axios.get<{ results: StandardType[] }>(`${api.baseUrl}/standard-types/`, {
          timeout: 10000, // 10 seconds timeout
        });
        
        console.log("API response for standard types:", response.data);
        
        // Check if response has results array
        if (response.data && response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
          return response.data.results;
        }
        
        // If response is not valid, return fallback types
        return [
          { id: "eb3c02c3-f39a-4547-92c5-5c78e39aa82f", name: "Best Practice" },
          { id: "5ef182ec-5541-44f0-b2eb-46460184ac54", name: "Policy" },
          { id: "457e7f33-a192-4f8e-9fa1-0553392ddc2c", name: "Procedure" },
          { id: "91a641b1-2092-4d5c-8c3e-a4f9f4518d6a", name: "Standing Order" }
        ];
      } catch (error) {
        console.error("Error fetching standard types:", error);
        // Return fallback types instead of throwing
        return [
          { id: "eb3c02c3-f39a-4547-92c5-5c78e39aa82f", name: "Best Practice" },
          { id: "5ef182ec-5541-44f0-b2eb-46460184ac54", name: "Policy" },
          { id: "457e7f33-a192-4f8e-9fa1-0553392ddc2c", name: "Procedure" },
          { id: "91a641b1-2092-4d5c-8c3e-a4f9f4518d6a", name: "Standing Order" }
        ];
      }
    },

    async saveStandard(standardData: StandardData): Promise<SavedStandard> {
      try {
        const response = await axios.post<SavedStandard>(`${api.baseUrl}/standards/`, standardData, {
          timeout: 30000, // 30 seconds timeout
        });
        
        return response.data;
      } catch (error) {
        console.error("Error saving standard:", error);
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            throw new Error("Request timed out. Please try again.");
          }
          if (error.response) {
            if (error.response.status === 400) {
              throw new Error(`Validation error: ${JSON.stringify(error.response.data)}`);
            } else if (error.response.status >= 500) {
              throw new Error("Server error. Please try again later.");
            }
          } else if (error.request) {
            throw new Error("No response from server. Please check your connection and try again.");
          }
        }
        throw new Error("Failed to save standard. Please try again.");
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
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
      const content = await api.fetchGeneratedContentById(id)

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
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
    setIsLoading(true);
    setError(null);

    try {
      const types = await api.fetchStandardTypes();
      setStandardTypes(types);
      return types;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Failed to fetch document types",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveStandard = async (standardData: StandardData): Promise<SavedStandard> => {
    setIsLoading(true);
    setError(null);

    try {
      const savedStandard = await api.saveStandard(standardData);
      toast({
        title: "Standard saved successfully",
        description: `"${savedStandard.standard_title}" has been saved.`,
      });
      return savedStandard;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Failed to save standard",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
