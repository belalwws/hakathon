"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Users, MapPin, Flag, CheckCircle, Mail, FileText, Sparkles } from 'lucide-react'
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
}

const EMAIL_TEMPLATES = {
  invitation: {
    name: 'دعوة للمشاركة',
    subject: 'دعوة للمشاركة في {hackathon_title}',
    message: `نحن متحمسون لدعوتك للمشاركة في هاكاثون مثير!

🎯 هذا الهاكاثون فرصة رائعة لـ:
• تطوير مهاراتك التقنية
• العمل مع فريق متنوع من المطورين والمصممين
• التنافس على جوائز قيمة
• بناء شبكة علاقات مهنية

💡 إذا كنت مهتماً بالتكنولوجيا والابتكار، فهذا الحدث مناسب لك!

📅 لا تفوت هذه الفرصة - التسجيل مفتوح الآن!`
  },
  reminder: {
    name: 'تذكير بانتهاء التسجيل',
    subject: 'تذكير: آخر فرصة للتسجيل في {hackathon_title}',
    message: `⏰ تذكير مهم!

موعد انتهاء التسجيل في الهاكاثون يقترب!

🚨 لديك وقت محدود للتسجيل - لا تفوت هذه الفرصة الذهبية!

✨ ما ينتظرك:
• تحديات تقنية مثيرة
• فرصة للتعلم والنمو
• جوائز قيمة للفائزين
• شهادات مشاركة

📝 سجل الآن قبل فوات الأوان!`
  },
  update: {
    name: 'تحديث مهم',
    subject: 'تحديث مهم حول {hackathon_title}',
    message: `📢 تحديث مهم!

نود إعلامكم بتحديث مهم حول الهاكاثون:

[اكتب التحديث هنا]

🔔 يرجى مراجعة التفاصيل الجديدة والتأكد من استعدادكم.

شكراً لكم على اهتمامكم ومشاركتكم!`
  },
  welcome: {
    name: 'ترحيب بالمشاركين',
    subject: 'مرحباً بك في {hackathon_title}',
    message: `🎉 مرحباً بك في الهاكاثون!

نحن سعداء جداً لانضمامك إلينا في هذه الرحلة المثيرة!

📋 الخطوات التالية:
• راجع تفاصيل الهاكاثون
• انضم إلى قنوات التواصل
• ابدأ في التفكير في أفكار مشاريعك
• تواصل مع أعضاء فريقك

💪 نتطلع إلى رؤية إبداعاتكم وابتكاراتكم!

بالتوفيق! 🚀`
  }
}

export default function NotifyPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [targetAudience, setTargetAudience] = useState('all')
  const [filters, setFilters] = useState({ city: 'all', nationality: 'all' })
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [includeHackathonDetails, setIncludeHackathonDetails] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchHackathon()
  }, [user, params.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = (templateKey: string) => {
    const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES]
    if (template && hackathon) {
      setSubject(template.subject.replace('{hackathon_title}', hackathon.title))
      setMessage(template.message)
      setSelectedTemplate(templateKey)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    console.log('🚀 Starting email send process...')
    setSending(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAudience,
          filters,
          subject,
          message,
          includeHackathonDetails
        })
      })

      const result = await response.json()
      console.log('📧 API Response:', result)

      if (response.ok) {
        setSuccess(true)
        setError('')
        // Reset form
        setSubject('')
        setMessage('')
        setSelectedTemplate('')
      } else {
        setError(result.error || 'فشل في إرسال الإيميلات')
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      setError('حدث خطأ في إرسال الإيميلات')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل البيانات...</p>
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
            <Link href="/admin/hackathons">
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
          <Link href={`/admin/hackathons/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#01645e]">إرسال إشعارات</h1>
            <p className="text-[#8b7632] text-lg">{hackathon.title}</p>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">تم إرسال الإيميلات بنجاح!</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="text-red-800 font-semibold">{error}</div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  تمبلت جاهزة
                </CardTitle>
                <CardDescription>اختر تمبلت جاهز لتوفير الوقت</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    onClick={() => applyTemplate(key)}
                    variant={selectedTemplate === key ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    {template.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#01645e] flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  إرسال إشعار
                </CardTitle>
                <CardDescription>إرسال إيميلات للمستخدمين حول الهاكاثون</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Target Audience */}
                  <div>
                    <Label htmlFor="targetAudience" className="text-[#01645e] font-semibold">
                      الجمهور المستهدف *
                    </Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            جميع المستخدمين في المنصة
                          </div>
                        </SelectItem>
                        <SelectItem value="participants">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            مشاركي هذا الهاكاثون
                          </div>
                        </SelectItem>
                        <SelectItem value="approved">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            المشاركين المقبولين فقط
                          </div>
                        </SelectItem>
                        <SelectItem value="city">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            حسب المدينة
                          </div>
                        </SelectItem>
                        <SelectItem value="nationality">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4" />
                            حسب الجنسية
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filters */}
                  {targetAudience === 'city' && (
                    <div>
                      <Label htmlFor="city" className="text-[#01645e] font-semibold">المدينة</Label>
                      <Select value={filters.city} onValueChange={(value) => setFilters({...filters, city: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المدينة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع المدن</SelectItem>
                          <SelectItem value="الرياض">الرياض</SelectItem>
                          <SelectItem value="جدة">جدة</SelectItem>
                          <SelectItem value="الدمام">الدمام</SelectItem>
                          <SelectItem value="مكة">مكة</SelectItem>
                          <SelectItem value="المدينة">المدينة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {targetAudience === 'nationality' && (
                    <div>
                      <Label htmlFor="nationality" className="text-[#01645e] font-semibold">الجنسية</Label>
                      <Select value={filters.nationality} onValueChange={(value) => setFilters({...filters, nationality: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجنسية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الجنسيات</SelectItem>
                          <SelectItem value="سعودي">سعودي</SelectItem>
                          <SelectItem value="مقيم">مقيم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject" className="text-[#01645e] font-semibold">
                      عنوان الإيميل *
                    </Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="أدخل عنوان الإيميل"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-[#01645e] font-semibold">
                      نص الرسالة *
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب نص الرسالة هنا..."
                      rows={8}
                      required
                    />
                  </div>

                  {/* Include Details Checkbox */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeDetails"
                      checked={includeHackathonDetails}
                      onChange={(e) => setIncludeHackathonDetails(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="includeDetails" className="text-[#01645e]">
                      تضمين تفاصيل الهاكاثون في الإيميل
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={sending}
                      className="flex-1 bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 ml-2" />
                          إرسال الإيميلات
                        </>
                      )}
                    </Button>
                  </div>

                  {/* توضيح الخيارات */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 توضيح خيارات الجمهور المستهدف:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li><strong>• جميع المستخدمين في المنصة:</strong> كل من عمل حساب في المنصة (للدعوة للمشاركة)</li>
                      <li><strong>• مشاركي هذا الهاكاثون:</strong> المسجلين في هذا الهاكاثون فقط (للتحديثات)</li>
                      <li><strong>• المشاركين المقبولين فقط:</strong> المقبولين في هذا الهاكاثون (للتعليمات النهائية)</li>
                    </ul>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
