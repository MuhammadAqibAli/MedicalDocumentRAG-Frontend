"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMedicalAssistant, type ContentType, type GeneratedContent } from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, AlertCircle, Search } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

export default function HistoryPage() {
  const router = useRouter()
  const { fetchGeneratedContents, fetchGeneratedContentById, isLoading, error } = useMedicalAssistant()
  const [contents, setContents] = useState<GeneratedContent[]>([])
  const [bestPractices, setBestPractices] = useState<GeneratedContent[]>([])
  const [policies, setPolicies] = useState<GeneratedContent[]>([])
  const [others, setOthers] = useState<GeneratedContent[]>([])
  const [searchTermBestPractices, setSearchTermBestPractices] = useState("")
  const [searchTermPolicies, setSearchTermPolicies] = useState("")
  const [searchTermOthers, setSearchTermOthers] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [activeTab, setActiveTab] = useState("bestPractices")

  useEffect(() => {
    loadContents()
  }, [currentPage])

  const loadContents = async () => {
    try {
      const fetchedContents = await fetchGeneratedContents(currentPage, {})

      // Ensure fetchedContents is always an array
      const safeContents = Array.isArray(fetchedContents) ? fetchedContents : []
      setContents(safeContents)

      // Filter contents by type
      const bestPracticesDocs = safeContents.filter(content => content.content_type === "guideline")
      const policyDocs = safeContents.filter(content => content.content_type === "policy")
      const otherDocs = safeContents.filter(content => 
        content.content_type !== "guideline" && content.content_type !== "policy"
      )

      setBestPractices(bestPracticesDocs)
      setPolicies(policyDocs)
      setOthers(otherDocs)

      // Set total pages
      setTotalPages(Math.ceil(safeContents.length / 10) || 1)
      
      // Select first item if available
      if (bestPracticesDocs.length > 0 && activeTab === "bestPractices") {
        selectDocument(bestPracticesDocs[0].id)
      } else if (policyDocs.length > 0 && activeTab === "policies") {
        selectDocument(policyDocs[0].id)
      } else if (otherDocs.length > 0 && activeTab === "others") {
        selectDocument(otherDocs[0].id)
      }
    } catch (error) {
      console.error("Failed to load contents:", error)
      setContents([])
    }
  }

  const selectDocument = async (id: string) => {
    try {
      const content = await fetchGeneratedContentById(id)
      setSelectedContent(content)
    } catch (error) {
      console.error("Failed to load content:", error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Select first item in the new tab if available
    if (value === "bestPractices" && bestPractices.length > 0) {
      selectDocument(bestPractices[0].id)
    } else if (value === "policies" && policies.length > 0) {
      selectDocument(policies[0].id)
    } else if (value === "others" && others.length > 0) {
      selectDocument(others[0].id)
    } else {
      setSelectedContent(null)
    }
  }

  // Filter functions for search
  const filteredBestPractices = bestPractices.filter(doc => 
    doc.topic.toLowerCase().includes(searchTermBestPractices.toLowerCase())
  )
  
  const filteredPolicies = policies.filter(doc => 
    doc.topic.toLowerCase().includes(searchTermPolicies.toLowerCase())
  )
  
  const filteredOthers = others.filter(doc => 
    doc.topic.toLowerCase().includes(searchTermOthers.toLowerCase())
  )

  return (
    <div className="w-full px-4">
      <h1 className="text-3xl font-bold mb-6">Generated Content History</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="bestPractices">Best Practices</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="others">Others</TabsTrigger>
        </TabsList>
        
        {/* Best Practices Tab */}
        <TabsContent value="bestPractices">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search best practices..."
                    className="pl-8"
                    value={searchTermBestPractices}
                    onChange={(e) => setSearchTermBestPractices(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
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
              ) : filteredBestPractices.length > 0 ? (
                <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {filteredBestPractices.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-muted ${
                        selectedContent?.id === doc.id ? "bg-muted" : ""
                      }`}
                      onClick={() => selectDocument(doc.id)}
                    >
                      <div className="font-medium">{doc.topic}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline">{doc.content_type}</Badge>
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No best practices found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or generate new content
                  </p>
                </div>
              )}
            </div>
            
            <div className="col-span-3">
              {selectedContent ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{selectedContent.topic}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{selectedContent.content_type}</Badge>
                      <Badge variant="secondary">{selectedContent.llm_model_used}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(selectedContent.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-6 rounded-md whitespace-pre-wrap h-[calc(100vh-300px)] overflow-auto">
                      {selectedContent.generated_text}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[calc(100vh-220px)] flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No document selected</h3>
                    <p className="text-muted-foreground max-w-md">
                      Select a document from the list to view its content
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Policies Tab */}
        <TabsContent value="policies">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search policies..."
                    className="pl-8"
                    value={searchTermPolicies}
                    onChange={(e) => setSearchTermPolicies(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
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
              ) : filteredPolicies.length > 0 ? (
                <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {filteredPolicies.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-muted ${
                        selectedContent?.id === doc.id ? "bg-muted" : ""
                      }`}
                      onClick={() => selectDocument(doc.id)}
                    >
                      <div className="font-medium">{doc.topic}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline">{doc.content_type}</Badge>
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No policies found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or generate new content
                  </p>
                </div>
              )}
            </div>
            
            <div className="col-span-3">
              {selectedContent ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{selectedContent.topic}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{selectedContent.content_type}</Badge>
                      <Badge variant="secondary">{selectedContent.llm_model_used}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(selectedContent.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-6 rounded-md whitespace-pre-wrap h-[calc(100vh-300px)] overflow-auto">
                      {selectedContent.generated_text}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[calc(100vh-220px)] flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No document selected</h3>
                    <p className="text-muted-foreground max-w-md">
                      Select a document from the list to view its content
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Others Tab */}
        <TabsContent value="others">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search other documents..."
                    className="pl-8"
                    value={searchTermOthers}
                    onChange={(e) => setSearchTermOthers(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
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
              ) : filteredOthers.length > 0 ? (
                <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {filteredOthers.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-muted ${
                        selectedContent?.id === doc.id ? "bg-muted" : ""
                      }`}
                      onClick={() => selectDocument(doc.id)}
                    >
                      <div className="font-medium">{doc.topic}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline">{doc.content_type}</Badge>
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No other documents found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or generate new content
                  </p>
                </div>
              )}
            </div>
            
            <div className="col-span-3">
              {selectedContent ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{selectedContent.topic}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{selectedContent.content_type}</Badge>
                      <Badge variant="secondary">{selectedContent.llm_model_used}</Badge>
                      <span className="text-muted-foreground">
                        {new Date(selectedContent.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-6 rounded-md whitespace-pre-wrap h-[calc(100vh-300px)] overflow-auto">
                      {selectedContent.generated_text}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[calc(100vh-220px)] flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No document selected</h3>
                    <p className="text-muted-foreground max-w-md">
                      Select a document from the list to view its content
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <div className="px-4 py-2">{currentPage}</div>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
