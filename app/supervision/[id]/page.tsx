"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  X
} from 'lucide-react'

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormDesign {
  id: string
  title: string
  description: string
  welcomeMessage: string
  successMessage: string
  coverImage?: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  formFields: string
  isEnabled: boolean
}

export default function SupervisionFormPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [design, setDesign] = useState<FormDesign | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [attachments, setAttachments] = useState<any[]>([])

  useEffect(() => {
    loadFormDesign()
  }, [hackathonId])

  const loadFormDesign = async () => {
    try {
      const response = await fetch(`/api/supervision-forms/design/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setDesign(data)
        
        if (data.formFields) {
          try {
            const parsedFields = JSON.parse(data.formFields)
            setFields(parsedFields)
          } catch (e) {
            console.error('Error parsing form fields:', e)
          }
        }
      } else {
        setError('لم يتم العثور على الفورم')
      }
    } catch (error) {
      console.error('Error loading form:', error)
      setError('حدث خطأ في تحميل الفورم')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      const attachment = {
        fieldId,
        name: file.name,
        type: file.type,
        data: base64
      }
      setAttachments([...attachments, attachment])
      setFormData({ ...formData, [fieldId]: file.name })
    }
    reader.readAsDataURL(file)
  }

  const removeAttachment = (fieldId: string) => {
    setAttachments(attachments.filter(a => a.fieldId !== fieldId))
    const newFormData = { ...formData }
    delete newFormData[fieldId]
    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Validate required fields
      const requiredFields = fields.filter(f => f.required)
      for (const field of requiredFields) {
        if (!formData[field.id]) {
          setError(`الحقل "${field.label}" مطلوب`)
          setSubmitting(false)
          return
        }
      }

      const response = await fetch('/api/supervision-forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId,
          formId: design?.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          formData,
          attachments
        })
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'فشل في إرسال الطلب')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setError('حدث خطأ في إرسال الطلب')
    } finally {
      setSubmitting(false)
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

  if (!design || !design.isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">الفورم غير متاح</h2>
            <p className="text-gray-600">عذراً، هذا الفورم غير متاح حالياً</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ 
          background: `linear-gradient(to bottom right, ${design.primaryColor}10, ${design.secondaryColor}10)` 
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4" style={{ color: design.primaryColor }} />
              <h2 className="text-3xl font-bold mb-4" style={{ color: design.primaryColor }}>
                تم الإرسال بنجاح!
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                {design.successMessage}
              </p>
              <Button
                onClick={() => router.push('/')}
                style={{ 
                  background: `linear-gradient(to right, ${design.primaryColor}, ${design.secondaryColor})` 
                }}
                className="text-white"
              >
                العودة للصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6"
      style={{ 
        background: `linear-gradient(to bottom right, ${design.primaryColor}10, ${design.secondaryColor}10)` 
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Cover Image */}
        {design.coverImage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <img 
              src={design.coverImage} 
              alt="Cover" 
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </motion.div>
        )}

        {/* Logo */}
        {design.logoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-6"
          >
            <img 
              src={design.logoUrl} 
              alt="Logo" 
              className="h-24 object-contain"
            />
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold" style={{ color: design.primaryColor }}>
                {design.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {design.description}
              </CardDescription>
              {design.welcomeMessage && (
                <Alert className="mt-4" style={{ borderColor: design.accentColor }}>
                  <AlertDescription className="text-base">
                    {design.welcomeMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Label className="text-base">
                      {field.label}
                      {field.required && <span className="text-red-500 mr-1">*</span>}
                    </Label>

                    {field.type === 'textarea' ? (
                      <Textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={4}
                        className="mt-2"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        required={field.required}
                        className="w-full mt-2 p-3 border rounded-lg"
                      >
                        <option value="">اختر...</option>
                        {field.options?.map((option, i) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'file' ? (
                      <div className="mt-2">
                        {formData[field.id] ? (
                          <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                            <span className="flex-1">{formData[field.id]}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(field.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <label className="cursor-pointer">
                              <span className="text-sm text-gray-600">انقر لرفع الملف</span>
                              <input
                                type="file"
                                onChange={(e) => handleFileUpload(e, field.id)}
                                className="hidden"
                                required={field.required}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="mt-2"
                      />
                    )}
                  </motion.div>
                ))}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-white text-lg py-6"
                  style={{ 
                    background: `linear-gradient(to right, ${design.primaryColor}, ${design.secondaryColor})` 
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 ml-2" />
                      إرسال الطلب
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
