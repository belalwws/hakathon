"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, CheckCircle, XCircle, Clock } from "lucide-react"

interface InvitationDetails {
  id: string
  email: string
  name: string
  status: string
  expiresAt: string
  createdAt: string
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchInvitationDetails()
  }, [token])

  const fetchInvitationDetails = async () => {
    try {
      const response = await fetch(`/api/supervisor/accept-invitation?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setInvitation(data.invitation)
      } else {
        setError(data.error || "حدث خطأ في جلب تفاصيل الدعوة")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError("يرجى إدخال كلمة المرور وتأكيدها")
      return
    }

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/supervisor/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("تم إنشاء حسابك بنجاح! جاري تسجيل الدخول...")

        // Force login to ensure proper session
        try {
          const loginResponse = await fetch("/api/force-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: invitation?.email,
              password: password
            })
          })

          const loginData = await loginResponse.json()

          if (loginResponse.ok) {
            setSuccess("تم تسجيل الدخول بنجاح! سيتم توجيهك الآن...")
            setTimeout(() => {
              window.location.href = loginData.redirect || "/supervisor/dashboard"
            }, 1000)
          } else {
            // Fallback to manual redirect
            setTimeout(() => {
              window.location.href = "/supervisor/dashboard"
            }, 1500)
          }
        } catch (loginError) {
          console.error("Force login failed:", loginError)
          // Fallback to manual redirect
          setTimeout(() => {
            window.location.href = "/supervisor/dashboard"
          }, 1500)
        }
      } else {
        setError(data.error || "حدث خطأ في إنشاء الحساب")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري التحقق من الدعوة...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">خطأ في الدعوة</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push("/login")} variant="outline">
                العودة لتسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">تم بنجاح!</h2>
              <p className="text-gray-600 mb-4">{success}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            مرحباً {invitation?.name}
          </CardTitle>
          <CardDescription>
            أنشئ كلمة المرور الخاصة بك للانضمام كمشرف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={invitation?.email || ""}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>تنتهي صلاحية هذه الدعوة في:</p>
            <p className="font-medium">
              {invitation && new Date(invitation.expiresAt).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
