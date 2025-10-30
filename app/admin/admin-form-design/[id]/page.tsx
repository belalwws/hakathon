"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Palette, 
  Upload, 
  Eye, 
  Save, 
  ArrowLeft, 
  Image as ImageIcon,
  Type,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Copy,
  ExternalLink
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormDesign {
  id?: string
  hackathonId: string
  isEnabled: boolean
  coverImage?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  title?: string
  description?: string
  welcomeMessage?: string
  successMessage?: string
  logoUrl?: string
  customCss?: string
  settings?: string
}

interface Hackathon {
  id: string
  title: string
  description: string
}

export default function AdminFormDesignPage() {
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.hackathonId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [formDesign, setFormDesign] = useState<FormDesign>({
    hackathonId,
    isEnabled: true,
    primaryColor: "#01645e",
    secondaryColor: "#3ab666",
    accentColor: "#c3e956",
    backgroundColor: "#ffffff",
    title: "طلب انضمام كمشرف",
    description: "انضم إلى فريق الإشراف في الهاكاثون",
    welcomeMessage: "نرحب بانضمامك إلى فريق الإشراف. يرجى ملء النموذج أدناه.",
    successMessage: "شكراً لك! تم إرسال طلبك بنجاح. سيتم مراجعته والرد عليك قريباً."
  })
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [hackathonId])

  const loadData = async () => {
    try {
      const [hackathonRes, designRes] = await Promise.all([
        fetch(`/api/hackathons/${hackathonId}`),
        fetch(`/api/admin/admin-form-design/${hackathonId}`)
      ])

      if (hackathonRes.ok) {
        const hackathonData = await hackathonRes.json()
        setHackathon(hackathonData)
      }

      if (designRes.ok) {
        const designData = await designRes.json()
        setFormDesign(designData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'حدث خطأ في تحميل البيانات' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const formData = new FormData()
      
      // Add all form design fields
      Object.entries(formDesign).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString())
        }
      })

      // Add cover image if selected
      if (coverImageFile) {
        formData.append('coverImage', coverImageFile)
      }

      const response = await fetch(`/api/admin/admin-form-design/${hackathonId}`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم حفظ التصميم بنجاح' })
        setFormDesign(data.formDesign)
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في حفظ التصميم' })
      }
    } catch (error) {
      console.error('Error saving design:', error)
      setMessage({ type: 'error', text: 'حدث خطأ في حفظ التصميم' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setMessage({ type: 'error', text: 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت' })
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'يرجى اختيار ملف صورة صالح' })
        return
      }

      setCoverImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormDesign(prev => ({
          ...prev,
          coverImage: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const copyFormLink = () => {
    const formUrl = `${window.location.origin}/admin/apply/${hackathonId}`
    navigator.clipboard.writeText(formUrl)
    setMessage({ type: 'success', text: 'تم نسخ رابط النموذج' })
  }

  const openFormPreview = () => {
    const formUrl = `${window.location.origin}/admin/apply/${hackathonId}`
    window.open(formUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري تحميل محرر التصميم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#01645e] flex items-center gap-3">
              <Palette className="w-8 h-8" />
              تصميم فورم المشرفين
            </h1>
            {hackathon && (
              <p className="text-gray-600 mt-1">{hackathon.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={copyFormLink}
          >
            <Copy className="w-4 h-4 ml-2" />
            نسخ الرابط
          </Button>
          <Button
            variant="outline"
            onClick={openFormPreview}
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            معاينة النموذج
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
          >
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ التصميم'}
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Design Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                إعدادات النموذج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">عام</TabsTrigger>
                  <TabsTrigger value="colors">الألوان</TabsTrigger>
                  <TabsTrigger value="content">المحتوى</TabsTrigger>
                  <TabsTrigger value="images">الصور</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isEnabled">تفعيل النموذج</Label>
                    <Switch
                      id="isEnabled"
                      checked={formDesign.isEnabled}
                      onCheckedChange={(checked) => 
                        setFormDesign(prev => ({ ...prev, isEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان النموذج</Label>
                    <Input
                      id="title"
                      value={formDesign.title || ''}
                      onChange={(e) => 
                        setFormDesign(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="طلب انضمام كمشرف"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">وصف النموذج</Label>
                    <Textarea
                      id="description"
                      value={formDesign.description || ''}
                      onChange={(e) => 
                        setFormDesign(prev => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="انضم إلى فريق الإشراف في الهاكاثون"
                      rows={2}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">اللون الأساسي</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formDesign.primaryColor}
                          onChange={(e) => 
                            setFormDesign(prev => ({ ...prev, primaryColor: e.target.value }))
                          }
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formDesign.primaryColor}
                          onChange={(e) => 
                            setFormDesign(prev => ({ ...prev, primaryColor: e.target.value }))
                          }
                          placeholder="#01645e"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={formDesign.secondaryColor}
                          onChange={(e) => 
                            setFormDesign(prev => ({ ...prev, secondaryColor: e.target.value }))
                          }
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formDesign.secondaryColor}
                          onChange={(e) => 
                            setFormDesign(prev => ({ ...prev, secondaryColor: e.target.value }))
                          }
                          placeholder="#3ab666"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accentColor">لون التمييز</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={formDesign.accentColor}
                          onChange={(e) => 
                            setFormDesign(prev => ({ ...prev, accentColor: e.target.value }))
                          }
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formDesign.accentColor}
                          onChange={(e) => 
                            setFormDesign(prev => ({ ...prev, accentColor: e.target.value }))
                          }
                          placeholder="#c3e956"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">لون الخلفية</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formDesign.backgroundColor}
                          onChange={(e) => 
                            setFormDesign(prev => ({ ...prev, backgroundColor: e.target.value }))
                          }
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formDesign.backgroundColor}
                          onChange={(e) => 
                            setFormDesign(prev => ({ ...prev, backgroundColor: e.target.value }))
                          }
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={formDesign.welcomeMessage || ''}
                      onChange={(e) => 
                        setFormDesign(prev => ({ ...prev, welcomeMessage: e.target.value }))
                      }
                      placeholder="نرحب بانضمامك إلى فريق الإشراف..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="successMessage">رسالة النجاح</Label>
                    <Textarea
                      id="successMessage"
                      value={formDesign.successMessage || ''}
                      onChange={(e) => 
                        setFormDesign(prev => ({ ...prev, successMessage: e.target.value }))
                      }
                      placeholder="شكراً لك! تم إرسال طلبك بنجاح..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customCss">CSS مخصص</Label>
                    <Textarea
                      id="customCss"
                      value={formDesign.customCss || ''}
                      onChange={(e) => 
                        setFormDesign(prev => ({ ...prev, customCss: e.target.value }))
                      }
                      placeholder="/* أضف CSS مخصص هنا */"
                      rows={5}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">رابط الشعار</Label>
                    <Input
                      id="logoUrl"
                      value={formDesign.logoUrl || ''}
                      onChange={(e) => 
                        setFormDesign(prev => ({ ...prev, logoUrl: e.target.value }))
                      }
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>صورة الغلاف</Label>
                    <div className="space-y-3">
                      {formDesign.coverImage && (
                        <div className="relative">
                          <img
                            src={formDesign.coverImage}
                            alt="Cover"
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setFormDesign(prev => ({ ...prev, coverImage: undefined }))
                              setCoverImageFile(null)
                            }}
                          >
                            حذف
                          </Button>
                        </div>
                      )}
                      
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="coverImageInput"
                        />
                        <Label
                          htmlFor="coverImageInput"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          <Upload className="w-4 h-4" />
                          {formDesign.coverImage ? 'تغيير الصورة' : 'رفع صورة الغلاف'}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          أقصى حجم: 10 ميجابايت
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  معاينة النموذج
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('tablet')}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className={`mx-auto border rounded-lg overflow-hidden ${
                  previewMode === 'desktop' ? 'w-full' :
                  previewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'
                }`}
                style={{ 
                  background: `linear-gradient(135deg, ${formDesign.primaryColor}10, ${formDesign.secondaryColor}10)`,
                  backgroundColor: formDesign.backgroundColor 
                }}
              >
                {/* Cover Image */}
                {formDesign.coverImage && (
                  <div 
                    className="h-32 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${formDesign.coverImage})` }}
                  />
                )}

                <div className="p-6 space-y-4">
                  {/* Logo */}
                  {formDesign.logoUrl && (
                    <div className="text-center">
                      <img 
                        src={formDesign.logoUrl} 
                        alt="Logo" 
                        className="h-12 w-auto mx-auto"
                      />
                    </div>
                  )}

                  {/* Header */}
                  <div className="text-center space-y-2">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${formDesign.primaryColor}, ${formDesign.secondaryColor})` 
                      }}
                    >
                      <Type className="w-6 h-6 text-white" />
                    </div>
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: formDesign.primaryColor }}
                    >
                      {formDesign.title || 'طلب انضمام كمشرف'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {formDesign.description || 'انضم إلى فريق الإشراف في الهاكاثون'}
                    </p>
                  </div>

                  {/* Welcome Message */}
                  {formDesign.welcomeMessage && (
                    <div 
                      className="p-3 rounded-lg border-r-4 text-sm"
                      style={{ 
                        backgroundColor: `${formDesign.accentColor}20`,
                        borderColor: formDesign.accentColor 
                      }}
                    >
                      {formDesign.welcomeMessage}
                    </div>
                  )}

                  {/* Sample Form Fields */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">الاسم الكامل *</label>
                      <div className="h-8 bg-gray-100 rounded border"></div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">البريد الإلكتروني *</label>
                      <div className="h-8 bg-gray-100 rounded border"></div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">نبذة شخصية</label>
                      <div className="h-16 bg-gray-100 rounded border"></div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    className="w-full py-2 px-4 rounded-md text-white font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${formDesign.primaryColor}, ${formDesign.secondaryColor})` 
                    }}
                  >
                    إرسال الطلب
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
