"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, Users, Trophy, Settings, Eye, Edit, Trash2, Pin, PinOff, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ExcelExporter } from '@/lib/excel-export'

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  status: 'draft' | 'open' | 'closed' | 'completed'
  isPinned?: boolean
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  createdAt: string
}

export default function AdminHackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    startDate: '',
    endDate: '',
    isActive: true,
    settings: {
      maxTeamSize: 5,
      allowIndividualParticipation: true,
      autoTeaming: false,
      evaluationCriteria: [
        { name: "الجدوى", weight: 0.2 },
        { name: "ابتكارية الفكرة", weight: 0.25 },
        { name: "قابلية التطبيق", weight: 0.25 },
        { name: "التأثير على المؤسسة", weight: 0.2 },
        { name: "مهارات العرض", weight: 0.1 }
      ]
    }
  })

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteHackathon = async (hackathonId: string, hackathonTitle: string) => {
    const confirmMessage = `هل أنت متأكد من حذف الهاكاثون "${hackathonTitle}"؟\n\nسيتم حذف جميع البيانات المرتبطة به (المشاركين، الفرق، التقييمات، إلخ).\n\nهذا الإجراء لا يمكن التراجع عنه!`

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`تم حذف الهاكاثون بنجاح!\n\nتم حذف:\n- ${result.deletedData.participants} مشارك\n- ${result.deletedData.teams} فريق\n- ${result.deletedData.judges} محكم\n- ${result.deletedData.scores} تقييم`)
        fetchHackathons() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف الهاكاثون')
      }
    } catch (error) {
      console.error('Error deleting hackathon:', error)
      alert('حدث خطأ في حذف الهاكاثون')
    }
  }

  const togglePinQuick = async (hackathonId: string, newPinStatus: boolean) => {
    const confirmMessage = newPinStatus
      ? 'هل تريد تثبيت هذا الهاكاثون في الصفحة الرئيسية؟ (سيتم إلغاء تثبيت أي هاكاثون آخر)'
      : 'هل تريد إلغاء تثبيت هذا الهاكاثون من الصفحة الرئيسية؟'

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinStatus })
      })

      if (response.ok) {
        fetchHackathons() // Refresh the list
        alert(newPinStatus ? 'تم تثبيت الهاكاثون في الصفحة الرئيسية' : 'تم إلغاء تثبيت الهاكاثون')
      } else {
        alert('فشل في تحديث حالة التثبيت')
      }
    } catch (error) {
      console.error('Error updating pin status:', error)
      alert('حدث خطأ في تحديث حالة التثبيت')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'مسودة', color: 'bg-gray-500' },
      open: { label: 'مفتوح', color: 'bg-green-500' },
      closed: { label: 'مغلق', color: 'bg-red-500' },
      completed: { label: 'مكتمل', color: 'bg-blue-500' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const exportToExcel = async () => {
    try {
      await ExcelExporter.exportToExcel({
        filename: 'الهاكاثونات.xlsx',
        sheetName: 'الهاكاثونات',
        columns: [
          { key: 'title', header: 'عنوان الهاكاثون', width: 25 },
          { key: 'description', header: 'الوصف', width: 35 },
          { key: 'status', header: 'الحالة', width: 12 },
          { key: 'startDate', header: 'تاريخ البداية', width: 15, format: 'date' },
          { key: 'endDate', header: 'تاريخ النهاية', width: 15, format: 'date' },
          { key: 'totalParticipants', header: 'إجمالي المشاركين', width: 15, format: 'number' },
          { key: 'approvedParticipants', header: 'المشاركين المقبولين', width: 18, format: 'number' },
          { key: 'pendingParticipants', header: 'في الانتظار', width: 15, format: 'number' },
          { key: 'createdAt', header: 'تاريخ الإنشاء', width: 18, format: 'date' }
        ],
        data: hackathons.map(hackathon => ({
          ...hackathon,
          status: hackathon.status === 'open' ? 'مفتوح' :
                  hackathon.status === 'closed' ? 'مغلق' :
                  hackathon.status === 'completed' ? 'مكتمل' : hackathon.status,
          totalParticipants: hackathon.stats.total,
          approvedParticipants: hackathon.stats.approved,
          pendingParticipants: hackathon.stats.pending
        }))
      })
    } catch (error) {
      console.error('Error exporting hackathons:', error)
      alert('حدث خطأ في تصدير البيانات')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل الهاكاثونات...</p>
            </div>
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
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">إدارة الهاكاثونات</h1>
            <p className="text-[#8b7632] text-lg">إنشاء وإدارة الهاكاثونات والمسابقات</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={exportToExcel}
              disabled={hackathons.length === 0}
              variant="outline"
              className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير Excel ({hackathons.length})
            </Button>
            <Link href="/admin/hackathons/create">
              <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white">
                <Plus className="w-5 h-5 ml-2" />
                إنشاء هاكاثون جديد
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'إجمالي الهاكاثونات',
              value: hackathons.length,
              icon: Trophy,
              color: 'from-[#01645e] to-[#3ab666]'
            },
            {
              title: 'الهاكاثونات المفتوحة',
              value: hackathons.filter(h => h.status === 'open').length,
              icon: Calendar,
              color: 'from-[#3ab666] to-[#c3e956]'
            },
            {
              title: 'إجمالي المشاركين',
              value: hackathons.reduce((sum, h) => sum + h.stats.total, 0),
              icon: Users,
              color: 'from-[#c3e956] to-[#8b7632]'
            },
            {
              title: 'في انتظار المراجعة',
              value: hackathons.reduce((sum, h) => sum + h.stats.pending, 0),
              icon: Settings,
              color: 'from-[#8b7632] to-[#01645e]'
            }
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
                      <p className="text-sm font-medium text-[#8b7632] mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-[#01645e]">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Hackathons List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e]">قائمة الهاكاثونات</CardTitle>
              <CardDescription>جميع الهاكاثونات المنشأة في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              {hackathons.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-[#01645e] mb-2">لا توجد هاكاثونات</h3>
                  <p className="text-[#8b7632] mb-6">ابدأ بإنشاء أول هاكاثون</p>
                  <Link href="/admin/hackathons/create">
                    <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                      <Plus className="w-5 h-5 ml-2" />
                      إنشاء هاكاثون جديد
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {hackathons.map((hackathon) => (
                    <motion.div
                      key={hackathon.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-[#01645e]">{hackathon.title}</h3>
                            {getStatusBadge(hackathon.status)}
                            {hackathon.isPinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                <Pin className="w-3 h-3" />
                                مثبت في الرئيسية
                              </span>
                            )}
                          </div>
                          <p className="text-[#8b7632] mb-3">{hackathon.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-[#01645e]">تاريخ البداية:</span>
                              <br />
                              {formatDate(hackathon.startDate)}
                            </div>
                            <div>
                              <span className="font-semibold text-[#01645e]">تاريخ النهاية:</span>
                              <br />
                              {formatDate(hackathon.endDate)}
                            </div>
                            <div>
                              <span className="font-semibold text-[#01645e]">انتهاء التسجيل:</span>
                              <br />
                              {formatDate(hackathon.registrationDeadline)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mr-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${hackathon.isPinned
                              ? 'text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-yellow-600 hover:text-yellow-700 border-yellow-600 hover:border-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                            }`}
                            onClick={() => togglePinQuick(hackathon.id, !hackathon.isPinned)}
                            title={hackathon.isPinned ? 'إلغاء التثبيت من الصفحة الرئيسية' : 'تثبيت في الصفحة الرئيسية'}
                          >
                            {hackathon.isPinned ? (
                              <>
                                <PinOff className="w-4 h-4 ml-1" />
                                إلغاء
                              </>
                            ) : (
                              <>
                                <Pin className="w-4 h-4 ml-1" />
                                تثبيت
                              </>
                            )}
                          </Button>
                          <Link href={`/admin/hackathons/${hackathon.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/hackathons/${hackathon.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                            onClick={() => deleteHackathon(hackathon.id, hackathon.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="flex gap-6 text-sm bg-gray-50 p-3 rounded-lg">
                        <div className="text-center">
                          <div className="font-bold text-[#01645e]">{hackathon.stats.total}</div>
                          <div className="text-[#8b7632]">إجمالي المشاركين</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-yellow-600">{hackathon.stats.pending}</div>
                          <div className="text-[#8b7632]">في الانتظار</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{hackathon.stats.approved}</div>
                          <div className="text-[#8b7632]">مقبول</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-red-600">{hackathon.stats.rejected}</div>
                          <div className="text-[#8b7632]">مرفوض</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
