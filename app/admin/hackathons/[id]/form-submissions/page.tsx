"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  FileText,
  Mail,
  Phone,
  Calendar,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface FormSubmission {
  id: string
  participantId: string
  participant: {
    user: {
      name: string
      email: string
      phone?: string
    }
    status: 'pending' | 'approved' | 'rejected'
    additionalInfo?: any
  }
  submittedAt: string
  formData: Record<string, any>
}

export default function FormSubmissionsPage() {
  const params = useParams()
  const hackathonId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [hackathon, setHackathon] = useState<any>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchHackathon()
    fetchSubmissions()
  }, [hackathonId])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchTerm, statusFilter])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data)
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/form-submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = submissions

    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.participant.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.participant.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.participant.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }

  const updateParticipantStatus = async (participantId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setUpdating(participantId)
    try {
      const response = await fetch(`/api/admin/participants/${participantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setSubmissions(prev => prev.map(submission =>
          submission.participantId === participantId
            ? { ...submission, participant: { ...submission.participant, status: newStatus } }
            : submission
        ))

        // Show success message
        console.log(`تم تحديث حالة المشارك إلى: ${newStatus}`)
      } else {
        console.error('Failed to update participant status')
      }
    } catch (error) {
      console.error('Error updating participant status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const updateSubmissionStatus = async (participantId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/participants/${participantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Update local state
        setSubmissions(prev => prev.map(sub => 
          sub.participantId === participantId 
            ? { ...sub, participant: { ...sub.participant, status } }
            : sub
        ))
        alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} المشارك بنجاح`)
      } else {
        alert('حدث خطأ في تحديث الحالة')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('حدث خطأ في تحديث الحالة')
    }
  }

  const exportSubmissions = () => {
    const csvContent = [
      ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الحالة', 'تاريخ التسجيل', 'البيانات الإضافية'],
      ...filteredSubmissions.map(sub => [
        sub.participant.user.name,
        sub.participant.user.email,
        sub.participant.user.phone || '',
        sub.participant.status === 'approved' ? 'مقبول' : sub.participant.status === 'rejected' ? 'مرفوض' : 'في الانتظار',
        new Date(sub.submittedAt).toLocaleDateString('ar-SA'),
        JSON.stringify(sub.formData)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `form-submissions-${hackathonId}.csv`
    link.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">مقبول</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>
    }
  }

  const renderFormData = (data: Record<string, any>) => {
    return Object.entries(data).map(([key, value]) => {
      if (key === 'name' || key === 'email' || key === 'phone') return null
      
      return (
        <div key={key} className="text-sm">
          <span className="font-medium">{key}:</span> {
            Array.isArray(value) ? value.join(', ') : String(value)
          }
        </div>
      )
    }).filter(Boolean)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
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
                <Link href={`/admin/hackathons/${hackathonId}`}>
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    العودة
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-[#01645e]/10 rounded-lg">
                      <FileText className="w-8 h-8 text-[#01645e]" />
                    </div>
                    النماذج المرسلة
                  </h1>
                  {hackathon && (
                    <p className="text-gray-600 mt-2">
                      إدارة النماذج المرسلة لـ {hackathon.title}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={exportSubmissions}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  تصدير CSV
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                  <p className="text-sm text-gray-600">إجمالي النماذج</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {submissions.filter(s => s.participant.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">في الانتظار</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.participant.status === 'approved').length}
                  </p>
                  <p className="text-sm text-gray-600">مقبول</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.participant.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-gray-600">مرفوض</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="فلترة بالحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportSubmissions} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                تصدير CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نماذج</h3>
                <p className="text-gray-600">لم يتم العثور على نماذج مرسلة</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          {submission.participant.user.name}
                        </h3>
                        {getStatusBadge(submission.participant.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {submission.participant.user.email}
                        </div>
                        
                        {submission.participant.user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {submission.participant.user.phone}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(submission.submittedAt).toLocaleDateString('ar-SA')}
                        </div>
                      </div>

                      {/* Form Data */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">البيانات المرسلة:</h4>
                        <div className="space-y-1">
                          {renderFormData(submission.formData)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {submission.participant.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateParticipantStatus(submission.participantId, 'approved')}
                            disabled={updating === submission.participantId}
                          >
                            {updating === submission.participantId ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            قبول
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateParticipantStatus(submission.participantId, 'rejected')}
                            disabled={updating === submission.participantId}
                          >
                            {updating === submission.participantId ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            رفض
                          </Button>
                        </div>
                      )}

                      {submission.participant.status !== 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateParticipantStatus(submission.participantId, 'pending')}
                            disabled={updating === submission.participantId}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            إعادة للانتظار
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
