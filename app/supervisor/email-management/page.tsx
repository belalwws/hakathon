'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { FileUploader } from "@/components/admin/FileUploader"
import {
  Mail,
  Send,
  Save,
  Eye,
  Users,
  RefreshCw,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  AlertCircle,
  RotateCcw,
  Trash2,
  Loader2
} from "lucide-react"

interface UploadedFile {
  url: string
  name: string
  type: string
  size: number
  uploadedAt: Date
}

interface EmailTemplate {
  id: string
  templateKey: string
  nameAr: string
  nameEn: string
  subject: string
  bodyHtml: string
  bodyText?: string
  category: string
  variables?: Record<string, string>
  attachments?: UploadedFile[]
  isActive: boolean
  isSystem: boolean
  description?: string
  lastEditedBy?: string
  createdAt: string
  updatedAt: string
}

interface EmailStats {
  totalSent: number
  deliveryRate: number
  openRate: number
  lastSent?: string
}

const TEMPLATE_CATEGORIES = [
  { value: 'participant', label: 'المشاركين', icon: '👥' },
  { value: 'judge', label: 'المحكمين', icon: '⚖️' },
  { value: 'supervisor', label: 'المشرفين', icon: '👨‍💼' },
  { value: 'team', label: 'الفرق', icon: '🏆' },
  { value: 'certificate', label: 'الشهادات', icon: '📜' },
  { value: 'general', label: 'عام', icon: '📧' }
]

