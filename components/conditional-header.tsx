'use client'

import { usePathname } from 'next/navigation'
import { ModernHeader } from './modern-header'

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Hide header on form pages only (show on landing page and all other pages)
  const hideHeaderPaths = [
    '/judge/apply/',
    '/feedback/',
    '/forms/',
    '/register-form'
  ]
  
  const shouldHideHeader = hideHeaderPaths.some(path => pathname?.includes(path))
  
  if (shouldHideHeader) {
    return null
  }
  
  // Use new modern header everywhere
  return <ModernHeader />
}

