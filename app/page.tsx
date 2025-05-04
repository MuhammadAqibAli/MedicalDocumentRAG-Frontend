import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileUp, History, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Medical Assistant for Healthcare Professionals</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload medical documents, generate content using AI models, and manage your generated content efficiently.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>Upload medical documents in PDF or DOCX format</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Securely upload your medical documents for processing and analysis.</p>
            <Button asChild className="w-full">
              <Link href="/upload">Upload Documents</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Content Generation
            </CardTitle>
            <CardDescription>Generate medical content using AI models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create policies, procedures, and other medical content with AI assistance.</p>
            <Button asChild className="w-full">
              <Link href="/generate">Generate Content</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Content History
            </CardTitle>
            <CardDescription>View and manage your generated content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Access, filter, and download your previously generated content.</p>
            <Button asChild className="w-full">
              <Link href="/history">View History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="py-8 bg-muted rounded-lg p-6 mt-12">
        <h2 className="text-2xl font-bold mb-4">Compliant with NZ Healthcare Standards</h2>
        <p className="text-muted-foreground">
          Our Medical Assistant is designed to help healthcare professionals in New Zealand create and manage medical
          content while maintaining compliance with local healthcare standards and regulations.
        </p>
      </section>
    </div>
  )
}
