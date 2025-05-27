"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleChatbot } from "@/components/SimpleChatbot"
import { FileUp, Sparkles, History, ClipboardCheck, FolderTree } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Compliant with NZ Healthcare Standards</h1>
        <p className="text-gray-600 mb-8">
          Upload standard documents, generate content using AI models, and manage
          your generated content efficiently.
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-6">
            <Link href="/generate">
              <Sparkles className="h-4 w-4" />
              Start Generating
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 flex items-center gap-2 px-6">
            <Link href="/upload">
              <FileUp className="h-4 w-4" />
              Upload Documents
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <FileUp className="h-5 w-5 text-blue-600" />
              Standard Upload
            </CardTitle>
            <CardDescription>Upload standard documents in PDF or DOCX format</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Securely upload your standard documents for processing and analysis.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/upload">Upload Documents</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Content Generation
            </CardTitle>
            <CardDescription>Generate standard content using AI models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Create policies, procedures, and other standard content with AI assistance.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/generate">Generate Content</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <History className="h-5 w-5 text-blue-600" />
              Content History
            </CardTitle>
            <CardDescription>View and manage your generated content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Access, filter, and download your previously generated content.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/history">View History</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <FolderTree className="h-5 w-5 text-blue-600" />
              Document Map
            </CardTitle>
            <CardDescription>Visualize document relationships and structure</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Explore the interconnected structure of your documents and standards.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/document-map">View Document Map</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Audit Questions
            </CardTitle>
            <CardDescription>Generate and manage audit questions for policy compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Create audit questions using AI to assess compliance with your policies and procedures.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/audit-questions">Manage Audit Questions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Patient Management
            </CardTitle>
            <CardDescription>Manage patient complaints and feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Track and respond to patient complaints, feedback, and manage patient records.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/patient-management">Patient Management</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto mt-16 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Compliant with NZ Healthcare Standards</h2>
        <p className="text-gray-600">
          Our Medical Assistant is designed to help healthcare professionals in New Zealand create and manage medical content
          while maintaining compliance with local healthcare standards and regulations.
        </p>
      </div>

      {/* Simple Medical Assistant Chatbot */}
      <SimpleChatbot />
    </div>
  )
}