export default function SupervisorEmailManagementPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false) // حالة إرسال الإيميل التجريبي
  const [searchQuery, setSearchQuery] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [editorMode, setEditorMode] = useState<'simple' | 'rich' | 'html'>('rich') // simple, rich, html
  const [simpleText, setSimpleText] = useState('') // النص البسيط للمحرر
  const [attachments, setAttachments] = useState<UploadedFile[]>([]) // الملفات المرفقة
  const [testEmail, setTestEmail] = useState('') // الإيميل التجريبي
  const [showTestResultModal, setShowTestResultModal] = useState(false) // modal نتيجة الإرسال
  const [testResultSuccess, setTestResultSuccess] = useState(false) // نجاح أو فشل
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // تعديلات غير محفوظة
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null) // مؤقت الحفظ التلقائي

  // Custom email state
  const [customEmail, setCustomEmail] = useState({
    subject: '',
    body: '',
    recipients: 'all', // all, hackathon, judges, supervisors
    hackathonId: '',
    filters: {}
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/email-templates', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates)
          console.log('✅ Loaded templates:', data.templates.length)
        } else {
          // إذا لم توجد قوالب، تهيئتها تلقائياً
          console.log('⚠️ No templates found - Auto-initializing...')
          await autoInitializeTemplates()
        }
      } else {
        console.error('Failed to load templates:', response.status)
        setTemplates([])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "خطأ",
        description: "فشل تحميل قوالب الإيميلات",
        variant: "destructive"
      })
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const autoInitializeTemplates = async () => {
    try {
      console.log('🔄 Auto-initializing default templates...')

      const response = await fetch('/api/admin/email-templates/initialize', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        console.log('✅ Auto-initialized templates:', data.templates?.length)
        toast({
          title: "✅ تم التحميل التلقائي",
          description: `تم تحميل ${data.templates?.length || 0} قالب افتراضي بنجاح`
        })
      } else {
        console.error('Failed to auto-initialize templates')
      }
    } catch (error) {
      console.error('Error auto-initializing templates:', error)
    }
  }

  const initializeDefaultTemplates = async () => {
    try {
      console.log('🔄 Initializing default templates...')

      toast({
        title: "جاري التهيئة...",
        description: "يتم الآن تحميل القوالب الافتراضية"
      })

      const response = await fetch('/api/admin/email-templates/initialize', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        console.log('✅ Initialized templates:', data.templates?.length)
        toast({
          title: "✅ تم التهيئة بنجاح",
          description: `تم تحميل ${data.templates?.length || 0} قالب افتراضي. يمكنك الآن تعديلها حسب احتياجاتك.`
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to initialize templates:', response.status, errorData)
        toast({
          title: "خطأ في التهيئة",
          description: errorData.error || "فشل تهيئة القوالب الافتراضية",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error initializing templates:', error)
      toast({
        title: "خطأ",
        description: "فشل تهيئة القوالب الافتراضية. تأكد من اتصالك بالإنترنت.",
        variant: "destructive"
      })
    }
  }

  const saveTemplate = async (template: EmailTemplate, silent = false) => {
    try {
      setSaving(true)

      // ✅ FIX: Always set isActive to true when saving from this page
      const templateToSave = {
        ...template,
        isActive: true  // Force active when saving from email management
      }

      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(templateToSave)
      })

      if (response.ok) {
        const data = await response.json()

        if (!silent) {
          toast({
            title: "✅ تم الحفظ",
            description: "تم حفظ القالب بنجاح وتفعيله"
          })
        }
        setHasUnsavedChanges(false)

        // ✅ FIX: Update only the saved template in state instead of reloading all
        // This prevents the refresh/flicker issue during auto-save
        setTemplates(prevTemplates =>
          prevTemplates.map(t =>
            t.id === data.template.id ? data.template : t
          )
        )

        // Update selected template if it's the one being saved
        if (selectedTemplate?.id === data.template.id) {
          setSelectedTemplate(data.template)
        }
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ القالب",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // حفظ تلقائي بعد 2 ثانية من التوقف عن الكتابة
  const autoSaveTemplate = (template: EmailTemplate) => {
    // إلغاء المؤقت السابق
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    // تعيين مؤقت جديد
    const timeout = setTimeout(() => {
      console.log('🔄 Auto-saving template...')
      saveTemplate(template, true) // حفظ صامت
    }, 2000) // 2 ثانية

    setAutoSaveTimeout(timeout)
  }

  // تحويل HTML إلى نص بسيط للمحرر
  const htmlToSimpleText = (html: string): string => {
    if (!html) return ''

    try {
      const temp = document.createElement('div')
      temp.innerHTML = html

      // إزالة العناصر غير المرغوبة
      const unwantedElements = temp.querySelectorAll('style, script, div[style*="border-top"]')
      unwantedElements.forEach(el => el.remove())

      // استخراج النص مع الحفاظ على البنية
      let text = temp.innerText || temp.textContent || ''

      // تنظيف النص
      text = text
        .replace(/\n{3,}/g, '\n\n') // تقليل الأسطر الفارغة المتعددة
        .replace(/^\s+|\s+$/g, '') // إزالة المسافات من البداية والنهاية
        .replace(/مع أطيب التحيات،?\s*فريق المنصة/g, '') // إزالة التوقيع
        .trim()

      return text
    } catch (error) {
      console.error('Error converting HTML to text:', error)
      return ''
    }
  }

  // تحويل النص البسيط إلى HTML منسق
  const simpleTextToHtml = (text: string, subject: string): string => {
    if (!text || !text.trim()) {
      return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${subject || 'رسالة'}</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="color: #4b5563; line-height: 1.8; margin: 15px 0;">محتوى الرسالة...</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>مع أطيب التحيات،<br>فريق المنصة</p>
            </div>
          </div>
        </div>
      `
    }

    // تقسيم النص إلى فقرات
    const paragraphs = text.split('\n\n').filter(p => p.trim())

    // بناء HTML بسيط ومنسق
    const htmlParagraphs = paragraphs.map(p => {
      const trimmed = p.trim()

      // إذا كانت الفقرة تحتوي على نقاط (bullet points)
      if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(line => line.trim().startsWith('- '))
        const listItems = items.map(item => {
          const itemText = item.replace(/^-\s*/, '').trim()
          return `<li style="margin: 8px 0;">${itemText}</li>`
        }).join('')
        return `<ul style="margin: 15px 0; padding-right: 20px; color: #4b5563; line-height: 1.6;">${listItems}</ul>`
      }

      // فقرة عادية
      return `<p style="color: #4b5563; line-height: 1.8; margin: 15px 0;">${trimmed}</p>`
    }).join('')

    // قالب HTML كامل
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${subject || 'رسالة'}</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${htmlParagraphs}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>مع أطيب التحيات،<br>فريق المنصة</p>
          </div>
        </div>
      </div>
    `
  }

  // تحديث النص البسيط والمرفقات عند تغيير القالب المحدد
  useEffect(() => {
    if (selectedTemplate) {
      if (editorMode === 'simple') {
        const extracted = htmlToSimpleText(selectedTemplate.bodyHtml)
        setSimpleText(extracted)
      }
      // تحديث المرفقات من القالب
      setAttachments(selectedTemplate.attachments || [])
    }
  }, [selectedTemplate?.id, editorMode])

  const resetSingleTemplate = async (templateKey: string) => {
    // تأكيد من المستخدم
    const confirmed = window.confirm(
      'هل أنت متأكد من إعادة تعيين هذا القالب للوضع الافتراضي؟\n\nسيتم فقدان جميع التعديلات على هذا القالب.'
    )

    if (!confirmed) return

    try {
      console.log('🔄 Resetting template:', templateKey)

      const response = await fetch('/api/admin/email-templates/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ templateKey })
      })

      console.log('📡 Reset response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Reset successful:', data)

        toast({
          title: "✅ تم إعادة التعيين",
          description: "تم إعادة القالب للوضع الافتراضي بنجاح"
        })

        // إعادة تحميل القوالب
        await loadTemplates()

        // إعادة تحديد القالب المحدث
        if (selectedTemplate?.templateKey === templateKey && data.template) {
          setSelectedTemplate(data.template)
          // تحديث النص البسيط
          const extracted = htmlToSimpleText(data.template.bodyHtml)
          setSimpleText(extracted)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Reset failed:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to reset')
      }
    } catch (error) {
      console.error('❌ Error resetting template:', error)
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل إعادة تعيين القالب",
        variant: "destructive"
      })
    }
  }

  const resetAllTemplates = async () => {
    // تأكيد مزدوج للأمان
    const confirmed1 = window.confirm(
      '⚠️ تحذير: هل أنت متأكد من إعادة تعيين جميع القوالب؟'
    )

    if (!confirmed1) return

    const confirmed2 = window.confirm(
      '⚠️ تأكيد نهائي: سيتم فقدان جميع التعديلات على كل القوالب!\n\nهل تريد المتابعة؟'
    )

    if (!confirmed2) return

    try {
      toast({
        title: "جاري إعادة التعيين...",
        description: "يتم الآن إعادة تعيين جميع القوالب"
      })

      const response = await fetch('/api/admin/email-templates/initialize', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        setSelectedTemplate(null)
        toast({
          title: "✅ تم إعادة التعيين",
          description: `تم إعادة تعيين ${data.templates?.length || 0} قالب بنجاح`
        })
      } else {
        throw new Error('Failed to reset all')
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إعادة تعيين القوالب",
        variant: "destructive"
      })
    }
  }

  const sendTestEmail = async (template: EmailTemplate) => {
    // التحقق من إدخال الإيميل
    if (!testEmail || !testEmail.trim()) {
      toast({
        title: "⚠️ تنبيه",
        description: "يرجى إدخال البريد الإلكتروني التجريبي أولاً",
        variant: "destructive"
      })
      return
    }

    // التحقق من صحة الإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail.trim())) {
      toast({
        title: "⚠️ تنبيه",
        description: "يرجى إدخال بريد إلكتروني صحيح",
        variant: "destructive"
      })
      return
    }

    // تحذير إذا كانت هناك تعديلات غير محفوظة
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        '⚠️ لديك تعديلات غير محفوظة!\n\nسيتم إرسال الإيميل التجريبي بالنسخة المحفوظة في قاعدة البيانات، وليس التعديلات الحالية.\n\nهل تريد حفظ التعديلات أولاً؟'
      )

      if (confirmed) {
        // حفظ التعديلات أولاً
        await saveTemplate(template)
        // الانتظار قليلاً للتأكد من الحفظ
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setSendingTest(true) // ✅ بدء التحميل

    try {
      console.log('📧 Sending test email for template:', template.templateKey)
      console.log('📧 Test email address:', testEmail.trim())

      const response = await fetch('/api/admin/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          templateKey: template.templateKey,
          testEmail: testEmail.trim()
        })
      })

      console.log('📡 Test email response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Test email sent successfully:', data)

        // ✅ عرض modal النجاح
        setTestResultSuccess(true)
        setShowTestResultModal(true)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Test email failed:', response.status, errorData)

        // ✅ عرض modal الفشل
        setTestResultSuccess(false)
        setShowTestResultModal(true)

        throw new Error(errorData.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('❌ Error sending test email:', error)

      // ✅ عرض modal الفشل
      setTestResultSuccess(false)
      setShowTestResultModal(true)
    } finally {
      setSendingTest(false) // ✅ إنهاء التحميل
    }
  }

  const sendCustomEmail = async () => {
    try {
      if (!customEmail.subject || !customEmail.body) {
        toast({
          title: "تنبيه",
          description: "يرجى ملء العنوان والمحتوى",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/admin/email-templates/send-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customEmail)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "✅ تم الإرسال",
          description: `تم إرسال الإيميل إلى ${data.sentCount} مستلم`
        })
        
        // Reset form
        setCustomEmail({
          subject: '',
          body: '',
          recipients: 'all',
          hackathonId: '',
          filters: {}
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال الإيميل المخصص",
        variant: "destructive"
      })
    }
  }

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.templateKey.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    return matchesSearch && t.category === activeTab
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">جاري تحميل قوالب الإيميلات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-slate-800">
          <Mail className="w-8 h-8 text-indigo-600" />
          إدارة الإيميلات
        </h1>
        <p className="text-slate-600">
          إدارة شاملة لكل قوالب الإيميلات التلقائية وإرسال إيميلات مخصصة
        </p>
        
        {/* Important Templates Notice */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">القوالب التلقائية المهمة:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>تأكيد التسجيل</strong> - يُرسل تلقائياً عند تسجيل مشارك جديد</li>
                <li>• <strong>قبول المشاركة</strong> - يُرسل تلقائياً عند قبول طلب مشارك</li>
                <li>• <strong>رفض المشاركة</strong> - يُرسل تلقائياً عند رفض طلب مشارك</li>
                <li>• <strong>تكوين الفريق</strong> - يُرسل عند تشكيل الفرق</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                💡 يمكنك تعديل محتوى ومظهر جميع القوالب حسب احتياجاتك
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 bg-slate-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">
            الكل ({templates.length})
          </TabsTrigger>
          {TEMPLATE_CATEGORIES.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="data-[state=active]:bg-white">
              {cat.icon} {cat.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="custom" className="data-[state=active]:bg-white">
            <Sparkles className="w-4 h-4 ml-1" />
            إيميل مخصص
          </TabsTrigger>
        </TabsList>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="ابحث في القوالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-slate-200"
            />
          </div>
          {templates.length === 0 ? (
            <Button
              onClick={() => initializeDefaultTemplates()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              تهيئة القوالب الافتراضية
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => initializeDefaultTemplates()}
                variant="outline"
                className="border-slate-200"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة تحميل القوالب
              </Button>
              <Button
                onClick={() => resetAllTemplates()}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                إعادة تعيين جميع القوالب
              </Button>
            </div>
          )}
        </div>

        {/* Templates List */}
        {activeTab !== 'custom' && (
          <TabsContent value={activeTab} className="space-y-4">
            {templates.length === 0 && !loading && (
              <Card className="border-2 border-dashed border-indigo-300 bg-indigo-50/30">
                <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <Mail className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    لا توجد قوالب إيميلات حالياً
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md leading-relaxed">
                    لم يتم تهيئة قوالب الإيميلات بعد. اضغط على الزر أدناه لتحميل القوالب الافتراضية التي تشمل:
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-6 text-right w-full max-w-md">
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>تأكيد التسجيل - يُرسل تلقائياً عند تسجيل مشارك</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>قبول المشاركة - يُرسل عند قبول طلب المشارك</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>رفض المشاركة - يُرسل عند رفض الطلب</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>تكوين الفريق - يُرسل عند تشكيل الفرق</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>وقوالب أخرى للشهادات والتذكيرات</span>
                      </li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => initializeDefaultTemplates()}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
                  >
                    <RefreshCw className="w-5 h-5 ml-2" />
                    تهيئة القوالب الافتراضية الآن
                  </Button>
                  <p className="text-xs text-slate-500 mt-4">
                    💡 بعد التهيئة، يمكنك تعديل جميع القوالب حسب احتياجاتك
                  </p>
                </CardContent>
              </Card>
            )}
            {filteredTemplates.length === 0 && templates.length > 0 && !loading && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  لا توجد قوالب تطابق البحث أو الفئة المحددة.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                // Highlight important automated templates
                const isImportantAutomatic = ['registration_confirmation', 'acceptance', 'rejection', 'team_formation'].includes(template.templateKey)
                
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md border-slate-200 ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-indigo-500' : ''
                    } ${isImportantAutomatic ? 'border-l-4 border-l-indigo-500 bg-indigo-50/30' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-slate-800">
                            {isImportantAutomatic && <Sparkles className="w-4 h-4 text-indigo-600" />}
                            {template.nameAr}
                            {template.isSystem && (
                              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                أساسي
                              </Badge>
                            )}
                            {isImportantAutomatic && (
                              <Badge className="text-xs bg-indigo-600 text-white">
                                تلقائي
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1 text-slate-600">
                            {template.nameEn}
                          </CardDescription>
                        </div>
                        {template.isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-slate-200 text-slate-700">{template.category}</Badge>
                          <span className="text-xs text-slate-500">
                            {template.templateKey}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Template Editor */}
            {selectedTemplate && (
              <Card className="mt-6 border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-slate-800">
                    <span>تحرير القالب: {selectedTemplate.nameAr}</span>
                    <div className="flex gap-2 items-center">
                      {/* حقل الإيميل التجريبي */}
                      <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-1.5 bg-white">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="بريد تجريبي..."
                          className="outline-none text-sm w-48 text-slate-700 placeholder:text-slate-400"
                          dir="ltr"
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="border-slate-200"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        {previewMode ? 'تحرير' : 'معاينة'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendTestEmail(selectedTemplate)}
                        disabled={sendingTest}
                        className="border-slate-200"
                      >
                        {sendingTest ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 ml-2" />
                            إرسال تجريبي
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetSingleTemplate(selectedTemplate.templateKey)}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <RotateCcw className="w-4 h-4 ml-2" />
                        إعادة للوضع الافتراضي
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveTemplate(selectedTemplate)}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 relative"
                      >
                        <Save className="w-4 h-4 ml-2" />
                        {saving ? 'جاري الحفظ...' : hasUnsavedChanges ? 'حفظ التعديلات' : 'حفظ'}
                        {hasUnsavedChanges && !saving && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                        )}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!previewMode ? (
                    <>
                      <div>
                        <Label className="text-slate-700">عنوان الإيميل</Label>
                        <Input
                          value={selectedTemplate.subject}
                          onChange={(e) => {
                            setHasUnsavedChanges(true)
                            const updatedTemplate = {
                              ...selectedTemplate,
                              subject: e.target.value
                            }
                            setSelectedTemplate(updatedTemplate)
                            autoSaveTemplate(updatedTemplate)
                          }}
                          className="mt-1 border-slate-200"
                          placeholder="مثال: مبروك! تم قبولك في الهاكاثون"
                        />
                      </div>

                      {/* محرر النصوص المتقدم */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-700 text-lg">محتوى الرسالة</Label>
                          <div className="flex gap-2">
                            <Button
                              variant={editorMode === 'simple' ? "default" : "outline"}
                              size="sm"
                              onClick={() => setEditorMode('simple')}
                              className={editorMode === 'simple' ? "bg-indigo-600" : ""}
                            >
                              محرر بسيط
                            </Button>
                            <Button
                              variant={editorMode === 'rich' ? "default" : "outline"}
                              size="sm"
                              onClick={() => setEditorMode('rich')}
                              className={editorMode === 'rich' ? "bg-indigo-600" : ""}
                            >
                              محرر احترافي
                            </Button>
                            <Button
                              variant={editorMode === 'html' ? "default" : "outline"}
                              size="sm"
                              onClick={() => setEditorMode('html')}
                              className={editorMode === 'html' ? "bg-indigo-600" : ""}
                            >
                              محرر HTML
                            </Button>
                          </div>
                        </div>

                        {editorMode === 'simple' ? (
                          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <Alert className="bg-blue-50 border-blue-200">
                              <AlertCircle className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-blue-800">
                                💡 اكتب رسالتك بشكل طبيعي. استخدم سطرين فارغين للفصل بين الفقرات. استخدم "-" في بداية السطر لعمل قائمة نقطية.
                              </AlertDescription>
                            </Alert>

                            <Textarea
                              value={simpleText}
                              onChange={(e) => {
                                const newText = e.target.value
                                setSimpleText(newText)
                                setHasUnsavedChanges(true)
                                // تحديث HTML
                                const htmlContent = simpleTextToHtml(newText, selectedTemplate.subject)
                                const updatedTemplate = {
                                  ...selectedTemplate,
                                  bodyHtml: htmlContent
                                }
                                setSelectedTemplate(updatedTemplate)
                                // حفظ تلقائي
                                autoSaveTemplate(updatedTemplate)
                              }}
                              rows={15}
                              className="mt-1 border-slate-200 text-base leading-relaxed font-['Segoe_UI',Tahoma,sans-serif]"
                              placeholder={`مثال:

مرحباً {{participantName}}،

نحن سعداء بإبلاغك أنه تم قبول طلبك للمشاركة في {{hackathonTitle}}!

تفاصيل مهمة:
- تاريخ البدء: 15 نوفمبر 2024
- المكان: مركز الابتكار التقني
- الوقت: 9:00 صباحاً

يرجى التأكد من حضورك في الموعد المحدد.

نتطلع لرؤيتك!`}
                            />
                          </div>
                        ) : editorMode === 'rich' ? (
                          <div className="space-y-3">
                            <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
                              <Sparkles className="h-4 w-4 text-indigo-600" />
                              <AlertDescription className="text-indigo-800">
                                ✨ محرر نصوص احترافي مع إمكانيات تنسيق متقدمة - استخدم الأدوات أعلاه لتنسيق النص، إضافة روابط، وإدراج متغيرات!
                              </AlertDescription>
                            </Alert>
                            <RichTextEditor
                              value={selectedTemplate.bodyHtml}
                              onChange={(value) => {
                                setHasUnsavedChanges(true)
                                const updatedTemplate = {
                                  ...selectedTemplate,
                                  bodyHtml: value
                                }
                                setSelectedTemplate(updatedTemplate)
                                autoSaveTemplate(updatedTemplate)
                              }}
                              placeholder="ابدأ بكتابة محتوى الإيميل هنا..."
                              minHeight="400px"
                            />
                          </div>
                        ) : (
                          <div>
                            <Label className="text-slate-700">محتوى HTML (للمستخدمين المتقدمين)</Label>
                            <Textarea
                              value={selectedTemplate.bodyHtml}
                              onChange={(e) => {
                                setHasUnsavedChanges(true)
                                const updatedTemplate = {
                                  ...selectedTemplate,
                                  bodyHtml: e.target.value
                                }
                                setSelectedTemplate(updatedTemplate)
                                autoSaveTemplate(updatedTemplate)
                              }}
                              rows={20}
                              className="mt-1 font-mono text-sm border-slate-200"
                            />
                          </div>
                        )}
                      </div>

                      {/* File Attachments */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-700 text-lg">المرفقات</Label>
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                            اختياري - سيتم إرفاقها تلقائياً عند الإرسال
                          </Badge>
                        </div>
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            📎 يمكنك رفع ملفات PDF وصور لإرفاقها تلقائياً مع هذا القالب. الملفات المرفوعة سيتم إرسالها مع كل إيميل يستخدم هذا القالب.
                          </AlertDescription>
                        </Alert>
                        <FileUploader
                          files={attachments}
                          onFilesChange={(newFiles) => {
                            setAttachments(newFiles)
                            setHasUnsavedChanges(true)
                            const updatedTemplate = {
                              ...selectedTemplate,
                              attachments: newFiles
                            }
                            setSelectedTemplate(updatedTemplate)
                            autoSaveTemplate(updatedTemplate)
                          }}
                          maxFiles={5}
                          accept="image/*,application/pdf"
                        />
                      </div>

                      {selectedTemplate.variables && (
                        <div>
                          <Label className="text-slate-700">المتغيرات المتاحة (يمكنك استخدامها في الرسالة)</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {Object.entries(selectedTemplate.variables).map(([key, desc]) => (
                              <div key={key} className="text-sm p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(`{{${key}}}`)
                                  toast({
                                    title: "تم النسخ!",
                                    description: `تم نسخ {{${key}}} إلى الحافظة`
                                  })
                                }}
                              >
                                <code className="text-indigo-600 font-semibold">{`{{${key}}}`}</code>
                                <p className="text-xs text-slate-600 mt-1">{desc}</p>
                                <p className="text-xs text-indigo-500 mt-1">اضغط للنسخ</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="border rounded p-4 bg-white border-slate-200">
                      <div className="mb-4 pb-4 border-b border-slate-200">
                        <p className="text-sm text-slate-600">الموضوع:</p>
                        <p className="font-semibold text-slate-800">{selectedTemplate.subject}</p>
                      </div>
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }}
                        style={{ maxWidth: '600px', margin: '0 auto' }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Custom Email Tab */}
        <TabsContent value="custom">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                إرسال إيميل مخصص
              </CardTitle>
              <CardDescription className="text-slate-600">
                أرسل إيميلات مخصصة لمجموعات مختلفة من المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-700">المستلمون</Label>
                <Select
                  value={customEmail.recipients}
                  onValueChange={(value) => setCustomEmail({...customEmail, recipients: value})}
                >
                  <SelectTrigger className="mt-1 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        جميع المستخدمين
                      </div>
                    </SelectItem>
                    <SelectItem value="participants">
                      <div className="flex items-center gap-2">
                        👥 المشاركين
                      </div>
                    </SelectItem>
                    <SelectItem value="judges">
                      <div className="flex items-center gap-2">
                        ⚖️ المحكمين
                      </div>
                    </SelectItem>
                    <SelectItem value="supervisors">
                      <div className="flex items-center gap-2">
                        👨‍💼 المشرفين
                      </div>
                    </SelectItem>
                    <SelectItem value="hackathon">
                      <div className="flex items-center gap-2">
                        🏆 هاكاثون محدد
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customEmail.recipients === 'hackathon' && (
                <div>
                  <Label className="text-slate-700">اختر الهاكاثون</Label>
                  <Input
                    placeholder="معرف الهاكاثون"
                    value={customEmail.hackathonId}
                    onChange={(e) => setCustomEmail({...customEmail, hackathonId: e.target.value})}
                    className="mt-1 border-slate-200"
                  />
                </div>
              )}

              <div>
                <Label className="text-slate-700">الموضوع</Label>
                <Input
                  placeholder="عنوان الإيميل"
                  value={customEmail.subject}
                  onChange={(e) => setCustomEmail({...customEmail, subject: e.target.value})}
                  className="mt-1 border-slate-200"
                />
              </div>

              <div>
                <Label className="text-slate-700">المحتوى</Label>
                <Textarea
                  placeholder="اكتب محتوى الإيميل هنا..."
                  value={customEmail.body}
                  onChange={(e) => setCustomEmail({...customEmail, body: e.target.value})}
                  rows={15}
                  className="mt-1 border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewMode(!previewMode)} className="border-slate-200">
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة
                </Button>
                <Button onClick={sendCustomEmail} className="bg-indigo-600 hover:bg-indigo-700">
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الآن
                </Button>
              </div>

              {previewMode && customEmail.body && (
                <div className="mt-6 border rounded p-4 bg-white border-slate-200">
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <p className="text-sm text-slate-600">الموضوع:</p>
                    <p className="font-semibold text-slate-800">{customEmail.subject}</p>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-700">{customEmail.body}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal نتيجة الإرسال التجريبي */}
      {showTestResultModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTestResultModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              {testResultSuccess ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    تم الإرسال بنجاح! ✅
                  </h3>
                  <p className="text-slate-600 mb-6">
                    تم إرسال الإيميل التجريبي إلى <span className="font-semibold text-slate-800">{testEmail}</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    فشل الإرسال ❌
                  </h3>
                  <p className="text-slate-600 mb-6">
                    تعذر إرسال الإيميل التجريبي. يرجى التحقق من إعدادات البريد الإلكتروني (GMAIL_USER و GMAIL_PASS).
                  </p>
                </>
              )}
              <Button
                onClick={() => setShowTestResultModal(false)}
                className={testResultSuccess ? "bg-green-600 hover:bg-green-700 w-full" : "bg-red-600 hover:bg-red-700 w-full"}
              >
                حسناً
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

