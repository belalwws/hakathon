'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Save, AlertCircle, CheckCircle, XCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useParams, useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal'

interface EmailSettings {
  teamFormation: boolean
  memberTransfer: boolean
  participantAcceptance: boolean
  participantRejection: boolean
}

export default function EmailSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string
  const { showSuccess, showError, ModalComponents } = useModal()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathonTitle, setHackathonTitle] = useState('')
  
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    teamFormation: true,
    memberTransfer: true,
    participantAcceptance: true,
    participantRejection: true
  })

  useEffect(() => {
    fetchSettings()
  }, [hackathonId])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/supervisor/hackathons/${hackathonId}/email-settings`)
      if (response.ok) {
        const data = await response.json()
        setHackathonTitle(data.hackathonTitle || '')
        
        // Load email notification settings from hackathon.settings.emailNotifications
        if (data.emailNotifications) {
          setEmailSettings({
            teamFormation: data.emailNotifications.teamFormation !== false,
            memberTransfer: data.emailNotifications.memberTransfer !== false,
            participantAcceptance: data.emailNotifications.participantAcceptance !== false,
            participantRejection: data.emailNotifications.participantRejection !== false
          })
        }
      }
    } catch (error) {
      console.error('Error fetching email settings:', error)
      showError('فشل تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/supervisor/hackathons/${hackathonId}/email-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications: emailSettings
        })
      })

      if (response.ok) {
        showSuccess('تم حفظ الإعدادات بنجاح!')
      } else {
        const error = await response.json()
        showError(error.error || 'فشل حفظ الإعدادات')
      }
    } catch (error) {
      console.error('Error saving email settings:', error)
      showError('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const toggleSetting = (key: keyof EmailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل الإعدادات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#01645e] mb-2">⚙️ إعدادات الإيميلات التلقائية</h1>
              <p className="text-[#8b7632] text-lg">{hackathonTitle}</p>
              <p className="text-sm text-gray-600 mt-2">تحكم في إرسال الإيميلات التلقائية للمشاركين</p>
            </div>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-[#01645e] text-[#01645e]"
            >
              عودة
            </Button>
          </div>
        </motion.div>

        {/* Settings Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Team Formation Emails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#3ab666]" />
                إيميلات تكوين الفرق التلقائي
              </CardTitle>
              <CardDescription>
                الإيميلات المرسلة تلقائياً عند تكوين الفرق وتوزيع المشاركين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#f0f9ff] to-[#e8f5e9] rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="teamFormation" className="text-base font-semibold text-[#01645e] cursor-pointer">
                    تفعيل إيميلات تكوين الفرق
                  </Label>
                  <p className="text-sm text-[#8b7632] mt-1">
                    يتم إرسال إيميل لكل مشارك يحتوي على معلومات فريقه وأعضائه
                  </p>
                </div>
                <Switch
                  id="teamFormation"
                  checked={emailSettings.teamFormation}
                  onCheckedChange={() => toggleSetting('teamFormation')}
                  className="data-[state=checked]:bg-[#3ab666]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Member Transfer Emails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#c3e956]" />
                إيميلات نقل الأعضاء بين الفرق
              </CardTitle>
              <CardDescription>
                الإيميلات المرسلة عند نقل مشارك من فريق إلى آخر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#fff8e1] to-[#f0f9ff] rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="memberTransfer" className="text-base font-semibold text-[#01645e] cursor-pointer">
                    تفعيل إيميلات نقل الأعضاء
                  </Label>
                  <p className="text-sm text-[#8b7632] mt-1">
                    يتم إرسال إيميلات للمشارك المنقول ولجميع أعضاء الفريقين
                  </p>
                </div>
                <Switch
                  id="memberTransfer"
                  checked={emailSettings.memberTransfer}
                  onCheckedChange={() => toggleSetting('memberTransfer')}
                  className="data-[state=checked]:bg-[#3ab666]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Participant Status Emails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#01645e]" />
                إيميلات قبول ورفض المشاركين
              </CardTitle>
              <CardDescription>
                الإيميلات المرسلة عند قبول أو رفض طلب المشاركة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Acceptance */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#e8f5e9] to-[#f0f9ff] rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="participantAcceptance" className="text-base font-semibold text-[#01645e] cursor-pointer flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    إيميلات قبول المشاركة
                  </Label>
                  <p className="text-sm text-[#8b7632] mt-1">
                    إيميل الترحيب والتأكيد المرسل عند قبول طلب المشاركة
                  </p>
                </div>
                <Switch
                  id="participantAcceptance"
                  checked={emailSettings.participantAcceptance}
                  onCheckedChange={() => toggleSetting('participantAcceptance')}
                  className="data-[state=checked]:bg-[#3ab666]"
                />
              </div>

              {/* Rejection */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#ffebee] to-[#fff8e1] rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="participantRejection" className="text-base font-semibold text-[#01645e] cursor-pointer flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    إيميلات رفض المشاركة
                  </Label>
                  <p className="text-sm text-[#8b7632] mt-1">
                    إيميل الإعتذار المرسل عند رفض طلب المشاركة
                  </p>
                </div>
                <Switch
                  id="participantRejection"
                  checked={emailSettings.participantRejection}
                  onCheckedChange={() => toggleSetting('participantRejection')}
                  className="data-[state=checked]:bg-[#3ab666]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 معلومة مهمة:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>يمكنك تعطيل أي نوع من الإيميلات حسب احتياجك</li>
                    <li>الإعدادات تُطبق فوراً على جميع العمليات القادمة</li>
                    <li>لا تؤثر على الإيميلات المرسلة سابقاً</li>
                    <li>يمكنك تعديل محتوى القوالب من صفحة "إدارة الإيميلات"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white px-8 py-6 text-lg"
              size="lg"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  حفظ الإعدادات
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Modal Components */}
      <ModalComponents />
    </div>
  )
}
