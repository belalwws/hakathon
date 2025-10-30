"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Trophy, Clock, MapPin, Code, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  status: 'draft' | 'open' | 'closed' | 'completed'
  prizes: {
    first: string
    second: string
    third: string
  }
  requirements: string[]
  categories: string[]
}

interface UserParticipation {
  id: string
  hackathon: {
    id: string
    title: string
    status: string
  }
  status: 'pending' | 'approved' | 'rejected'
  registeredAt: string
}

export default function HackathonsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [userParticipations, setUserParticipations] = useState<UserParticipation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHackathons()
    if (user) {
      fetchUserParticipations()
    }
  }, [user])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/hackathons')
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

  const fetchUserParticipations = async () => {
    try {
      const response = await fetch('/api/user/participations')
      if (response.ok) {
        const data = await response.json()
        setUserParticipations(data.participations || [])
      }
    } catch (error) {
      console.error('Error fetching user participations:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'قريباً', color: 'bg-gray-500' },
      open: { label: 'مفتوح للتسجيل', color: 'bg-green-500' },
      closed: { label: 'مغلق', color: 'bg-red-500' },
      completed: { label: 'مكتمل', color: 'bg-blue-500' },
      // Support for uppercase versions for compatibility
      DRAFT: { label: 'قريباً', color: 'bg-gray-500' },
      OPEN: { label: 'مفتوح للتسجيل', color: 'bg-green-500' },
      CLOSED: { label: 'مغلق', color: 'bg-red-500' },
      COMPLETED: { label: 'مكتمل', color: 'bg-blue-500' }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isRegistrationOpen = (hackathon: Hackathon) => {
    const now = new Date()
    const deadline = new Date(hackathon.registrationDeadline)
    return hackathon.status === 'open' && now < deadline
  }

  const getUserParticipationStatus = (hackathonId: string) => {
    return userParticipations.find(p => p.hackathon.id === hackathonId)
  }

  const isUserRegistered = (hackathonId: string) => {
    return userParticipations.some(p => p.hackathon.id === hackathonId)
  }

  const handleRegisterClick = (hackathonId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/hackathons/${hackathonId}/register-form`)
    } else {
      // Go to registration page
      router.push(`/hackathons/${hackathonId}/register-form`)
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
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-[#01645e] mb-4">الهاكاثونات المتاحة</h1>
          <p className="text-xl text-[#8b7632] max-w-3xl mx-auto">
            اكتشف الهاكاثونات المتاحة وشارك في تطوير حلول مبتكرة تخدم المجتمع
          </p>
        </motion.div>

        {/* Hackathons Grid */}
        {hackathons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Code className="w-24 h-24 text-[#8b7632] mx-auto mb-6 opacity-50" />
            <h3 className="text-3xl font-bold text-[#01645e] mb-4">لا توجد هاكاثونات متاحة حالياً</h3>
            <p className="text-xl text-[#8b7632] mb-8">ترقب إطلاق هاكاثونات جديدة قريباً</p>
            {!user && (
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-8 py-3 text-lg">
                  سجل الآن لتكون أول من يعلم
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-[#01645e]/5 to-[#3ab666]/5">
                    <div className="flex justify-between items-start mb-3">
                      <CardTitle className="text-2xl text-[#01645e] flex-1">{hackathon.title}</CardTitle>
                      {getStatusBadge(hackathon.status)}
                    </div>
                    <CardDescription className="text-[#8b7632] text-base leading-relaxed">
                      {hackathon.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-6">
                    {/* Dates */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-[#3ab666]" />
                        <span className="font-semibold text-[#01645e]">انتهاء التسجيل:</span>
                        <span className="text-[#8b7632]">{formatDate(hackathon.registrationDeadline)}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-[#3ab666]" />
                        <span className="font-semibold text-[#01645e]">فترة الهاكاثون:</span>
                        <span className="text-[#8b7632]">
                          {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                        </span>
                      </div>
                      
                      {hackathon.maxParticipants && (
                        <div className="flex items-center gap-3 text-sm">
                          <Users className="w-4 h-4 text-[#3ab666]" />
                          <span className="font-semibold text-[#01645e]">الحد الأقصى:</span>
                          <span className="text-[#8b7632]">{hackathon.maxParticipants} مشارك</span>
                        </div>
                      )}
                    </div>

                    {/* Prizes */}
                    {hackathon.prizes && (hackathon.prizes.first || hackathon.prizes.second || hackathon.prizes.third) && (
                      <div className="bg-gradient-to-r from-[#c3e956]/10 to-[#3ab666]/10 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Trophy className="w-5 h-5 text-[#c3e956]" />
                          <span className="font-bold text-[#01645e]">الجوائز</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          {hackathon.prizes.first && (
                            <div className="text-center">
                              <div className="font-bold text-yellow-600">🥇 الأولى</div>
                              <div className="text-[#8b7632]">{hackathon.prizes.first}</div>
                            </div>
                          )}
                          {hackathon.prizes.second && (
                            <div className="text-center">
                              <div className="font-bold text-gray-600">🥈 الثانية</div>
                              <div className="text-[#8b7632]">{hackathon.prizes.second}</div>
                            </div>
                          )}
                          {hackathon.prizes.third && (
                            <div className="text-center">
                              <div className="font-bold text-orange-600">🥉 الثالثة</div>
                              <div className="text-[#8b7632]">{hackathon.prizes.third}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {hackathon.categories && hackathon.categories.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-[#3ab666]" />
                          <span className="font-semibold text-[#01645e]">المجالات:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.categories.map((category, idx) => (
                            <Badge key={idx} variant="outline" className="text-[#3ab666] border-[#3ab666]">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4">
                      {!user ? (
                        <Link href="/register" className="w-full">
                          <Button className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]">
                            سجل أولاً للمشاركة
                          </Button>
                        </Link>
                      ) : isUserRegistered(hackathon.id) ? (
                        // المستخدم مسجل بالفعل
                        (() => {
                          const participation = getUserParticipationStatus(hackathon.id)
                          return (
                            <div className="space-y-2">
                              <Button
                                disabled
                                className="w-full bg-green-100 text-green-800 border border-green-300 hover:bg-green-100"
                              >
                                ✅ تم التسجيل
                              </Button>
                              <div className="text-center text-sm">
                                <span className="text-[#8b7632]">الحالة: </span>
                                <span className={`font-semibold ${
                                  participation?.status === 'approved' ? 'text-green-600' :
                                  participation?.status === 'rejected' ? 'text-red-600' :
                                  'text-yellow-600'
                                }`}>
                                  {participation?.status === 'approved' ? 'مقبول' :
                                   participation?.status === 'rejected' ? 'مرفوض' :
                                   'في انتظار المراجعة'}
                                </span>
                              </div>
                            </div>
                          )
                        })()
                      ) : isRegistrationOpen(hackathon) ? (
                        <Link href={`/hackathons/${hackathon.id}/register-form`} className="w-full">
                          <Button className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]">
                            سجل في الهاكاثون
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full">
                          {hackathon.status === 'completed' ? 'انتهى الهاكاثون' :
                           hackathon.status === 'closed' ? 'مغلق' : 'التسجيل مغلق'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
