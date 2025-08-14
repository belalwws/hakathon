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
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/90 backdrop-blur-lg border-[#c3e956]/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-[#01645e]/10">
                <Shield className="w-10 h-10 text-[#01645e]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-[#01645e]">{"تسجيل الدخول"}</CardTitle>
            <CardDescription className="text-[#8b7632]">{"ادخل بياناتك للوصول إلى نظام التقييم"}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#01645e] font-medium">
                  {"البريد الإلكتروني"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#c3e956]/10 border-[#c3e956]/30 text-[#01645e] placeholder:text-[#8b7632] focus:border-[#01645e] focus:ring-[#01645e]/20"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#01645e] font-medium">
                  {"كلمة المرور"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#c3e956]/10 border-[#c3e956]/30 text-[#01645e] placeholder:text-[#8b7632] focus:border-[#01645e] focus:ring-[#01645e]/20 pr-10"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b7632] hover:text-[#01645e]"
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
                className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white"
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
                <p className="text-sm text-[#8b7632] mb-3">{"حسابات تجريبية للاختبار:"}</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[1, 2, 3].map((judgeNumber) => (
                  <Button
                    key={judgeNumber}
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials(judgeNumber)}
                    className="bg-[#c3e956]/10 border-[#c3e956]/30 text-[#01645e] hover:bg-[#01645e]/10 hover:border-[#01645e] text-xs"
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
