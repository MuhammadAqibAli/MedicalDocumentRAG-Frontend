import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { MedicalAssistantProvider } from "@/context/medical-assistant-context"
import { FooterCopyright } from "@/components/footer-copyright"

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light">
          <MedicalAssistantProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
              <footer className="border-t py-4">
                <FooterCopyright />
              </footer>
            </div>
            <Toaster />
          </MedicalAssistantProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
