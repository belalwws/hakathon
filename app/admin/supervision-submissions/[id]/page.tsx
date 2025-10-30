"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Loader2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'

interface Submission {
  id: string
  name: string
  email: string
  phone?: string
  formData: string
  attachments?: string
  status: string
  createdAt: string
  reviewedBy?: string
  reviewNotes?: string
  rejectionReason?: string
}

export default function SupervisionSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const hackathonId = params.hackathonId as string

  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    loadSubmissions()
  }, [user, hackathonId])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchQuery, statusFilter])

  const loadSubmissions = async () => {
    try {
      const response = await fetch(`/api/supervision-forms/submit?hackathonId=${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = [...submissions]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredSubmissions(filtered)
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/supervision-forms/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewedBy: user?.id
        })
      })

      if (response.ok) {
        loadSubmissions()
        alert('تم تحديث الحالة بنجاح')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('حدث خطأ في تحديث الحالة')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 ml-1" /> قيد المراجعة</Badge>
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 ml-1" /> مقبول</Badge>
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 ml-1" /> مرفوض</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const exportToCSV = () => {
    const headers = ['الاسم', 'البريد الإلكتروني', 'رقم الهاتف', 'الحالة', 'تاريخ الإرسال']
    const rows = filteredSubmissions.map(s => [
      s.name,
      s.email,
      s.phone || '-',
      s.status,
      new Date(s.createdAt).toLocaleDateString('ar-SA')
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `supervision-submissions-${hackathonId}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-[#01645e]" />
          <p className="text-[#01645e] font-semibold">جاري تحميل الطلبات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/forms')}
                className="text-[#01645e]"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                رجوع
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-[#01645e]">
                  طلبات الإشراف
                </h1>
                <p className="text-[#8b7632] text-lg mt-1">
                  {filteredSubmissions.length} طلب
                </p>
              </div>
            </div>

            <Button
              onClick={exportToCSV}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير CSV
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="بحث بالاسم أو البريد الإلكتروني..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="approved">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">
              الكل ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              قيد المراجعة ({submissions.filter(s => s.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              مقبول ({submissions.filter(s => s.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              مرفوض ({submissions.filter(s => s.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredSubmissions.map((submission, index) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                index={index}
                onStatusChange={updateStatus}
                onView={setSelectedSubmission}
              />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredSubmissions.filter(s => s.status === 'pending').map((submission, index) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                index={index}
                onStatusChange={updateStatus}
                onView={setSelectedSubmission}
              />
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {filteredSubmissions.filter(s => s.status === 'approved').map((submission, index) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                index={index}
                onStatusChange={updateStatus}
                onView={setSelectedSubmission}
              />
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filteredSubmissions.filter(s => s.status === 'rejected').map((submission, index) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                index={index}
                onStatusChange={updateStatus}
                onView={setSelectedSubmission}
              />
            ))}
          </TabsContent>
        </Tabs>

        {filteredSubmissions.length === 0 && (
          <Card className="text-center p-12">
            <p className="text-gray-500 text-lg">لا توجد طلبات</p>
          </Card>
        )}
      </div>
    </div>
  )
}

function SubmissionCard({ 
  submission, 
  index, 
  onStatusChange, 
  onView 
}: { 
  submission: Submission
  index: number
  onStatusChange: (id: string, status: string) => void
  onView: (submission: Submission) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const formData = JSON.parse(submission.formData || '{}')
  const attachments = submission.attachments ? JSON.parse(submission.attachments) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl text-[#01645e]">{submission.name}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span>{submission.email}</span>
                {submission.phone && <span>• {submission.phone}</span>}
                <span>• {new Date(submission.createdAt).toLocaleDateString('ar-SA')}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(submission.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              <Eye className="w-4 h-4 ml-1" />
              {expanded ? 'إخفاء' : 'عرض'} التفاصيل
            </Button>

            {submission.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => onStatusChange(submission.id, 'approved')}
                >
                  <CheckCircle className="w-4 h-4 ml-1" />
                  قبول
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => onStatusChange(submission.id, 'rejected')}
                >
                  <XCircle className="w-4 h-4 ml-1" />
                  رفض
                </Button>
              </>
            )}
          </div>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2"
            >
              <h4 className="font-semibold text-[#01645e] mb-2">البيانات المرسلة:</h4>
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600">{String(value)}</span>
                </div>
              ))}

              {attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-[#01645e] mb-2">المرفقات:</h4>
                  {attachments.map((att: any, i: number) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline"
                    >
                      📎 {att.name}
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 ml-1" /> قيد المراجعة</Badge>
    case 'approved':
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 ml-1" /> مقبول</Badge>
    case 'rejected':
      return <Badge className="bg-red-500"><XCircle className="w-3 h-3 ml-1" /> مرفوض</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}
