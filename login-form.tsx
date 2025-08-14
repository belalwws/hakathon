"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01645e] via-[#3ab666] to-[#c3e956] p-4">
      <Card className="w-full max-w-md glass-3d">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copy%20of%20%D8%A7%D9%84%D9%87%D9%88%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B4%D8%AA%D8%B1%D9%83%D8%A9%20%D9%84%D9%87%D8%A7%D9%83%D8%A7%D8%AB%D9%88%D9%86%20%D8%A7%D9%84%D8%A7%D8%A8%D8%AA%D9%83%D8%A7%D8%B1%20%D9%81%D9%89%20%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AD%D9%83%D9%88%D9%85%D9%8A%D8%A9%20%20_20250811_071941_0000-mhYmT6CBMBAiGfKtW6ODkUAWW0nPfS.png"
              alt="هاكاثون الابتكار في الخدمات الحكومية"
              className="h-20 w-auto mx-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-[#01645e]">تسجيل الدخول</CardTitle>
          <CardDescription className="text-[#8b7632]">أدخل بيانات الدخول للوصول إلى نظام التحكيم</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#01645e] font-medium">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#3ab666] focus:border-[#01645e] focus:ring-[#01645e]"
                placeholder="judge@hackathon.gov.sa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#01645e] font-medium">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#3ab666] focus:border-[#01645e] focus:ring-[#01645e]"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 btn-3d"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
