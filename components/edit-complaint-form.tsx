"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download, Upload, Loader2, ArrowLeft, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import apiService from "@/lib/api"

type EditComplaintFormProps = {
  complaintId: string
  onSuccess: () => void
  onCancel: () => void
}

type ComplaintFormValues = {
  title: string
  reference_number: string
  practice: string
  form_date: Date
  reporter_name: string
  group: string
  email: string
  patient_name: string
  patient_nhi: string
  patient_dob: Date
  patient_email: string
  patient_phone: string
  is_acknowledged: boolean
  received_date: Date
  complaint_method: string
  complaint_severity: string
  complaint_owner: string
  complaint_details: string
  action_taken: string
  is_notified_external: boolean
  other_comments: string
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
}

export function EditComplaintForm({ complaintId, onSuccess, onCancel }: EditComplaintFormProps) {
  const [activeTab, setActiveTab] = useState("information")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ComplaintFormValues>()

  // Fetch complaint data
  useEffect(() => {
    const fetchComplaint = async () => {
      setIsLoading(true)
      try {
        const response = await apiService.fetchComplaintById(complaintId)

        const data = response.data

        // Parse dates
        const formDate = data.form_date ? new Date(data.form_date) : new Date()
        const receivedDate = data.received_date ? new Date(data.received_date) : new Date()
        const patientDob = data.patient_dob ? new Date(data.patient_dob) : undefined

        // Set form values
        reset({
          ...data,
          form_date: formDate,
          received_date: receivedDate,
          patient_dob: patientDob,
          is_acknowledged: Boolean(data.is_acknowledged),
          is_notified_external: Boolean(data.is_notified_external),
          is_resolved: Boolean(data.is_resolved),
          is_disclosure_required: Boolean(data.is_disclosure_required),
          is_followup_required: Boolean(data.is_followup_required),
          is_event_analysis_required: Boolean(data.is_event_analysis_required),
          is_training_required: Boolean(data.is_training_required),
          is_visible_to_users: Boolean(data.is_visible_to_users),
          disable_editing: Boolean(data.disable_editing),
        })

        // Set file path if exists
        if (data.file_upload_path) {
          setCurrentFilePath(data.file_upload_path)
        }

      } catch (err: any) {
        console.error("Failed to fetch complaint:", err)
        setError(err.response?.data?.error || "Failed to load complaint data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaint()
  }, [complaintId, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const onSubmit = async (data: ComplaintFormValues) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString().split('T')[0])
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false')
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Add file if selected
      if (selectedFile) {
        formData.append('file_upload', selectedFile)
      }

      await apiService.updateComplaint(complaintId, formData)

      toast.success("Complaint updated successfully", {
        className: "bg-green-50 border-green-200",
      })

      onSuccess()
    } catch (error) {
      console.error("Error updating complaint:", error)
      toast.error("Failed to update complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-500">Loading complaint data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <Button
          onClick={onCancel}
          className="mt-4"
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onCancel} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          Patient Management Register <span className="mx-2">›</span> Update Complaint
        </h1>
        <div className="ml-auto">
          <Button className="bg-cyan-500 hover:bg-cyan-600">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="patient-details">Patient Details</TabsTrigger>
            <TabsTrigger value="complaint-details">Complaint Details</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="information" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title", { required: true })}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">Title is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_number" className="font-medium">
                  Reference Number
                </Label>
                <Input
                  id="reference_number"
                  {...register("reference_number")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice" className="font-medium">
                  Practice
                </Label>
                <Select
                  onValueChange={(value) => setValue("practice", value)}
                  defaultValue={watch("practice")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Practice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auckland Medical Center">Auckland Medical Center</SelectItem>
                    <SelectItem value="Wellington Health Clinic">Wellington Health Clinic</SelectItem>
                    <SelectItem value="Christchurch Family Practice">Christchurch Family Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form_date" className="font-medium">
                  Form Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch("form_date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("form_date") ? (
                        format(watch("form_date"), "dd/MM/yyyy")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch("form_date")}
                      onSelect={(date) => date && setValue("form_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporter_name" className="font-medium">
                  Name (Person Completing the Report) <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue("reporter_name", value)}
                  defaultValue={watch("reporter_name")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                    <SelectItem value="John Doe">John Doe</SelectItem>
                    <SelectItem value="Amina Khan">Amina Khan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group" className="font-medium">
                  Group
                </Label>
                <Select
                  onValueChange={(value) => setValue("group", value)}
                  defaultValue={watch("group")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Nursing">Nursing</SelectItem>
                    <SelectItem value="Doctors">Doctors</SelectItem>
                    <SelectItem value="Reception">Reception</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={() => setActiveTab("patient-details")}>
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Patient Details Tab */}
          <TabsContent value="patient-details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="patient_name" className="font-medium">
                  Patient Name
                </Label>
                <Input
                  id="patient_name"
                  {...register("patient_name")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_nhi" className="font-medium">
                  Patient NHI
                </Label>
                <Input
                  id="patient_nhi"
                  {...register("patient_nhi")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_dob" className="font-medium">
                  Patient DOB
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch("patient_dob") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("patient_dob") ? (
                        format(watch("patient_dob"), "dd/MM/yyyy")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch("patient_dob")}
                      onSelect={(date) => date && setValue("patient_dob", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_email" className="font-medium">
                  Patient Email
                </Label>
                <Input
                  id="patient_email"
                  type="email"
                  {...register("patient_email")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_phone" className="font-medium">
                  Patient Phone Number
                </Label>
                <div className="flex">
                  <div className="w-16 flex items-center justify-center bg-gray-100 border border-r-0 rounded-l-md">
                    <span className="text-sm">+64</span>
                  </div>
                  <Input
                    id="patient_phone"
                    {...register("patient_phone")}
                    className="rounded-l-none"
                    placeholder="21 123 4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Patient's Complaint has been acknowledged?
                </Label>
                <RadioGroup
                  defaultValue={watch("is_acknowledged") ? "yes" : "no"}
                  onValueChange={(value) => setValue("is_acknowledged", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="acknowledged-yes" />
                    <Label htmlFor="acknowledged-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="acknowledged-no" />
                    <Label htmlFor="acknowledged-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex justify-between space-x-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("information")}>
                Previous
              </Button>
              <Button type="button" onClick={() => setActiveTab("complaint-details")}>
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Complaint Details Tab */}
          <TabsContent value="complaint-details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="received_date" className="font-medium">
                  Date Complaint was Received
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch("received_date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("received_date") ? (
                        format(watch("received_date"), "dd/MM/yyyy")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch("received_date")}
                      onSelect={(date) => date && setValue("received_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint_method" className="font-medium">
                  Complaint Method
                </Label>
                <Select
                  onValueChange={(value) => setValue("complaint_method", value)}
                  defaultValue={watch("complaint_method")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Complaint Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="In Person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint_severity" className="font-medium">
                  Complaint Severity
                </Label>
                <Select
                  onValueChange={(value) => setValue("complaint_severity", value)}
                  defaultValue={watch("complaint_severity")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint_owner" className="font-medium">
                  Complaint Owner
                </Label>
                <Input
                  id="complaint_owner"
                  {...register("complaint_owner")}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="complaint_details" className="font-medium">
                  Complaint Details
                </Label>
                <Textarea
                  id="complaint_details"
                  {...register("complaint_details")}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="action_taken" className="font-medium">
                  What action has been taken as a result of the patient's complaint?
                </Label>
                <Textarea
                  id="action_taken"
                  {...register("action_taken")}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Has the complaint been notified to external agencies?
                </Label>
                <RadioGroup
                  defaultValue={watch("is_notified_external") ? "yes" : "no"}
                  onValueChange={(value) => setValue("is_notified_external", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="notified-yes" />
                    <Label htmlFor="notified-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="notified-no" />
                    <Label htmlFor="notified-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="other_comments" className="font-medium">
                  Other Comments
                </Label>
                <Textarea
                  id="other_comments"
                  {...register("other_comments")}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_upload" className="font-medium">
                  File Upload
                </Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="file_upload"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFileClick}
                    className="flex items-center"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? selectedFile.name : "Upload File"}
                  </Button>
                  {currentFilePath && !selectedFile && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center"
                      onClick={async () => {
                        try {
                          const response = await apiService.downloadComplaintFile(complaintId)
                          const url = window.URL.createObjectURL(new Blob([response.data]))
                          const link = document.createElement('a')
                          link.href = url
                          const filename = currentFilePath?.split('/').pop() || 'complaint-document'
                          link.setAttribute('download', filename)
                          document.body.appendChild(link)
                          link.click()
                          link.remove()
                        } catch (error) {
                          console.error("Error downloading file:", error)
                          toast.error("Failed to download file. Please try again.")
                        }
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Current File
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected file: {selectedFile.name}
                  </p>
                )}
                {currentFilePath && !selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current file: {currentFilePath.split('/').pop()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between space-x-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("patient-details")}>
                Previous
              </Button>
              <Button type="button" onClick={() => setActiveTab("management")}>
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="request_review_by" className="font-medium">
                  Request for Review
                </Label>
                <Input
                  id="request_review_by"
                  {...register("request_review_by")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint_reason" className="font-medium">
                  Reason for the patient's complaint
                </Label>
                <Textarea
                  id="complaint_reason"
                  {...register("complaint_reason")}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Is the complaint resolved?
                </Label>
                <RadioGroup
                  defaultValue={watch("is_resolved") ? "yes" : "no"}
                  onValueChange={(value) => setValue("is_resolved", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="resolved-yes" />
                    <Label htmlFor="resolved-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="resolved-no" />
                    <Label htmlFor="resolved-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="identified_issues" className="font-medium">
                  What issues have been identified as a result of the patient's complaint?
                </Label>
                <Textarea
                  id="identified_issues"
                  {...register("identified_issues")}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="staff_skill_issues" className="font-medium">
                  What issues have been identified in staff skill set as a result of the patient's complaint?
                </Label>
                <Textarea
                  id="staff_skill_issues"
                  {...register("staff_skill_issues")}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="policy_impact" className="font-medium">
                  Did existing policies, processes and procedures help or hinder?
                </Label>
                <Textarea
                  id="policy_impact"
                  {...register("policy_impact")}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Is there a requirement for Open Disclosure?
                </Label>
                <RadioGroup
                  defaultValue={watch("is_disclosure_required") ? "yes" : "no"}
                  onValueChange={(value) => setValue("is_disclosure_required", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="disclosure-yes" />
                    <Label htmlFor="disclosure-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="disclosure-no" />
                    <Label htmlFor="disclosure-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Is there a requirement for follow-up care?
                </Label>
                <RadioGroup
                  defaultValue={watch("is_followup_required") ? "yes" : "no"}
                  onValueChange={(value) => setValue("is_followup_required", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="followup-yes" />
                    <Label htmlFor="followup-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="followup-no" />
                    <Label htmlFor="followup-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Is there a requirement for formal Event Analysis?
                </Label>
                <RadioGroup
                  defaultValue={watch("is_event_analysis_required") ? "yes" : "no"}
                  onValueChange={(value) => setValue("is_event_analysis_required", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="event-analysis-yes" />
                    <Label htmlFor="event-analysis-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="event-analysis-no" />
                    <Label htmlFor="event-analysis-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Is there a requirement for staff training?
                </Label>
                <RadioGroup
                  defaultValue={watch("is_training_required") ? "yes" : "no"}
                  onValueChange={(value) => setValue("is_training_required", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="training-yes" />
                    <Label htmlFor="training-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="training-no" />
                    <Label htmlFor="training-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Make Complaint Management visible to users?
                </Label>
                <RadioGroup
                  defaultValue={watch("is_visible_to_users") ? "yes" : "no"}
                  onValueChange={(value) => setValue("is_visible_to_users", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="visible-yes" />
                    <Label htmlFor="visible-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="visible-no" />
                    <Label htmlFor="visible-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Disable editing by users?
                </Label>
                <RadioGroup
                  defaultValue={watch("disable_editing") ? "yes" : "no"}
                  onValueChange={(value) => setValue("disable_editing", value === "yes")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="disable-editing-yes" />
                    <Label htmlFor="disable-editing-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="disable-editing-no" />
                    <Label htmlFor="disable-editing-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex justify-between space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setActiveTab("complaint-details")}>
                Previous
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
