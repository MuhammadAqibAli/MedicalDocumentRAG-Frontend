"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMedicalAssistant, type DocumentType } from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUp, AlertCircle, CheckCircle2, FileText, Filter, ArrowUpDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface UploadFormValues {
  documentType: DocumentType
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  uploadedAt: string
  size: string
}

export default function UploadPage() {
  const { uploadDocument, isLoading, error } = useMedicalAssistant()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([
    { id: "1", name: "Clinical Guideline - Diabetes Management.pdf", type: "Clinical Guideline", uploadedAt: "5 days ago", size: "3.2 MB" },
    { id: "2", name: "Patient Information - COVID-19 Vaccination.docx", type: "Patient Information", uploadedAt: "6 days ago", size: "1.8 MB" },
    { id: "3", name: "Policy - Infection Control Measures.pdf", type: "Policy", uploadedAt: "4 days ago", size: "4.5 MB" },
    { id: "4", name: "Best Practice - Wound Care.pdf", type: "Best Practice", uploadedAt: "1 day ago", size: "2.7 MB" }
  ])

  const form = useForm<UploadFormValues>({
    defaultValues: {
      documentType: "policy",
    },
  })

  const onSubmit = async (data: UploadFormValues) => {
    if (!selectedFile) {
      form.setError("root", {
        type: "required",
        message: "Please select a file to upload",
      })
      return
    }

    setUploadSuccess(false)

    // Simulate upload progress with slower increments for longer processing time
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          // Slow down progress at 90% to account for server processing time
          return prev + 0.5
        } else if (prev >= 70) {
          return prev + 1
        }
        return prev + 2
      })
    }, 300)

    try {
      await uploadDocument(selectedFile, data.documentType)
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadSuccess(true)
      
      // Add the uploaded document to the list
      const newDocument: UploadedDocument = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: data.documentType.charAt(0).toUpperCase() + data.documentType.slice(1),
        uploadedAt: "Just now",
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      }
      
      setUploadedDocuments(prev => [newDocument, ...prev])
      setSelectedFile(null)

      // Reset the form
      form.reset()

      // Clear the file input by resetting the form element
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      clearInterval(progressInterval)
      setUploadProgress(0)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (fileExtension !== "pdf" && fileExtension !== "docx") {
        form.setError("root", {
          type: "validate",
          message: "Only PDF and DOCX files are allowed",
        })
        e.target.value = ""
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      form.clearErrors("root")
    } else {
      setSelectedFile(null)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-2">Document Upload</h1>
      <p className="text-muted-foreground mb-6">Upload and manage your standard documents</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Uploaded Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Uploaded Documents</CardTitle>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Sort
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Document</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Uploaded</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedDocuments.map((doc) => (
                    <tr key={doc.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center">
                          {doc.name.endsWith('.pdf') ? (
                            <FileText className="h-5 w-5 text-red-500 mr-2" />
                          ) : (
                            <FileText className="h-5 w-5 text-blue-500 mr-2" />
                          )}
                          <span className="text-sm">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{doc.type}</td>
                      <td className="p-3 text-sm">{doc.uploadedAt}</td>
                      <td className="p-3 text-sm">{doc.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Upload Document */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Upload standard documents in PDF or DOCX format for processing</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => {
                    const { standardTypes, fetchStandardTypes, isLoading: contextLoading } = useMedicalAssistant();
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
                                <SelectValue placeholder="Select the type of standard you are uploading" />
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
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileUp className="h-10 w-10 text-blue-500 mb-2" />
                      <Button variant="ghost" className="text-blue-500" onClick={() => fileInputRef.current?.click()}>
                        Choose File
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">Upload a PDF or DOCX file (max 10MB)</p>
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </div>
                  {form.formState.errors.root && (
                    <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.root.message}</p>
                  )}
                </FormItem>

                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">Uploading... {uploadProgress}%</p>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {uploadSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Success</AlertTitle>
                    <AlertDescription className="text-green-700">Document uploaded successfully</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading || !selectedFile} className="w-full bg-blue-500 hover:bg-blue-600">
                  {isLoading ? "Uploading..." : "Upload Document"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">Supported file formats: PDF, DOCX</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
