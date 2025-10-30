"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Eye, Calendar, User, Mail, BarChart3, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  options?: string[]
}

interface FormResponse {
  id: string
  userId?: string
  userEmail?: string
  userName?: string
  responses: Record<string, any>
  submittedAt: string
}

interface Form {
  id: string
  title: string
  description: string
  fields: FormField[]
  status: string
  isPublic: boolean
  createdAt: string
  _count: {
    responses: number
  }
}

export default function FormResponses({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchFormAndResponses()
  }, [user, router, params.id])

  const fetchFormAndResponses = async () => {
    try {
      // Fetch form details
      const formResponse = await fetch(`/api/admin/forms/${params.id}`)
      if (formResponse.ok) {
        const formData = await formResponse.json()
        setForm(formData.form)
      }

      // Fetch responses
      const responsesResponse = await fetch(`/api/admin/forms/${params.id}/responses`)
      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json()
        setResponses(responsesData.responses)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!form || responses.length === 0) return

    const headers = ['التاريخ', 'المستخدم', 'البريد الإلكتروني', ...form.fields.map(f => f.label)]
    const rows = responses.map(response => [
      new Date(response.submittedAt).toLocaleDateString('ar-EG'),
      response.userName || 'غير محدد',
      response.userEmail || 'غير محدد',
      ...form.fields.map(field => {
        const value = response.responses[field.id]
        if (Array.isArray(value)) {
          return value.join(', ')
        }
        return value || ''
      })
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${form.title}_responses.csv`
    link.click()
  }

  const renderFieldValue = (field: FormField, value: any) => {
    if (!value) return 'لا يوجد رد'

    switch (field.type) {
      case 'checkbox':
        return Array.isArray(value) ? value.join(', ') : value
      case 'date':
        return new Date(value).toLocaleDateString('ar-EG')
      default:
        return value.toString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-medium">جاري تحميل الردود...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-[#01645e]/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#01645e] mb-2">النموذج غير موجود</h3>
              <p className="text-[#8b7632] mb-6">لم يتم العثور على النموذج المطلوب</p>
              <Link href="/admin/forms">
                <Button>العودة للنماذج</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/forms">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للنماذج
              </Button>
            </Link>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-[#01645e] mb-2">ردود النموذج</h1>
              <p className="text-[#8b7632] text-lg">{form.title}</p>
              {form.description && (
                <p className="text-[#8b7632] text-sm mt-1">{form.description}</p>
              )}
            </div>
            {responses.length > 0 && (
              <Button onClick={exportToCSV} className="bg-gradient-to-r from-[#3ab666] to-[#c3e956]">
                <Download className="w-4 h-4 ml-2" />
                تصدير CSV
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">إجمالي الردود</p>
                  <p className="text-3xl font-bold">{responses.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">عدد الحقول</p>
                  <p className="text-3xl font-bold">{form.fields.length}</p>
                </div>
                <FileText className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#8b7632] to-[#c3e956] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">تاريخ الإنشاء</p>
                  <p className="text-lg font-bold">{new Date(form.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                <Calendar className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Responses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {responses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="w-16 h-16 text-[#01645e]/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد ردود بعد</h3>
                <p className="text-[#8b7632] mb-6">لم يقم أحد بملء هذا النموذج بعد</p>
                <Badge variant="outline" className={form.status === 'published' ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'}>
                  {form.status === 'published' ? 'النموذج منشور' : 'النموذج غير منشور'}
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {responses.map((response, index) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-[#01645e] text-lg flex items-center gap-2">
                            <User className="w-5 h-5" />
                            {response.userName || 'مستخدم مجهول'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            {response.userEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {response.userEmail}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(response.submittedAt).toLocaleDateString('ar-EG')} - {new Date(response.submittedAt).toLocaleTimeString('ar-EG')}
                            </span>
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedResponse(selectedResponse?.id === response.id ? null : response)}
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          {selectedResponse?.id === response.id ? 'إخفاء' : 'عرض'}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {selectedResponse?.id === response.id && (
                      <CardContent>
                        <div className="space-y-4 border-t pt-4">
                          {form.fields.map((field) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className="font-medium text-[#01645e]">
                                {field.label}
                                {field.required && <span className="text-red-500 mr-1">*</span>}
                              </div>
                              <div className="md:col-span-2 text-[#8b7632]">
                                {renderFieldValue(field, response.responses[field.id])}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
