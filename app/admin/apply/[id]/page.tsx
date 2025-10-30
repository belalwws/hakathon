"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2, UserPlus, Mail, Phone, User, Camera, Upload, Award } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HackathonData {
  id: string
  title: string
  description: string
  status: string
}

interface FormDesign {
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
}

export default function AdminApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.hackathonId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hackathon, setHackathon] = useState<HackathonData | null>(null)
  const [formDesign, setFormDesign] = useState<FormDesign>({
    primaryColor: "#01645e",
    secondaryColor: "#3ab666", 
    accentColor: "#c3e956",
    backgroundColor: "#ffffff"
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    experience: '',
    expertise: '',
    linkedin: '',
    twitter: '',
    website: '',
    motivation: '',
    availability: '',
    previousWork: ''
  })

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>('')

  useEffect(() => {
    loadHackathonData()
    loadFormDesign()
  }, [hackathonId])

  const loadHackathonData = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data)
      } else {
        setError('الهاكاثون غير موجود')
      }
    } catch (err) {
      console.error('Error loading hackathon:', err)
      setError('حدث خطأ في تحميل بيانات الهاكاثون')
    }
  }

  const loadFormDesign = async () => {
    try {
      const response = await fetch(`/api/admin/admin-form-design/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setFormDesign(data)
      }
    } catch (err) {
      console.error('Error loading form design:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار ملف صورة صالح')
        return
      }

      setProfileImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.email) {
      setError('يرجى ملء الحقول المطلوبة')
      return
    }

    if (!formData.email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صالح')
      return
    }

    setSubmitting(true)

    try {
      const submitData = new FormData()
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      
      submitData.append('hackathonId', hackathonId)
      
      // Add profile image if selected
      if (profileImage) {
        submitData.append('profileImage', profileImage)
      }

      const response = await fetch('/api/admin/apply', {
        method: 'POST',
        body: submitData
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'فشل في إرسال الطلب')
      }
    } catch (err) {
      console.error('Error submitting application:', err)
      setError('حدث خطأ في إرسال الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#01645e] animate-spin mx-auto mb-4" />
          <p className="text-[#01645e] font-semibold">جاري تحميل الصفحة...</p>
        </div>
      </div>
    )
  }

  if (error && !hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#01645e] mb-2">خطأ</h2>
              <p className="text-[#8b7632] mb-6">{error}</p>
              <Button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#01645e] mb-2">تم إرسال الطلب بنجاح!</h2>
              <p className="text-[#8b7632] mb-6">
                {formDesign.successMessage || 'شكراً لك! تم إرسال طلبك بنجاح. سيتم مراجعته والرد عليك قريباً.'}
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: `linear-gradient(135deg, ${formDesign.primaryColor}10, ${formDesign.secondaryColor}10)`,
        backgroundColor: formDesign.backgroundColor 
      }}
    >
      {/* Cover Image */}
      {formDesign.coverImage && (
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: `url(${formDesign.coverImage})` }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full relative z-10"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            {/* Logo */}
            {formDesign.logoUrl && (
              <div className="flex justify-center mb-4">
                <img 
                  src={formDesign.logoUrl} 
                  alt="Logo" 
                  className="h-16 w-auto"
                />
              </div>
            )}

            <div className="flex justify-center mb-4">
              <div 
                className="p-4 rounded-full"
                style={{ 
                  background: `linear-gradient(135deg, ${formDesign.primaryColor}, ${formDesign.secondaryColor})` 
                }}
              >
                <UserPlus className="w-12 h-12 text-white" />
              </div>
            </div>

            <CardTitle 
              className="text-3xl mb-2"
              style={{ color: formDesign.primaryColor }}
            >
              {formDesign.title || 'طلب انضمام كمشرف'}
            </CardTitle>
            
            <CardDescription className="text-lg">
              {formDesign.description || 'انضم إلى فريق الإشراف في الهاكاثون'}
            </CardDescription>

            {/* Welcome Message */}
            {formDesign.welcomeMessage && (
              <div 
                className="mt-4 p-4 rounded-lg border-r-4"
                style={{ 
                  backgroundColor: `${formDesign.accentColor}20`,
                  borderColor: formDesign.accentColor 
                }}
              >
                <p className="text-sm">{formDesign.welcomeMessage}</p>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Hackathon Info */}
            {hackathon && (
              <div 
                className="p-4 rounded-lg border-r-4"
                style={{ 
                  backgroundColor: `${formDesign.primaryColor}10`,
                  borderColor: formDesign.primaryColor 
                }}
              >
                <div className="flex items-start gap-3">
                  <Award 
                    className="w-6 h-6 mt-1 flex-shrink-0"
                    style={{ color: formDesign.primaryColor }}
                  />
                  <div>
                    <h3 
                      className="font-bold mb-1"
                      style={{ color: formDesign.primaryColor }}
                    >
                      {hackathon.title}
                    </h3>
                    <p className="text-sm text-gray-600">{hackathon.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  الصورة الشخصية (اختياري)
                </Label>
                <div className="flex items-center gap-4">
                  {profileImagePreview ? (
                    <div className="relative">
                      <img 
                        src={profileImagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-full object-cover border-2"
                        style={{ borderColor: formDesign.primaryColor }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() => {
                          setProfileImage(null)
                          setProfileImagePreview('')
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center"
                      style={{ borderColor: formDesign.primaryColor }}
                    >
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profileImage"
                    />
                    <Label 
                      htmlFor="profileImage"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border"
                      style={{ 
                        borderColor: formDesign.primaryColor,
                        color: formDesign.primaryColor 
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      اختيار صورة
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      أقصى حجم: 5 ميجابايت
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    الاسم الكامل <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  رقم الهاتف (اختياري)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">نبذة شخصية</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="اكتب نبذة مختصرة عن نفسك..."
                  rows={3}
                />
              </div>

              {/* Experience & Expertise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">سنوات الخبرة</Label>
                  <Input
                    id="experience"
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="مثال: 5 سنوات في إدارة المشاريع"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">مجالات الخبرة</Label>
                  <Input
                    id="expertise"
                    type="text"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    placeholder="مثال: إدارة المشاريع، التقنية، التسويق"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">الموقع الشخصي</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-2">
                <Label htmlFor="motivation">لماذا تريد الانضمام كمشرف؟</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="اشرح دوافعك للانضمام كمشرف في هذا الهاكاثون..."
                  rows={3}
                />
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label htmlFor="availability">مدى التفرغ</Label>
                <Textarea
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="اذكر مدى تفرغك وإمكانية المشاركة في الهاكاثون..."
                  rows={2}
                />
              </div>

              {/* Previous Work */}
              <div className="space-y-2">
                <Label htmlFor="previousWork">أعمال سابقة</Label>
                <Textarea
                  id="previousWork"
                  value={formData.previousWork}
                  onChange={(e) => setFormData({ ...formData, previousWork: e.target.value })}
                  placeholder="اذكر أي أعمال أو مشاريع سابقة ذات صلة..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full text-lg py-6"
                style={{ 
                  background: `linear-gradient(135deg, ${formDesign.primaryColor}, ${formDesign.secondaryColor})` 
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 ml-2" />
                    إرسال الطلب
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
