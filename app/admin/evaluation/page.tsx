"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Star, Award, Target, BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

interface EvaluationCriteria {
  id: string
  name: string
  description: string
  weight: number
  maxScore: number
  category: string
}

const DEFAULT_CRITERIA = [
  {
    name: 'الابتكار والإبداع',
    description: 'مدى إبداع الفكرة وتميزها عن الحلول الموجودة',
    weight: 25,
    maxScore: 100,
    category: 'technical'
  },
  {
    name: 'التنفيذ التقني',
    description: 'جودة الكود والتطبيق التقني للحل',
    weight: 25,
    maxScore: 100,
    category: 'technical'
  },
  {
    name: 'تجربة المستخدم',
    description: 'سهولة الاستخدام وجودة واجهة المستخدم',
    weight: 20,
    maxScore: 100,
    category: 'design'
  },
  {
    name: 'الأثر والفائدة',
    description: 'مدى تأثير الحل على المجتمع أو السوق المستهدف',
    weight: 15,
    maxScore: 100,
    category: 'business'
  },
  {
    name: 'العرض التقديمي',
    description: 'جودة العرض ووضوح التواصل',
    weight: 15,
    maxScore: 100,
    category: 'presentation'
  }
]

export default function EvaluationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCriteria, setEditingCriteria] = useState<EvaluationCriteria | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 10,
    maxScore: 100,
    category: 'technical'
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    loadCriteria()
  }, [user])

  const loadCriteria = async () => {
    try {
      const response = await fetch('/api/admin/evaluation/criteria')
      if (response.ok) {
        const data = await response.json()
        setCriteria(data.criteria || [])
      }
    } catch (error) {
      console.error('Error loading criteria:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultCriteria = async () => {
    try {
      const response = await fetch('/api/admin/evaluation/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: DEFAULT_CRITERIA })
      })

      if (response.ok) {
        loadCriteria()
      }
    } catch (error) {
      console.error('Error initializing criteria:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCriteria 
        ? `/api/admin/evaluation/criteria/${editingCriteria.id}`
        : '/api/admin/evaluation/criteria'
      
      const method = editingCriteria ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        loadCriteria()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving criteria:', error)
    }
  }

  const deleteCriteria = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المعيار؟')) return

    try {
      const response = await fetch(`/api/admin/evaluation/criteria/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadCriteria()
      }
    } catch (error) {
      console.error('Error deleting criteria:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      weight: 10,
      maxScore: 100,
      category: 'technical'
    })
    setShowAddForm(false)
    setEditingCriteria(null)
  }

  const startEdit = (criteria: EvaluationCriteria) => {
    setFormData({
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      maxScore: criteria.maxScore,
      category: criteria.category
    })
    setEditingCriteria(criteria)
    setShowAddForm(true)
  }

  const getTotalWeight = () => {
    return criteria.reduce((total, c) => total + c.weight, 0)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Settings className="w-4 h-4" />
      case 'design': return <Star className="w-4 h-4" />
      case 'business': return <Target className="w-4 h-4" />
      case 'presentation': return <BarChart3 className="w-4 h-4" />
      default: return <Award className="w-4 h-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'technical': return 'تقني'
      case 'design': return 'تصميم'
      case 'business': return 'أعمال'
      case 'presentation': return 'عرض'
      default: return 'عام'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل معايير التقييم...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#01645e]">نظام التقييم</h1>
            <p className="text-[#8b7632] text-lg">إدارة معايير التقييم والنتائج</p>
          </div>
          <div className="flex gap-4">
            {criteria.length === 0 && (
              <Button
                onClick={initializeDefaultCriteria}
                variant="outline"
                className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white"
              >
                <Settings className="w-4 h-4 ml-2" />
                إعداد المعايير الافتراضية
              </Button>
            )}
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة معيار جديد
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        {criteria.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#01645e]/10 rounded-lg">
                    <Award className="w-6 h-6 text-[#01645e]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8b7632]">إجمالي المعايير</p>
                    <p className="text-2xl font-bold text-[#01645e]">{criteria.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#3ab666]/10 rounded-lg">
                    <Target className="w-6 h-6 text-[#3ab666]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8b7632]">إجمالي الأوزان</p>
                    <p className="text-2xl font-bold text-[#01645e]">{getTotalWeight()}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#c3e956]/10 rounded-lg">
                    <Star className="w-6 h-6 text-[#8b7632]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8b7632]">أعلى درجة</p>
                    <p className="text-2xl font-bold text-[#01645e]">{Math.max(...criteria.map(c => c.maxScore), 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#01645e]/10 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-[#01645e]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#8b7632]">متوسط الوزن</p>
                    <p className="text-2xl font-bold text-[#01645e]">
                      {criteria.length > 0 ? Math.round(getTotalWeight() / criteria.length) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-[#01645e]">
                    {editingCriteria ? 'تعديل المعيار' : 'إضافة معيار جديد'}
                  </CardTitle>
                  <CardDescription>
                    {editingCriteria ? 'تعديل معيار التقييم' : 'إضافة معيار تقييم جديد'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-[#01645e] font-semibold">اسم المعيار *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="مثال: الابتكار والإبداع"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-[#01645e] font-semibold">الوصف</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="وصف تفصيلي للمعيار..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight" className="text-[#01645e] font-semibold">الوزن (%)</Label>
                        <Input
                          id="weight"
                          type="number"
                          min="1"
                          max="100"
                          value={formData.weight}
                          onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxScore" className="text-[#01645e] font-semibold">أعلى درجة</Label>
                        <Input
                          id="maxScore"
                          type="number"
                          min="1"
                          value={formData.maxScore}
                          onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value)})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-[#01645e] font-semibold">الفئة</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">تقني</SelectItem>
                          <SelectItem value="design">تصميم</SelectItem>
                          <SelectItem value="business">أعمال</SelectItem>
                          <SelectItem value="presentation">عرض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                        {editingCriteria ? 'تحديث' : 'إضافة'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Criteria List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={showAddForm ? "lg:col-span-2" : "lg:col-span-3"}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#01645e]">معايير التقييم</CardTitle>
                <CardDescription>
                  {criteria.length > 0 
                    ? `${criteria.length} معيار - إجمالي الأوزان: ${getTotalWeight()}%`
                    : 'لا توجد معايير تقييم بعد'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {criteria.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-[#01645e] mb-2">لا توجد معايير تقييم</h3>
                    <p className="text-[#8b7632] mb-4">ابدأ بإضافة معايير التقييم لتقييم المشاريع</p>
                    <Button
                      onClick={initializeDefaultCriteria}
                      variant="outline"
                      className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white"
                    >
                      إعداد المعايير الافتراضية
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {criteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryIcon(criterion.category)}
                              <h3 className="font-semibold text-[#01645e]">{criterion.name}</h3>
                              <span className="text-xs bg-[#3ab666]/10 text-[#3ab666] px-2 py-1 rounded">
                                {getCategoryName(criterion.category)}
                              </span>
                            </div>
                            <p className="text-[#8b7632] text-sm mb-3">{criterion.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-[#01645e] font-semibold">
                                الوزن: {criterion.weight}%
                              </span>
                              <span className="text-[#01645e] font-semibold">
                                أعلى درجة: {criterion.maxScore}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(criterion)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                              onClick={() => deleteCriteria(criterion.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
