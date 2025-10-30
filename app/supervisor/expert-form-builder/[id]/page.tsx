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
import { ImageUploader } from '@/components/admin/ImageUploader'
import { useModal } from '@/hooks/use-modal'

export default function SupervisorExpertFormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string
  const { showSuccess, showError } = useModal()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<any>(null)

  // Form Settings
  const [formTitle, setFormTitle] = useState('طلب الانضمام كخبير')
  const [formDescription, setFormDescription] = useState('املأ النموذج للتقديم كخبير في الهاكاثون')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('تم إرسال طلبك بنجاح! سيتم مراجعته والرد عليك قريباً.')
  
  // Form Fields
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'name',
      type: 'text',
      label: 'الاسم الكامل',
      placeholder: 'أدخل اسمك الكامل',
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
      id: 'phone',
      type: 'phone',
      label: 'رقم الهاتف',
      placeholder: '05xxxxxxxx',
      required: false
    },
    {
      id: 'currentPosition',
      type: 'text',
      label: 'المنصب الحالي',
      placeholder: 'مثال: مدير تقنية المعلومات',
      required: false
    },
    {
      id: 'company',
      type: 'text',
      label: 'الشركة/المؤسسة',
      placeholder: 'أدخل اسم الشركة أو المؤسسة',
      required: false
    },
    {
      id: 'yearsOfExperience',
      type: 'number',
      label: 'سنوات الخبرة',
      placeholder: 'عدد سنوات الخبرة',
      required: false
    },
    {
      id: 'expertise',
      type: 'textarea',
      label: 'مجالات الخبرة',
      placeholder: 'اذكر مجالات خبرتك (تطوير، تصميم، أمن سيبراني، إلخ)',
      required: false
    },
    {
      id: 'bio',
      type: 'textarea',
      label: 'نبذة عن الخبير',
      placeholder: 'اكتب نبذة مختصرة عنك وخبراتك...',
      required: false
    },
    {
      id: 'linkedIn',
      type: 'text',
      label: 'رابط LinkedIn',
      placeholder: 'https://linkedin.com/in/...',
      required: false
    },
    {
      id: 'portfolio',
      type: 'text',
      label: 'الموقع الشخصي أو Portfolio',
      placeholder: 'https://...',
      required: false
    },
    {
      id: 'previousHackathons',
      type: 'select',
      label: 'هل شاركت في هاكاثونات من قبل؟',
      required: false,
      options: ['نعم', 'لا']
    },
    {
      id: 'whyJoin',
      type: 'textarea',
      label: 'لماذا تريد الانضمام كخبير؟',
      placeholder: 'اكتب السبب...',
      required: false
    },
    {
      id: 'profileImage',
      type: 'file',
      label: 'صورة شخصية',
      required: false,
      description: 'الرجاء رفع صورة شخصية واضحة'
    },
    {
      id: 'cv',
      type: 'file',
      label: 'السيرة الذاتية (CV)',
      required: false,
      description: 'ملف PDF فقط'
    }
  ])

  // Design Settings
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#0891b2') // cyan-600
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6') // blue-500
  const [accentColor, setAccentColor] = useState('#06b6d4') // cyan-500

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
      const formRes = await fetch(`/api/admin/expert-form/${hackathonId}`)
      if (formRes.ok) {
        const data = await formRes.json()
        if (data.form) {
          setFormTitle(data.form.title || formTitle)
          setFormDescription(data.form.description || formDescription)
          setWelcomeMessage(data.form.welcomeMessage || '')
          setSuccessMessage(data.form.successMessage || successMessage)
          setFields(data.form.fields || fields)
          setCoverImage(data.form.coverImage || null)
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
      const response = await fetch(`/api/admin/expert-form/${hackathonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          welcomeMessage,
          successMessage,
          fields,
          coverImage,
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
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-cyan-600" />
          <p className="text-cyan-600 font-semibold">جاري تحميل الفورم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 to-blue-50/50 p-6">
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
                onClick={() => router.push('/supervisor/forms')}
                className="text-cyan-600"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                رجوع
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-cyan-600 flex items-center gap-3">
                  <FileText className="w-10 h-10" />
                  بناء فورم الخبراء
                </h1>
                {hackathon && (
                  <p className="text-blue-600 text-lg mt-1">{hackathon.title}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/expert/apply/${hackathonId}`, '_blank')}
                className="border-cyan-600 text-cyan-600"
              >
                <Eye className="w-4 h-4 ml-2" />
                معاينة
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-cyan-600 to-blue-500"
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
                  أضف وعدل الحقول التي تريدها في فورم الخبراء
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
                    placeholder="طلب الانضمام كخبير"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>وصف الفورم</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="املأ النموذج للتقديم كخبير في الهاكاثون"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>رسالة الترحيب (اختياري)</Label>
                  <Textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="نرحب بانضمامك كخبير..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>رسالة النجاح</Label>
                  <Textarea
                    value={successMessage}
                    onChange={(e) => setSuccessMessage(e.target.value)}
                    placeholder="تم إرسال طلبك بنجاح!"
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
                {/* Cover Image */}
                <ImageUploader
                  label="صورة الغلاف"
                  value={coverImage}
                  onChange={setCoverImage}
                  folder="expert-forms"
                  aspectRatio="21/9"
                  maxSizeMB={5}
                />

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
                        placeholder="#0891b2"
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
                        placeholder="#3b82f6"
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
                        placeholder="#06b6d4"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-8">
                  <Label className="mb-4 block">معاينة الألوان</Label>
                  <div className="p-6 rounded-lg" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                        {formTitle}
                      </h3>
                      <p className="text-gray-600 mb-4">{formDescription}</p>
                      <Button style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} className="text-white">
                        زر تجريبي
                      </Button>
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
