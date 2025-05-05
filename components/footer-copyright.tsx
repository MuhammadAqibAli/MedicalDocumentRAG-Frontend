'use client'

import { useEffect, useState } from 'react'

export function FooterCopyright() {
  const [year, setYear] = useState<number>()
  
  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])
  
  return (
    <div className="container mx-auto text-center text-sm text-muted-foreground">
      © {year || '2024'} Medical Assistant for New Zealand Healthcare Professionals
    </div>
  )
}
