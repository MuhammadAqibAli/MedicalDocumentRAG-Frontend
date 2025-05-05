'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMedicalAssistant, type GeneratedContent } from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Download, Copy, CheckCircle2, AlertCircle, FileText, Info } from "lucide-react"

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { fetchGeneratedContentById, isLoading, error } = useMedicalAssistant()
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    if (params.id) {
      loadContent(params.id as string)
    }
  }, [params.id])

  const loadContent = async (id: string) => {
    try {
      const fetchedContent = await fetchGeneratedContentById(id)
      setContent(fetchedContent)
    } catch (error) {
      console.error("Failed to load content:", error)
    }
  }

  const copyToClipboard = () => {
    if (content) {
      navigator.clipboard.writeText(content.generated_text)
      alert("Content copied to clipboard")
    }
  }

  const downloadAsPDF = () => {
    // In a real application, this would generate a PDF
    alert("PDF download functionality would be implemented here")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : content ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{content.topic}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{content.content_type}</Badge>
                  <Badge variant="secondary">{content.llm_model_used}</Badge>
                  {content?.validation_results?.["Clinical Relevance"] ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadAsPDF} className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="mt-4">
                <div className="bg-muted p-6 rounded-md whitespace-pre-wrap">{content.generated_text}</div>
              </TabsContent>
              <TabsContent value="validation" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {content.validation_results && 
                      content.validation_results["Consistency"] && 
                      content.validation_results["Language Tone"] && 
                      content.validation_results["Clinical Relevance"] ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-600">Valid Content</AlertTitle>
                        <AlertDescription className="text-green-700">
                          This content has passed all validation checks and is compliant with New Zealand healthcare
                          standards.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Invalid Content</AlertTitle>
                        <AlertDescription>This content has failed one or more validation checks.</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {content.validation_results && (
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-2">Validation Results:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <Badge className={content.validation_results["Consistency"] ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {content.validation_results["Consistency"] ? 
                              <CheckCircle2 className="h-3 w-3 mr-1" /> : 
                              <AlertCircle className="h-3 w-3 mr-1" />}
                            Consistency
                          </Badge>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge className={content.validation_results["Language Tone"] ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {content.validation_results["Language Tone"] ? 
                              <CheckCircle2 className="h-3 w-3 mr-1" /> : 
                              <AlertCircle className="h-3 w-3 mr-1" />}
                            Language Tone
                          </Badge>
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge className={content.validation_results["Clinical Relevance"] ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {content.validation_results["Clinical Relevance"] ? 
                              <CheckCircle2 className="h-3 w-3 mr-1" /> : 
                              <AlertCircle className="h-3 w-3 mr-1" />}
                            Clinical Relevance
                          </Badge>
                        </li>
                      </ul>
                      
                      {content.validation_results["Potential Issues"] && content.validation_results["Potential Issues"].length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Potential Issues:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {content.validation_results["Potential Issues"].map((issue, index) => (
                              <li key={index} className="text-sm">
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="sources" className="mt-4">
                {content.sourceChunks && content.sourceChunks.length > 0 ? (
                  <div className="space-y-4">
                    {content.sourceChunks.map((chunk, index) => (
                      <div key={index} className="bg-muted p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{chunk.source}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{chunk.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Info className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No source information available</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This content was generated without using retrieval-augmented generation.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">Generated on {new Date(content.created_at).toLocaleString()}</p>
          </CardFooter>
        </Card>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Content not found</AlertTitle>
          <AlertDescription>
            The requested content could not be found. Please return to the history page and try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
