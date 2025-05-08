"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMedicalAssistant, type ContentType, type GeneratedContent, type SavedStandard } from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, AlertCircle, Search } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import axios from "axios"

export default function HistoryPage() {
  const router = useRouter()
  const { isLoading: contextLoading, error: contextError } = useMedicalAssistant()
  const [standards, setStandards] = useState<SavedStandard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStandard, setSelectedStandard] = useState<SavedStandard | null>(null)
  const [activeTab, setActiveTab] = useState("bestPractice")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Define tab configurations
  const tabs = [
    { id: "bestPractice", label: "Best Practice", typeId: "eb3c02c3-f39a-4547-92c5-5c78e39aa82f" },
    { id: "policy", label: "Policy", typeId: "5ef182ec-5541-44f0-b2eb-46460184ac54" },
    { id: "procedure", label: "Procedure", typeId: "457e7f33-a192-4f8e-9fa1-0553392ddc2c" },
    { id: "standingOrder", label: "Standing Order", typeId: "91a641b1-2092-4d5c-8c3e-a4f9f4518d6a" }
  ]

  // Get the current tab's type ID
  const getCurrentTypeId = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab)
    return currentTab ? currentTab.typeId : tabs[0].typeId
  }

  // Fetch standards based on the selected tab
  const fetchStandards = async (typeId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/standards/?standard_type_id=${typeId}`)
      
      if (Array.isArray(response.data)) {
        setStandards(response.data)
        setTotalPages(Math.ceil(response.data.length / 10) || 1)
        
        // Select first item if available
        if (response.data.length > 0) {
          setSelectedStandard(response.data[0])
        } else {
          setSelectedStandard(null)
        }
      } else {
        setStandards([])
        setSelectedStandard(null)
      }
    } catch (err) {
      console.error("Failed to fetch standards:", err)
      setError("Failed to load standards. Please try again later.")
      setStandards([])
      setSelectedStandard(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Load standards when tab changes or on initial load
  useEffect(() => {
    const typeId = getCurrentTypeId()
    fetchStandards(typeId)
  }, [activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm("")
  }

  const selectStandard = (standard: SavedStandard) => {
    setSelectedStandard(standard)
  }

  // Filter standards based on search term
  const filteredStandards = standards.filter(standard => 
    standard.standard_title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full px-4">
      <h1 className="text-3xl font-bold mb-6">Standards Library</h1>

      {(error || contextError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || contextError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id}>
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={`Search ${tab.label}...`}
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {isLoading || contextLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredStandards.length > 0 ? (
                  <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                    {filteredStandards.map((standard) => (
                      <div
                        key={standard.id}
                        className={`p-3 border rounded-md cursor-pointer hover:bg-muted ${
                          selectedStandard?.id === standard.id ? "bg-muted" : ""
                        }`}
                        onClick={() => selectStandard(standard)}
                      >
                        <div className="font-medium">{standard.standard_title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline">{standard.standard_type_name}</Badge>
                          {new Date(standard.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No {tab.label} standards found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search or create new content
                    </p>
                  </div>
                )}
              </div>
              
              <div className="col-span-3">
                {selectedStandard ? (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>{selectedStandard.standard_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline">{selectedStandard.standard_type_name}</Badge>
                        {selectedStandard.llm_model_used && (
                          <Badge variant="secondary">{selectedStandard.llm_model_used}</Badge>
                        )}
                        <span className="text-muted-foreground">
                          {new Date(selectedStandard.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="bg-muted p-6 rounded-md h-[calc(100vh-300px)] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: selectedStandard.content }}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-[calc(100vh-220px)] flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No standard selected</h3>
                      <p className="text-muted-foreground max-w-md">
                        Select a standard from the list to view its content
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
