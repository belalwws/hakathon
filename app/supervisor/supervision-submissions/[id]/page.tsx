'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SupervisionSubmissionsRedirect() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin supervision submissions page
    router.replace(`/admin/supervision-submissions/${params.id}`)
  }, [params.id, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#01645e] font-semibold">جاري إعادة التوجيه...</p>
      </div>
    </div>
  )
}
