"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Save, Eye, EyeOff, Settings, Users, FileText, Download, Shield, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

interface JudgeSettings {
  showTeamNames: boolean
  showProjectTitles: boolean
  showProjectDescriptions: boolean
  showPresentationFiles: boolean
  showTeamMembers: boolean
  allowFileDownload: boolean
  evaluationOnly: boolean
  showPreviousScores: boolean
  anonymousMode: boolean
  customMessage: string
}

interface HackathonData {
  hackathonId: string
  hackathonTitle: string
  settings: JudgeSettings
}

export default function JudgeSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathonData, setHackathonData] = useState<HackathonData | null>(null)
  const [settings, setSettings] = useState<JudgeSettings>({
    showTeamNames: true,
    showProjectTitles: true,
    showProjectDescriptions: true,
    showPresentationFiles: true,
    showTeamMembers: true,
    allowFileDownload: true,
    evaluationOnly: false,
    showPreviousScores: false,
    anonymousMode: false,
    customMessage: ''
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/dashboard')
      return
    }
    if (user && hackathonId) {
      fetchJudgeSettings()
    }
  }, [user, authLoading, hackathonId])

  const fetchJudgeSettings = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/judge-settings`)
      if (response.ok) {
        const data = await response.json()
        setHackathonData(data)
        setSettings(data.settings)
      } else {
        console.error('Failed to fetch judge settings')
      }
    } catch (error) {
      console.error('Error fetching judge settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/judge-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        const data = await response.json()
        alert('✅ تم حفظ إعدادات المحكم بنجاح!')
        setHackathonData(prev => prev ? { ...prev, settings: data.settings } : null)
      } else {
        const error = await response.json()
        alert(`❌ خطأ في حفظ الإعدادات: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving judge settings:', error)
      alert('❌ حدث خطأ في حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof JudgeSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-medium">جاري تحميل إعدادات المحكم...</p>
        </div>
      </div>
    )
  }

  if (!hackathonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#01645e] font-medium">لم يتم العثور على بيانات الهاكاثون</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/admin/hackathons/${hackathonId}`}>
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للهاكاثون
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#01645e] mb-2">إعدادات المحكم</h1>
              <p className="text-[#8b7632]">{hackathonData.hackathonTitle}</p>
            </div>
            <Badge className="bg-[#3ab666] text-white">
              <Settings className="w-4 h-4 ml-1" />
              تحكم في المحتوى
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Visibility Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-[#01645e] flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  إعدادات المحتوى المرئي
                </CardTitle>
                <CardDescription>
                  تحكم في ما يراه المحكم من معلومات الفرق والمشاريع
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">أسماء الفرق</p>
                    <p className="text-sm text-[#8b7632]">إظهار أسماء الفرق للمحكمين</p>
                  </div>
                  <Switch
                    checked={settings.showTeamNames}
                    onCheckedChange={(checked) => updateSetting('showTeamNames', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">عناوين المشاريع</p>
                    <p className="text-sm text-[#8b7632]">إظهار عناوين المشاريع</p>
                  </div>
                  <Switch
                    checked={settings.showProjectTitles}
                    onCheckedChange={(checked) => updateSetting('showProjectTitles', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">وصف المشاريع</p>
                    <p className="text-sm text-[#8b7632]">إظهار وصف تفصيلي للمشاريع</p>
                  </div>
                  <Switch
                    checked={settings.showProjectDescriptions}
                    onCheckedChange={(checked) => updateSetting('showProjectDescriptions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">ملفات العروض التقديمية</p>
                    <p className="text-sm text-[#8b7632]">إظهار روابط العروض التقديمية</p>
                  </div>
                  <Switch
                    checked={settings.showPresentationFiles}
                    onCheckedChange={(checked) => updateSetting('showPresentationFiles', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">أعضاء الفريق</p>
                    <p className="text-sm text-[#8b7632]">إظهار قائمة أعضاء كل فريق</p>
                  </div>
                  <Switch
                    checked={settings.showTeamMembers}
                    onCheckedChange={(checked) => updateSetting('showTeamMembers', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-[#01645e] flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  الإعدادات المتقدمة
                </CardTitle>
                <CardDescription>
                  إعدادات خاصة لتحكم أكبر في تجربة المحكم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">السماح بتحميل الملفات</p>
                    <p className="text-sm text-[#8b7632]">السماح للمحكمين بتحميل الملفات</p>
                  </div>
                  <Switch
                    checked={settings.allowFileDownload}
                    onCheckedChange={(checked) => updateSetting('allowFileDownload', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">وضع التقييم فقط</p>
                    <p className="text-sm text-[#8b7632]">إخفاء كل شيء عدا نماذج التقييم</p>
                  </div>
                  <Switch
                    checked={settings.evaluationOnly}
                    onCheckedChange={(checked) => updateSetting('evaluationOnly', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">إظهار درجات المحكمين الآخرين</p>
                    <p className="text-sm text-[#8b7632]">السماح برؤية تقييمات المحكمين الآخرين</p>
                  </div>
                  <Switch
                    checked={settings.showPreviousScores}
                    onCheckedChange={(checked) => updateSetting('showPreviousScores', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#01645e]">الوضع المجهول</p>
                    <p className="text-sm text-[#8b7632]">إخفاء أسماء الفرق والأعضاء تماماً</p>
                  </div>
                  <Switch
                    checked={settings.anonymousMode}
                    onCheckedChange={(checked) => updateSetting('anonymousMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Custom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-[#01645e] flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                رسالة مخصصة للمحكمين
              </CardTitle>
              <CardDescription>
                رسالة تظهر للمحكمين في أعلى صفحة التقييم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="اكتب رسالة توجيهية للمحكمين (اختياري)..."
                value={settings.customMessage}
                onChange={(e) => updateSetting('customMessage', e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] px-8 py-3 text-lg"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
