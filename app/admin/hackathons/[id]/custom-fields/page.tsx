"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Save, Plus, Trash2, RotateCcw, GripVertical, Eye, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

interface CustomField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  enabled: boolean
  order: number
  options?: string[]
  isDefault?: boolean
}

interface CustomFieldsData {
  hackathonId: string
  hackathonTitle: string
  fields: CustomField[]
  defaultFields: CustomField[]
}

const FIELD_TYPES = [
  { value: 'text', label: 'نص' },
  { value: 'email', label: 'بريد إلكتروني' },
  { value: 'tel', label: 'رقم هاتف' },
  { value: 'number', label: 'رقم' },
  { value: 'select', label: 'قائمة منسدلة' },
  { value: 'textarea', label: 'نص طويل' },
  { value: 'checkbox', label: 'مربع اختيار' },
  { value: 'radio', label: 'اختيار واحد' },
  { value: 'date', label: 'تاريخ' }
]

export default function CustomFieldsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<CustomFieldsData | null>(null)
  const [fields, setFields] = useState<CustomField[]>([])
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/dashboard')
      return
    }
    if (user && hackathonId) {
      fetchCustomFields()
    }
  }, [user, authLoading, hackathonId])

  const fetchCustomFields = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/custom-fields`)
      if (response.ok) {
        const fieldsData = await response.json()
        setData(fieldsData)
        setFields(fieldsData.fields)
      } else {
        console.error('Failed to fetch custom fields')
      }
    } catch (error) {
      console.error('Error fetching custom fields:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFields = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/custom-fields`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      })

      if (response.ok) {
        const result = await response.json()
        alert('✅ تم حفظ الحقول المخصصة بنجاح!')
        setData(prev => prev ? { ...prev, fields: result.fields } : null)
      } else {
        const error = await response.json()
        alert(`❌ خطأ في حفظ الحقول: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving custom fields:', error)
      alert('❌ حدث خطأ في حفظ الحقول')
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefault = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الحقول للافتراضية؟ سيتم فقدان جميع التخصيصات.')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/custom-fields/reset`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        alert('✅ تم إعادة تعيين الحقول للافتراضية بنجاح!')
        setFields(result.fields)
        setData(prev => prev ? { ...prev, fields: result.fields } : null)
      } else {
        const error = await response.json()
        alert(`❌ خطأ في إعادة التعيين: ${error.error}`)
      }
    } catch (error) {
      console.error('Error resetting custom fields:', error)
      alert('❌ حدث خطأ في إعادة التعيين')
    } finally {
      setSaving(false)
    }
  }

  const addNewField = () => {
    const newField: CustomField = {
      id: `custom_${Date.now()}`,
      type: 'text',
      label: 'حقل جديد',
      placeholder: '',
      required: false,
      enabled: true,
      order: fields.length + 1
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, updates: Partial<CustomField>) => {
    const updatedFields = [...fields]
    updatedFields[index] = { ...updatedFields[index], ...updates }
    setFields(updatedFields)
  }

  const removeField = (index: number) => {
    const field = fields[index]
    if (field.isDefault) {
      alert('لا يمكن حذف الحقول الافتراضية')
      return
    }
    if (confirm('هل أنت متأكد من حذف هذا الحقل؟')) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newFields.length) return
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
    
    // Update order
    newFields.forEach((field, i) => {
      field.order = i + 1
    })
    
    setFields(newFields)
  }

  const addOption = (fieldIndex: number) => {
    const updatedFields = [...fields]
    const field = updatedFields[fieldIndex]
    if (!field.options) field.options = []
    field.options.push('خيار جديد')
    setFields(updatedFields)
  }

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updatedFields = [...fields]
    const field = updatedFields[fieldIndex]
    if (field.options) {
      field.options[optionIndex] = value
    }
    setFields(updatedFields)
  }

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields]
    const field = updatedFields[fieldIndex]
    if (field.options) {
      field.options.splice(optionIndex, 1)
    }
    setFields(updatedFields)
  }

  const renderFieldPreview = (field: CustomField) => {
    if (!field.enabled) return null

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <Input
            placeholder={field.placeholder}
            disabled
            className="bg-gray-50"
          />
        )
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled
            className="bg-gray-50"
            rows={3}
          />
        )
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, i) => (
                <SelectItem key={i} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" disabled className="rounded" />
            <span className="text-sm">{field.placeholder || field.label}</span>
          </div>
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="radio" disabled name={field.id} className="rounded-full" />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )
      case 'date':
        return (
          <Input
            type="date"
            disabled
            className="bg-gray-50"
          />
        )
      default:
        return (
          <Input
            placeholder={field.placeholder}
            disabled
            className="bg-gray-50"
          />
        )
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-medium">جاري تحميل الحقول المخصصة...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#01645e] font-medium">لم يتم العثور على بيانات الهاكاثون</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/admin/hackathons/${hackathonId}`}>
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للهاكاثون
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#01645e] mb-2">النماذج المخصصة</h1>
              <p className="text-[#8b7632]">{data.hackathonTitle}</p>
            </div>
            <Badge className="bg-[#3ab666] text-white">
              <Settings className="w-4 h-4 ml-1" />
              تخصيص النماذج
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fields Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#01645e]">تحرير الحقول</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPreviewMode(!previewMode)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      {previewMode ? 'إخفاء المعاينة' : 'معاينة'}
                    </Button>
                    <Button
                      onClick={handleResetToDefault}
                      disabled={saving}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 ml-2" />
                      إعادة تعيين
                    </Button>
                    <Button
                      onClick={addNewField}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة حقل
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  قم بتخصيص حقول نموذج التسجيل لهذا الهاكاثون
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-[#01645e]">{field.label}</span>
                        {field.isDefault && (
                          <Badge variant="secondary" className="text-xs">افتراضي</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={field.enabled}
                          onCheckedChange={(checked) => updateField(index, { enabled: checked })}
                        />
                        {!field.isDefault && (
                          <Button
                            onClick={() => removeField(index)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {field.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">التسمية</label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            placeholder="تسمية الحقل"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">النوع</label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateField(index, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">النص التوضيحي</label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                            placeholder="النص التوضيحي"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(index, { required: checked })}
                          />
                          <label className="text-sm">مطلوب</label>
                        </div>

                        {(field.type === 'select' || field.type === 'radio') && (
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">الخيارات</label>
                            <div className="space-y-2">
                              {field.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                    placeholder="خيار"
                                  />
                                  <Button
                                    onClick={() => removeOption(index, optionIndex)}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                onClick={() => addOption(index)}
                                variant="outline"
                                size="sm"
                              >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة خيار
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleSaveFields}
                disabled={saving}
                className="bg-gradient-to-r from-[#01645e] to-[#3ab666] px-8 py-3 text-lg"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 ml-2" />
                    حفظ الحقول
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-[#01645e]">معاينة النموذج</CardTitle>
                <CardDescription>
                  هكذا سيبدو نموذج التسجيل للمشاركين
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {fields
                  .filter(field => field.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-[#01645e]">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFieldPreview(field)}
                    </div>
                  ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
