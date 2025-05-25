"use client"

import { useEffect, useState, useRef } from "react"

import { useRouter } from "next/navigation"
import { useMedicalAssistant, type ContentType, type GeneratedContent, type SavedStandard } from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText, AlertCircle, Search, MoreVertical,
  Edit, Trash2, Download, X, Save
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { toast } from "sonner"
import { BrainCircuit } from "lucide-react"
import dynamic from "next/dynamic";
//import html2pdf from 'html2pdf.js'

// Import TipTap editor with dynamic import to avoid SSR issues
const TipTapEditor = dynamic(
  () => import('@/components/TipTapEditor'),
  { ssr: false }
);

// Import ReactFlow components dynamically to avoid SSR issues
const MindMapEditor = dynamic(
  () => import("@/components/mind-map-editor"), 
  { ssr: false }
)

// Import DocumentMapViewer
const DocumentMapViewer = dynamic(() => import("@/components/document-map-viewer"), {
  ssr: false
})

export default function HistoryPage() {
  const router = useRouter()
  const { standardTypes, fetchStandardTypes, isLoading: contextLoading, error: contextError } = useMedicalAssistant()
  const [activeTab, setActiveTab] = useState("")
  const [standards, setStandards] = useState<SavedStandard[]>([])
  const [selectedStandard, setSelectedStandard] = useState<SavedStandard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [tabs, setTabs] = useState<{ id: string; label: string; typeId: string }[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStandard, setEditingStandard] = useState<SavedStandard | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [editedTitle, setEditedTitle] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [standardToDelete, setStandardToDelete] = useState<SavedStandard | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mindMapDialogOpen, setMindMapDialogOpen] = useState(false)
  const [mindMapStandard, setMindMapStandard] = useState<SavedStandard | null>(null)
  const [documentMapDialogOpen, setDocumentMapDialogOpen] = useState(false)

  // Function to handle standard click in document map
  const handleDocumentMapStandardClick = (standard: SavedStandard) => {
    // If the standard has an empty ID, it's a category click
    if (!standard.id) {
      // Just activate the tab for this standard type
      setActiveTab(standard.standard_type)
      setSelectedStandard(null) // Clear any selected standard
      
      // Close the dialog after selection
      setDocumentMapDialogOpen(false)
      return
    }
    
    // Otherwise it's a standard click
    // Find the tab for this standard's type
    const standardType = standardTypes.find(type => type.id === standard.standard_type)
    if (standardType) {
      // Set active tab to this standard's type
      setActiveTab(standardType.id)
      
      // After tab change and standards load, select this specific standard
      setTimeout(() => {
        setSelectedStandard(standard)
        
        // Close the dialog after selection
        setDocumentMapDialogOpen(false)
      }, 100)
    }
  }

  // Initialize tabs based on standard types
  useEffect(() => {
    if (standardTypes.length > 0) {
      const newTabs = standardTypes.map(type => ({
        id: type.id,
        label: type.name,
        typeId: type.id
      }))
      setTabs(newTabs)

      // Set active tab to the first tab if not already set
      if (!activeTab && newTabs.length > 0) {
        setActiveTab(newTabs[0].id)
      }
    } else {
      fetchStandardTypes()
    }
  }, [standardTypes, activeTab, fetchStandardTypes])

  const getCurrentTypeId = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab)
    return currentTab ? currentTab.typeId : tabs[0]?.typeId || ""
  }

  // Fetch standards based on the selected tab
  const fetchStandards = async (typeId: string) => {
    if (!typeId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/standards/?standard_type_id=${typeId}`)

      if (Array.isArray(response.data)) {
        setStandards(response.data)
        setTotalPages(Math.ceil(response.data.length / 10) || 1)

        // Select first item if available
        if (response.data.length > 0) {
          setSelectedStandard(response.data[0])
        } else {
          setSelectedStandard(null)
        }
      } else {
        setStandards([])
        setSelectedStandard(null)
      }
    } catch (err) {
      console.error("Failed to fetch standards:", err)
      setError("Failed to load standards. Please try again later.")
      setStandards([])
      setSelectedStandard(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Load standards when tab changes or on initial load
  useEffect(() => {
    const typeId = getCurrentTypeId()
    if (typeId) {
      fetchStandards(typeId)
    }
  }, [activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchTerm("")
  }

  const selectStandard = (standard: SavedStandard) => {
    setSelectedStandard(standard)
  }

  const handleEdit = (standard: SavedStandard) => {
    setEditingStandard(standard)
    setEditedContent(standard.content)
    setEditedTitle(standard.standard_title)
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingStandard) return

    setIsUpdating(true)

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/standards/${editingStandard.id}/`, {
        standard_title: editedTitle,
        content: editedContent,
        version: editingStandard.version // You might want to increment this
      })

      // Update the standards list with the updated standard
      setStandards(prevStandards =>
        prevStandards.map(std =>
          std.id === editingStandard.id ? response.data : std
        )
      )

      // Update selected standard if it's the one being edited
      if (selectedStandard?.id === editingStandard.id) {
        setSelectedStandard(response.data)
      }

      // Use Sonner toast
      toast.success("Standard Updated", {
        description: "The standard has been successfully updated."
      })

      setEditDialogOpen(false)
    } catch (err) {
      console.error("Failed to update standard:", err)

      // Use Sonner toast for error
      toast.error("Update Failed", {
        description: "Failed to update the standard. Please try again."
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (standard: SavedStandard) => {
    setStandardToDelete(standard)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!standardToDelete) return

    setIsDeleting(true)

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/standards/${standardToDelete.id}/`)

      // Remove the deleted standard from the list
      setStandards(prevStandards =>
        prevStandards.filter(std => std.id !== standardToDelete.id)
      )

      // If the deleted standard was selected, clear the selection
      if (selectedStandard?.id === standardToDelete.id) {
        setSelectedStandard(standards.find(std => std.id !== standardToDelete.id) || null)
      }

      // Use Sonner toast
      toast.success("Standard Deleted", {
        description: "Standard deleted successfully."

      })

      setDeleteDialogOpen(false)
    } catch (err) {
      console.error("Failed to delete standard:", err)

      // Use Sonner toast for error
      toast.error("Delete Failed", {
        description: "There was a problem deleting the standard. Please try again."
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = (standard: SavedStandard) => {
    const element = document.createElement("div")
    element.innerHTML = standard.content

    const opt = {
      margin: 1,
      filename: `${standard.standard_title}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    }

    //html2pdf().set(opt).from(element).save()

    toast.success("Export started", {
      description: "Your document is being exported as PDF.",
    })
  }

  const handleMindMap = (standard: SavedStandard) => {
    setMindMapStandard(standard)
    setMindMapDialogOpen(true)
  }

  // Filter standards based on search term
  const filteredStandards = standards.filter(standard =>
    standard.standard_title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Document History</h1>
        <Button 
          onClick={() => setDocumentMapDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <BrainCircuit className="h-4 w-4" />
          Document Map
        </Button>
      </div>

      {(error || contextError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || contextError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id}>
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={`Search ${tab.label}...`}
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {isLoading || contextLoading ? (
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
                ) : filteredStandards.length > 0 ? (
                  <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                    {filteredStandards.map((standard) => (
                      <div
                        key={standard.id}
                        className={`p-3 border rounded-md cursor-pointer hover:bg-muted ${
                          selectedStandard?.id === standard.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className="flex-1 mr-2"
                            onClick={() => selectStandard(standard)}
                          >
                            <div className="font-medium">{standard.standard_title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Badge variant="outline">{standard.standard_type_name}</Badge>
                              {new Date(standard.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(standard)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMindMap(standard)}>
                                <BrainCircuit className="h-4 w-4 mr-2" />
                                Mind Map
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(standard)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport(standard)}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No {tab.label} standards found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search or create new content
                    </p>
                  </div>
                )}
              </div>

              <div className="col-span-3">
                {selectedStandard ? (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>{selectedStandard.standard_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline">{selectedStandard.standard_type_name}</Badge>
                        {selectedStandard.llm_model_used && (
                          <Badge variant="secondary">{selectedStandard.llm_model_used}</Badge>
                        )}
                        <span className="text-muted-foreground">
                          {new Date(selectedStandard.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="bg-muted p-6 rounded-md h-[calc(100vh-300px)] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: selectedStandard.content }}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-[calc(100vh-220px)] flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No standard selected</h3>
                      <p className="text-muted-foreground max-w-md">
                        Select a standard from the list to view its content
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Standard</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex-1 overflow-hidden">
              <label className="text-sm font-medium mb-1 block">Content</label>
              <div className="h-[calc(60vh-100px)] border rounded-md overflow-auto">
                <TipTapEditor
                  content={editedContent}
                  onChange={setEditedContent}
                  editorClass="h-full"
                  maxLength={1000000}
                  scrollable={true}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  "Updating..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>Are you sure you want to delete "{standardToDelete?.standard_title}"?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mind Map Dialog */}
      <Dialog open={mindMapDialogOpen} onOpenChange={setMindMapDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-4 pt-4 pb-4 flex-shrink-0">
            <DialogTitle>Mind Map Editor: {mindMapStandard?.standard_title}</DialogTitle>
          </DialogHeader>
          {mindMapStandard && (
            <div className="flex-1 overflow-hidden" style={{ background: '#ffffff' }}>
              <MindMapEditor
                standard={mindMapStandard}
                onSave={async (updatedContent, updatedTitle) => {
                  if (!mindMapStandard) return

                  setIsUpdating(true)

                  try {
                    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/standards/${mindMapStandard.id}/`, {
                      standard_title: updatedTitle || mindMapStandard.standard_title,
                      content: updatedContent,
                      version: mindMapStandard.version
                    })

                    // Update the standards list with the updated standard
                    setStandards(prevStandards =>
                      prevStandards.map(std =>
                        std.id === mindMapStandard.id ? response.data : std
                      )
                    )

                    // Update selected standard if it's the one being edited
                    if (selectedStandard?.id === mindMapStandard.id) {
                      setSelectedStandard(response.data)
                    }

                    toast.success("Mind Map Updated", {
                      description: "The document has been successfully updated from mind map."
                    })

                    setMindMapDialogOpen(false)
                  } catch (err) {
                    console.error("Failed to update standard:", err)

                    toast.error("Update Failed", {
                      description: "Failed to update the document. Please try again."
                    })
                  } finally {
                    setIsUpdating(false)
                  }
                }}
                onCancel={() => setMindMapDialogOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Map Dialog */}
      <Dialog open={documentMapDialogOpen} onOpenChange={setDocumentMapDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-4 pt-4 pb-4 flex-shrink-0">
            <DialogTitle>Document Map</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <DocumentMapViewer
              standards={standards}
              standardTypes={standardTypes}
              onStandardClick={handleDocumentMapStandardClick}
              showNodeControls={false} // Hide node controls in document map view
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
