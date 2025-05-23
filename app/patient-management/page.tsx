"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Download, Loader2, Edit, Eye, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ComplaintForm } from "@/components/complaint-form"
import { EditComplaintForm } from "@/components/edit-complaint-form"
import apiService from "@/lib/api"
import { toast } from "sonner"

type Complaint = {
  id: string
  title: string
  reference_number: string
  practice: string
  form_date: string
  reporter_name: string
  group: string
  email: string
  patient_name: string
  patient_nhi: string
  patient_dob: string
  patient_email: string
  patient_phone: string
  is_acknowledged: boolean
  received_date: string
  complaint_method: string
  complaint_severity: string
  complaint_owner: string
  complaint_details: string
  action_taken: string
  is_notified_external: boolean
  other_comments: string
  file_upload_path: string
  request_review_by: string
  complaint_reason: string
  is_resolved: boolean
  identified_issues: string
  staff_skill_issues: string
  policy_impact: string
  is_disclosure_required: boolean
  is_followup_required: boolean
  is_event_analysis_required: boolean
  is_training_required: boolean
  is_visible_to_users: boolean
  disable_editing: boolean
  created_at: string
  updated_at: string
}

export default function PatientManagementRegister() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [editingComplaintId, setEditingComplaintId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch complaints from API
  const fetchComplaints = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.fetchComplaints()
      setComplaints(response.data)
    } catch (err) {
      console.error("Failed to fetch complaints:", err)
      setError("Failed to load complaints. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/')
  }

  const handleComplaintSuccess = () => {
    setShowComplaintForm(false)
    setEditingComplaintId(null)
    fetchComplaints()
    toast.success("Complaint updated successfully", {
      className: "bg-green-50 border-green-200",
    })
  }

  const handleEditComplaint = (complaintId: string) => {
    setEditingComplaintId(complaintId)
  }

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await apiService.deleteComplaint(complaintId)
      toast.success("Complaint deleted successfully", {
        className: "bg-green-50 border-green-200",
      })
      fetchComplaints()
    } catch (err) {
      console.error("Failed to delete complaint:", err)
      toast.error("Failed to delete complaint. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (showComplaintForm) {
    return (
      <ComplaintForm
        onSuccess={handleComplaintSuccess}
        onCancel={() => setShowComplaintForm(false)}
      />
    )
  }

  if (editingComplaintId) {
    return (
      <EditComplaintForm
        complaintId={editingComplaintId}
        onSuccess={handleComplaintSuccess}
        onCancel={() => setEditingComplaintId(null)}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          Patient Management Register
        </h1>
        <div className="flex space-x-2">
          <Input
            placeholder="Type to filter list"
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button className="bg-green-500 hover:bg-green-600">
            <Plus className="mr-2 h-4 w-4" /> Add Feedback
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={() => setShowComplaintForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Complaint
          </Button>
          <Button className="bg-cyan-500 hover:bg-cyan-600">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Practice</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">Resolved</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2">Loading complaints...</p>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">No complaints found</td>
              </tr>
            ) : (
              complaints
                .filter(complaint =>
                  complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  complaint.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  complaint.practice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  complaint.complaint_owner?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((complaint) => (
                  <tr key={complaint.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => handleEditComplaint(complaint.id)}
                      >
                        {complaint.title}
                      </button>
                    </td>
                    <td className="p-3">{complaint.complaint_method || "Complaint"}</td>
                    <td className="p-3">{complaint.complaint_owner}</td>
                    <td className="p-3">{complaint.practice}</td>
                    <td className="p-3">{formatDate(complaint.received_date)}</td>
                    <td className="p-3">{complaint.complaint_severity || "N/A"}</td>
                    <td className="p-3">{complaint.is_resolved ? "Yes" : "No"}</td>
                    <td className="p-3">
                      {complaint.is_resolved ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Open</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditComplaint(complaint.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteComplaint(complaint.id)}
                            className="text-red-600 hover:text-red-700 focus:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


