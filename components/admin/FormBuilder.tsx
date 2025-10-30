"use client"

import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  AlignLeft, 
  CheckSquare, 
  Circle, 
  ChevronDown,
  Calendar,
  Mail,
  Phone,
  Link as LinkIcon,
  Hash,
  FileText,
  Image as ImageIcon,
  Star
} from 'lucide-react'

export interface FormField {
  id: string
  type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'url' | 'date' | 'select' | 'radio' | 'checkbox' | 'file' | 'rating'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  description?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

interface FormBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
}

const fieldTypes = [
  { value: 'text', label: 'نص قصير', icon: Type },
  { value: 'textarea', label: 'نص طويل', icon: AlignLeft },
  { value: 'email', label: 'بريد إلكتروني', icon: Mail },
  { value: 'phone', label: 'رقم هاتف', icon: Phone },
  { value: 'number', label: 'رقم', icon: Hash },
  { value: 'url', label: 'رابط', icon: LinkIcon },
  { value: 'date', label: 'تاريخ', icon: Calendar },
  { value: 'select', label: 'قائمة منسدلة', icon: ChevronDown },
  { value: 'radio', label: 'اختيار واحد', icon: Circle },
  { value: 'checkbox', label: 'اختيار متعدد', icon: CheckSquare },
  { value: 'file', label: 'رفع ملف', icon: FileText },
  { value: 'rating', label: 'تقييم', icon: Star },
]

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: 'حقل جديد',
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['خيار 1', 'خيار 2'] : undefined
    }
    onChange([...fields, newField])
    setShowAddMenu(false)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ))
  }

  const deleteField = (id: string) => {
    onChange(fields.filter(field => field.id !== id))
  }

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.options) {
      updateField(fieldId, {
        options: [...field.options, `خيار ${field.options.length + 1}`]
      })
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

  const deleteOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId)
    if (field && field.options && field.options.length > 1) {
      updateField(fieldId, {
        options: field.options.filter((_, i) => i !== optionIndex)
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Fields List */}
      <Reorder.Group axis="y" values={fields} onReorder={onChange} className="space-y-4">
        {fields.map((field) => (
          <Reorder.Item key={field.id} value={field}>
            <Card className="border-2 hover:border-[#01645e] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="cursor-move mt-2">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Field Content */}
                  <div className="flex-1 space-y-3">
                    {/* Label & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">عنوان الحقل</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="أدخل عنوان الحقل"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">نوع الحقل</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(field.id, { type: value as FormField['type'] })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Placeholder */}
                    {!['select', 'radio', 'checkbox', 'file', 'rating'].includes(field.type) && (
                      <div>
                        <Label className="text-xs text-gray-500">نص توضيحي (اختياري)</Label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder="مثال: أدخل اسمك الكامل"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <Label className="text-xs text-gray-500">وصف الحقل (اختياري)</Label>
                      <Textarea
                        value={field.description || ''}
                        onChange={(e) => updateField(field.id, { description: e.target.value })}
                        placeholder="وصف إضافي للحقل..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>

                    {/* Options for select/radio/checkbox */}
                    {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                      <div>
                        <Label className="text-xs text-gray-500 mb-2 block">الخيارات</Label>
                        <div className="space-y-2">
                          {field.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(field.id, index, e.target.value)}
                                placeholder={`خيار ${index + 1}`}
                              />
                              {field.options && field.options.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteOption(field.id, index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(field.id)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 ml-2" />
                            إضافة خيار
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Validation for number fields */}
                    {field.type === 'number' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">الحد الأدنى</Label>
                          <Input
                            type="number"
                            value={field.validation?.min || ''}
                            onChange={(e) => updateField(field.id, {
                              validation: { ...field.validation, min: parseInt(e.target.value) }
                            })}
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">الحد الأقصى</Label>
                          <Input
                            type="number"
                            value={field.validation?.max || ''}
                            onChange={(e) => updateField(field.id, {
                              validation: { ...field.validation, max: parseInt(e.target.value) }
                            })}
                            placeholder="100"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Required Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Label className="text-sm">حقل إلزامي</Label>
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteField(field.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Add Field Button */}
      <div className="relative">
        <Button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#01645e]/90 hover:to-[#3ab666]/90"
          size="lg"
        >
          <Plus className="w-5 h-5 ml-2" />
          إضافة حقل جديد
        </Button>

        {/* Field Type Menu */}
        {showAddMenu && (
          <Card className="absolute bottom-full mb-2 w-full z-10 shadow-xl">
            <CardContent className="p-2">
              <div className="grid grid-cols-2 gap-2">
                {fieldTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant="ghost"
                    onClick={() => addField(type.value as FormField['type'])}
                    className="justify-start"
                  >
                    <type.icon className="w-4 h-4 ml-2" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

