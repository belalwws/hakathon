"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Save, ArrowLeft, FileText, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
}

export default function EditFormPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published' | 'closed',
    isPublic: false,
    fields: [] as FormField[]
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchForm()
  }, [user, router, params.id])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/admin/forms/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data.form)
        setFormData({
          title: data.form.title,
          description: data.form.description,
          status: data.form.status,
          isPublic: data.form.isPublic,
          fields: data.form.fields || []
        })
      } else {
        router.push('/admin/forms')
      }
    } catch (error) {
      console.error('Error fetching form:', error)
      router.push('/admin/forms')
    } finally {
      setLoading(false)
    }
  }

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '',
      required: false,
      options: []
    }
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const removeField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(formData.fields.find(f => f.id === fieldId)?.options || []), '']
    })
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = formData.fields.find(f => f.id === fieldId)
    if (field && field.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateField(fieldId, { options: newOptions })
    }
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = formData.fields.find(f => f.id === fieldId)
    if (field && field.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex)
      updateField(fieldId, { options: newOptions })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/forms/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        alert('تم حفظ الفورم بنجاح!')
        router.push('/admin/forms')
      } else {
        alert(`خطأ: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert('حدث خطأ في حفظ الفورم')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] text-lg">جاري تحميل الفورم...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-[#01645e] mb-2">الفورم غير موجود</h2>
            <p className="text-gray-600 mb-4">الفورم المطلوب غير موجود أو تم حذفه</p>
            <Link href="/admin/forms">
              <Button className="bg-[#01645e] text-white">
                العودة لقائمة الفورم
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/forms">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  العودة
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[#01645e]">تعديل الفورم</h1>
                <p className="text-gray-600">قم بتعديل إعدادات الفورم وحقوله</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#01645e] text-white hover:bg-[#3ab666]"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-1" />
                  حفظ
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Settings */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#01645e]">إعدادات الفورم</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">عنوان الفورم</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="أدخل عنوان الفورم"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">وصف الفورم</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="أدخل وصف الفورم"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">حالة الفورم</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'draft' | 'published' | 'closed') => 
                        setFormData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="published">منشور</SelectItem>
                        <SelectItem value="closed">مغلق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="isPublic">فورم عام</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#01645e]">حقول الفورم</CardTitle>
                    <Button onClick={addField} size="sm" className="bg-[#3ab666] text-white">
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة حقل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.fields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد حقول في الفورم</p>
                      <p className="text-sm">اضغط على "إضافة حقل" لبدء إنشاء الفورم</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.fields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border-2 border-gray-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                  <Input
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    placeholder="عنوان الحقل"
                                    className="font-medium"
                                  />
                                </div>
                                <Button
                                  onClick={() => removeField(field.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>نوع الحقل</Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value: any) => updateField(field.id, { type: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">نص</SelectItem>
                                      <SelectItem value="textarea">نص طويل</SelectItem>
                                      <SelectItem value="select">قائمة منسدلة</SelectItem>
                                      <SelectItem value="radio">اختيار واحد</SelectItem>
                                      <SelectItem value="checkbox">اختيار متعدد</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                  <Switch
                                    id={`required_${field.id}`}
                                    checked={field.required}
                                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                  />
                                  <Label htmlFor={`required_${field.id}`}>مطلوب</Label>
                                </div>
                              </div>

                              {/* Options for select, radio, checkbox */}
                              {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <Label>الخيارات</Label>
                                    <Button
                                      onClick={() => addOption(field.id)}
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Plus className="w-4 h-4 ml-1" />
                                      إضافة خيار
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {field.options?.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex gap-2">
                                        <Input
                                          value={option}
                                          onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                          placeholder={`خيار ${optionIndex + 1}`}
                                        />
                                        <Button
                                          onClick={() => removeOption(field.id, optionIndex)}
                                          variant="outline"
                                          size="sm"
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
