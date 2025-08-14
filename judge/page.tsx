"use client"

import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/login-form"
import { JudgeDashboard } from "@/components/judge-dashboard"
import { Loader2 } from "lucide-react"

export default function JudgePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01645e] via-[#3ab666] to-[#c3e956]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (user.role !== "judge") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01645e] via-[#3ab666] to-[#c3e956]">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">غير مصرح بالوصول</h1>
          <p>هذه الصفحة مخصصة للمحكمين فقط</p>
        </div>
      </div>
    )
  }

  return <JudgeDashboard />
}
