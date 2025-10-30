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

export default function SupervisorInvitationPage() {
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
    setError("")
    setSuccess("")

    if (!password || !confirmPassword) {
      setError("جميع الحقول مطلوبة")
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
        setSuccess("تم قبول الدعوة بنجاح! سيتم توجيهك إلى لوحة التحكم...")
        setTimeout(() => {
          router.push("/supervisor/dashboard")
        }, 2000)
      } else {
        setError(data.error || "حدث خطأ في قبول الدعوة")
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الدعوة...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">خطأ في الدعوة</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl text-blue-800">دعوة للانضمام كمشرف</CardTitle>
          <CardDescription>
            مرحباً {invitation?.name}، يرجى إنشاء كلمة المرور لإكمال التسجيل
          </CardDescription>
        </CardHeader>

        <CardContent>
          {invitation && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">
                <p><strong>البريد الإلكتروني:</strong> {invitation.email}</p>
                <p className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4" />
                  <strong>تنتهي الصلاحية:</strong> {new Date(invitation.expiresAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? "جاري الإنشاء..." : "إنشاء الحساب والدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
