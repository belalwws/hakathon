"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Save, Eye, ArrowLeft, Type, List, CheckSquare, Calendar, Mail, Phone, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'email' | 'phone' | 'date' | 'number'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select, radio, checkbox
}

const fieldTypes = [
  { value: 'text', label: 'نص قصير', icon: Type },
  { value: 'textarea', label: 'نص طويل', icon: FileText },
  { value: 'email', label: 'بريد إلكتروني', icon: Mail },
  { value: 'phone', label: 'رقم هاتف', icon: Phone },
  { value: 'number', label: 'رقم', icon: Type },
  { value: 'date', label: 'تاريخ', icon: Calendar },
  { value: 'select', label: 'قائمة منسدلة', icon: List },
  { value: 'radio', label: 'اختيار واحد', icon: CheckSquare },
  { value: 'checkbox', label: 'اختيار متعدد', icon: CheckSquare }
]

export default function CreateForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    status: 'draft' as 'draft' | 'published'
  })
  const [fields, setFields] = useState<FormField[]>([])

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
  }, [user, router])

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: '',
      placeholder: '',
      required: false
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ))
  }

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id))
  }

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field) {
      const options = field.options || []
      updateField(fieldId, { options: [...options, ''] })
    }
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateField(fieldId, { options: newOptions })
    }
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex)
      updateField(fieldId, { options: newOptions })
    }
  }

  const saveForm = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      alert('يرجى إدخال عنوان النموذج')
      return
    }

    if (fields.length === 0) {
      alert('يرجى إضافة حقل واحد على الأقل')
      return
    }

    // Validate fields
    for (const field of fields) {
      if (!field.label.trim()) {
        alert('يرجى إدخال تسمية لجميع الحقول')
        return
      }
      if ((field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (!field.options || field.options.length === 0)) {
        alert(`يرجى إضافة خيارات للحقل: ${field.label}`)
        return
      }
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
          fields
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(status === 'draft' ? 'تم حفظ النموذج كمسودة' : 'تم نشر النموذج بنجاح')
        router.push('/admin/forms')
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حفظ النموذج')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert('حدث خطأ في حفظ النموذج')
    } finally {
      setLoading(false)
    }
  }

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return <Input placeholder={field.placeholder || field.label} disabled />
      case 'textarea':
        return <Textarea placeholder={field.placeholder || field.label} disabled />
      case 'date':
        return <Input type="date" disabled />
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="اختر..." />
            </SelectTrigger>
          </Select>
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input type="radio" disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                <input type="checkbox" disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )
      default:
        return <Input placeholder={field.label} disabled />
    }
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
          <h1 className="text-4xl font-bold text-[#01645e] mb-2">إنشاء نموذج جديد</h1>
          <p className="text-[#8b7632] text-lg">قم بتصميم نموذج مخصص لجمع البيانات</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Builder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-[#01645e]">إعدادات النموذج</CardTitle>
                <CardDescription>قم بتكوين النموذج وإضافة الحقول</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">عنوان النموذج *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="أدخل عنوان النموذج"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">وصف النموذج</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="وصف مختصر للنموذج"
                    />
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({...formData, isPublic: checked})}
                    />
                    <Label htmlFor="isPublic">نموذج عام (يمكن للجميع الوصول إليه)</Label>
                  </div>
                </div>

                {/* Fields */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">حقول النموذج</Label>
                    <Button onClick={addField} size="sm" className="bg-[#3ab666] hover:bg-[#2d8f52]">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة حقل
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border-l-4 border-l-[#3ab666]">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-[#01645e]">حقل {index + 1}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeField(field.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>نوع الحقل</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value) => updateField(field.id, { type: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>تسمية الحقل *</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                placeholder="أدخل تسمية الحقل"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <Label>نص المساعدة</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              placeholder="نص يظهر للمستخدم كمساعدة"
                            />
                          </div>

                          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <Label>الخيارات</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(field.id)}
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
                                      placeholder={`الخيار ${optionIndex + 1}`}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeOption(field.id, optionIndex)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2 rtl:space-x-reverse mt-4">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                            />
                            <Label>حقل مطلوب</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    onClick={() => saveForm('draft')}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ كمسودة
                  </Button>
                  <Button
                    onClick={() => saveForm('published')}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    نشر النموذج
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-[#01645e] flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  معاينة النموذج
                </CardTitle>
                <CardDescription>كيف سيبدو النموذج للمستخدمين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.title && (
                    <div>
                      <h3 className="text-xl font-bold text-[#01645e] mb-2">{formData.title}</h3>
                      {formData.description && (
                        <p className="text-[#8b7632] text-sm">{formData.description}</p>
                      )}
                    </div>
                  )}

                  {fields.length === 0 ? (
                    <div className="text-center py-8 text-[#8b7632]">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>لا توجد حقول بعد</p>
                      <p className="text-xs">أضف حقول لرؤية المعاينة</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <div key={field.id}>
                          <Label className="text-sm font-medium text-[#01645e]">
                            {field.label}
                            {field.required && <span className="text-red-500 mr-1">*</span>}
                          </Label>
                          <div className="mt-1">
                            {renderFieldPreview(field)}
                          </div>
                          {field.placeholder && (
                            <p className="text-xs text-[#8b7632] mt-1">{field.placeholder}</p>
                          )}
                        </div>
                      ))}
                      <Button disabled className="w-full mt-6">
                        إرسال النموذج
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
