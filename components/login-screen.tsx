"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, LogIn, Shield, ArrowRight } from "lucide-react"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const success = await login(email, password)
      if (!success) {
        setError("بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.")
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (judgeNumber: number) => {
    setEmail(`judge${judgeNumber}@email.com`)
    setPassword("pass123")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F4FB] to-[#E6E9F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/90 backdrop-blur-lg border-[#E6E9F2] shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-[#6C4AB6]/10">
                <Shield className="w-10 h-10 text-[#6C4AB6]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-[#1F2A44]">{"تسجيل الدخول"}</CardTitle>
            <CardDescription className="text-[#9AA3B2]">{"ادخل بياناتك للوصول إلى نظام التقييم"}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#1F2A44] font-medium">
                  {"البريد الإلكتروني"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#F6F4FB] border-[#E6E9F2] text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1F2A44] font-medium">
                  {"كلمة المرور"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#F6F4FB] border-[#E6E9F2] text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20 pr-10"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9AA3B2] hover:text-[#6C4AB6]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {"جاري تسجيل الدخول..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={20} />
                    {"تسجيل الدخول"}
                    <ArrowRight size={20} />
                  </div>
                )}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-[#9AA3B2] mb-3">{"حسابات تجريبية للاختبار:"}</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[1, 2, 3].map((judgeNumber) => (
                  <Button
                    key={judgeNumber}
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials(judgeNumber)}
                    className="bg-[#F6F4FB] border-[#E6E9F2] text-[#1F2A44] hover:bg-[#6C4AB6]/10 hover:border-[#6C4AB6] text-xs"
                  >
                    {`المحكم ${judgeNumber}: judge${judgeNumber}@email.com`}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
