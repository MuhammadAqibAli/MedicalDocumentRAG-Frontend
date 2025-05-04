import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { MedicalAssistantProvider } from "@/context/medical-assistant-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Medical Assistant",
  description: "Medical Assistant API for healthcare professionals in New Zealand",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <MedicalAssistantProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
              <footer className="border-t py-4">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Medical Assistant for New Zealand Healthcare Professionals
                </div>
              </footer>
            </div>
            <Toaster />
          </MedicalAssistantProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
