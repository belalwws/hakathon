'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Users, 
  Settings, 
  ArrowLeft, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Send,
  Download,
  BarChart3,
  FormInput
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
}

interface FormSubmission {
  id: string
  submittedAt: string
  userData: any
  status: string
}

interface FormStats {
  totalSubmissions: number
  pendingReview: number
  approved: number
  rejected: number
}

export default function HackathonFormsManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string
  
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [formExists, setFormExists] = useState(false)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [stats, setStats] = useState<FormStats>({
    totalSubmissions: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    if (hackathonId) {
      loadHackathon()
      loadFormData()
      loadSubmissions()
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

  const loadFormData = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/form`)
      if (response.ok) {
        const data = await response.json()
        setFormExists(!!data.form)
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      setFormExists(false)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
        
        // Calculate stats
        const total = data.submissions?.length || 0
        const pending = data.submissions?.filter((s: any) => s.status === 'pending').length || 0
        const approved = data.submissions?.filter((s: any) => s.status === 'approved').length || 0
        const rejected = data.submissions?.filter((s: any) => s.status === 'rejected').length || 0
        
        setStats({
          totalSubmissions: total,
          pendingReview: pending,
          approved: approved,
          rejected: rejected
        })
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
  }

  const createNewForm = () => {
    router.push(`/admin/hackathons/${hackathonId}/forms/builder`)
  }

  const editForm = () => {
    router.push(`/admin/hackathons/${hackathonId}/forms/builder`)
  }

  const previewForm = () => {
    window.open(`/hackathons/${hackathonId}/register`, '_blank')
  }

  const viewSubmissions = () => {
    router.push(`/admin/hackathons/${hackathonId}/forms/submissions`)
  }

  const exportSubmissions = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/submissions/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${hackathon?.title || 'hackathon'}-submissions.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting submissions:', error)
      alert('حدث خطأ في تصدير البيانات')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8b7632] text-lg">جاري تحميل بيانات النماذج...</p>
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
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl w-24 h-24 flex items-center justify-center">
                <FileText className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-2">
            📝 إدارة النماذج والتسجيل
          </h1>
          {hackathon && (
            <h2 className="text-2xl font-bold text-[#01645e] mb-4">{hackathon.title}</h2>
          )}
          <p className="text-[#8b7632] text-lg">إدارة شاملة لنماذج التسجيل والطلبات المرسلة</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8b7632] mb-1">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats.totalSubmissions}</p>
                </div>
                <Users className="w-8 h-8 text-[#3ab666]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8b7632] mb-1">في انتظار المراجعة</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingReview}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8b7632] mb-1">مقبولة</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8b7632] mb-1">مرفوضة</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="form-builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-lg">
            <TabsTrigger value="form-builder" className="flex items-center gap-2">
              <FormInput className="w-4 h-4" />
              تصميم النموذج
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              الطلبات المرسلة
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Form Builder Tab */}
          <TabsContent value="form-builder">
            <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#01645e] flex items-center gap-2">
                  <FormInput className="w-5 h-5" />
                  نموذج التسجيل الديناميكي
                </CardTitle>
                <CardDescription>
                  قم بتصميم وتخصيص نموذج التسجيل الخاص بهذا الهاكاثون
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {formExists ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-800">✅ نموذج التسجيل جاهز</h4>
                          <p className="text-sm text-green-600">تم إنشاء نموذج تسجيل مخصص لهذا الهاكاثون</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          نشط
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={editForm} className="bg-[#01645e] hover:bg-[#01645e]/90">
                        <Edit className="w-4 h-4 mr-2" />
                        تعديل النموذج
                      </Button>
                      <Button onClick={previewForm} variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        معاينة النموذج
                      </Button>
                      <Button 
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/hackathons/${hackathonId}/register`)}
                        variant="outline"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        نسخ رابط التسجيل
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FormInput className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-[#01645e] mb-2">لم يتم إنشاء نموذج بعد</h3>
                    <p className="text-[#8b7632] mb-6">قم بإنشاء نموذج تسجيل مخصص لهذا الهاكاثون</p>
                    <Button onClick={createNewForm} className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                      <Plus className="w-4 h-4 mr-2" />
                      إنشاء نموذج جديد
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#01645e] flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      الطلبات المرسلة
                    </CardTitle>
                    <CardDescription>
                      مراجعة وإدارة طلبات التسجيل المرسلة
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportSubmissions} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      تصدير Excel
                    </Button>
                    <Button onClick={viewSubmissions} className="bg-[#01645e] hover:bg-[#01645e]/90">
                      <Eye className="w-4 h-4 mr-2" />
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {submissions.slice(0, 6).map((submission) => (
                        <Card key={submission.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge 
                                variant={submission.status === 'approved' ? 'default' : 
                                        submission.status === 'rejected' ? 'destructive' : 'secondary'}
                              >
                                {submission.status === 'approved' ? 'مقبول' : 
                                 submission.status === 'rejected' ? 'مرفوض' : 'في انتظار المراجعة'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(submission.submittedAt).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            <p className="font-medium text-[#01645e]">
                              {submission.userData?.name || 'غير محدد'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {submission.userData?.email || 'غير محدد'}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {submissions.length > 6 && (
                      <div className="text-center">
                        <Button onClick={viewSubmissions} variant="outline">
                          عرض جميع الطلبات ({submissions.length})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-[#01645e] mb-2">لا توجد طلبات بعد</h3>
                    <p className="text-[#8b7632]">لم يتم استلام أي طلبات تسجيل حتى الآن</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#01645e] flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات النماذج
                </CardTitle>
                <CardDescription>
                  إعدادات عامة لنماذج التسجيل والطلبات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-[#01645e] mb-2">إعدادات التسجيل</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• تفعيل/إيقاف التسجيل</li>
                        <li>• تحديد الحد الأقصى للمشاركين</li>
                        <li>• إعدادات الموافقة التلقائية</li>
                      </ul>
                      <Button className="mt-3 w-full" variant="outline">
                        تعديل الإعدادات
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-[#01645e] mb-2">إشعارات البريد الإلكتروني</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• إشعار استلام الطلب</li>
                        <li>• إشعار الموافقة/الرفض</li>
                        <li>• تذكير قبل بداية الهاكاثون</li>
                      </ul>
                      <Button className="mt-3 w-full" variant="outline">
                        إدارة الإشعارات
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
