"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { FormCountdown } from '@/components/FormCountdown'
import { FormClosed } from '@/components/FormClosed'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox'
  label: string
  required: boolean
  options?: string[]
}

interface Form {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'closed'
  isPublic: boolean
  fields: FormField[]
  openAt?: string | null
  closeAt?: string | null
}

export default function FormPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchForm()
  }, [params.id])

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

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data.form)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching form:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

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

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/forms/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          userId: user?.id
        })
      })

      const data = await response.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        alert(`خطأ: ${data.error}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('حدث خطأ في إرسال النموذج')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] text-lg">جاري تحميل النموذج...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#01645e] mb-2">النموذج غير موجود</h2>
            <p className="text-gray-600 mb-4">النموذج المطلوب غير موجود أو تم حذفه</p>
            <Button onClick={() => router.push('/')} className="bg-[#01645e] text-white">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show countdown if form hasn't opened yet
  if (shouldShowCountdown()) {
    return (
      <FormCountdown 
        targetDate={new Date(form.openAt!)} 
        type="opening" 
        formTitle={form.title}
      />
    )
  }

  // Show closed message if form is closed
  if (isFormClosed()) {
    return (
      <FormClosed 
        formTitle={form.title}
        closedAt={form.closeAt ? new Date(form.closeAt) : undefined}
        message="عذراً، لقد انتهى موعد قبول الردود على هذا النموذج"
      />
    )
  }

  if (form.status !== 'published') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#01645e] mb-2">النموذج غير متاح</h2>
            <p className="text-gray-600 mb-4">هذا النموذج غير متاح حالياً</p>
            <Button onClick={() => router.push('/')} className="bg-[#01645e] text-white">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#01645e] mb-2">تم إرسال النموذج بنجاح!</h2>
            <p className="text-gray-600 mb-4">شكراً لكم على المشاركة</p>
            <Button onClick={() => router.push('/')} className="bg-[#01645e] text-white">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 via-[#3ab666]/5 to-[#01645e]/10 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#01645e]/20 to-[#3ab666]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#c3e956]/10 to-[#01645e]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] text-white relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c3e956] to-[#01645e]"></div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative z-10"
              >
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <FileText className="w-8 h-8" />
                  </motion.div>
                  {form.title}
                </CardTitle>
                {form.description && (
                  <CardDescription className="text-white/90 text-lg leading-relaxed">
                    {form.description}
                  </CardDescription>
                )}
              </motion.div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {form.fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <label className="block text-lg font-semibold text-[#01645e] mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#3ab666] to-[#c3e956] rounded-full"></div>
                        {field.label}
                        {field.required && <span className="text-red-500 text-xl">*</span>}
                      </label>
                      
                      {field.type === 'text' && (
                        <motion.input
                          type="text"
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#01645e]/20 focus:border-[#01645e] transition-all duration-300 bg-white/80 backdrop-blur-sm text-lg"
                          placeholder={`أدخل ${field.label.toLowerCase()}`}
                          whileFocus={{ scale: 1.02 }}
                        />
                      )}
                    
                      {field.type === 'textarea' && (
                        <motion.textarea
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#01645e]/20 focus:border-[#01645e] transition-all duration-300 bg-white/80 backdrop-blur-sm text-lg resize-none"
                          placeholder={`اكتب ${field.label.toLowerCase()} هنا...`}
                          whileFocus={{ scale: 1.02 }}
                        />
                      )}
                      
                      {field.type === 'select' && field.options && (
                        <motion.select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#01645e]/20 focus:border-[#01645e] transition-all duration-300 bg-white/80 backdrop-blur-sm text-lg appearance-none cursor-pointer"
                          whileFocus={{ scale: 1.02 }}
                        >
                          <option value="">اختر من القائمة...</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </motion.select>
                      )}
                    
                      {field.type === 'radio' && field.options && (
                        <div className="space-y-3">
                          {field.options.map((option, optionIndex) => (
                            <motion.label
                              key={option}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: optionIndex * 0.05 }}
                              className="flex items-center p-3 rounded-lg border-2 border-gray-100 hover:border-[#3ab666]/30 hover:bg-[#3ab666]/5 transition-all duration-300 cursor-pointer group"
                            >
                              <input
                                type="radio"
                                name={field.id}
                                value={option}
                                checked={formData[field.id] === option}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                required={field.required}
                                className="w-5 h-5 text-[#01645e] border-2 border-gray-300 focus:ring-[#01645e] focus:ring-2 ml-3"
                              />
                              <span className="text-lg text-gray-700 group-hover:text-[#01645e] transition-colors duration-300">
                                {option}
                              </span>
                            </motion.label>
                          ))}
                        </div>
                      )}
                      
                      {field.type === 'checkbox' && field.options && (
                        <div className="space-y-3">
                          {field.options.map((option, optionIndex) => (
                            <motion.label
                              key={option}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: optionIndex * 0.05 }}
                              className="flex items-center p-3 rounded-lg border-2 border-gray-100 hover:border-[#c3e956]/30 hover:bg-[#c3e956]/5 transition-all duration-300 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                value={option}
                                checked={formData[field.id]?.includes(option) || false}
                                onChange={(e) => {
                                  const currentValues = formData[field.id] || []
                                  if (e.target.checked) {
                                    handleInputChange(field.id, [...currentValues, option])
                                  } else {
                                    handleInputChange(field.id, currentValues.filter((v: string) => v !== option))
                                  }
                                }}
                                className="w-5 h-5 text-[#c3e956] border-2 border-gray-300 focus:ring-[#c3e956] focus:ring-2 ml-3 rounded"
                              />
                              <span className="text-lg text-gray-700 group-hover:text-[#01645e] transition-colors duration-300">
                                {option}
                              </span>
                            </motion.label>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-4 justify-center pt-6"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      onClick={() => router.push('/')}
                      variant="outline"
                      className="px-8 py-3 text-lg border-2 border-gray-300 hover:border-[#01645e] hover:text-[#01645e] transition-all duration-300"
                    >
                      إلغاء
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 text-lg bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white hover:from-[#3ab666] hover:to-[#c3e956] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 ml-2" />
                          إرسال النموذج
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
