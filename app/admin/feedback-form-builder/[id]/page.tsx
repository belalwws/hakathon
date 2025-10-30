"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Settings,
  Palette,
  FileText
} from 'lucide-react'
import FormBuilder, { FormField } from '@/components/admin/FormBuilder'
import { useModal } from '@/hooks/use-modal'

export default function FeedbackFormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.hackathonId as string
  const { showSuccess, showError } = useModal()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<any>(null)

  // Form Settings
  const [formTitle, setFormTitle] = useState('قيّم تجربتك في الهاكاثون')
  const [formDescription, setFormDescription] = useState('نود معرفة رأيك لتحسين تجربتك في الهاكاثونات القادمة')
  const [welcomeMessage, setWelcomeMessage] = useState('شكراً لمشاركتك! رأيك مهم جداً لنا')
  const [successMessage, setSuccessMessage] = useState('شكراً لك! تقييمك يساعدنا على التحسين')
  
  // Form Fields
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'name',
      type: 'text',
      label: 'الاسم',
      placeholder: 'أدخل اسمك',
      required: true
    },
    {
      id: 'email',
      type: 'email',
      label: 'البريد الإلكتروني',
      placeholder: 'example@email.com',
      required: true
    },
    {
      id: 'overall_rating',
      type: 'rating',
      label: 'التقييم العام للهاكاثون',
      required: true
    }
  ])

  // Design Settings
  const [primaryColor, setPrimaryColor] = useState('#01645e')
  const [secondaryColor, setSecondaryColor] = useState('#3ab666')
  const [accentColor, setAccentColor] = useState('#c3e956')

  useEffect(() => {
    loadData()
  }, [hackathonId])

  const loadData = async () => {
    try {
      // Load hackathon
      const hackathonRes = await fetch(`/api/hackathons/${hackathonId}`)
      if (hackathonRes.ok) {
        const data = await hackathonRes.json()
        setHackathon(data)
      }

      // Load existing form
      const formRes = await fetch(`/api/admin/feedback-form/${hackathonId}`)
      if (formRes.ok) {
        const data = await formRes.json()
        if (data.form) {
          setFormTitle(data.form.title || formTitle)
          setFormDescription(data.form.description || formDescription)
          setWelcomeMessage(data.form.welcomeMessage || welcomeMessage)
          setSuccessMessage(data.form.successMessage || successMessage)
          setFields(data.form.fields || fields)
          setPrimaryColor(data.form.primaryColor || primaryColor)
          setSecondaryColor(data.form.secondaryColor || secondaryColor)
          setAccentColor(data.form.accentColor || accentColor)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/feedback-form/${hackathonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          welcomeMessage,
          successMessage,
          fields,
          primaryColor,
          secondaryColor,
          accentColor
        })
      })

      if (response.ok) {
        showSuccess('تم حفظ الفورم بنجاح!')
      } else {
        const error = await response.json()
        showError(error.error || 'فشل في حفظ الفورم')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      showError('حدث خطأ في حفظ الفورم')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-[#01645e]" />
          <p className="text-[#01645e] font-semibold">جاري تحميل الفورم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/forms')}
                className="text-[#01645e]"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                رجوع
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-[#01645e] flex items-center gap-3">
                  <FileText className="w-10 h-10" />
                  بناء فورم التقييم
                </h1>
                {hackathon && (
                  <p className="text-[#8b7632] text-lg mt-1">{hackathon.title}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/feedback/${hackathonId}`, '_blank')}
                className="border-[#3ab666] text-[#3ab666]"
              >
                <Eye className="w-4 h-4 ml-2" />
                معاينة
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ الفورم
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="fields">
              <FileText className="w-4 h-4 ml-2" />
              الحقول
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="design">
              <Palette className="w-4 h-4 ml-2" />
              التصميم
            </TabsTrigger>
          </TabsList>

          {/* Fields Tab */}
          <TabsContent value="fields">
            <Card>
              <CardHeader>
                <CardTitle>حقول الفورم</CardTitle>
                <CardDescription>
                  أضف وعدل الحقول التي تريدها في فورم التقييم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormBuilder fields={fields} onChange={setFields} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الفورم</CardTitle>
                <CardDescription>
                  عدل النصوص والرسائل الخاصة بالفورم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>عنوان الفورم</Label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="قيّم تجربتك في الهاكاثون"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>وصف الفورم</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="نود معرفة رأيك لتحسين تجربتك في الهاكاثونات القادمة"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>رسالة الترحيب (اختياري)</Label>
                  <Textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="شكراً لمشاركتك! رأيك مهم جداً لنا"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>رسالة النجاح</Label>
                  <Textarea
                    value={successMessage}
                    onChange={(e) => setSuccessMessage(e.target.value)}
                    placeholder="شكراً لك! تقييمك يساعدنا على التحسين"
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design">
            <Card>
              <CardHeader>
                <CardTitle>تصميم الفورم</CardTitle>
                <CardDescription>
                  خصص ألوان الفورم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>اللون الأساسي</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#01645e"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>اللون الثانوي</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        placeholder="#3ab666"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>لون التمييز</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        placeholder="#c3e956"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

