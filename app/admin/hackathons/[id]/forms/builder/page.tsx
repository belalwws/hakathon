'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical,
  Type,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  Circle,
  List,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

interface Hackathon {
  id: string
  title: string
}

const fieldTypes = [
  { type: 'text', label: 'نص', icon: Type },
  { type: 'email', label: 'بريد إلكتروني', icon: Mail },
  { type: 'phone', label: 'رقم هاتف', icon: Phone },
  { type: 'textarea', label: 'نص طويل', icon: FileText },
  { type: 'select', label: 'قائمة منسدلة', icon: List },
  { type: 'checkbox', label: 'خانات اختيار', icon: CheckSquare },
  { type: 'radio', label: 'اختيار واحد', icon: Circle },
  { type: 'date', label: 'تاريخ', icon: Calendar },
  { type: 'file', label: 'رفع ملف', icon: Upload }
]

export default function FormBuilderPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string
  
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    if (hackathonId) {
      loadHackathon()
      loadExistingForm()
    }
  }, [user, router, hackathonId])

  const loadHackathon = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
      }
    } catch (error) {
      console.error('Error loading hackathon:', error)
    }
  }

  const loadExistingForm = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/form`)
      if (response.ok) {
        const data = await response.json()
        if (data.form && data.form.formData) {
          const formData = JSON.parse(data.form.formData)
          setFields(formData.fields || [])
        }
      }
    } catch (error) {
      console.error('Error loading existing form:', error)
    } finally {
      setLoading(false)
    }
  }

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `حقل ${fieldTypes.find(ft => ft.type === type)?.label}`,
      required: false,
      placeholder: '',
      options: type === 'select' || type === 'checkbox' || type === 'radio' ? ['خيار 1', 'خيار 2'] : undefined
    }
    setFields([...fields, newField])
    setSelectedField(newField)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates })
    }
  }

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === fieldId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= fields.length) return
    
    const newFields = [...fields]
    const [movedField] = newFields.splice(index, 1)
    newFields.splice(newIndex, 0, movedField)
    setFields(newFields)
  }

  const saveForm = async () => {
    setSaving(true)
    try {
      const formData = {
        fields,
        title: `نموذج تسجيل ${hackathon?.title}`,
        description: 'نموذج التسجيل المخصص للهاكاثون'
      }

      const response = await fetch(`/api/admin/hackathons/${hackathonId}/form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData: JSON.stringify(formData),
          updatedBy: user?.name || 'admin'
        })
      })

      if (response.ok) {
        alert('✅ تم حفظ النموذج بنجاح!')
      } else {
        const error = await response.json()
        alert(`❌ خطأ في الحفظ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert('❌ حدث خطأ في حفظ النموذج')
    } finally {
      setSaving(false)
    }
  }

  const previewForm = () => {
    window.open(`/hackathons/${hackathonId}/register`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8b7632] text-lg">جاري تحميل بناء النموذج...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => router.push(`/admin/hackathons/${hackathonId}/forms`)}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </button>
            
            <div className="flex gap-2">
              <Button onClick={previewForm} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                معاينة
              </Button>
              <Button onClick={saveForm} disabled={saving} className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ النموذج'}
              </Button>
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-2">
            🏗️ بناء النموذج الديناميكي
          </h1>
          {hackathon && (
            <h2 className="text-2xl font-bold text-[#01645e] mb-4">{hackathon.title}</h2>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Field Types Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#01645e]">أنواع الحقول</CardTitle>
                <CardDescription>اسحب أو اضغط لإضافة حقل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {fieldTypes.map((fieldType) => {
                  const Icon = fieldType.icon
                  return (
                    <Button
                      key={fieldType.type}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addField(fieldType.type)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {fieldType.label}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Form Builder */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#01645e]">تصميم النموذج</CardTitle>
                <CardDescription>قم بترتيب وتنظيم حقول النموذج</CardDescription>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-12">
                    <Plus className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-[#01645e] mb-2">ابدأ بإضافة حقول</h3>
                    <p className="text-[#8b7632]">اختر نوع الحقل من القائمة الجانبية لإضافته</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const Icon = fieldTypes.find(ft => ft.type === field.type)?.icon || Type
                      return (
                        <div
                          key={field.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedField?.id === field.id 
                              ? 'border-[#01645e] bg-[#01645e]/5' 
                              : 'border-gray-200 hover:border-[#01645e]/50'
                          }`}
                          onClick={() => setSelectedField(field)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <Icon className="w-4 h-4 text-[#01645e]" />
                              <div>
                                <p className="font-medium text-[#01645e]">{field.label}</p>
                                <p className="text-sm text-gray-500">
                                  {fieldTypes.find(ft => ft.type === field.type)?.label}
                                  {field.required && ' (مطلوب)'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveField(field.id, 'up')
                                }}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveField(field.id, 'down')
                                }}
                                disabled={index === fields.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeField(field.id)
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Field Properties Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#01645e]">خصائص الحقل</CardTitle>
                <CardDescription>تخصيص الحقل المحدد</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedField ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="field-label">تسمية الحقل</Label>
                      <Input
                        id="field-label"
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                        placeholder="أدخل تسمية الحقل"
                      />
                    </div>

                    <div>
                      <Label htmlFor="field-placeholder">النص التوضيحي</Label>
                      <Input
                        id="field-placeholder"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        placeholder="أدخل النص التوضيحي"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="field-required"
                        checked={selectedField.required}
                        onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                      />
                      <Label htmlFor="field-required">حقل مطلوب</Label>
                    </div>

                    {(selectedField.type === 'select' || selectedField.type === 'checkbox' || selectedField.type === 'radio') && (
                      <div>
                        <Label>الخيارات</Label>
                        <div className="space-y-2">
                          {selectedField.options?.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(selectedField.options || [])]
                                  newOptions[index] = e.target.value
                                  updateField(selectedField.id, { options: newOptions })
                                }}
                                placeholder={`خيار ${index + 1}`}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const newOptions = selectedField.options?.filter((_, i) => i !== index)
                                  updateField(selectedField.id, { options: newOptions })
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newOptions = [...(selectedField.options || []), `خيار ${(selectedField.options?.length || 0) + 1}`]
                              updateField(selectedField.id, { options: newOptions })
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            إضافة خيار
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedField.type === 'text' && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="min-length">الحد الأدنى للأحرف</Label>
                          <Input
                            id="min-length"
                            type="number"
                            value={selectedField.validation?.minLength || ''}
                            onChange={(e) => updateField(selectedField.id, {
                              validation: {
                                ...selectedField.validation,
                                minLength: e.target.value ? parseInt(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-length">الحد الأقصى للأحرف</Label>
                          <Input
                            id="max-length"
                            type="number"
                            value={selectedField.validation?.maxLength || ''}
                            onChange={(e) => updateField(selectedField.id, {
                              validation: {
                                ...selectedField.validation,
                                maxLength: e.target.value ? parseInt(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Type className="w-12 h-12 text-[#8b7632] mx-auto mb-3 opacity-50" />
                    <p className="text-[#8b7632]">اختر حقلاً لتخصيص خصائصه</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
