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
      // For demo purposes, use mock data if API fails
      if (id === "1") {
        setContent({
          id: "1",
          topic: "Diabetes Management Protocol",
          contentType: "procedure",
          modelName: "gpt-4-medical",
          content: `# Diabetes Management Protocol

## Overview
This protocol outlines the standard procedures for managing patients with diabetes in primary care settings across New Zealand healthcare facilities.

## Assessment
1. Conduct comprehensive initial assessment including:
   - Medical history
   - Family history
   - Current medications
   - Lifestyle factors
   - Physical examination

2. Laboratory tests:
   - HbA1c
   - Fasting plasma glucose
   - Lipid profile
   - Kidney function tests
   - Urine albumin-to-creatinine ratio

## Management
1. Lifestyle modifications:
   - Nutritional counseling
   - Physical activity recommendations
   - Smoking cessation support
   - Alcohol consumption guidance

2. Medication management:
   - First-line therapy: Metformin
   - Second-line options based on patient characteristics
   - Insulin therapy when indicated

3. Monitoring:
   - Regular HbA1c testing (every 3-6 months)
   - Annual comprehensive foot examination
   - Annual eye examination
   - Regular blood pressure monitoring

## Complications Screening
1. Cardiovascular disease
2. Diabetic nephropathy
3. Diabetic retinopathy
4. Diabetic neuropathy
5. Foot complications

## Patient Education
1. Self-monitoring of blood glucose
2. Recognition of hypoglycemia and hyperglycemia
3. Foot care
4. Medication adherence
5. Sick day management

## Referral Criteria
1. Endocrinology referral
2. Ophthalmology referral
3. Nephrology referral
4. Podiatry referral

## Documentation Requirements
All patient encounters must be documented in the electronic health record according to New Zealand health information standards.`,
          createdAt: "2023-05-15T10:30:00Z",
          validationResults: {
            valid: true,
          },
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
        })
      }
    }
  }

  const copyToClipboard = () => {
    if (content) {
      navigator.clipboard.writeText(content.content)
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
                  <Badge variant="outline">{content.contentType}</Badge>
                  <Badge variant="secondary">{content.modelName}</Badge>
                  {content?.validationResults?.valid ? (
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
                <div className="bg-muted p-6 rounded-md whitespace-pre-wrap">{content.content}</div>
              </TabsContent>
              <TabsContent value="validation" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {content.validationResults && content.validationResults.valid ? (
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

                  {content.validationResults && content.validationResults.issues && content.validationResults.issues.length > 0 && (
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-2">Issues Found:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {content.validationResults.issues.map((issue, index) => (
                          <li key={index} className="text-sm">
                            {issue}
                          </li>
                        ))}
                      </ul>
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
            <p className="text-sm text-muted-foreground">Generated on {new Date(content.createdAt).toLocaleString()}</p>
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
