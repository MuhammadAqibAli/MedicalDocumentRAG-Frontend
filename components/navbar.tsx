"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, FileUp, History, Menu, Sparkles } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navItems = [
  {
    name: "Upload",
    href: "/upload",
    icon: <FileUp className="h-4 w-4 mr-2" />,
  },
  {
    name: "Generate",
    href: "/generate",
    icon: <Sparkles className="h-4 w-4 mr-2" />,
  },
  {
    name: "History",
    href: "/history",
    icon: <History className="h-4 w-4 mr-2" />,
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white">
            <span className="text-xs">M</span>
          </div>
            <span>MMC AI</span>
            <span className="text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded">Beta</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Button key={item.href} variant={pathname === item.href ? "default" : "ghost"} asChild>
              <Link href={item.href} className="flex items-center">
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "default" : "ghost"}
                  asChild
                  className="justify-start"
                  onClick={() => setOpen(false)}
                >
                  <Link href={item.href} className="flex items-center">
                    {item.icon}
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
