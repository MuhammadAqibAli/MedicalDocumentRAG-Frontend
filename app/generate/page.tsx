"use client"

import { useEffect, useState, useRef } from "react"
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
  Info, Save, GitCompare, History, Search 
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import axios from "axios"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"

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

interface DocumentItem {
  id: string
  title: string
  contentType: ContentType
  createdAt: string
  content: string
}

export default function GeneratePage() {
  const { 
    generateContent, 
    fetchAvailableModels, 
    isLoading: contextLoading, 
    error, 
    saveStandard,
    standardTypes,
    fetchStandardTypes,
    isLoading
  } = useMedicalAssistant();
  const { toast } = useToast();
  const [models, setModels] = useState<Model[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [editorContent, setEditorContent] = useState("")
  const [compareDialogOpen, setCompareDialogOpen] = useState(false)
  const [historyContent, setHistoryContent] = useState("")
  const [savedContents, setSavedContents] = useState<{id: string, title: string, content: string, date: string}[]>([])
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const editorRef = useRef<any>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [documentSelectionDialogOpen, setDocumentSelectionDialogOpen] = useState(false)
  
  // New state variables for standards and comparison
  const [standards, setStandards] = useState<any[]>([])
  const [isLoadingStandards, setIsLoadingStandards] = useState(false)
  const [standardsError, setStandardsError] = useState<string | null>(null)
  const [showComparisonResults, setShowComparisonResults] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<any>(null)
  const [isComparing, setIsComparing] = useState(false)

  // Add this useEffect to fetch standards when the dialog opens
  useEffect(() => {
    if (historyDialogOpen) {
      fetchStandards();
    }
  }, [historyDialogOpen]);

  // Function to fetch standards based on the selected content type
  const fetchStandards = async () => {
    const selectedType = form.getValues().contentType;
    if (!selectedType) {
      setStandardsError("Please select a Standard Type from Content Generation.");
      return;
    }

    setIsLoadingStandards(true);
    setStandardsError(null);

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/standards/?standard_type_id=${selectedType}`);
      
      if (Array.isArray(response.data)) {
        setStandards(response.data);
      } else {
        setStandards([]);
      }
    } catch (err) {
      console.error("Failed to fetch standards:", err);
      setStandardsError("Failed to load standards. Please try again later.");
      setStandards([]);
    } finally {
      setIsLoadingStandards(false);
    }
  };

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

  // Watch for content type changes to fetch documents of that type
  useEffect(() => {
    const contentType = form.watch("contentType");
    fetchDocumentsByType(contentType);
  }, [form.watch("contentType")]);

  const fetchDocumentsByType = async (contentType: ContentType) => {
    setDocumentsLoading(true);
    try {
      // In a real application, this would be an API call
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        // Mock data for demonstration
        const mockDocuments: DocumentItem[] = [
          { 
            id: "1", 
            title: "Diabetes Management Protocol", 
            contentType: contentType, 
            createdAt: new Date().toISOString(),
            content: "<p>Diabetes management protocol content...</p>"
          },
          { 
            id: "2", 
            title: "Hypertension Guidelines", 
            contentType: contentType, 
            createdAt: new Date().toISOString(),
            content: "<p>Hypertension guidelines content...</p>"
          },
          { 
            id: "3", 
            title: "Asthma Treatment Plan", 
            contentType: contentType, 
            createdAt: new Date().toISOString(),
            content: "<p>Asthma treatment plan content...</p>"
          }
        ];
        setDocuments(mockDocuments);
        setDocumentsLoading(false);
      }, 500);

      // Uncomment for real API implementation
      /*
      const response = await axios.get(`/api/documents`, {
        params: { contentType }
      });
      setDocuments(response.data);
      */
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

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
      toast({
        title: "Content Copied",
        description: "Content has been copied to clipboard.",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    }
  }

  const downloadAsPDF = async () => {
    if (!editorContent) {
      toast({
        title: "No Content",
        description: "No content to download.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    try {
      // Create a temporary div to render the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorContent;
      tempDiv.style.width = '700px';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);

      // Use html2canvas to capture the rendered content
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit the canvas in A4
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(
        canvas.toDataURL('image/png'), 
        'PNG', 
        0, 
        0, 
        imgWidth, 
        imgHeight
      );

      // Save the PDF
      const fileName = `${form.getValues().topic || 'document'}.pdf`;
      pdf.save(fileName);

      // Add success toast notification
      toast({
        title: "Download Started",
        description: `${fileName} is being downloaded.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  }

  const saveContent = async () => {
    if (!editorContent) {
      toast({
        title: "No Content",
        description: "No content to save.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    try {
      // Prepare the data for the API
      const standardData = {
        standard_title: form.getValues().topic || "Untitled",
        standard_type: form.getValues().contentType,
        content: editorContent,
        version: "1.0",
        generated_content: generatedContent ? generatedContent.id : null
      };

      console.log("Saving standard with data:", standardData);
      //console.log("Available methods:", Object.keys(useMedicalAssistant()));

      // Call the API through the context
      const savedStandard = await saveStandard(standardData);
      
      // Update the local state with the saved content
      const newContent = {
        id: savedStandard.id,
        title: savedStandard.standard_title,
        content: savedStandard.content,
        date: new Date(savedStandard.created_at).toLocaleString()
      };
      
      setSavedContents(prev => [...prev, newContent]);
      
      // Show success message
      toast({
        title: "Content saved successfully",
        description: `"${savedStandard.standard_title}" has been saved.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
    } catch (error) {
      console.error("Failed to save standard:", error);
      // Error is already handled by the context with toast notifications
    }
  }

  const selectHistoryContent = (content: string) => {
    setHistoryContent(content)
    setHistoryDialogOpen(false)
  }

  const handleDocumentSelect = (document: DocumentItem) => {
    form.setValue("topic", document.title);
    setEditorContent(document.content);
  }

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const compareDocuments = async () => {
    // Check if both documents are present
    if (!editorContent || !historyContent) {
      toast({
        title: "Missing Documents",
        description: "Both Current Document and Historical Document are required for comparison.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
      return;
    }

    setIsComparing(true);
    setShowComparisonResults(false);

    try {
      const selectedType = form.getValues().contentType;
      
      const response = await axios.post('http://127.0.0.1:8000/api/standards/compare/', {
        content1: editorContent,
        content2: historyContent,
        standard_type_id: selectedType
      });

      setComparisonResult(response.data);
      setShowComparisonResults(true);
    } catch (error) {
      console.error("Comparison failed:", error);
      toast({
        title: "Comparison Failed",
        description: "An error occurred while comparing the documents. Please try again.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleCompareDialogChange = (open: boolean) => {
    setCompareDialogOpen(open);
    
    if (!open) {
      // Clear the comparison data when dialog is closed
      setHistoryContent("");
      setShowComparisonResults(false);
      setComparisonResult(null);
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6">Content Generation</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="mb-6">
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
                    render={({ field }) => {
                      //const { standardTypes, fetchStandardTypes, isLoading: contextLoading } = useMedicalAssistant();
                      const [typesLoading, setTypesLoading] = useState(true);
                      
                      useEffect(() => {
                        const loadTypes = async () => {
                          setTypesLoading(true);
                          try {
                            // If types are already loaded in context, use them
                            if (standardTypes.length === 0) {
                              await fetchStandardTypes();
                            }
                            // Set the first type as default if available and not already set
                            if (standardTypes.length > 0 && !field.value) {
                              field.onChange(standardTypes[0].id);
                            }
                          } catch (error) {
                            console.error("Failed to fetch standard types:", error);
                          } finally {
                            setTypesLoading(false);
                          }
                        };
                        
                        loadTypes();
                      }, [fetchStandardTypes, standardTypes.length]);
                      
                      return (
                        <FormItem>
                          <FormLabel>Standard Type</FormLabel>
                          {typesLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select standard type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {standardTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormDescription>Select the type of content to generate</FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                    <CardTitle>
                      {form.getValues().topic || "New Document"}
                      {standardTypes.find(t => t.id === form.getValues().contentType)?.name && 
                        ` - ${standardTypes.find(t => t.id === form.getValues().contentType)?.name}`
                      }
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {standardTypes.find(t => t.id === form.getValues().contentType)?.name || form.getValues().contentType}
                      </Badge>
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
      <Dialog open={compareDialogOpen} onOpenChange={handleCompareDialogChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Compare Documents</DialogTitle>
            <DialogDescription>
              Compare current document with a previously saved version
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 mt-4 overflow-hidden">
            <div>
              <h3 className="text-sm font-medium mb-2">Current Document</h3>
              <div className="border rounded-md p-2 h-[300px] overflow-auto">
                <CKEditor
                  editor={ClassicEditor}
                  data={editorContent}
                  disabled={true}
                  config={{
                    toolbar: [],
                    height: '280px'
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
                  onClick={() => {
                    const selectedType = form.getValues().contentType;
                    if (!selectedType) {
                      toast({
                        title: "Standard Type Required",
                        description: "Please select a Standard Type from Content Generation.",
                        variant: "destructive",
                        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
                      });
                      return;
                    }
                    setHistoryDialogOpen(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <History className="h-4 w-4" />
                  Select from History
                </Button>
              </div>
              <div className="border rounded-md p-2 h-[300px] overflow-auto">
                <CKEditor
                  editor={ClassicEditor}
                  data={historyContent}
                  disabled={true}
                  config={{
                    toolbar: [],
                    height: '280px'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Centered Compare Button */}
          <div className="flex justify-center mt-6">
            <Button 
              onClick={compareDocuments}
              disabled={isComparing}
              className="px-8"
            >
              {isComparing ? "Comparing..." : "Compare"}
            </Button>
          </div>
          
          {/* Comparison Results Viewer */}
          {showComparisonResults && (
            <div className="mt-6 border rounded-md p-4 overflow-auto flex-grow">
              <h3 className="text-lg font-medium mb-4">Comparison Results</h3>
              
              {comparisonResult ? (
                <div className="space-y-6 overflow-auto">
                  {/* Key Differences */}
                  <div>
                    <h4 className="text-md font-medium mb-2">Key Differences</h4>
                    <div className="space-y-4">
                      {comparisonResult.comparison.key_differences.map((diff: any, index: number) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="font-medium text-primary mb-2">{diff.aspect}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Current Document</div>
                              <div className="text-sm">{diff.document1}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Historical Document</div>
                              <div className="text-sm">{diff.document2}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recommendation */}
                  <div>
                    <h4 className="text-md font-medium mb-2">Recommendation</h4>
                    <div className="border rounded-md p-3 bg-muted/50">
                      <p>{comparisonResult.comparison.recommendation}</p>
                    </div>
                  </div>
                  
                  {/* Improvement Suggestions */}
                  <div>
                    <h4 className="text-md font-medium mb-2">Improvement Suggestions</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {comparisonResult.comparison.improvement_suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-md h-[300px] overflow-auto flex items-center justify-center">
                  <p className="text-center">We are currently working on the Compare feature.</p>
                </div>
              )}
            </div>
          )}
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
          <div className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {isLoadingStandards ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : standardsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{standardsError}</AlertDescription>
                </Alert>
              ) : standards.length > 0 ? (
                <div className="space-y-2">
                  {standards
                    .filter(standard => 
                      standard.standard_title.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((standard) => (
                      <div 
                        key={standard.id} 
                        className="border rounded-md p-3 cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setHistoryContent(standard.content);
                          setHistoryDialogOpen(false);
                        }}
                      >
                        <div className="font-medium">{standard.standard_title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline">{standard.standard_type_name}</Badge>
                          {new Date(standard.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No standards found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or create new content
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Selection Dialog */}
      <Dialog open={documentSelectionDialogOpen} onOpenChange={setDocumentSelectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Existing Documents
            </DialogTitle>
            <DialogDescription>
              Browse existing {form.watch("contentType")} documents
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="border rounded-md">
              {documentsLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 border-b last:border-b-0 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        handleDocumentSelect(doc);
                        setDocumentSelectionDialogOpen(false);
                        setHistoryContent(doc.content);
                        setHistoryDialogOpen(false);
                      }}
                    >
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
