"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, Palette, Image as ImageIcon, Eye, Save, ArrowLeft, Copy, Plus, Trash2, Star } from "lucide-react"
import { useModal } from "@/hooks/use-modal"

interface Question {
  id: string
  question: string
  type: 'rating' | 'text' | 'textarea'
  required: boolean
}

interface FormDesign {
  id?: string
  hackathonId: string
  isEnabled: boolean
  title: string
  description?: string
  welcomeMessage?: string
  thankYouMessage?: string
  ratingScale: number
  coverImage?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  logoUrl?: string
  customCss?: string
  questions: Question[]
}

export default function FeedbackFormDesignPage() {
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
    title: 'قيّم تجربتك في الهاكاثون',
    description: 'نود معرفة رأيك لتحسين تجربتك في الهاكاثونات القادمة',
    welcomeMessage: 'شكراً لمشاركتك! رأيك مهم جداً لنا',
    thankYouMessage: 'شكراً لك! تقييمك يساعدنا على التحسين',
    ratingScale: 5,
    primaryColor: '#01645e',
    secondaryColor: '#3ab666',
    accentColor: '#c3e956',
    backgroundColor: '#ffffff',
    questions: [
      { id: 'q1', question: 'كيف كان مستوى التنظيم؟', type: 'rating', required: true },
      { id: 'q2', question: 'هل كانت المواضيع والتحديات مناسبة؟', type: 'rating', required: true },
      { id: 'q3', question: 'ما أكثر شيء أعجبك في الهاكاثون؟', type: 'textarea', required: false }
    ]
  })

  useEffect(() => {
    fetchFormDesign()
  }, [hackathonId])

  const fetchFormDesign = async () => {
    try {
      const response = await fetch(`/api/admin/feedback-form-design/${hackathonId}`)
      const data = await response.json()
      if (response.ok && data.design) {
        setFormData({
          ...data.design,
          questions: JSON.parse(data.design.questions)
        })
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

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      question: '',
      type: 'text',
      required: false
    }
    setFormData({ ...formData, questions: [...formData.questions, newQuestion] })
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...formData.questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setFormData({ ...formData, questions: newQuestions })
  }

  const deleteQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const submitData = new FormData()
      submitData.append('isEnabled', formData.isEnabled.toString())
      submitData.append('title', formData.title)
      submitData.append('ratingScale', formData.ratingScale.toString())
      submitData.append('primaryColor', formData.primaryColor)
      submitData.append('secondaryColor', formData.secondaryColor)
      submitData.append('accentColor', formData.accentColor)
      submitData.append('backgroundColor', formData.backgroundColor)
      submitData.append('questions', JSON.stringify(formData.questions))
      if (formData.description) submitData.append('description', formData.description)
      if (formData.welcomeMessage) submitData.append('welcomeMessage', formData.welcomeMessage)
      if (formData.thankYouMessage) submitData.append('thankYouMessage', formData.thankYouMessage)
      if (formData.logoUrl) submitData.append('logoUrl', formData.logoUrl)
      if (formData.customCss) submitData.append('customCss', formData.customCss)
      if (coverImageFile) submitData.append('coverImage', coverImageFile)

      const response = await fetch(`/api/admin/feedback-form-design/${hackathonId}`, {
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
    const formLink = `${baseUrl}/feedback/${hackathonId}`
    
    try {
      await navigator.clipboard.writeText(formLink)
      showSuccess('تم نسخ رابط الفورم إلى الحافظة!')
    } catch (error) {
      showError('فشل في نسخ الرابط')
    }
  }

  const previewForm = () => {
    window.open(`/feedback/${hackathonId}`, '_blank')
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#01645e] mb-2">تخصيص فورم تقييم الهاكاثون</h1>
              <p className="text-[#8b7632] text-lg">صمم فورم احترافي لاستقبال تقييمات المشاركين</p>
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  الإعدادات الأساسية
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

                {/* Rating Scale */}
                <div className="space-y-2">
                  <Label htmlFor="ratingScale">مقياس التقييم</Label>
                  <Select
                    value={formData.ratingScale.toString()}
                    onValueChange={(value) => setFormData({ ...formData, ratingScale: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">من 1 إلى 3 ⭐⭐⭐</SelectItem>
                      <SelectItem value="5">من 1 إلى 5 ⭐⭐⭐⭐⭐</SelectItem>
                      <SelectItem value="10">من 1 إلى 10 ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</SelectItem>
                    </SelectContent>
                  </Select>
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
                    placeholder="قيّم تجربتك في الهاكاثون"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الفورم</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="نود معرفة رأيك..."
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
                    placeholder="شكراً لمشاركتك..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thankYouMessage">رسالة الشكر</Label>
                  <Textarea
                    id="thankYouMessage"
                    value={formData.thankYouMessage}
                    onChange={(e) => setFormData({ ...formData, thankYouMessage: e.target.value })}
                    placeholder="شكراً لك! تقييمك يساعدنا..."
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

            {/* Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>الأسئلة الإضافية</span>
                  <Button onClick={addQuestion} size="sm" className="bg-[#3ab666]">
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة سؤال
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.questions.map((q, index) => (
                  <div key={q.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <Label>سؤال {index + 1}</Label>
                      <Button
                        onClick={() => deleteQuestion(index)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={q.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="اكتب السؤال..."
                    />
                    <div className="flex gap-2">
                      <Select
                        value={q.type}
                        onValueChange={(value) => updateQuestion(index, 'type', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">نص قصير</SelectItem>
                          <SelectItem value="textarea">نص طويل</SelectItem>
                          <SelectItem value="rating">تقييم</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={q.required}
                          onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                        />
                        <Label className="text-sm">مطلوب</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-6 h-fit"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  معاينة مباشرة
                </CardTitle>
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

                    <div className="text-center py-4">
                      <p className="text-sm font-semibold mb-3">التقييم العام</p>
                      <div className="flex justify-center gap-2">
                        {[...Array(formData.ratingScale)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 text-gray-300" />
                        ))}
                      </div>
                    </div>

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
                      إرسال التقييم
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

