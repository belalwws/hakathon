"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormCountdown } from '@/components/FormCountdown'
import { FormClosed } from '@/components/FormClosed'
import { 
  Send, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'idNumber' | 'textarea' | 'paragraph' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  conditional?: {
    enabled: boolean
    showWhen: string
    showWhenValue: string
  }
}

interface RegistrationForm {
  id: string
  hackathonId: string
  title: string
  description: string
  coverImage?: string
  colors?: {
    primary: string
    secondary: string
    accent: string
    buttonText: string
  }
  isActive: boolean
  fields: FormField[]
  settings: {
    allowMultipleSubmissions: boolean
    requireApproval: boolean
    sendConfirmationEmail: boolean
    redirectUrl?: string
  }
  openAt?: string | null
  closeAt?: string | null
}

export default function HackathonRegisterFormPage() {
  const params = useParams()
  const router = useRouter()
  const hackathonId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<RegistrationForm | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false)

  useEffect(() => {
    checkCustomDesign()
    fetchForm()
  }, [hackathonId])

  useEffect(() => {
    // تتبع حالة الفورم لمنع Refresh المتكرر
    let hasRefreshed = false
    
    // Auto-refresh when form opens or closes
    if (form) {
      const checkFormStatus = () => {
        // لو عملنا refresh مرة، نوقف التحقق
        if (hasRefreshed) return

        const now = new Date()
        const openAt = form.openAt ? new Date(form.openAt) : null
        const closeAt = form.closeAt ? new Date(form.closeAt) : null

        // Refresh page when form opens (مرة واحدة فقط)
        if (openAt && now >= openAt && shouldShowCountdown()) {
          hasRefreshed = true
          setTimeout(() => window.location.reload(), 1000)
          return
        }

        // Refresh page when form closes (مرة واحدة فقط)
        if (closeAt && now >= closeAt && isFormOpen()) {
          hasRefreshed = true
          setTimeout(() => window.location.reload(), 1000)
          return
        }
      }

      const interval = setInterval(checkFormStatus, 1000)
      return () => clearInterval(interval)
    }
  }, [form])

  const isFormOpen = (): boolean => {
    if (!form) return false
    const now = new Date()
    const openAt = form.openAt ? new Date(form.openAt) : null
    const closeAt = form.closeAt ? new Date(form.closeAt) : null

    // If openAt is set and current time is before openAt
    if (openAt && now < openAt) {
      return false
    }

    // If closeAt is set and current time is after closeAt
    if (closeAt && now >= closeAt) {
      return false
    }

    return true
  }

  const isFormClosed = (): boolean => {
    if (!form || !form.closeAt) return false
    const now = new Date()
    const closeAt = new Date(form.closeAt)
    return now >= closeAt
  }

  const shouldShowCountdown = (): boolean => {
    if (!form || !form.openAt) return false
    const now = new Date()
    const openAt = new Date(form.openAt)
    return now < openAt
  }

  const checkCustomDesign = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/register-form-design`)
      if (response.ok) {
        const data = await response.json()
        if (data.design && data.design.isEnabled && data.design.htmlContent) {
          console.log('✅ Custom form design found, redirecting...')
          window.location.href = `/api/form/${hackathonId}`
          return
        }
      }
    } catch (error) {
      console.log('ℹ️ No custom design found, using default form')
    }
  }

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/register-form`)
      if (response.ok) {
        const data = await response.json()
        if (data.form) {
          setForm(data.form)
          // Initialize form data with default values
          const initialData: Record<string, any> = {}
          data.form.fields.forEach((field: FormField) => {
            if (field.type === 'checkbox') {
              initialData[field.id] = []
            } else {
              initialData[field.id] = ''
            }
          })
          setFormData(initialData)
        }
      }
    } catch (error) {
      console.error('Error fetching form:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} مطلوب`
    }

    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'البريد الإلكتروني غير صحيح'
    }

    if (field.type === 'phone' && value && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
      return 'رقم الهاتف غير صحيح'
    }

    if (field.type === 'idNumber' && value && !/^[0-9]{10}$/.test(value)) {
      return 'رقم الهوية يجب أن يكون 10 أرقام'
    }

    if (field.validation?.minLength && value && value.length < field.validation.minLength) {
      return `يجب أن يكون ${field.label} ${field.validation.minLength} أحرف على الأقل`
    }

    if (field.validation?.maxLength && value && value.length > field.validation.maxLength) {
      return `يجب أن يكون ${field.label} ${field.validation.maxLength} أحرف كحد أقصى`
    }

    return null
  }

  const shouldShowField = (field: FormField): boolean => {
    // If no conditional logic, always show
    if (!field.conditional?.enabled) return true

    // Check if the condition is met
    const watchFieldValue = formData[field.conditional.showWhen]
    const shouldShow = watchFieldValue === field.conditional.showWhenValue
    
    // Debug logging
    if (field.conditional?.enabled) {
      console.log('🔍 Conditional Field Check:', {
        fieldLabel: field.label,
        watchField: field.conditional.showWhen,
        expectedValue: field.conditional.showWhenValue,
        actualValue: watchFieldValue,
        shouldShow
      })
    }
    
    return shouldShow
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = formData[fieldId] || []
    let newValues
    
    if (checked) {
      newValues = [...currentValues, option]
    } else {
      newValues = currentValues.filter((v: string) => v !== option)
    }
    
    handleFieldChange(fieldId, newValues)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form) return

    // Validate all fields
    const newErrors: Record<string, string> = {}
    form.fields.forEach(field => {
      // Only validate if field should be shown
      if (shouldShowField(field)) {
        const error = validateField(field, formData[field.id])
        if (error) {
          newErrors[field.id] = error
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      console.log('📤 Sending registration data:', {
        formId: form.id,
        data: formData,
        email: formData.email,
        name: formData.name
      })

      const response = await fetch(`/api/hackathons/${hackathonId}/register-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          data: formData
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSubmitted(true)

        if (form.settings.redirectUrl) {
          setTimeout(() => {
            window.location.href = form.settings.redirectUrl!
          }, 3000)
        }
      } else {
        const error = await response.json()

        // ✅ Check if user is already registered
        if (response.status === 409 && error.alreadyRegistered) {
          // Show modal for duplicate registration
          setShowAlreadyRegistered(true)
        } else {
          alert(error.error || 'حدث خطأ في التسجيل')
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('حدث خطأ في التسجيل')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const error = errors[field.id]
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'idNumber':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-base font-medium text-gray-700 mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type === 'email' ? 'email' : field.type === 'phone' || field.type === 'idNumber' ? 'tel' : 'text'}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.type === 'idNumber' ? 10 : undefined}
              className={`mt-1 h-12 text-base ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-base font-medium text-gray-700 mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`mt-1 text-base ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>}
          </div>
        )

      case 'paragraph':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-base font-medium text-gray-700 mb-3 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <Textarea
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || 'اكتب نبذة تفصيلية...'}
                rows={6}
                className={`text-base bg-white shadow-sm ${error ? 'border-red-500' : 'border-blue-300'}`}
                dir="rtl"
              />
              <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                💡 يمكنك كتابة نص طويل ومفصل هنا
              </p>
            </div>
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-base font-medium text-gray-700 mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger className={`mt-1 h-12 text-base ${error ? 'border-red-500' : 'border-gray-300'}`}>
                <SelectValue placeholder={field.placeholder || `اختر ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option} className="text-base">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>}
          </div>
        )

      case 'radio':
        return (
          <div key={field.id}>
            <Label className="text-base font-medium text-gray-700 mb-3 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={formData[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              className="mt-2 space-y-3"
              dir="rtl"
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors" dir="rtl">
                  <RadioGroupItem value={option} id={`${field.id}_${option}`} />
                  <Label htmlFor={`${field.id}_${option}`} className="text-base cursor-pointer flex-1 text-right">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id}>
            <Label className="text-base font-medium text-gray-700 mb-3 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="mt-2 space-y-3">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors" dir="rtl">
                  <Checkbox
                    id={`${field.id}_${option}`}
                    checked={(formData[field.id] || []).includes(option)}
                    onCheckedChange={(checked) => handleCheckboxChange(field.id, option, checked as boolean)}
                  />
                  <Label htmlFor={`${field.id}_${option}`} className="text-base cursor-pointer flex-1 text-right">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>}
          </div>
        )

      case 'date':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-base font-medium text-gray-700 mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`mt-1 h-12 text-base ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>}
          </div>
        )

      case 'file':
        return (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-base font-medium text-gray-700 mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
              className={`mt-1 h-12 text-base ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">جاري تحميل النموذج...</p>
        </div>
      </div>
    )
  }

  // Show countdown if form hasn't opened yet
  if (form && shouldShowCountdown()) {
    return (
      <FormCountdown 
        targetDate={new Date(form.openAt!)} 
        type="opening" 
        formTitle={form.title}
      />
    )
  }

  // Show closed message if form is closed
  if (form && isFormClosed()) {
    return (
      <FormClosed 
        formTitle={form.title}
        closedAt={form.closeAt ? new Date(form.closeAt) : undefined}
        message="عذراً، لقد انتهى موعد قبول التسجيلات في هذا الهاكاثون"
      />
    )
  }

  if (!form || !form.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-xl border-0">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">النموذج غير متاح</h2>
            <p className="text-gray-600 leading-relaxed">
              نموذج التسجيل غير متاح حالياً أو تم إلغاء تفعيله
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-lg mx-auto shadow-2xl border-0">
            <CardContent className="p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-4 text-gray-900">تم التسجيل بنجاح! 🎉</h2>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {form.settings.requireApproval 
                  ? 'تم استلام طلبك بنجاح وسيتم مراجعته من قبل فريق الإدارة قريباً'
                  : 'تم تأكيد تسجيلك في الهاكاثون بنجاح'
                }
              </p>
              
              {form.settings.sendConfirmationEmail && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    تم إرسال رسالة تأكيد إلى بريدك الإلكتروني
                  </p>
                </div>
              )}

              <div className="pt-6">
                <p className="text-sm text-gray-500">
                  شكراً لتسجيلك معنا! 💚
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        <Card className="shadow-xl border-0">
          {/* Cover Image */}
          {form.coverImage && (
            <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
              <img
                src={form.coverImage}
                alt={form.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h2 className="text-2xl font-bold">{form.title}</h2>
                  {form.description && (
                    <p className="text-sm mt-2 opacity-90">{form.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <CardHeader className={form.coverImage ? "pt-8" : ""}>
            {!form.coverImage && (
              <>
                <CardTitle className="text-3xl font-bold text-center text-gray-900">
                  {form.title}
                </CardTitle>
                {form.description && (
                  <CardDescription className="text-center text-base mt-3">
                    {form.description}
                  </CardDescription>
                )}
              </>
            )}
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.fields.filter(field => shouldShowField(field)).map((field, index) => {
                  // Full width fields
                  if (field.type === 'textarea' || field.type === 'paragraph' || field.type === 'checkbox' || field.type === 'radio') {
                    return (
                      <motion.div 
                        key={field.id} 
                        className="md:col-span-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderField(field)}
                      </motion.div>
                    )
                  }
                  // Two columns for other fields
                  return (
                    <motion.div 
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderField(field)}
                    </motion.div>
                  )
                })}
              </div>
              
              <div className="flex justify-center pt-8 border-t mt-8">
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  style={{
                    backgroundColor: form.colors?.primary || '#01645e',
                    color: form.colors?.buttonText || '#ffffff'
                  }}
                  className="px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:opacity-90"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      جاري التسجيل...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      إرسال التسجيل
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Already Registered Modal */}
      {showAlreadyRegistered && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="w-16 h-16" />
              </div>
              <h2 className="text-2xl font-bold text-center">تم التسجيل مسبقاً</h2>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-700 text-lg mb-6">
                أنت مسجل بالفعل في هذا الهاكاثون!
              </p>
              <p className="text-gray-600 mb-8">
                لا يمكنك التسجيل مرة أخرى بنفس البريد الإلكتروني.
              </p>

              <Button
                onClick={() => setShowAlreadyRegistered(false)}
                style={{
                  backgroundColor: form?.colors?.primary || '#01645e',
                  color: form?.colors?.buttonText || '#ffffff'
                }}
                className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:opacity-90"
              >
                حسناً، فهمت
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
