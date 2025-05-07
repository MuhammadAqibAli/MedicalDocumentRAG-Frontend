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
import { 
  Sparkles, AlertCircle, CheckCircle2, Download, Copy, FileText, 
  Info, Save, GitCompare, History 
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Type imports for CKEditor
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

interface GenerateFormValues {
  topic: string
  contentType: ContentType
  author: string
  generateUsingAI: "yes" | "no"
  modelName: string
}

export default function GeneratePage() {
  const { generateContent, fetchAvailableModels, isLoading, error } = useMedicalAssistant()
  const [models, setModels] = useState<Model[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [editorContent, setEditorContent] = useState("")
  const [compareDialogOpen, setCompareDialogOpen] = useState(false)
  const [historyContent, setHistoryContent] = useState("")
  const [savedContents, setSavedContents] = useState<{id: string, title: string, content: string, date: string}[]>([])
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)

  const form = useForm<GenerateFormValues>({
    defaultValues: {
      topic: "",
      contentType: "policy",
      author: "Dr. Smith",
      generateUsingAI: "yes",
      modelName: "",
    },
  })

  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await fetchAvailableModels();
        console.log("Available models:", availableModels);
        
        if (Array.isArray(availableModels) && availableModels.length > 0) {
          setModels(availableModels);
          form.setValue("modelName", availableModels[0].name);
        } else {
          // Fallback if no models returned
          const fallbackModels = [
            { name: "llama3-8b-instruct" },
            { name: "mistral-7b-instruct" },
            { name: "phi-3-mini-instruct" },
            { name: "tinyllama-1.1b-chat" }
          ];
          setModels(fallbackModels);
          form.setValue("modelName", fallbackModels[0].name);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
        // Fallback to hardcoded models if API fails
        const fallbackModels = [
          { name: "llama3-8b-instruct" },
          { name: "mistral-7b-instruct" },
          { name: "phi-3-mini-instruct" },
          { name: "tinyllama-1.1b-chat" }
        ];
        setModels(fallbackModels);
        form.setValue("modelName", fallbackModels[0].name);
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []); // Empty dependency array to run only once

  const onSubmit = async (data: GenerateFormValues) => {
    try {
      if (data.generateUsingAI === "yes") {
        const content = await generateContent(data.topic, data.contentType, data.modelName)
        setGeneratedContent(content)
        setEditorContent(content.generated_text)
      } else {
        // If not using AI, just create an empty editor for manual input
        setEditorContent("")
      }
    } catch (error) {
      console.error("Generation failed:", error)
    }
  }

  const copyToClipboard = () => {
    if (editorContent) {
      navigator.clipboard.writeText(editorContent)
      alert("Content copied to clipboard")
    }
  }

  const downloadAsPDF = () => {
    // In a real application, this would generate a PDF
    alert("PDF download functionality would be implemented here")
  }

  const saveContent = () => {
    if (editorContent) {
      const newContent = {
        id: Date.now().toString(),
        title: form.getValues().topic || "Untitled",
        content: editorContent,
        date: new Date().toLocaleString()
      }
      setSavedContents(prev => [...prev, newContent])
      alert("Content saved successfully")
    }
  }

  const selectHistoryContent = (content: string) => {
    setHistoryContent(content)
    setHistoryDialogOpen(false)
  }

  return (
    <div className="max-w-full mx-auto">
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
                        <FormLabel>Document Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="policy">Policy</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="best practice">Best Practice</SelectItem>
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
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select author" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                            <SelectItem value="Dr. Robert">Dr. Robert</SelectItem>
                            <SelectItem value="Sarah William">Sarah William</SelectItem>
                            <SelectItem value="Dr. Albert">Dr. Albert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Select the author of the document</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="generateUsingAI"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Generate Using AI</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">YES</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">NO</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("generateUsingAI") === "yes" && (
                    <FormField
                      control={form.control}
                      name="modelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Model</FormLabel>
                          {modelsLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : models.length > 0 ? (
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select AI model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {models.map((model) => (
                                  <SelectItem key={model.name} value={model.name}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Alert variant="destructive" className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>No models available</AlertTitle>
                              <AlertDescription>
                                Could not load AI models. Please try refreshing the page.
                              </AlertDescription>
                            </Alert>
                          )}
                          <FormDescription>Choose the AI model for content generation</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

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
          ) : (
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{form.getValues().topic || "New Document"}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{form.getValues().contentType}</Badge>
                      {generatedContent && (
                        <Badge variant="secondary">{generatedContent.llm_model_used}</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={downloadAsPDF} title="Download as PDF">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={saveContent} title="Save content">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setCompareDialogOpen(true)} 
                      title="Compare with history"
                    >
                      <GitCompare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 h-[calc(100%-80px)]">
                <div className="h-full">
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorContent}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorContent(data);
                    }}
                    config={{
                      toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'],
                      height: '500px'
                    }}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  {generatedContent ? 
                    `Generated on ${new Date(generatedContent.created_at).toLocaleString()}` : 
                    "New document"}
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Compare Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Compare Documents</DialogTitle>
            <DialogDescription>
              Compare current document with a previously saved version
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Current Document</h3>
              <div className="border rounded-md p-2 h-[400px] overflow-auto">
                <CKEditor
                  editor={ClassicEditor}
                  data={editorContent}
                  disabled={true}
                  config={{
                    toolbar: [],
                    height: '380px'
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Historical Document</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setHistoryDialogOpen(true)}
                  className="flex items-center gap-1"
                >
                  <History className="h-4 w-4" />
                  Select from History
                </Button>
              </div>
              <div className="border rounded-md p-2 h-[400px] overflow-auto">
                <CKEditor
                  editor={ClassicEditor}
                  data={historyContent}
                  disabled={true}
                  config={{
                    toolbar: [],
                    height: '380px'
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Selection Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Historical Document</DialogTitle>
            <DialogDescription>
              Choose a previously saved document to compare
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {savedContents.length > 0 ? (
              <div className="space-y-2">
                {savedContents.map((item) => (
                  <div 
                    key={item.id} 
                    className="border rounded-md p-3 cursor-pointer hover:bg-muted"
                    onClick={() => selectHistoryContent(item.content)}
                  >
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium">No saved documents</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Save some documents first to enable comparison.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
