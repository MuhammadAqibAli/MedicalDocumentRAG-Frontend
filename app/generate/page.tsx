"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  useMedicalAssistant,
  type ContentType,
  type GeneratedContent,
  type Model,
} from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sparkles, AlertCircle, CheckCircle2, Download, Copy, FileText, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface GenerateFormValues {
  topic: string
  contentType: ContentType
  modelName: string
}

export default function GeneratePage() {
  const { generateContent, fetchAvailableModels, isLoading, error } = useMedicalAssistant()
  const [models, setModels] = useState<Model[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [activeTab, setActiveTab] = useState("content")

  const form = useForm<GenerateFormValues>({
    defaultValues: {
      topic: "",
      contentType: "policy",
      modelName: "",
    },
  })

  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await fetchAvailableModels()
        setModels(Array.isArray(availableModels) ? availableModels : [])

        if (Array.isArray(availableModels) && availableModels.length > 0) {
          form.setValue("modelName", availableModels[0].name)
        } else if (mockModels.length > 0) {
          form.setValue("modelName", mockModels[0].name)
        }
      } catch (error) {
        console.error("Failed to load models:", error)
        setModels([])
        if (mockModels.length > 0) {
          form.setValue("modelName", mockModels[0].name)
        }
      } finally {
        setModelsLoading(false)
      }
    }

    loadModels()
  }, [fetchAvailableModels, form])

  const onSubmit = async (data: GenerateFormValues) => {
    try {
      const content = await generateContent(data.topic, data.contentType, data.modelName)
      setGeneratedContent(content)
      setActiveTab("content")
    } catch (error) {
      console.error("Generation failed:", error)
    }
  }

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content)
      alert("Content copied to clipboard")
    }
  }

  const downloadAsPDF = () => {
    // In a real application, this would generate a PDF
    alert("PDF download functionality would be implemented here")
  }

  // Mock models for demonstration
  const mockModels: Model[] = [
    { name: "gpt-4-medical", description: "Advanced medical content generation" },
    { name: "med-llama", description: "Specialized for medical documentation" },
    { name: "clinical-bert", description: "Focused on clinical terminology" },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Content Generation</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Content
              </CardTitle>
              <CardDescription>Create medical content using AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    rules={{ required: "Topic is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Diabetes Management" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>Enter the main topic for content generation</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="policy">Policy</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="guideline">Guideline</SelectItem>
                            <SelectItem value="summary">Summary</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Select the type of content to generate</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Model</FormLabel>
                        {modelsLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AI model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(models) && models.length > 0
                                ? models.map((model) => (
                                    <SelectItem key={model.name} value={model.name}>
                                      {model.name}
                                    </SelectItem>
                                  ))
                                : mockModels.map((model) => (
                                    <SelectItem key={model.name} value={model.name}>
                                      {model.name}
                                    </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FormDescription>Choose the AI model for content generation</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Generating..." : "Generate Content"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
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
          ) : generatedContent ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{generatedContent.topic}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{generatedContent.contentType}</Badge>
                      <Badge variant="secondary">{generatedContent.modelName}</Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={downloadAsPDF} title="Download as PDF">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="validation">Validation</TabsTrigger>
                    <TabsTrigger value="sources">Sources</TabsTrigger>
                  </TabsList>
                  <TabsContent value="content" className="mt-4">
                    <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{generatedContent.content}</div>
                  </TabsContent>
                  <TabsContent value="validation" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {generatedContent.validationResults.valid ? (
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
                      </div>

                      {generatedContent.validationResults.issues &&
                        generatedContent.validationResults.issues.length > 0 && (
                          <div className="bg-muted p-4 rounded-md">
                            <h4 className="font-medium mb-2">Issues Found:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {generatedContent.validationResults.issues.map((issue, index) => (
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
                    {generatedContent.sourceChunks && generatedContent.sourceChunks.length > 0 ? (
                      <div className="space-y-4">
                        {generatedContent.sourceChunks.map((chunk, index) => (
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
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date(generatedContent.createdAt).toLocaleString()}
                </p>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 bg-muted rounded-lg text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Generate Medical Content</h3>
              <p className="text-muted-foreground max-w-md">
                Fill out the form to generate medical content using AI models. The generated content will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
