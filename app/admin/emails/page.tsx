"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EmailsManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [emailType, setEmailType] = useState('welcome')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
  }, [user, router])

  const emailTemplates = {
    welcome: {
      subject: 'مرحباً بك في هاكاثون الابتكار التقني',
      message: `مرحباً [الاسم],

تم قبول طلب مشاركتك في هاكاثون الابتكار التقني بنجاح!

نحن متحمسون لرؤية إبداعاتك وحلولك المبتكرة. ستتلقى المزيد من التفاصيل حول:
- تفاصيل الفريق
- جدول الفعاليات
- المتطلبات التقنية
- معايير التقييم

نتطلع لرؤيتك في الهاكاثون!

مع أطيب التحيات،
فريق هاكاثون الابتكار التقني`
    },
    reminder: {
      subject: 'تذكير: طلب مشاركتك في انتظار المراجعة',
      message: `مرحباً [الاسم],

نود تذكيرك بأن طلب مشاركتك في هاكاثون الابتكار التقني لا يزال قيد المراجعة.

سيتم الرد عليك خلال 24-48 ساعة من تاريخ التقديم.

شكراً لصبرك وتفهمك.

مع أطيب التحيات،
فريق هاكاثون الابتكار التقني`
    },
    announcement: {
      subject: 'إعلان مهم - هاكاثون الابتكار التقني',
      message: `مرحباً [الاسم],

نود إعلامك بـ [تفاصيل الإعلان].

للمزيد من المعلومات، يرجى زيارة لوحة التحكم الخاصة بك.

مع أطيب التحيات،
فريق هاكاثون الابتكار التقني`
    }
  }

  const handleTemplateChange = (type: string) => {
    setEmailType(type)
    const template = emailTemplates[type as keyof typeof emailTemplates]
    setSubject(template.subject)
    setMessage(template.message)
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      alert('يرجى إدخال عنوان بريد إلكتروني')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      })

      if (response.ok) {
        alert('تم إرسال الإيميل التجريبي بنجاح!')
        setTestEmail('')
        setLastSent({
          count: 1,
          timestamp: new Date().toLocaleString('ar-SA')
        })
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إرسال الإيميل')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      alert('حدث خطأ في إرسال الإيميل')
    } finally {
      setSending(false)
    }
  }

  const sendEmails = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          subject,
          message
        })
      })

      if (response.ok) {
        const result = await response.json()
        setLastSent(result)
        alert(`تم إرسال ${result.sentCount} رسالة بنجاح!`)
      } else {
        alert('حدث خطأ في إرسال الرسائل')
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      alert('حدث خطأ في إرسال الرسائل')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">إدارة الرسائل</h1>
            <p className="text-[#8b7632] text-lg">إرسال رسائل إلكترونية للمشاركين</p>
          </div>
          
          <div className="text-center">
            <Mail className="w-12 h-12 text-[#01645e] mx-auto mb-2" />
            <div className="text-sm text-[#8b7632]">نظام الرسائل</div>
          </div>
        </motion.div>

        {/* Email Composer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Email Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#01645e] flex items-center">
                  <Send className="w-6 h-6 ml-2" />
                  إنشاء رسالة
                </CardTitle>
                <CardDescription>اختر نوع الرسالة وقم بتخصيص المحتوى</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Type */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">نوع الرسالة</label>
                  <Select value={emailType} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الرسالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">رسالة ترحيب (للمقبولين)</SelectItem>
                      <SelectItem value="reminder">تذكير (للمنتظرين)</SelectItem>
                      <SelectItem value="announcement">إعلان عام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">موضوع الرسالة</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="أدخل موضوع الرسالة"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">محتوى الرسالة</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="أدخل محتوى الرسالة..."
                    rows={12}
                    className="resize-none"
                  />
                  <p className="text-xs text-[#8b7632] mt-1">
                    يمكنك استخدام [الاسم] ليتم استبداله بأسماء المستلمين
                  </p>
                </div>

                {/* Send Button */}
                <Button 
                  onClick={sendEmails}
                  disabled={sending || !subject || !message}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإرسال...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Send className="w-4 h-4 ml-2" />
                      إرسال الرسائل
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Email Stats & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#01645e]">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/emails/broadcast">
                  <Button className="w-full justify-start bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white">
                    <Users className="w-4 h-4 ml-2" />
                    إرسال جماعي للمستخدمين
                  </Button>
                </Link>
                <Button
                  onClick={() => handleTemplateChange('welcome')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  رسالة ترحيب
                </Button>
                <Button 
                  onClick={() => handleTemplateChange('reminder')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Clock className="w-4 h-4 ml-2" />
                  تذكير
                </Button>
                <Button 
                  onClick={() => handleTemplateChange('announcement')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <AlertCircle className="w-4 h-4 ml-2" />
                  إعلان
                </Button>
              </CardContent>
            </Card>

            {/* Last Sent Info */}
            {lastSent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#01645e]">آخر إرسال</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8b7632]">النوع:</span>
                      <Badge variant="outline">{lastSent.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#8b7632]">عدد الرسائل:</span>
                      <span className="font-semibold">{lastSent.sentCount}</span>
                    </div>
                    <div className="text-xs text-[#8b7632]">
                      تم الإرسال بنجاح
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#01645e]">إرشادات الرسائل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-[#8b7632]">
                  <p>• استخدم لغة واضحة ومهذبة</p>
                  <p>• تأكد من صحة المعلومات</p>
                  <p>• استخدم [الاسم] للتخصيص</p>
                  <p>• راجع المحتوى قبل الإرسال</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
