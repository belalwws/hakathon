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
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Loader2,
  Settings,
  Palette,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export default function SupervisionFormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.hackathonId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<any>(null)

  // Form Settings
  const [formTitle, setFormTitle] = useState('فورم الإشراف')
  const [formDescription, setFormDescription] = useState('نموذج طلب الانضمام لفريق الإشراف')
  const [welcomeMessage, setWelcomeMessage] = useState('مرحباً بك في فورم الإشراف')
  const [successMessage, setSuccessMessage] = useState('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.')
  
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
      type: 'tel',
      label: 'رقم الهاتف',
      placeholder: '05xxxxxxxx',
      required: false
    }
  ])

  // Design Settings
  const [coverImage, setCoverImage] = useState<string>('')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [primaryColor, setPrimaryColor] = useState('#01645e')
  const [secondaryColor, setSecondaryColor] = useState('#3ab666')
  const [accentColor, setAccentColor] = useState('#c3e956')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')

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

      // Load existing form design
      const formRes = await fetch(`/api/supervision-forms/design/${hackathonId}`)
      if (formRes.ok) {
        const design = await formRes.json()
        if (design) {
          setFormTitle(design.title || formTitle)
          setFormDescription(design.description || formDescription)
          setWelcomeMessage(design.welcomeMessage || welcomeMessage)
          setSuccessMessage(design.successMessage || successMessage)
          setCoverImage(design.coverImage || '')
          setLogoUrl(design.logoUrl || '')
          setPrimaryColor(design.primaryColor || primaryColor)
          setSecondaryColor(design.secondaryColor || secondaryColor)
          setAccentColor(design.accentColor || accentColor)
          setBackgroundColor(design.backgroundColor || backgroundColor)
          
          if (design.formFields) {
            try {
              const parsedFields = JSON.parse(design.formFields)
              setFields(parsedFields)
            } catch (e) {
              console.error('Error parsing form fields:', e)
            }
          }
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
      const response = await fetch(`/api/supervision-forms/design/${hackathonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          welcomeMessage,
          successMessage,
          formFields: JSON.stringify(fields),
          coverImage,
          logoUrl,
          primaryColor,
          secondaryColor,
          accentColor,
          backgroundColor,
          isEnabled: true
        })
      })

      if (response.ok) {
        alert('تم حفظ الفورم بنجاح!')
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حفظ الفورم')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert('حدث خطأ في حفظ الفورم')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'logo') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      if (type === 'cover') {
        setCoverImage(base64)
      } else {
        setLogoUrl(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'حقل جديد',
      placeholder: '',
      required: false
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
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
                  بناء فورم الإشراف
                </h1>
                {hackathon && (
                  <p className="text-[#8b7632] text-lg mt-1">{hackathon.title}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/supervision/${hackathonId}`, '_blank')}
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
                  أضف وعدل الحقول التي تريدها في فورم الإشراف
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>نوع الحقل</Label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value })}
                          className="w-full mt-1 p-2 border rounded"
                        >
                          <option value="text">نص</option>
                          <option value="email">بريد إلكتروني</option>
                          <option value="tel">رقم هاتف</option>
                          <option value="textarea">نص طويل</option>
                          <option value="select">قائمة منسدلة</option>
                          <option value="file">ملف</option>
                        </select>
                      </div>
                      <div>
                        <Label>التسمية</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(index, { placeholder: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                          />
                          <span>مطلوب</span>
                        </label>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button onClick={addField} className="w-full">
                  + إضافة حقل جديد
                </Button>
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
                    placeholder="فورم الإشراف"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>وصف الفورم</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="نموذج طلب الانضمام لفريق الإشراف"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>رسالة الترحيب</Label>
                  <Textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="مرحباً بك في فورم الإشراف"
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
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الصور</CardTitle>
                  <CardDescription>رفع صورة الغلاف والشعار (يتم الرفع على Cloudinary)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>صورة الغلاف</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'cover')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#01645e] file:text-white hover:file:bg-[#01645e]/90"
                      />
                      {coverImage && (
                        <div className="mt-4">
                          <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>شعار (Logo)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#3ab666] file:text-white hover:file:bg-[#3ab666]/90"
                      />
                      {logoUrl && (
                        <div className="mt-4">
                          <img src={logoUrl} alt="Logo" className="w-32 h-32 object-contain rounded" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الألوان</CardTitle>
                  <CardDescription>اختر ألوان الفورم</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اللون الأساسي</Label>
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label>اللون الثانوي</Label>
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label>اللون المميز</Label>
                    <Input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label>لون الخلفية</Label>
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
