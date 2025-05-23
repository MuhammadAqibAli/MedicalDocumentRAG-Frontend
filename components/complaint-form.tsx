"use client"

import { useState, useRef } from "react"
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
import { CalendarIcon, Download, Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import apiService from "@/lib/api"

type ComplaintFormProps = {
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

export function ComplaintForm({ onSuccess, onCancel }: ComplaintFormProps) {
  const [activeTab, setActiveTab] = useState("information")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ComplaintFormValues>({
    defaultValues: {
      form_date: new Date(),
      received_date: new Date(),
      is_acknowledged: false,
      is_notified_external: false,
      is_resolved: false,
      is_disclosure_required: false,
      is_followup_required: false,
      is_event_analysis_required: false,
      is_training_required: false,
      is_visible_to_users: true,
      disable_editing: false,
    }
  })

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

      await apiService.createComplaint(formData)

      toast.success("Complaint submitted successfully", {
        className: "bg-green-50 border-green-200",
      })

      onSuccess()
    } catch (error) {
      console.error("Error submitting complaint:", error)
      toast.error("Failed to submit complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          New Complaint
          <span className="ml-2 text-amber-500">★</span>
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => onCancel()}>
            Cancel
          </Button>
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
          </TabsList>

          <TabsContent value="information" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_number" className="font-medium">
                  Reference Number
                </Label>
                <Input
                  id="reference_number"
                  placeholder="#023"
                  {...register("reference_number")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice" className="font-medium">
                  Practice
                </Label>
                <Select onValueChange={(value) => setValue("practice", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Practice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auckland Medical Center">Auckland Medical Center</SelectItem>
                    <SelectItem value="Wellington Health Clinic">Wellington Health Clinic</SelectItem>
                    <SelectItem value="Christchurch Hospital">Christchurch Hospital</SelectItem>
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
                <Input
                  id="reporter_name"
                  {...register("reporter_name", { required: "Reporter name is required" })}
                  className={errors.reporter_name ? "border-red-500" : ""}
                />
                {errors.reporter_name && (
                  <p className="text-red-500 text-sm">{errors.reporter_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="group" className="font-medium">
                  Group
                </Label>
                <Input
                  id="group"
                  placeholder="Admin"
                  {...register("group")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={() => setActiveTab("patient-details")}>
                Next
              </Button>
            </div>
          </TabsContent>

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
                  Patient NHI <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patient_nhi"
                  placeholder="AAANNNN"
                  {...register("patient_nhi", { required: "Patient NHI is required" })}
                  className={errors.patient_nhi ? "border-red-500" : ""}
                />
                {errors.patient_nhi && (
                  <p className="text-red-500 text-sm">{errors.patient_nhi.message}</p>
                )}
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
                  {...register("patient_email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={errors.patient_email ? "border-red-500" : ""}
                />
                {errors.patient_email && (
                  <p className="text-red-500 text-sm">{errors.patient_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_phone" className="font-medium">
                  Patient Phone Number
                </Label>
                <div className="flex">
                  <div className="flex items-center border rounded-l-md px-3 bg-gray-50">
                    <span>+64</span>
                  </div>
                  <Input
                    id="patient_phone"
                    className="rounded-l-none"
                    placeholder="21 123 4567"
                    {...register("patient_phone")}
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
                <Select onValueChange={(value) => setValue("complaint_method", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Complaint Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="In Person">In Person</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint_severity" className="font-medium">
                  Complaint Severity
                </Label>
                <Select onValueChange={(value) => setValue("complaint_severity", value)}>
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
                <Select onValueChange={(value) => setValue("complaint_owner", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Robert Johnson">Dr. Robert Johnson</SelectItem>
                    <SelectItem value="Dr. Sarah Williams">Dr. Sarah Williams</SelectItem>
                    <SelectItem value="Nurse Jane Smith">Nurse Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint_details" className="font-medium">
                Complaint Details
              </Label>
              <Textarea
                id="complaint_details"
                rows={5}
                {...register("complaint_details")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action_taken" className="font-medium">
                Action taken at time of complaint and by whom
              </Label>
              <Textarea
                id="action_taken"
                rows={5}
                {...register("action_taken")}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">
                Was the complaint notified to an external organization?
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

            <div className="space-y-2">
              <Label htmlFor="other_comments" className="font-medium">
                Any other Comments
              </Label>
              <Textarea
                id="other_comments"
                rows={3}
                {...register("other_comments")}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">
                Choose file to upload
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileClick}
                  className="flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <span className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_review_by" className="font-medium">
                Request Review By
              </Label>
              <Select onValueChange={(value) => setValue("request_review_by", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medical Director">Medical Director</SelectItem>
                  <SelectItem value="Clinical Lead">Clinical Lead</SelectItem>
                  <SelectItem value="Practice Manager">Practice Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setActiveTab("patient-details")}>
                Previous
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
                  "Save"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}



