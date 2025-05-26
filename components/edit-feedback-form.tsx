"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

type EditFeedbackFormProps = {
  feedbackId: string
  onSuccess: () => void
  onCancel: () => void
}

type FeedbackFormValues = {
  title: string
  practice: string
  form_date: Date
  submitter: string
  group: string
  email: string
  date_received: Date
  feedback_method: string
  patient_nhi: string
  feedback_details: string
  other_comments: string
  management_owner: string
  review_requested_by: string
}

type Practice = {
  id: string
  name: string
}

type FeedbackMethod = {
  id: string
  name: string
}

type User = {
  id: string
  name: string
}

export function EditFeedbackForm({ feedbackId, onSuccess, onCancel }: EditFeedbackFormProps) {
  const [activeTab, setActiveTab] = useState("information")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [currentAttachments, setCurrentAttachments] = useState<any[]>([])
  const [practices, setPractices] = useState<Practice[]>([])
  const [feedbackMethods, setFeedbackMethods] = useState<FeedbackMethod[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FeedbackFormValues>()

  const formDate = watch("form_date")
  const dateReceived = watch("date_received")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedbackRes, practicesRes, methodsRes, usersRes] = await Promise.all([
          apiService.getFeedback(feedbackId),
          apiService.fetchPractices(),
          apiService.fetchFeedbackMethods(),
          apiService.fetchUsers()
        ])

        const feedback = feedbackRes.data
        setPractices(practicesRes.data.results || practicesRes.data)
        setFeedbackMethods(methodsRes.data.results || methodsRes.data)
        setUsers(usersRes.data.results || usersRes.data)
        setCurrentAttachments(feedback.attachments || [])

        // Reset form with feedback data
        reset({
          title: feedback.title,
          practice: feedback.practice,
          form_date: new Date(feedback.form_date),
          submitter: feedback.submitter,
          group: feedback.group,
          email: feedback.email,
          date_received: new Date(feedback.date_received),
          feedback_method: feedback.feedback_method,
          patient_nhi: feedback.patient_nhi,
          feedback_details: feedback.feedback_details,
          other_comments: feedback.other_comments,
          management_owner: feedback.management_owner,
          review_requested_by: feedback.review_requested_by,
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch feedback data:", error)
        setError("Failed to load feedback data")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [feedbackId, reset])

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString().split('T')[0])
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value))
        }
      })

      // Add new files if selected
      selectedFiles.forEach((file) => {
        formData.append(`attachments`, file)
      })

      await apiService.updateFeedback(feedbackId, formData)

      toast.success("Feedback updated successfully", {
        className: "bg-green-50 border-green-200",
      })

      onSuccess()
    } catch (error) {
      console.error("Error updating feedback:", error)
      toast.error("Failed to update feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeAttachment = async (attachmentId: string) => {
    try {
      await apiService.removeFeedbackAttachment(feedbackId, attachmentId)
      setCurrentAttachments(prev => prev.filter(att => att.id !== attachmentId))
      toast.success("Attachment removed successfully")
    } catch (error) {
      console.error("Failed to remove attachment:", error)
      toast.error("Failed to remove attachment")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading feedback...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={onCancel}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Edit Feedback
          <span className="ml-2 text-amber-500">★</span>
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
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
            <TabsTrigger value="details">Details</TabsTrigger>
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
                <Label htmlFor="practice" className="font-medium">
                  Practice <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue("practice", value)} value={watch("practice")}>
                  <SelectTrigger className={errors.practice ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Practice" />
                  </SelectTrigger>
                  <SelectContent>
                    {practices.map((practice) => (
                      <SelectItem key={practice.id} value={practice.id}>
                        {practice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.practice && (
                  <p className="text-red-500 text-sm">Practice is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="form_date" className="font-medium">
                  Form Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formDate && "text-muted-foreground",
                        errors.form_date && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formDate ? format(formDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formDate}
                      onSelect={(date) => setValue("form_date", date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.form_date && (
                  <p className="text-red-500 text-sm">Form date is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitter" className="font-medium">
                  Name (Person Completing the Report) <span className="text-red-500">*</span>
                </Label>
                <Select 
                  onValueChange={(value) => setValue("submitter", value)} 
                  value={watch("submitter") || ""}
                >
                  <SelectTrigger className={errors.submitter ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Submitter" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.submitter && (
                  <p className="text-red-500 text-sm">Submitter is required</p>
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
                  placeholder="anna.khan@technologies.com"
                  {...register("email")}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date_received" className="font-medium">
                  Date Feedback was Received <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateReceived && "text-muted-foreground",
                        errors.date_received && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateReceived ? format(dateReceived, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateReceived}
                      onSelect={(date) => setValue("date_received", date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date_received && (
                  <p className="text-red-500 text-sm">Date received is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback_method" className="font-medium">
                  Feedback Method
                </Label>
                <Select onValueChange={(value) => setValue("feedback_method", value)} value={watch("feedback_method")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Feedback Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="management_owner" className="font-medium">
                  Feedback Management Owner
                </Label>
                <Select onValueChange={(value) => setValue("management_owner", value)} value={watch("management_owner")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review_requested_by" className="font-medium">
                  Request Review By
                </Label>
                <Select onValueChange={(value) => setValue("review_requested_by", value)} value={watch("review_requested_by")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback_details" className="font-medium">
                Feedback Details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback_details"
                rows={4}
                {...register("feedback_details", { required: "Feedback details are required" })}
                className={errors.feedback_details ? "border-red-500" : ""}
              />
              {errors.feedback_details && (
                <p className="text-red-500 text-sm">{errors.feedback_details.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_comments" className="font-medium">
                Any other Comments
              </Label>
              <Textarea
                id="other_comments"
                rows={4}
                {...register("other_comments")}
              />
            </div>

            {/* Current Attachments */}
            {currentAttachments.length > 0 && (
              <div className="space-y-4">
                <Label className="font-medium">Current Attachments</Label>
                <div className="space-y-2">
                  {currentAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between bg-blue-50 p-3 rounded">
                      <span className="text-sm font-medium">{attachment.file_name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New File Attachments */}
            <div className="space-y-4">
              <Label className="font-medium">Add New Attachments</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFileClick}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Browse Files
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">
                      Choose files to upload
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-medium">New Files to Upload:</Label>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-8">
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
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Feedback
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}






