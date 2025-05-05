"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMedicalAssistant, type GeneratedContent, type ContentType } from "@/context/medical-assistant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { History, Search, Filter, AlertCircle, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function HistoryPage() {
  const router = useRouter()
  const { fetchGeneratedContents, isLoading, error } = useMedicalAssistant()
  const [contents, setContents] = useState<GeneratedContent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Remove mock data and rely on API response
  useEffect(() => {
    loadContents()
  }, [currentPage, contentTypeFilter])

  const loadContents = async () => {
    try {
      const filters: Record<string, any> = {}
      if (contentTypeFilter !== "all") {
        filters.content_type = contentTypeFilter
      }
      if (searchTerm) {
        filters.search = searchTerm
      }

      const fetchedContents = await fetchGeneratedContents(currentPage, filters)

      // Ensure fetchedContents is always an array
      const safeContents = Array.isArray(fetchedContents) ? fetchedContents : []
      setContents(safeContents)

      // In a real application, the API would return pagination info
      setTotalPages(Math.ceil(safeContents.length / 10) || 1)
    } catch (error) {
      console.error("Failed to load contents:", error)
      setContents([])
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadContents()
  }

  const handleContentTypeChange = (value: string) => {
    setContentTypeFilter(value as ContentType | "all")
    setCurrentPage(1)
    // Trigger content reload when filter changes
    setTimeout(() => loadContents(), 0)
  }

  const handleRowClick = (id: string) => {
    router.push(`/history/${id}`)
  }

  // Use only the API data, no fallback to mock data
  const displayContents = Array.isArray(contents) ? contents : []

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generated Content History</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search and Filter
          </CardTitle>
          <CardDescription>Find and filter your generated content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by topic or content..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={contentTypeFilter} onValueChange={handleContentTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="guideline">Guideline</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} className="md:w-24">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Content History
          </CardTitle>
          <CardDescription>View and manage your previously generated content</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
          ) : displayContents.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Created</TableHead>
                      {/* <TableHead>Status</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayContents.map((content) => (
                      <TableRow
                        key={content.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(content.id)}
                      >
                        <TableCell className="font-medium">{content.topic}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{content.content_type}</Badge>
                        </TableCell>
                        <TableCell>{content.llm_model_used}</TableCell>
                        <TableCell>{new Date(content.created_at).toLocaleDateString()}</TableCell>
                        {/* <TableCell>
                          {
                           (content.validation_results && content.validation_results.valid) ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>
                          ) : (
                            <Badge variant="destructive">Invalid</Badge>
                          )}
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No content found</h3>
              <p className="text-muted-foreground max-w-md">
                You haven't generated any content yet, or no content matches your search criteria.
              </p>
              <Button asChild className="mt-4">
                <a href="/generate">Generate Content</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
