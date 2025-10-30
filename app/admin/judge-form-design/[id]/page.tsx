"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle2, Loader2, Upload, Palette, Image as ImageIcon, Eye, Save, ArrowLeft, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useModal } from "@/hooks/use-modal"

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
}

export default function JudgeFormDesignPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.hackathonId as string
  const { showSuccess, showError, ModalComponents } = useModal()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormDesign>({
    hackathonId,
    isEnabled: true,
    primaryColor: '#01645e',
    secondaryColor: '#3ab666',
    accentColor: '#c3e956',
    backgroundColor: '#ffffff',
    title: 'نموذج التقديم كمحكم',
    description: 'املأ النموذج للتقديم كمحكم في الهاكاثون'
  })

  useEffect(() => {
    fetchFormDesign()
  }, [hackathonId])

  const fetchFormDesign = async () => {
    try {
      const response = await fetch(`/api/admin/judge-form-design/${hackathonId}`)
      const data = await response.json()
      if (response.ok && data.design) {
        setFormData(data.design)
        if (data.design.coverImage) {
          setCoverImagePreview(data.design.coverImage)
        }
      }
    } catch (err) {
      console.error('Error fetching form design:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const submitData = new FormData()
      submitData.append('isEnabled', formData.isEnabled.toString())
      submitData.append('primaryColor', formData.primaryColor)
      submitData.append('secondaryColor', formData.secondaryColor)
      submitData.append('accentColor', formData.accentColor)
      submitData.append('backgroundColor', formData.backgroundColor)
      if (formData.title) submitData.append('title', formData.title)
      if (formData.description) submitData.append('description', formData.description)
      if (formData.welcomeMessage) submitData.append('welcomeMessage', formData.welcomeMessage)
      if (formData.successMessage) submitData.append('successMessage', formData.successMessage)
      if (formData.logoUrl) submitData.append('logoUrl', formData.logoUrl)
      if (formData.customCss) submitData.append('customCss', formData.customCss)
      if (coverImageFile) submitData.append('coverImage', coverImageFile)

      const response = await fetch(`/api/admin/judge-form-design/${hackathonId}`, {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        showSuccess('تم حفظ التصميم بنجاح!')
        fetchFormDesign()
      } else {
        const error = await response.json()
        showError(error.error || 'فشل في حفظ التصميم')
      }
    } catch (err) {
      console.error('Error saving design:', err)
      showError('حدث خطأ في حفظ التصميم')
    } finally {
      setSaving(false)
    }
  }

  const copyFormLink = async () => {
    const baseUrl = window.location.origin
    const formLink = `${baseUrl}/judge/apply/${hackathonId}`
    
    try {
      await navigator.clipboard.writeText(formLink)
      showSuccess('تم نسخ رابط الفورم إلى الحافظة!')
    } catch (error) {
      showError('فشل في نسخ الرابط')
    }
  }

  const previewForm = () => {
    window.open(`/judge/apply/${hackathonId}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#01645e] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#01645e] mb-2">تخصيص فورم المحكمين</h1>
              <p className="text-[#8b7632] text-lg">صمم فورم احترافي لاستقبال طلبات المحكمين</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-[#01645e] text-[#01645e]"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              رجوع
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={copyFormLink}
              variant="outline"
              className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white"
            >
              <Copy className="w-4 h-4 ml-2" />
              نسخ رابط الفورم
            </Button>
            <Button
              onClick={previewForm}
              variant="outline"
              className="border-[#8b7632] text-[#8b7632] hover:bg-[#8b7632] hover:text-white"
            >
              <Eye className="w-4 h-4 ml-2" />
              معاينة الفورم
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
                  حفظ التصميم
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  إعدادات التصميم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="isEnabled">تفعيل الفورم</Label>
                  <Switch
                    id="isEnabled"
                    checked={formData.isEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                  />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    صورة الغلاف
                  </Label>
                  {coverImagePreview && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-[#01645e]">
                      <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="cursor-pointer"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">اللون الأساسي</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-16 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-16 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">لون التمييز</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-16 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">لون الخلفية</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-16 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الفورم</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="نموذج التقديم كمحكم"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الفورم</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="املأ النموذج للتقديم كمحكم في الهاكاثون"
                    rows={2}
                  />
                </div>

                {/* Messages */}
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={formData.welcomeMessage}
                    onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                    placeholder="نرحب بك للانضمام كمحكم..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="successMessage">رسالة النجاح</Label>
                  <Textarea
                    id="successMessage"
                    value={formData.successMessage}
                    onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                    placeholder="تم إرسال طلبك بنجاح!"
                    rows={2}
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">رابط الشعار (اختياري)</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>

                {/* Custom CSS */}
                <div className="space-y-2">
                  <Label htmlFor="customCss">CSS مخصص (متقدم)</Label>
                  <Textarea
                    id="customCss"
                    value={formData.customCss}
                    onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
                    placeholder=".custom-class { ... }"
                    rows={4}
                    className="font-mono text-sm"
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  معاينة مباشرة
                </CardTitle>
                <CardDescription>
                  هذه معاينة تقريبية - افتح الفورم في نافذة جديدة للمعاينة الكاملة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-4 rounded-lg overflow-hidden"
                  style={{ borderColor: formData.primaryColor }}
                >
                  {/* Preview Header */}
                  <div 
                    className="p-6 text-white text-center"
                    style={{
                      background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})`
                    }}
                  >
                    <h2 className="text-2xl font-bold mb-2">{formData.title}</h2>
                    <p className="text-sm opacity-90">{formData.description}</p>
                  </div>

                  {/* Preview Content */}
                  <div className="p-6 space-y-4" style={{ backgroundColor: formData.backgroundColor }}>
                    {formData.welcomeMessage && (
                      <div 
                        className="p-3 rounded-lg text-sm"
                        style={{ 
                          backgroundColor: `${formData.accentColor}20`,
                          borderRight: `4px solid ${formData.accentColor}`
                        }}
                      >
                        {formData.welcomeMessage}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="h-10 bg-gray-100 rounded"></div>
                      <div className="h-10 bg-gray-100 rounded"></div>
                      <div className="h-20 bg-gray-100 rounded"></div>
                    </div>

                    <button
                      className="w-full py-3 rounded-lg text-white font-bold"
                      style={{
                        background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})`
                      }}
                    >
                      إرسال الطلب
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <ModalComponents />
    </div>
  )
}

