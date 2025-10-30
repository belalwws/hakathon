'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, Eye, Users, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface FormSubmission {
  id: string
  userId: string
  hackathonId: string
  status: 'pending' | 'approved' | 'rejected'
  registeredAt: string
  additionalInfo: any
  user: {
    name: string
    email: string
    phone: string
    city: string
    nationality: string
  }
}

interface Hackathon {
  id: string
  title: string
  description: string
}

export default function FormSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch hackathon details
      const hackathonRes = await fetch(`/api/supervisor/hackathons/${params.id}`, {
        credentials: 'include'
      })
      
      if (hackathonRes.ok) {
        const data = await hackathonRes.json()
        setHackathon(data.hackathon)
        setSubmissions(data.hackathon.participants || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true
    return sub.status === filter
  })

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري التحميل...</p>
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
          className="flex items-center gap-4 mb-8"
        >
          <Link href={`/supervisor/hackathons/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#01645e]">طلبات التسجيل</h1>
            <p className="text-[#8b7632] text-lg">{hackathon?.title}</p>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'إجمالي الطلبات', value: stats.total, icon: FileText, color: 'from-[#01645e] to-[#3ab666]' },
            { title: 'قيد المراجعة', value: stats.pending, icon: Calendar, color: 'from-[#8b7632] to-[#c3e956]' },
            { title: 'مقبولة', value: stats.approved, icon: CheckCircle2, color: 'from-[#3ab666] to-[#c3e956]' },
            { title: 'مرفوضة', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8b7632] mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#01645e]">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter Buttons */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                الكل ({stats.total})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                size="sm"
              >
                قيد المراجعة ({stats.pending})
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                size="sm"
              >
                مقبولة ({stats.approved})
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
                size="sm"
              >
                مرفوضة ({stats.rejected})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات التسجيل</CardTitle>
            <CardDescription>
              عرض وإدارة طلبات التسجيل للهاكاثون
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد طلبات</h3>
                <p className="text-[#8b7632]">لا توجد طلبات تطابق الفلتر المحدد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#01645e]">
                            {submission.user.name}
                          </h3>
                          <Badge className={
                            submission.status === 'approved' ? 'bg-green-500' :
                            submission.status === 'rejected' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }>
                            {submission.status === 'approved' ? 'مقبول' :
                             submission.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                          </Badge>
                        </div>
                        <div className="text-sm text-[#8b7632] space-y-1">
                          <p>📧 {submission.user.email}</p>
                          {submission.user.phone && <p>📱 {submission.user.phone}</p>}
                          {submission.user.city && <p>📍 {submission.user.city}</p>}
                          <p>📅 {new Date(submission.registeredAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/supervisor/hackathons/${params.id}?view=${submission.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 ml-2" />
                            عرض
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
