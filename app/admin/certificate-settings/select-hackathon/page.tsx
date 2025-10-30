'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, ArrowLeft, Calendar, Users, Award, ChevronRight } from 'lucide-react'

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
  startDate: string
  endDate: string
  _count?: {
    participants: number
  }
}

export default function SelectHackathonForCertificatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    loadHackathons()
  }, [user, router])

  const loadHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error loading hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHackathonSelect = (hackathonId: string) => {
    router.push(`/admin/hackathons/${hackathonId}/certificate-settings`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'upcoming': return 'قادم'
      case 'completed': return 'مكتمل'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8b7632] text-lg">جاري تحميل الهاكاثونات...</p>
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
                <Settings className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-4">
            🏆 إعدادات الشهادات
          </h1>
          <p className="text-[#8b7632] text-xl">اختر الهاكاثون لتخصيص شهادته</p>
        </motion.div>

        {/* Hackathons Grid */}
        {hackathons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Award className="w-24 h-24 text-[#8b7632] mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-[#01645e] mb-2">لا توجد هاكاثونات</h3>
            <p className="text-[#8b7632]">قم بإنشاء هاكاثون أولاً لتتمكن من تخصيص شهادته</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => handleHackathonSelect(hackathon.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#01645e] mb-2 group-hover:text-[#3ab666] transition-colors">
                      {hackathon.title}
                    </h3>
                    <p className="text-[#8b7632] text-sm line-clamp-2 mb-3">
                      {hackathon.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8b7632] group-hover:text-[#3ab666] group-hover:translate-x-1 transition-all" />
                </div>

                <div className="space-y-3">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8b7632]">الحالة:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hackathon.status)}`}>
                      {getStatusText(hackathon.status)}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-[#8b7632]">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(hackathon.startDate).toLocaleDateString('ar-SA')} - {new Date(hackathon.endDate).toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  {/* Participants */}
                  {hackathon._count && (
                    <div className="flex items-center gap-2 text-sm text-[#8b7632]">
                      <Users className="w-4 h-4" />
                      <span>{hackathon._count.participants} مشارك</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-[#01645e]/10">
                  <div className="flex items-center justify-center gap-2 text-[#3ab666] font-medium group-hover:text-[#01645e] transition-colors">
                    <Award className="w-4 h-4" />
                    <span>تخصيص الشهادة</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5" />
            💡 حول إعدادات الشهادات
          </h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• كل هاكاثون له تصميم شهادة منفصل ومستقل</li>
            <li>• يمكنك رفع قالب شهادة مخصص لكل هاكاثون</li>
            <li>• تحديد موضع الاسم ولونه حسب تصميم كل شهادة</li>
            <li>• الإعدادات تُحفظ تلقائياً لكل هاكاثون على حدة</li>
            <li>• يمكن معاينة الشهادة قبل إرسالها للمشاركين</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
