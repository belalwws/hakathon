"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Flag, Calendar, Trophy, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  city: string
  nationality: string
  status: string
  createdAt: string
  participations: Array<{
    id: string
    hackathon: {
      id: string
      title: string
      description: string
      startDate: string
      endDate: string
      status: string
    }
    teamName?: string
    projectTitle?: string
    projectDescription?: string
    teamRole?: string
    status: 'pending' | 'approved' | 'rejected'
    registeredAt: string
    approvedAt?: string
    rejectedAt?: string
    team?: {
      id: string
      name: string
      teamNumber: number
      members: Array<{
        id: string
        user: {
          id: string
          name: string
          email: string
          preferredRole: string
        }
      }>
    }
  }>
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      console.log('🔄 Fetching user profile...')

      // Fetch user profile with participations
      const profileResponse = await fetch('/api/user/profile')
      if (!profileResponse.ok) {
        console.error('❌ Profile fetch failed:', profileResponse.status)
        router.push('/login')
        return
      }

      const profileData = await profileResponse.json()
      console.log('✅ Profile data received:', profileData)

      setProfile(profileData.user)
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'في الانتظار', color: 'bg-yellow-500', icon: Clock },
      approved: { label: 'مقبول', color: 'bg-green-500', icon: CheckCircle },
      rejected: { label: 'مرفوض', color: 'bg-red-500', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getHackathonStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'مسودة', color: 'bg-gray-500' },
      OPEN: { label: 'مفتوح', color: 'bg-green-500' },
      CLOSED: { label: 'مغلق', color: 'bg-red-500' },
      COMPLETED: { label: 'مكتمل', color: 'bg-blue-500' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل الملف الشخصي...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-[#01645e] mb-4">خطأ في تحميل الملف الشخصي</h1>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#01645e] mb-2">لوحة التحكم الشخصية</h1>
          <p className="text-[#8b7632] text-lg">تابع رحلتك في الهاكاثونات وجميع المراحل</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <Card className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">إجمالي المشاركات</p>
                  <p className="text-2xl font-bold">{profile.participations?.length || 0}</p>
                </div>
                <Trophy className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">المقبولة</p>
                  <p className="text-2xl font-bold">
                    {profile.participations?.filter(p => p.status === 'approved').length || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#8b7632] to-[#c3e956] text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">في الانتظار</p>
                  <p className="text-2xl font-bold">
                    {profile.participations?.filter(p => p.status === 'pending').length || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#6c757d] to-[#8b7632] text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">في فريق</p>
                  <p className="text-2xl font-bold">
                    {profile.participations?.filter(p => p.team).length || 0}
                  </p>
                </div>
                <User className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">

          {/* Left Column - Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                  <User className="w-5 h-5" />
                  الملف الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#01645e]">{profile.name}</h3>
                    <p className="text-[#8b7632] text-sm">{profile.email}</p>
                  </div>

                  <div className="space-y-3">
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-[#3ab666]" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#3ab666]" />
                        <span>{profile.city}</span>
                      </div>
                    )}
                    {profile.nationality && (
                      <div className="flex items-center gap-2 text-sm">
                        <Flag className="w-4 h-4 text-[#3ab666]" />
                        <span>{profile.nationality}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#3ab666]" />
                      <span>عضو منذ {formatDate(profile.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#01645e] flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  الحالة الحالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.participations && profile.participations.length > 0 ? (
                    <>
                      {profile.participations.filter(p => p.status === 'pending').length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                              {profile.participations.filter(p => p.status === 'pending').length} طلب في الانتظار
                            </span>
                          </div>
                        </div>
                      )}

                      {profile.participations.filter(p => p.team).length > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              عضو في {profile.participations.filter(p => p.team).length} فريق
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600">لم تشارك في أي هاكاثون بعد</p>
                      <Link href="/hackathons" className="text-[#3ab666] text-sm hover:underline">
                        استكشف الهاكاثونات المتاحة
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Participations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  رحلتي في الهاكاثونات
                </CardTitle>
                <CardDescription>تتبع جميع مشاركاتك ومراحلها</CardDescription>
              </CardHeader>
              <CardContent>
                {!profile.participations || profile.participations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#01645e] mb-2">ابدأ رحلتك!</h3>
                    <p className="text-[#8b7632] mb-6">لم تسجل في أي هاكاثون بعد</p>
                    <Link href="/hackathons">
                      <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666]">
                        استكشف الهاكاثونات
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {profile.participations.map((participation, index) => (
                      <motion.div
                        key={participation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-[#01645e]">{participation.hackathon.title}</h3>
                              {getStatusBadge(participation.status)}
                              {getHackathonStatusBadge(participation.hackathon.status)}
                            </div>
                            <p className="text-[#8b7632] mb-3 line-clamp-2">{participation.hackathon.description}</p>

                            {/* Hackathon Info */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                                <Calendar className="w-3 h-3 inline ml-1" />
                                {formatDate(participation.hackathon.startDate)} - {formatDate(participation.hackathon.endDate)}
                              </div>
                              {getHackathonStatusBadge(participation.hackathon.status)}
                            </div>
                          </div>

                          <div className="flex gap-2 mr-4">
                            <Link href={`/hackathons/${participation.hackathon.id}`}>
                              <Button variant="outline" size="sm" className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white">
                                <Eye className="w-4 h-4 ml-1" />
                                عرض التفاصيل
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Progress Timeline */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-[#01645e] mb-3">مراحل المشاركة:</h4>
                          <div className="flex items-center space-x-4 space-x-reverse">
                            {/* Registration */}
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-[#3ab666] rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <div className="mr-3">
                                <p className="text-xs font-medium text-[#3ab666]">تم التسجيل</p>
                                <p className="text-xs text-gray-500">{formatDate(participation.registeredAt)}</p>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="w-8 h-0.5 bg-gray-300"></div>

                            {/* Review */}
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                participation.status === 'pending' ? 'bg-yellow-500' :
                                participation.status === 'approved' ? 'bg-[#3ab666]' : 'bg-red-500'
                              }`}>
                                {participation.status === 'pending' ? (
                                  <Clock className="w-4 h-4 text-white" />
                                ) : participation.status === 'approved' ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="mr-3">
                                <p className={`text-xs font-medium ${
                                  participation.status === 'pending' ? 'text-yellow-600' :
                                  participation.status === 'approved' ? 'text-[#3ab666]' : 'text-red-600'
                                }`}>
                                  {participation.status === 'pending' ? 'قيد المراجعة' :
                                   participation.status === 'approved' ? 'تم القبول' : 'تم الرفض'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {participation.approvedAt ? formatDate(participation.approvedAt) :
                                   participation.rejectedAt ? formatDate(participation.rejectedAt) : 'في الانتظار'}
                                </p>
                              </div>
                            </div>

                            {/* Arrow */}
                            {participation.status === 'approved' && (
                              <>
                                <div className="w-8 h-0.5 bg-gray-300"></div>

                                {/* Team Assignment */}
                                <div className="flex items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    participation.team ? 'bg-[#3ab666]' : 'bg-gray-400'
                                  }`}>
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="mr-3">
                                    <p className={`text-xs font-medium ${
                                      participation.team ? 'text-[#3ab666]' : 'text-gray-500'
                                    }`}>
                                      {participation.team ? 'في فريق' : 'انتظار الفريق'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {participation.team ? participation.team?.name : 'قريباً'}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 mb-1 font-medium">الدور المفضل</p>
                            <p className="font-semibold text-[#01645e]">{participation.teamRole || 'غير محدد'}</p>
                          </div>

                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                            <p className="text-xs text-green-600 mb-1 font-medium">نوع المشاركة</p>
                            <p className="font-semibold text-[#01645e]">{participation.team ? 'فريق' : 'فردي'}</p>
                          </div>

                          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-600 mb-1 font-medium">تاريخ التسجيل</p>
                            <p className="font-semibold text-[#01645e]">{formatDate(participation.registeredAt)}</p>
                          </div>

                          {participation.teamName && (
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200">
                              <p className="text-xs text-orange-600 mb-1 font-medium">اسم الفريق المقترح</p>
                              <p className="font-semibold text-[#01645e]">{participation.teamName}</p>
                            </div>
                          )}

                          {participation.projectTitle && (
                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-lg border border-pink-200">
                              <p className="text-xs text-pink-600 mb-1 font-medium">عنوان المشروع</p>
                              <p className="font-semibold text-[#01645e]">{participation.projectTitle}</p>
                            </div>
                          )}

                          {participation.projectDescription && (
                            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-3 rounded-lg border border-teal-200 md:col-span-2 lg:col-span-3">
                              <p className="text-xs text-teal-600 mb-1 font-medium">وصف المشروع</p>
                              <p className="font-medium text-[#01645e] text-sm">{participation.projectDescription}</p>
                            </div>
                          )}
                        </div>

                        {/* Status Messages */}
                        {participation.status === 'approved' && participation.approvedAt && (
                          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <p className="text-green-700 font-medium">
                                تم قبولك في هذا الهاكاثون! 🎉
                              </p>
                            </div>
                            <p className="text-green-600 text-sm mt-1">
                              تاريخ القبول: {formatDate(participation.approvedAt)}
                            </p>
                          </div>
                        )}

                        {participation.status === 'rejected' && participation.rejectedAt && (
                          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-5 h-5 text-red-600" />
                              <p className="text-red-700 font-medium">
                                لم يتم قبولك في هذا الهاكاثون
                              </p>
                            </div>
                            <p className="text-red-600 text-sm mt-1">
                              تاريخ الرفض: {formatDate(participation.rejectedAt)}
                            </p>
                          </div>
                        )}

                        {participation.status === 'pending' && (
                          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <p className="text-yellow-700 font-medium">
                                طلبك قيد المراجعة
                              </p>
                            </div>
                            <p className="text-yellow-600 text-sm mt-1">
                              ستتلقى إشعاراً عند اتخاذ قرار بشأن طلبك
                            </p>
                          </div>
                        )}

                        {/* Team Information */}
                        {participation.team && (
                          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-[#01645e] mb-3 flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-[#3ab666]" />
                              معلومات الفريق
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-[#8b7632] mb-1">اسم الفريق:</p>
                                <p className="font-semibold text-[#01645e]">{participation.team?.name || 'غير محدد'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-[#8b7632] mb-1">رقم الفريق:</p>
                                <p className="font-semibold text-[#01645e]">فريق #{participation.team?.teamNumber || 'غير محدد'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-[#8b7632] mb-1">عدد الأعضاء:</p>
                                <p className="font-semibold text-[#01645e]">{participation.team?.members?.length || 0} أعضاء</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-[#8b7632] mb-2">أعضاء الفريق:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {participation.team?.members?.map((member) => (
                                  <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                    <div className="w-8 h-8 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center">
                                      <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-[#01645e] text-sm">
                                        {member.user.name}
                                        {member.user.id === profile.id && (
                                          <span className="text-[#3ab666] mr-1 font-bold">(أنت)</span>
                                        )}
                                      </p>
                                      <p className="text-xs text-[#8b7632]">{member.user.preferredRole || 'مطور'}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-blue-700 text-sm text-center">
                                🎯 تم تعيينك في هذا الفريق! تواصل مع أعضاء فريقك لبدء العمل على مشروعكم.
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone - Delete Account */}
          {user && user.role !== 'admin' && user.role !== 'master' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-900 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    منطقة الخطر
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    الإجراءات التالية لا يمكن التراجع عنها
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">حذف الحساب</h3>
                      <p className="text-sm text-red-700">
                        حذف حسابك وجميع بياناتك بشكل دائم
                      </p>
                    </div>
                    <Link href="/profile/delete-account">
                      <Button variant="destructive" size="sm">
                        حذف الحساب
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
