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
import { FileUp, AlertCircle, CheckCircle2, FileText, Filter, ArrowUpDown, Download, Trash2, Eye, ArrowUp, ArrowDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import axios from "axios"

interface UploadFormValues {
  documentType: DocumentType
}

interface UploadedDocument {
  id: string
  file_name: string
  standard_type_id: string
  standard_type_name: string
  uploaded_at: string
  time_ago?: string
  document_extension_type: string
}

type SortField = 'file_name' | 'standard_type_name' | 'uploaded_at';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'pdf' | 'docx' | string;

export default function UploadPage() {
  const { uploadDocument, isLoading, error, standardTypes, fetchStandardTypes } = useMedicalAssistant()
  const { toast } = useToast()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sortField, setSortField] = useState<SortField>('uploaded_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)

  const form = useForm<UploadFormValues>({
    defaultValues: {
      documentType: "policy",
    },
  })

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    // Only run fetchStandardTypes if it's available and not already loaded
    if (fetchStandardTypes && standardTypes.length === 0) {
      fetchStandardTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  const fetchDocuments = async () => {
    setIsDocumentsLoading(true)
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/documents/')
      setUploadedDocuments(response.data)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDocumentsLoading(false)
    }
  }

  const viewDocument = async (document: UploadedDocument) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/documents/${document.id}/`)
      setSelectedDocument(response.data)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error('Failed to fetch document details:', error)
      toast({
        title: "Error",
        description: "Failed to load document details. Please try again.",
        variant: "destructive"
      })
    }
  }

  const downloadDocument = async (document: UploadedDocument) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/documents/${document.id}/download/`, {
        responseType: 'blob'
      })
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = window.document.createElement('a')
      link.href = url
      link.setAttribute('download', document.file_name)
      window.document.body.appendChild(link)
      link.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(link)
      
      toast({
        title: "Download Started",
        description: "Download started successfully.",
        className: "bg-green-50 border-green-200",

      })
    } catch (error) {
      console.error('Failed to download document:', error)
      
      toast({
        title: "Download Failed",
        description: "There was a problem downloading the document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteDocument = async (document: UploadedDocument) => {
    if (confirm(`Are you sure you want to delete "${document.file_name}"?`)) {
      setIsDeleting(true)
      try {
        await axios.delete(`http://127.0.0.1:8000/api/documents/${document.id}/`)
        
        // Remove document from state
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== document.id))
        
        // Close the dialog if the deleted document was being viewed
        if (selectedDocument?.id === document.id) {
          setIsViewDialogOpen(false)
        }
        
        toast({
          title: "Document Deleted",
          description: "Document deleted successfully.",
          className: "bg-green-50 border-green-200",
        })
      } catch (error) {
        console.error('Failed to delete document:', error)
        
        toast({
          title: "Delete Failed",
          description: "There was a problem deleting the document. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const onSubmit = async (data: UploadFormValues) => {
    // Check if document type is selected
    if (!data.documentType) {
      form.setError("documentType", {
        type: "required",
        message: "Please select a Standard Type before uploading."
      })
      
      toast({
        title: "Missing Selection",
        description: "Please select a Standard Type before uploading.",
        variant: "destructive",
      })
      return
    }
    
    if (!selectedFile) {
      form.setError("root", {
        type: "required",
        message: "Please select a file to upload",
      })
      
      toast({
        title: "Missing File",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setUploadSuccess(false)
    setUploadProgress(0)

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
      
      // Refresh the document list
      fetchDocuments()
      
      setSelectedFile(null)

      // Reset the form
      form.reset()

      // Clear the file input by resetting the form element
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
      // Success toast with green styling
      toast({
        title: "Upload Successful",
        description: "Document uploaded successfully.",
        variant: "default",
        className: "bg-green-50 border-green-200",
      })
    } catch (error) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      
      // Error toast with red styling
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your document. Please try again.",
        variant: "destructive",
      })
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
        
        toast({
          title: "Invalid File Format",
          description: "Only PDF and DOCX files are allowed.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      form.clearErrors("root")
    } else {
      setSelectedFile(null)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field and default to ascending
      setSortField(field)
      setSortDirection('asc')
    }
    setIsSortMenuOpen(false)
  }

  // Handle filtering
  const handleFilter = (type: FilterType) => {
    setFilterType(type)
    setIsFilterMenuOpen(false)
  }

  // Get filtered and sorted documents
  const getFilteredAndSortedDocuments = () => {
    // First filter
    let filtered = [...uploadedDocuments]
    
    if (filterType !== 'all') {
      if (filterType === 'pdf' || filterType === 'docx') {
        filtered = filtered.filter(doc => doc.document_extension_type === filterType)
      } else {
        // Filter by document type
        filtered = filtered.filter(doc => doc.standard_type_id === filterType)
      }
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortField === 'file_name') {
        comparison = a.file_name.localeCompare(b.file_name)
      } else if (sortField === 'standard_type_name') {
        comparison = a.standard_type_name.localeCompare(b.standard_type_name)
      } else if (sortField === 'uploaded_at') {
        comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }

  const filteredAndSortedDocuments = getFilteredAndSortedDocuments()

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-2">Document Upload</h1>
      <p className="text-muted-foreground mb-6">Upload and manage your standard documents</p>

      <div className="grid grid-cols-10 gap-6">
        {/* Left Column - Uploaded Documents (70%) */}
        <Card className="col-span-7">
          <CardHeader className="pb-3">
            <CardTitle>Uploaded Documents</CardTitle>
            <div className="flex justify-end gap-2">
              <DropdownMenu open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleFilter('all')}>
                    All Documents
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>File Format</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleFilter('pdf')}>
                    PDF Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilter('docx')}>
                    DOCX Documents
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Document Type</DropdownMenuLabel>
                  {standardTypes.map(type => (
                    <DropdownMenuItem key={type.id} onClick={() => handleFilter(type.id)}>
                      {type.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu open={isSortMenuOpen} onOpenChange={setIsSortMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleSort('file_name')}>
                    <div className="flex items-center">
                      Name {getSortIcon('file_name')}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('standard_type_name')}>
                    <div className="flex items-center">
                      Type {getSortIcon('standard_type_name')}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('uploaded_at')}>
                    <div className="flex items-center">
                      Date {getSortIcon('uploaded_at')}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              {isDocumentsLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredAndSortedDocuments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No documents found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Document</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Uploaded</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedDocuments.map((doc) => (
                      <tr key={doc.id} className="border-t hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center">
                            {doc.document_extension_type === 'pdf' ? (
                              <FileText className="h-5 w-5 text-red-500 mr-2" />
                            ) : (
                              <FileText className="h-5 w-5 text-blue-500 mr-2" />
                            )}
                            <span className="text-sm">{doc.file_name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{doc.standard_type_name}</td>
                        <td className="p-3 text-sm">{doc.time_ago || formatDate(doc.uploaded_at)}</td>
                        <td className="p-3 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => viewDocument(doc)}
                              title="View document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => downloadDocument(doc)}
                              title="Download document"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteDocument(doc)}
                              disabled={isDeleting}
                              title="Delete document"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Upload Document (30%) */}
        <Card className="col-span-3">
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Type</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileUp className="h-10 w-10 text-blue-500 mb-2" />
                      <Button 
                        variant="ghost" 
                        className="text-blue-500" 
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission
                          fileInputRef.current?.click();
                        }}
                        type="button" // Explicitly set type to button to prevent form submission
                      >
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

      {/* Document View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              View information about this document
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                {selectedDocument.document_extension_type === 'pdf' ? (
                  <FileText className="h-8 w-8 text-red-500" />
                ) : (
                  <FileText className="h-8 w-8 text-blue-500" />
                )}
                <div>
                  <h3 className="font-medium">{selectedDocument.file_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDocument.standard_type_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Document ID</p>
                  <p className="text-sm text-muted-foreground">{selectedDocument.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDocument.uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadDocument(selectedDocument)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteDocument(selectedDocument)}
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
