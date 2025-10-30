"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Save, Mail, RotateCcw, Eye, Copy, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

interface EmailTemplate {
  subject: string
  body: string
}

interface EmailTemplates {
  registration_confirmation: EmailTemplate
  acceptance: EmailTemplate
  rejection: EmailTemplate
  team_formation: EmailTemplate
  evaluation_results: EmailTemplate
  reminder: EmailTemplate
}

interface TemplateData {
  hackathonId: string
  hackathonTitle: string
  templates: EmailTemplates
  defaultTemplates: EmailTemplates
}

const TEMPLATE_NAMES = {
  registration_confirmation: 'تأكيد التسجيل',
  acceptance: 'إيميل القبول',
  rejection: 'إيميل الرفض',
  team_formation: 'تكوين الفريق',
  evaluation_results: 'نتائج التقييم',
  reminder: 'التذكير'
}

const TEMPLATE_DESCRIPTIONS = {
  registration_confirmation: 'يتم إرساله عند تسجيل المشارك في الهاكاثون',
  acceptance: 'يتم إرساله عند قبول المشارك في الهاكاثون',
  rejection: 'يتم إرساله عند رفض طلب المشاركة',
  team_formation: 'يتم إرساله عند تكوين الفرق',
  evaluation_results: 'يتم إرساله مع نتائج التقييم',
  reminder: 'يتم إرساله كتذكير للمشاركين'
}

const AVAILABLE_VARIABLES = {
  common: [
    '{{participantName}}', '{{participantEmail}}', '{{hackathonTitle}}', 
    '{{hackathonDate}}', '{{hackathonTime}}', '{{hackathonLocation}}',
    '{{registrationDate}}'
  ],
  team: [
    '{{teamName}}', '{{teamNumber}}', '{{teamRole}}', '{{teamMembers}}'
  ],
  evaluation: [
    '{{teamRank}}', '{{totalScore}}', '{{isWinner}}'
  ],
  reminder: [
    '{{reminderType}}', '{{reminderMessage}}'
  ]
}

export default function EmailTemplatesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<TemplateData | null>(null)
  const [templates, setTemplates] = useState<EmailTemplates | null>(null)
  const [activeTab, setActiveTab] = useState('registration_confirmation')

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/dashboard')
      return
    }
    if (user && hackathonId) {
      fetchEmailTemplates()
    }
  }, [user, authLoading, hackathonId])

  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/email-templates`)
      if (response.ok) {
        const templateData = await response.json()
        setData(templateData)
        setTemplates(templateData.templates)
      } else {
        console.error('Failed to fetch email templates')
      }
    } catch (error) {
      console.error('Error fetching email templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplates = async () => {
    if (!templates) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/email-templates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ templates })
      })

      if (response.ok) {
        const result = await response.json()
        alert('✅ تم حفظ قوالب الإيميلات بنجاح!')
        setData(prev => prev ? { ...prev, templates: result.templates } : null)
      } else {
        const error = await response.json()
        alert(`❌ خطأ في حفظ القوالب: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving email templates:', error)
      alert('❌ حدث خطأ في حفظ القوالب')
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefault = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع القوالب للافتراضية؟ سيتم فقدان جميع التخصيصات.')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/email-templates/reset`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        alert('✅ تم إعادة تعيين القوالب للافتراضية بنجاح!')
        setTemplates(result.templates)
        setData(prev => prev ? { ...prev, templates: result.templates } : null)
      } else {
        const error = await response.json()
        alert(`❌ خطأ في إعادة التعيين: ${error.error}`)
      }
    } catch (error) {
      console.error('Error resetting email templates:', error)
      alert('❌ حدث خطأ في إعادة التعيين')
    } finally {
      setSaving(false)
    }
  }

  const updateTemplate = (templateType: keyof EmailTemplates, field: 'subject' | 'body', value: string) => {
    if (!templates) return
    
    setTemplates(prev => ({
      ...prev!,
      [templateType]: {
        ...prev![templateType],
        [field]: value
      }
    }))
  }

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable)
    alert(`تم نسخ المتغير: ${variable}`)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-medium">جاري تحميل قوالب الإيميلات...</p>
        </div>
      </div>
    )
  }

  if (!data || !templates) {
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
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-3xl font-bold text-[#01645e] mb-2">قوالب الإيميلات</h1>
              <p className="text-[#8b7632]">{data.hackathonTitle}</p>
            </div>
            <Badge className="bg-[#3ab666] text-white">
              <Mail className="w-4 h-4 ml-1" />
              إدارة الإيميلات
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Variables Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-[#01645e] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  المتغيرات المتاحة
                </CardTitle>
                <CardDescription>
                  انقر على المتغير لنسخه
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#01645e] mb-2">متغيرات عامة</h4>
                  <div className="space-y-1">
                    {AVAILABLE_VARIABLES.common.map(variable => (
                      <button
                        key={variable}
                        onClick={() => copyVariable(variable)}
                        className="block w-full text-left text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#01645e] mb-2">متغيرات الفريق</h4>
                  <div className="space-y-1">
                    {AVAILABLE_VARIABLES.team.map(variable => (
                      <button
                        key={variable}
                        onClick={() => copyVariable(variable)}
                        className="block w-full text-left text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#01645e] mb-2">متغيرات التقييم</h4>
                  <div className="space-y-1">
                    {AVAILABLE_VARIABLES.evaluation.map(variable => (
                      <button
                        key={variable}
                        onClick={() => copyVariable(variable)}
                        className="block w-full text-left text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#01645e] mb-2">متغيرات التذكير</h4>
                  <div className="space-y-1">
                    {AVAILABLE_VARIABLES.reminder.map(variable => (
                      <button
                        key={variable}
                        onClick={() => copyVariable(variable)}
                        className="block w-full text-left text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Templates Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#01645e]">تحرير القوالب</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleResetToDefault}
                      disabled={saving}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 ml-2" />
                      إعادة تعيين للافتراضي
                    </Button>
                    <Button
                      onClick={handleSaveTemplates}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 ml-2" />
                          حفظ القوالب
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                    {Object.entries(TEMPLATE_NAMES).map(([key, name]) => (
                      <TabsTrigger key={key} value={key} className="text-xs">
                        {name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(templates).map(([templateType, template]) => (
                    <TabsContent key={templateType} value={templateType} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[#01645e] mb-2">
                          {TEMPLATE_NAMES[templateType as keyof typeof TEMPLATE_NAMES]}
                        </h3>
                        <p className="text-sm text-[#8b7632] mb-4">
                          {TEMPLATE_DESCRIPTIONS[templateType as keyof typeof TEMPLATE_DESCRIPTIONS]}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#01645e] mb-2">
                            عنوان الإيميل
                          </label>
                          <Input
                            value={template.subject}
                            onChange={(e) => updateTemplate(
                              templateType as keyof EmailTemplates, 
                              'subject', 
                              e.target.value
                            )}
                            placeholder="عنوان الإيميل..."
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#01645e] mb-2">
                            نص الإيميل
                          </label>
                          <Textarea
                            value={template.body}
                            onChange={(e) => updateTemplate(
                              templateType as keyof EmailTemplates, 
                              'body', 
                              e.target.value
                            )}
                            placeholder="نص الإيميل..."
                            rows={12}
                            className="w-full resize-none"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
