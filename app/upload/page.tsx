"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { useMedicalAssistant, type DocumentType } from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUp, AlertCircle, CheckCircle2, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface UploadFormValues {
  documentType: DocumentType
}


export default function UploadPage() {
  const { uploadDocument, isLoading, error } = useMedicalAssistant()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 200)

    try {
      await uploadDocument(selectedFile, data.documentType)
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadSuccess(true)
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Document Upload</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Upload Medical Document
          </CardTitle>
          <CardDescription>Upload medical documents in PDF or DOCX format for processing</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="documentType"
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
                        <SelectItem value="guideline">Guideline</SelectItem>
                        <SelectItem value="form">Form</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the type of document you are uploading</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Document File</FormLabel>
                <FormControl>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormDescription>Upload a PDF or DOCX file (max 10MB)</FormDescription>
                {form.formState.errors.root && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
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

              <Button type="submit" disabled={isLoading || !selectedFile} className="w-full">
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
  )
}
