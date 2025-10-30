'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Check, 
  X, 
  Clock,
  Mail,
  Phone,
  Calendar,
  User,
  FileText,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Submission {
  id: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  userData: {
    name: string
    email: string
    phone?: string
    university?: string
    major?: string
    [key: string]: any
  }
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

interface Hackathon {
  id: string
  title: string
}

export default function SubmissionsManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string
  
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    if (hackathonId) {
      loadHackathon()
      loadSubmissions()
    }
  }, [user, router, hackathonId])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchTerm, statusFilter])

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

  const loadSubmissions = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = submissions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(submission => 
        submission.userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.userData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.userData.university?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }

  const updateSubmissionStatus = async (submissionId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes,
          reviewedBy: user?.name || 'admin'
        })
      })

      if (response.ok) {
        loadSubmissions() // Reload submissions
        setShowDetails(false)
        alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح`)
      } else {
        alert('حدث خطأ في تحديث حالة الطلب')
      }
    } catch (error) {
      console.error('Error updating submission status:', error)
      alert('حدث خطأ في تحديث حالة الطلب')
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">مقبول</Badge>
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>
      default:
        return <Badge variant="secondary">في انتظار المراجعة</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-orange-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8b7632] text-lg">جاري تحميل الطلبات...</p>
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
            
            <Button onClick={exportSubmissions} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              تصدير Excel
            </Button>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-2">
            📋 إدارة الطلبات المرسلة
          </h1>
          {hackathon && (
            <h2 className="text-2xl font-bold text-[#01645e] mb-4">{hackathon.title}</h2>
          )}
        </motion.div>

        {/* Filters */}
        <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث بالاسم أو البريد الإلكتروني أو الجامعة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في انتظار المراجعة</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <Card className="bg-white/90 backdrop-blur-lg border border-[#01645e]/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#01645e] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              الطلبات المرسلة ({filteredSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-[#01645e] mb-2">لا توجد طلبات</h3>
                <p className="text-[#8b7632]">لم يتم العثور على طلبات تطابق معايير البحث</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <Card key={submission.id} className="border border-gray-200 hover:border-[#01645e]/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-[#01645e]/10 rounded-full">
                            {getStatusIcon(submission.status)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#01645e] flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {submission.userData.name || 'غير محدد'}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {submission.userData.email}
                              </span>
                              {submission.userData.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {submission.userData.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(submission.submittedAt).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            {submission.userData.university && (
                              <p className="text-sm text-gray-500 mt-1">
                                {submission.userData.university} - {submission.userData.major}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(submission.status)}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubmission(submission)
                                setShowDetails(true)
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              {submission.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => updateSubmissionStatus(submission.id, 'approved')}>
                                    <Check className="w-4 h-4 mr-2 text-green-600" />
                                    قبول
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateSubmissionStatus(submission.id, 'rejected')}>
                                    <X className="w-4 h-4 mr-2 text-red-600" />
                                    رفض
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#01645e]">تفاصيل الطلب</DialogTitle>
              <DialogDescription>
                مراجعة تفاصيل طلب التسجيل
              </DialogDescription>
            </DialogHeader>
            
            {selectedSubmission && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">الاسم</Label>
                    <p className="text-[#01645e] font-medium">{selectedSubmission.userData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">البريد الإلكتروني</Label>
                    <p className="text-[#01645e]">{selectedSubmission.userData.email}</p>
                  </div>
                  {selectedSubmission.userData.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">رقم الهاتف</Label>
                      <p className="text-[#01645e]">{selectedSubmission.userData.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">تاريخ التقديم</Label>
                    <p className="text-[#01645e]">{new Date(selectedSubmission.submittedAt).toLocaleString('ar-SA')}</p>
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[#01645e]">معلومات إضافية</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(selectedSubmission.userData).map(([key, value]) => {
                      if (['name', 'email', 'phone'].includes(key) || !value) return null
                      return (
                        <div key={key}>
                          <Label className="text-sm font-medium text-gray-700 capitalize">{key}</Label>
                          <p className="text-[#01645e]">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Status and Review */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">الحالة الحالية</Label>
                      <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                    </div>
                    {selectedSubmission.reviewedBy && (
                      <div className="text-right">
                        <Label className="text-sm font-medium text-gray-700">تمت المراجعة بواسطة</Label>
                        <p className="text-[#01645e]">{selectedSubmission.reviewedBy}</p>
                        {selectedSubmission.reviewedAt && (
                          <p className="text-sm text-gray-500">
                            {new Date(selectedSubmission.reviewedAt).toLocaleString('ar-SA')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {selectedSubmission.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">ملاحظات المراجعة</Label>
                      <p className="text-[#01645e] bg-gray-50 p-3 rounded-lg mt-1">{selectedSubmission.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              {selectedSubmission?.status === 'pending' && (
                <>
                  <Button
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    قبول الطلب
                  </Button>
                  <Button
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    رفض الطلب
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
