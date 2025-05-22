"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMedicalAssistant } from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles, AlertCircle, Trash2, Edit, Search, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import apiService from "@/lib/api"

// Types
interface AuditQuestion {
  id: string
  question_text: string
  policy_name: string
  ai_model: string
  options: string[]
  created_at: string
  updated_at: string
}

interface GenerateFormValues {
  policyName: string
  numberOfQuestions: number
  aiModel: string
}

interface EditFormValues {
  questionText: string
  options: string
}

export default function AuditQuestionsPage() {
  const { fetchAvailableModels, isLoading: contextLoading } = useMedicalAssistant()
  const { toast } = useToast()
  
  const [auditQuestions, setAuditQuestions] = useState<AuditQuestion[]>([])
  const [models, setModels] = useState<{ name: string }[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingQuestion, setEditingQuestion] = useState<AuditQuestion | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  
  // Form for generating questions
  const generateForm = useForm<GenerateFormValues>({
    defaultValues: {
      policyName: "",
      numberOfQuestions: 5,
      aiModel: "",
    },
  })
  
  // Form for editing questions
  const editForm = useForm<EditFormValues>({
    defaultValues: {
      questionText: "",
      options: "",
    },
  })
  
  // Load models on page load
  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await fetchAvailableModels()
        
        if (Array.isArray(availableModels) && availableModels.length > 0) {
          setModels(availableModels)
          generateForm.setValue("aiModel", availableModels[0].name)
        } else {
          // Fallback if no models returned
          const fallbackModels = [
            { name: "gpt-4o" },
            { name: "gpt-4.1" },
            { name: "gemini-2.5-pro-preview" },
            { name: "claude-3-opus" }
          ]
          setModels(fallbackModels)
          generateForm.setValue("aiModel", fallbackModels[0].name)
        }
      } catch (error) {
        console.error("Failed to load models:", error)
        // Fallback to hardcoded models if API fails
        const fallbackModels = [
          { name: "gpt-4o" },
          { name: "gpt-4.1" },
          { name: "gemini-2.5-pro-preview" },
          { name: "claude-3-opus" }
        ]
        setModels(fallbackModels)
        generateForm.setValue("aiModel", fallbackModels[0].name)
      } finally {
        setModelsLoading(false)
      }
    }

    loadModels()
    fetchAuditQuestions()
  }, [])
  
  // Fetch audit questions
  const fetchAuditQuestions = async (policyName?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiService.fetchAuditQuestions(policyName)
      setAuditQuestions(response.data)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch audit questions"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Generate audit questions
  const onGenerateSubmit = async (data: GenerateFormValues) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await apiService.generateAuditQuestions({
        ai_model: data.aiModel,
        policy_name: data.policyName,
        number_of_questions: data.numberOfQuestions
      })
      
      // Add new questions to the list
      setAuditQuestions(prev => [...response.data, ...prev])
      
      toast({
        title: "Success",
        description: `Generated ${response.data.length} audit questions for ${data.policyName}`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
      
      // Reset form
      generateForm.reset({
        policyName: "",
        numberOfQuestions: 5,
        aiModel: data.aiModel,
      })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate audit questions"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Delete audit question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await apiService.deleteAuditQuestion(questionId)
      
      // Remove question from list
      setAuditQuestions(prev => prev.filter(q => q.id !== questionId))
      
      toast({
        title: "Success",
        description: "Audit question deleted successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete audit question"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Edit audit question
  const handleEditQuestion = (question: AuditQuestion) => {
    setEditingQuestion(question)
    editForm.reset({
      questionText: question.question_text,
      options: question.options.join(", "),
    })
    setEditDialogOpen(true)
  }
  
  // Submit edit form
  const onEditSubmit = async (data: EditFormValues) => {
    if (!editingQuestion) return
    
    setIsLoading(true)
    
    try {
      const options = data.options.split(",").map(option => option.trim())
      
      const response = await apiService.updateAuditQuestion(editingQuestion.id, {
        question_text: data.questionText,
        options: options
      })
      
      // Update question in list
      setAuditQuestions(prev => 
        prev.map(q => q.id === editingQuestion.id ? response.data : q)
      )
      
      toast({
        title: "Success",
        description: "Audit question updated successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
      
      setEditDialogOpen(false)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update audit question"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Filter questions by search term
  const filteredQuestions = auditQuestions.filter(question => 
    question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.policy_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Audit Questions Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Generate Questions Form */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Audit Questions
              </CardTitle>
              <CardDescription>Create audit questions using AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generateForm}>
                <form onSubmit={generateForm.handleSubmit(onGenerateSubmit)} className="space-y-4">
                  <FormField
                    control={generateForm.control}
                    name="policyName"
                    rules={{ required: "Policy name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Data Privacy Policy" {...field} disabled={isGenerating} />
                        </FormControl>
                        <FormDescription>Enter the policy name for audit questions</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generateForm.control}
                    name="numberOfQuestions"
                    rules={{ 
                      required: "Number of questions is required",
                      min: { value: 1, message: "Minimum 1 question" },
                      max: { value: 50, message: "Maximum 50 questions" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={50} 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            disabled={isGenerating} 
                          />
                        </FormControl>
                        <FormDescription>How many questions to generate (1-50)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generateForm.control}
                    name="aiModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Model</FormLabel>
                        {modelsLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : models.length > 0 ? (
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
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
                        <FormDescription>Choose the AI model for generating questions</FormDescription>
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
                  
                  <Button type="submit" disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Questions List */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Audit Questions</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <CardDescription>Manage your audit questions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60%]">Question</TableHead>
                        <TableHead>Policy</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className="font-medium">{question.question_text}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{question.policy_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{question.ai_model}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditQuestion(question)}
                                title="Edit question"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteQuestion(question.id)}
                                title="Delete question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No audit questions found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate new questions using the form or clear your search filter.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Question Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Audit Question</DialogTitle>
            <DialogDescription>
              Update the question text and response options.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="questionText"
                rules={{ required: "Question text is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the audit question" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="options"
                rules={{ required: "Options are required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Options</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Compliant, Partial Compliant, Non Compliant" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter options separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

