"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// Icons removed to avoid SSR module interop issues
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  status: string
  prizes: {
    first: string
    second: string
    third: string
  }
  requirements: string[]
  categories: string[]
}

const teamRoles = [
  { value: 'leader', label: 'قائد الفريق', description: 'إدارة الفريق وتنسيق المهام' },
  { value: 'developer', label: 'مطور', description: 'تطوير وبرمجة التطبيق' },
  { value: 'designer', label: 'مصمم', description: 'تصميم واجهة المستخدم والتجربة' },
  { value: 'analyst', label: 'محلل', description: 'تحليل البيانات والمتطلبات' },
  { value: 'manager', label: 'مدير مشروع', description: 'إدارة المشروع والجدولة الزمنية' }
]

export default function HackathonRegisterPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    teamName: '',
    projectTitle: '',
    projectDescription: '',
    githubRepo: '',
    teamRole: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    // Redirect to dynamic form page
    router.push(`/hackathons/${params.id}/register-form`)
    return
    
    // fetchHackathon() - Commented out since we're redirecting
  }, [user, params.id, router])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
      } else {
        console.error('Hackathon not found')
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !hackathon) return

    setSubmitting(true)

    try {
      const response = await fetch(`/api/hackathons/${params.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        router.push('/hackathons')
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في التسجيل')
      }
    } catch (error) {
      console.error('Error registering:', error)
      alert('حدث خطأ في التسجيل')
    } finally {
      setSubmitting(false)
    }
  }

  const isRegistrationOpen = () => {
    if (!hackathon) return false
    const now = new Date()
    const deadline = new Date(hackathon.registrationDeadline)

    // Check for both lowercase and uppercase status values for compatibility
    const isOpen = hackathon.status === 'open' || hackathon.status === 'OPEN'
    return isOpen && now < deadline
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل بيانات الهاكاثون...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-[#01645e] mb-4">الهاكاثون غير موجود</h1>
            <Link href="/hackathons">
              <Button>العودة إلى قائمة الهاكاثونات</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isRegistrationOpen()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-[#01645e] mb-4">التسجيل مغلق</h1>
            <p className="text-[#8b7632] mb-6">انتهى موعد التسجيل لهذا الهاكاثون أو أنه غير مفتوح حالياً</p>
            <Link href="/hackathons">
              <Button>العودة إلى قائمة الهاكاثونات</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
              <Link href="/hackathons">
                <Button variant="outline" size="sm">
                  <span
                    className="w-4 h-4 ml-2 inline-block border-r-2 border-b-2 border-current rotate-135"
                    aria-hidden
                  />
                  العودة
                </Button>
              </Link>
          <div>
            <h1 className="text-4xl font-bold text-[#01645e]">التسجيل في الهاكاثون</h1>
            <p className="text-[#8b7632] text-lg">{hackathon.title}</p>
          </div>
        </motion.div>

        {/* Hackathon Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e]">{hackathon.title}</CardTitle>
              <CardDescription>{hackathon.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-[#01645e]">تاريخ البداية:</span>
                  <br />
                  {new Date(hackathon.startDate).toLocaleDateString('ar-SA')}
                </div>
                <div>
                  <span className="font-semibold text-[#01645e]">تاريخ النهاية:</span>
                  <br />
                  {new Date(hackathon.endDate).toLocaleDateString('ar-SA')}
                </div>
                <div>
                  <span className="font-semibold text-[#01645e]">انتهاء التسجيل:</span>
                  <br />
                  {new Date(hackathon.registrationDeadline).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e]">نموذج التسجيل</CardTitle>
              <CardDescription>املأ البيانات التالية للتسجيل في الهاكاثون</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Team Role Selection */}
                <div>
                  <Label htmlFor="teamRole">الدور المفضل في الفريق *</Label>
                  <Select value={formData.teamRole} onValueChange={(value) => setFormData({...formData, teamRole: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر دورك المفضل في الفريق" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-sm bg-[#01645e]/30" aria-hidden />
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-gray-500">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Name */}
                <div>
                  <Label htmlFor="teamName">اسم الفريق المقترح</Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                    placeholder="اسم الفريق (اختياري - يمكن تكوين الفرق تلقائياً)"
                  />
                </div>

                {/* Project Title */}
                <div>
                  <Label htmlFor="projectTitle">عنوان المشروع المقترح</Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({...formData, projectTitle: e.target.value})}
                    placeholder="عنوان فكرة المشروع (اختياري)"
                  />
                </div>

                {/* Project Description */}
                <div>
                  <Label htmlFor="projectDescription">وصف المشروع</Label>
                  <Textarea
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={(e) => setFormData({...formData, projectDescription: e.target.value})}
                    placeholder="وصف مختصر لفكرة المشروع وأهدافه (اختياري)"
                    rows={4}
                  />
                </div>

                {/* GitHub Repository */}
                <div>
                  <Label htmlFor="githubRepo">رابط مستودع GitHub</Label>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 inline-block rounded-sm bg-[#3ab666]/40" aria-hidden />
                    <Input
                      id="githubRepo"
                      value={formData.githubRepo}
                      onChange={(e) => setFormData({...formData, githubRepo: e.target.value})}
                      placeholder="https://github.com/username/repository (اختياري)"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6">
                  <Link href="/hackathons">
                    <Button variant="outline">إلغاء</Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={submitting || !formData.teamRole}
                    className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
                  >
                    {submitting ? 'جاري التسجيل...' : 'تسجيل في الهاكاثون'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Requirements */}
        {hackathon.requirements && hackathon.requirements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e]">متطلبات المشاركة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {hackathon.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#3ab666] mt-1">•</span>
                      <span className="text-[#8b7632]">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
