"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2, UserCheck, Mail, Phone, Lock, Award } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InvitationData {
  email: string
  name: string | null
  hackathonId: string
}

interface HackathonData {
  id: string
  title: string
  description: string
  status: string
}

function JudgeRegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [hackathon, setHackathon] = useState<HackathonData | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!token) {
      setError('رمز الدعوة مفقود')
      setLoading(false)
      return
    }

    verifyInvitation()
  }, [token])

  const verifyInvitation = async () => {
    try {
      const response = await fetch(`/api/judge/register-invitation?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setInvitation(data.invitation)
        setHackathon(data.hackathon)
        // Pre-fill name if provided in invitation
        if (data.invitation.name) {
          setFormData(prev => ({ ...prev, name: data.invitation.name }))
        }
      } else {
        setError(data.error || 'دعوة غير صالحة')
      }
    } catch (err) {
      console.error('Error verifying invitation:', err)
      setError('حدث خطأ في التحقق من الدعوة')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.password) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/judge/register-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: formData.name,
          phone: formData.phone || null,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/judge/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'فشل التسجيل')
      }
    } catch (err) {
      console.error('Error registering:', err)
      setError('حدث خطأ في التسجيل')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#01645e] animate-spin mx-auto mb-4" />
          <p className="text-[#01645e] font-semibold">جاري التحقق من الدعوة...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#01645e] mb-2">دعوة غير صالحة</h2>
              <p className="text-[#8b7632] mb-6">{error}</p>
              <Button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
              >
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
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#01645e] mb-2">تم التسجيل بنجاح!</h2>
              <p className="text-[#8b7632] mb-6">جاري تحويلك إلى لوحة التحكم...</p>
              <Loader2 className="w-8 h-8 text-[#01645e] animate-spin mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                <UserCheck className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-[#01645e]">تسجيل محكم جديد</CardTitle>
            <CardDescription className="text-lg">
              تم دعوتك للانضمام كمحكم في الهاكاثون
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Hackathon Info */}
            {hackathon && (
              <div className="bg-gradient-to-r from-[#c3e956]/20 to-[#3ab666]/20 p-4 rounded-lg border-r-4 border-[#01645e]">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-[#01645e] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-[#01645e] mb-1">{hackathon.title}</h3>
                    <p className="text-sm text-[#8b7632]">{hackathon.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  الاسم الكامل <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  رقم الهاتف (اختياري)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  كلمة المرور <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  تأكيد كلمة المرور <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] text-lg py-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5 ml-2" />
                    إكمال التسجيل
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function JudgeRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#01645e] animate-spin mx-auto mb-4" />
          <p className="text-[#01645e] font-semibold">جاري تحميل الصفحة...</p>
        </div>
      </div>
    }>
      <JudgeRegisterContent />
    </Suspense>
  )
}

