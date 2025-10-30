'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { FileText, Users, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

interface FormOverview {
  hackathonId: string
  hackathonTitle: string
  totalSubmissions: number
  pendingReview: number
  approved: number
  rejected: number
  hasCustomForm: boolean
}

export default function FormsOverviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formsData, setFormsData] = useState<FormOverview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    loadFormsOverview()
  }, [user, router])

  const loadFormsOverview = async () => {
    try {
      const response = await fetch('/api/admin/forms-overview')
      if (response.ok) {
        const data = await response.json()
        setFormsData(data)
      }
    } catch (error) {
      console.error('Error loading forms overview:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01645e]"></div>
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#01645e]">نظرة عامة على النماذج</h1>
              <p className="text-[#8b7632] text-lg mt-2">إحصائيات شاملة لجميع نماذج الهاكاثونات</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">
                العودة إلى لوحة التحكم
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formsData.map((form, index) => (
            <motion.div
              key={form.hackathonId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#01645e] text-lg">
                      {form.hackathonTitle}
                    </CardTitle>
                    {form.hasCustomForm && (
                      <Badge variant="secondary" className="bg-[#3ab666]/10 text-[#3ab666]">
                        نموذج مخصص
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    إحصائيات النماذج والتسجيلات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-blue-600">{form.totalSubmissions}</div>
                      <div className="text-sm text-blue-700">إجمالي التسجيلات</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-yellow-600">{form.pendingReview}</div>
                      <div className="text-sm text-yellow-700">في الانتظار</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-green-600">{form.approved}</div>
                      <div className="text-sm text-green-700">مقبول</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-red-600">{form.rejected}</div>
                      <div className="text-sm text-red-700">مرفوض</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/admin/hackathons/${form.hackathonId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        عرض التفاصيل
                      </Button>
                    </Link>
                    <Link href={`/admin/hackathons/${form.hackathonId}/forms`} className="flex-1">
                      <Button size="sm" className="w-full bg-[#01645e] hover:bg-[#014a46]">
                        <FileText className="w-4 h-4 mr-2" />
                        إدارة النماذج
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {formsData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد نماذج</h3>
            <p className="text-[#8b7632] mb-6">لم يتم إنشاء أي نماذج بعد</p>
            <Link href="/admin/hackathons">
              <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                إدارة الهاكاثونات
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
