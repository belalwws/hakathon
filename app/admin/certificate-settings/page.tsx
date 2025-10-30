'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function CertificateSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    // Redirect to hackathon selection page
    router.push('/admin/certificate-settings/select-hackathon')
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#8b7632] text-lg">جاري التوجيه...</p>
      </div>
    </div>
  )
}
