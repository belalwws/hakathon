"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star
} from 'lucide-react'
import { FormField } from '@/components/admin/FormBuilder'

export default function ExpertApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [hackathon, setHackathon] = useState<any>(null)
  const [formConfig, setFormConfig] = useState<any>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File>>({})

  useEffect(() => {
    loadForm()
  }, [hackathonId])

  const loadForm = async () => {
    try {
      const hackathonRes = await fetch(`/api/hackathons/${hackathonId}`)
      if (hackathonRes.ok) {
        const hackData = await hackathonRes.json()
        setHackathon(hackData)
      }

      // استخدام الـ endpoint العام بدلاً من الـ admin endpoint
      const formRes = await fetch(`/api/expert-form/${hackathonId}`)
      if (formRes.ok) {
        const formData = await formRes.json()
        if (formData.form) {
          setFormConfig(formData.form)
        }
      }
    } catch (error) {
      console.error('Error loading form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [fieldId]: file }))
    } else {
      const newFiles = { ...files }
      delete newFiles[fieldId]
      setFiles(newFiles)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const fields = formConfig?.fields || []
      for (const field of fields) {
        if (field.required && !formData[field.id] && !files[field.id]) {
          setError(`الحقل "${field.label}" مطلوب`)
          setSubmitting(false)
          return
        }
      }

      const submitData = new FormData()
      submitData.append('hackathonId', hackathonId)
      submitData.append('formData', JSON.stringify(formData))

      Object.entries(files).forEach(([fieldId, file]) => {
        submitData.append(fieldId, file)
      })

      const response = await fetch('/api/expert/apply', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({})
        setFiles({})
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

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
      case 'number':
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        )
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        )
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={(value as string[])?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = (value as string[]) || []
                    if (checked) {
                      handleInputChange(field.id, [...currentValues, option])
                    } else {
                      handleInputChange(field.id, currentValues.filter(v => v !== option))
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )
      case 'file':
        return (
          <div>
            <Input
              type="file"
              onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
              required={field.required}
              accept="image/*,.pdf,.doc,.docx"
            />
            {files[field.id] && (
              <p className="text-sm text-green-600 mt-2">
                <CheckCircle2 className="w-4 h-4 inline ml-1" />
                {files[field.id].name}
              </p>
            )}
          </div>
        )
      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleInputChange(field.id, rating)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    value >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        )
      default:
        return null
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

  if (!formConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            الفورم غير متاح حالياً. يرجى المحاولة لاحقاً.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const primaryColor = formConfig.primaryColor || '#0891b2'
  const secondaryColor = formConfig.secondaryColor || '#3b82f6'

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4" style={{ color: primaryColor }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>تم الإرسال بنجاح!</h2>
              <p className="text-gray-600 mb-6">{formConfig.successMessage}</p>
              <Button onClick={() => router.push('/')} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} className="text-white">
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }} dir="rtl">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            {/* Cover Image */}
            {formConfig.coverImage && (
              <div className="w-full h-48 md:h-64 overflow-hidden rounded-t-lg">
                <img
                  src={formConfig.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardHeader className="text-center" style={{ background: formConfig.coverImage ? 'transparent' : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
              <CardTitle className="text-3xl" style={{ color: formConfig.coverImage ? primaryColor : 'white' }}>
                {formConfig.title}
              </CardTitle>
              {hackathon && (
                <CardDescription className="text-lg" style={{ color: formConfig.coverImage ? secondaryColor : 'rgba(255,255,255,0.9)' }}>
                  {hackathon.title}
                </CardDescription>
              )}
              {formConfig.description && (
                <p className="mt-2" style={{ color: formConfig.coverImage ? '#666' : 'rgba(255,255,255,0.8)' }}>
                  {formConfig.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {formConfig.fields?.map((field: FormField) => (
                  <div key={field.id}>
                    <Label className="text-lg mb-2 block">
                      {field.label}
                      {field.required && <span className="text-red-500 mr-1">*</span>}
                    </Label>
                    {field.description && <p className="text-sm text-gray-500 mb-2">{field.description}</p>}
                    {renderField(field)}
                  </div>
                ))}
                <Button type="submit" disabled={submitting} className="w-full text-white text-lg py-6" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                  {submitting ? (<><Loader2 className="w-5 h-5 ml-2 animate-spin" />جاري الإرسال...</>) : ('إرسال الطلب')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
