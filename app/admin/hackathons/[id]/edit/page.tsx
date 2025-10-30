'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Calendar, FileText, Users, Trophy, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  status: 'draft' | 'open' | 'closed' | 'completed'
  prizes?: {
    first?: string
    second?: string
    third?: string
  }
  requirements?: string[]
  categories?: string[]
}

export default function EditHackathonPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    status: 'draft' as const,
    prizes: {
      first: '',
      second: '',
      third: ''
    },
    requirements: [''],
    categories: ['']
  })

  useEffect(() => {
    fetchHackathon()
  }, [params.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const h = data.hackathon
        setHackathon(h)
        
        // Format dates for input fields
        const formatDate = (dateString: string) => {
          const date = new Date(dateString)
          return date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM format
        }

        setFormData({
          title: h.title || '',
          description: h.description || '',
          startDate: formatDate(h.startDate),
          endDate: formatDate(h.endDate),
          registrationDeadline: formatDate(h.registrationDeadline),
          maxParticipants: h.maxParticipants?.toString() || '',
          status: h.status || 'draft',
          prizes: {
            first: h.prizes?.first || '',
            second: h.prizes?.second || '',
            third: h.prizes?.third || ''
          },
          requirements: Array.isArray(h.requirements) && h.requirements.length > 0 ? h.requirements : [''],
          categories: Array.isArray(h.categories) && h.categories.length > 0 ? h.categories : ['']
        })
      } else {
        alert('فشل في جلب بيانات الهاكاثون')
        router.push('/admin/hackathons')
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
      alert('حدث خطأ في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Clean up empty requirements and categories
      const currentRequirements = Array.isArray(formData.requirements) ? formData.requirements : []
      const currentCategories = Array.isArray(formData.categories) ? formData.categories : []

      const cleanedData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        requirements: currentRequirements.filter(req => req.trim() !== ''),
        categories: currentCategories.filter(cat => cat.trim() !== '')
      }

      const response = await fetch(`/api/admin/hackathons/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })

      if (response.ok) {
        alert('تم تحديث الهاكاثون بنجاح')
        router.push(`/admin/hackathons/${params.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في تحديث الهاكاثون')
      }
    } catch (error) {
      console.error('Error updating hackathon:', error)
      alert('حدث خطأ في تحديث الهاكاثون')
    } finally {
      setSaving(false)
    }
  }

  const addRequirement = () => {
    const currentRequirements = Array.isArray(formData.requirements) ? formData.requirements : ['']
    setFormData({
      ...formData,
      requirements: [...currentRequirements, '']
    })
  }

  const removeRequirement = (index: number) => {
    const currentRequirements = Array.isArray(formData.requirements) ? formData.requirements : ['']
    setFormData({
      ...formData,
      requirements: currentRequirements.filter((_, i) => i !== index)
    })
  }

  const updateRequirement = (index: number, value: string) => {
    const currentRequirements = Array.isArray(formData.requirements) ? formData.requirements : ['']
    const newRequirements = [...currentRequirements]
    newRequirements[index] = value
    setFormData({
      ...formData,
      requirements: newRequirements
    })
  }

  const addCategory = () => {
    const currentCategories = Array.isArray(formData.categories) ? formData.categories : ['']
    setFormData({
      ...formData,
      categories: [...currentCategories, '']
    })
  }

  const removeCategory = (index: number) => {
    const currentCategories = Array.isArray(formData.categories) ? formData.categories : ['']
    setFormData({
      ...formData,
      categories: currentCategories.filter((_, i) => i !== index)
    })
  }

  const updateCategory = (index: number, value: string) => {
    const currentCategories = Array.isArray(formData.categories) ? formData.categories : ['']
    const newCategories = [...currentCategories]
    newCategories[index] = value
    setFormData({
      ...formData,
      categories: newCategories
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] text-lg font-medium">جاري تحميل بيانات الهاكاثون...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/admin/hackathons/${params.id}`}>
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    العودة
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-[#01645e]" />
                    تعديل الهاكاثون
                  </h1>
                  <p className="text-gray-600 mt-2">{hackathon?.title || 'تعديل معلومات الهاكاثون والمواعيد'}</p>
                </div>
              </div>
              {hackathon && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">الحالة الحالية</p>
                  <div className="mt-1">
                    {formData.status === 'draft' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                        مسودة
                      </span>
                    )}
                    {formData.status === 'open' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        مفتوح للتسجيل
                      </span>
                    )}
                    {formData.status === 'closed' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                        مغلق
                      </span>
                    )}
                    {formData.status === 'completed' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        مكتمل
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-[#01645e] text-xl">
                      <div className="p-2 bg-[#01645e]/10 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      المعلومات الأساسية
                    </CardTitle>
                    <CardDescription className="text-gray-600">معلومات عامة عن الهاكاثون</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    <div>
                      <Label htmlFor="title">عنوان الهاكاثون *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="مثال: هاكاثون الذكاء الاصطناعي"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">وصف الهاكاثون *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="وصف مفصل عن الهاكاثون وأهدافه..."
                        rows={4}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">حالة الهاكاثون</Label>
                        <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">مسودة</SelectItem>
                            <SelectItem value="open">مفتوح للتسجيل</SelectItem>
                            <SelectItem value="closed">مغلق</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="maxParticipants">الحد الأقصى للمشاركين</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          value={formData.maxParticipants}
                          onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                          placeholder="مثال: 100"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Dates and Timing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-[#01645e] text-xl">
                      <div className="p-2 bg-[#01645e]/10 rounded-lg">
                        <Calendar className="w-5 h-5" />
                      </div>
                      المواعيد والتوقيت
                    </CardTitle>
                    <CardDescription className="text-gray-600">تحديد مواعيد الهاكاثون والتسجيل</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="startDate">تاريخ البداية *</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">تاريخ النهاية *</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="registrationDeadline">آخر موعد للتسجيل *</Label>
                      <Input
                        id="registrationDeadline"
                        type="datetime-local"
                        value={formData.registrationDeadline}
                        onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prizes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <Trophy className="w-5 h-5" />
                  الجوائز
                </CardTitle>
                <CardDescription>تحديد جوائز المراكز الأولى</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="firstPrize">جائزة المركز الأول</Label>
                    <Input
                      id="firstPrize"
                      value={formData.prizes.first}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: { ...formData.prizes, first: e.target.value }
                      })}
                      placeholder="مثال: 10,000 ريال"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondPrize">جائزة المركز الثاني</Label>
                    <Input
                      id="secondPrize"
                      value={formData.prizes.second}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: { ...formData.prizes, second: e.target.value }
                      })}
                      placeholder="مثال: 5,000 ريال"
                    />
                  </div>

                  <div>
                    <Label htmlFor="thirdPrize">جائزة المركز الثالث</Label>
                    <Input
                      id="thirdPrize"
                      value={formData.prizes.third}
                      onChange={(e) => setFormData({
                        ...formData,
                        prizes: { ...formData.prizes, third: e.target.value }
                      })}
                      placeholder="مثال: 2,500 ريال"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <Users className="w-5 h-5" />
                  متطلبات المشاركة
                </CardTitle>
                <CardDescription>شروط ومتطلبات المشاركة في الهاكاثون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(formData.requirements) && formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`متطلب ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRequirement}
                  className="w-full"
                >
                  إضافة متطلب جديد
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#01645e]">
                  <Settings className="w-5 h-5" />
                  فئات المشاريع
                </CardTitle>
                <CardDescription>تصنيفات المشاريع المقبولة في الهاكاثون</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(formData.categories) && formData.categories.map((category, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={category}
                      onChange={(e) => updateCategory(index, e.target.value)}
                      placeholder={`فئة ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.categories.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategory(index)}
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCategory}
                  className="w-full"
                >
                  إضافة فئة جديدة
                </Button>
              </CardContent>
            </Card>
          </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Save Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#01645e]">الإجراءات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#01645e] hover:bg-[#01645e]/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>

                  <Link href={`/admin/hackathons/${params.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      إلغاء
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Status Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#01645e]">معلومات الحالة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">الحالة الحالية:</span>
                    <div className="mt-1">
                      {formData.status === 'draft' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          مسودة
                        </span>
                      )}
                      {formData.status === 'open' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          مفتوح للتسجيل
                        </span>
                      )}
                      {formData.status === 'closed' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          مغلق
                        </span>
                      )}
                      {formData.status === 'completed' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          مكتمل
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">آخر تحديث:</span>
                    <p className="text-gray-600 mt-1">
                      {hackathon ? new Date(hackathon.startDate).toLocaleDateString('ar-SA') : '-'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#01645e]">نصائح</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p>• تأكد من صحة التواريخ قبل الحفظ</p>
                  <p>• يمكن تعديل المعلومات في أي وقت</p>
                  <p>• تغيير الحالة إلى "مفتوح" يجعل الهاكاثون متاحاً للتسجيل</p>
                  <p>• الجوائز اختيارية ويمكن إضافتها لاحقاً</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
