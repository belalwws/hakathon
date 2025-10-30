"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Phone, MapPin, Flag, Briefcase, Users, Code, Lightbulb } from 'lucide-react'

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
  { value: 'leader', label: 'قائد الفريق', description: 'إدارة الفريق وتنسيق المهام', icon: Users },
  { value: 'developer', label: 'مطور', description: 'تطوير وبرمجة التطبيق', icon: Code },
  { value: 'designer', label: 'مصمم', description: 'تصميم واجهة المستخدم والتجربة', icon: Lightbulb },
  { value: 'analyst', label: 'محلل', description: 'تحليل البيانات والمتطلبات', icon: Briefcase },
  { value: 'manager', label: 'مدير مشروع', description: 'إدارة المشروع والجدولة الزمنية', icon: Users }
]

const cities = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'بريدة', 'تبوك', 'خميس مشيط', 'حائل', 'الجبيل', 'الخرج', 'الأحساء', 'نجران', 'ينبع', 'عرعر', 'سكاكا', 'جيزان', 'القطيف', 'أخرى'
]

export default function SimpleHackathonRegisterPage() {
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    email: '',
    phone: '',
    city: '',
    nationality: 'سعودي',
    
    // Hackathon Info
    teamName: '',
    projectTitle: '',
    projectDescription: '',
    githubRepo: '',
    teamRole: '',
    
    // Optional
    experience: '',
    motivation: ''
  })

  useEffect(() => {
    fetchHackathon()
  }, [params.id])

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hackathon) return

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.teamRole) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/hackathons/${params.id}/simple-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في التسجيل')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#01645e] to-[#3ab666] flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#01645e] to-[#3ab666] flex items-center justify-center">
        <div className="text-white text-xl">الهاكاثون غير موجود</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#01645e] to-[#3ab666] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تم التسجيل بنجاح!</h2>
          <p className="text-gray-600 mb-6">
            تم تسجيلك في {hackathon.title} بنجاح. سيتم إرسال تفاصيل إضافية عبر البريد الإلكتروني.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/hackathons')}
              className="w-full bg-[#01645e] hover:bg-[#01645e]/90"
            >
              العودة للهاكاثونات
            </Button>
            <Link href="/" className="block text-[#01645e] hover:underline">
              الصفحة الرئيسية
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01645e] to-[#3ab666] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">التسجيل في الهاكاثون</h1>
          <h2 className="text-2xl text-white/90 mb-4">{hackathon.title}</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            املأ البيانات التالية للتسجيل في الهاكاثون. لا تحتاج لإنشاء حساب أو كلمة مرور.
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e]">نموذج التسجيل</CardTitle>
              <CardDescription>
                جميع الحقول المطلوبة مميزة بعلامة *
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    البيانات الشخصية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">الاسم الكامل *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">المدينة</Label>
                      <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المدينة" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Hackathon Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    معلومات المشاركة
                  </h3>
                  
                  <div>
                    <Label htmlFor="teamRole">الدور المفضل *</Label>
                    <Select value={formData.teamRole} onValueChange={(value) => handleInputChange('teamRole', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر دورك في الفريق" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <role.icon className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-sm text-gray-500">{role.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teamName">اسم الفريق (اختياري)</Label>
                      <Input
                        id="teamName"
                        value={formData.teamName}
                        onChange={(e) => handleInputChange('teamName', e.target.value)}
                        placeholder="اسم فريقك"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="projectTitle">عنوان المشروع (اختياري)</Label>
                      <Input
                        id="projectTitle"
                        value={formData.projectTitle}
                        onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                        placeholder="عنوان مشروعك"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="projectDescription">وصف المشروع (اختياري)</Label>
                    <Textarea
                      id="projectDescription"
                      value={formData.projectDescription}
                      onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                      placeholder="اكتب وصفاً مختصراً لمشروعك..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#01645e] hover:bg-[#01645e]/90 text-white py-3 text-lg"
                  >
                    {submitting ? 'جاري التسجيل...' : 'تسجيل في الهاكاثون'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href={`/hackathons/${params.id}`} className="text-white hover:underline">
            ← العودة لصفحة الهاكاثون
          </Link>
        </div>
      </div>
    </div>
  )
}
