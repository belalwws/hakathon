"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Users, Trophy, Clock, MapPin, Flag, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants?: number
  status: string
  prizes: {
    first: string
    second: string
    third: string
  }
  requirements: string[]
  categories: string[]
  participantCount: number
}

export default function HackathonDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHackathon()
  }, [params.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
      } else {
        console.error('Hackathon not found')
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    } finally {
      setLoading(false)
    }
  }

  const isRegistrationOpen = () => {
    if (!hackathon) return false
    const now = new Date()
    const deadline = new Date(hackathon.registrationDeadline)
    // Check for both lowercase and uppercase status values for compatibility
    const isOpen = hackathon.status === 'open' || hackathon.status === 'OPEN'
    return isOpen && now < deadline
  }

  const handleRegisterClick = () => {
    if (!user) {
      router.push(`/login?redirect=/hackathons/${params.id}/register-form`)
    } else {
      router.push(`/hackathons/${params.id}/register-form`)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#01645e] font-semibold">جاري تحميل تفاصيل الهاكاثون...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-[#01645e] mb-4">الهاكاثون غير موجود</h1>
            <Link href="/hackathons">
              <Button>العودة إلى قائمة الهاكاثونات</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/hackathons">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#01645e]">{hackathon.title}</h1>
            <p className="text-[#8b7632] text-lg">{hackathon.description}</p>
          </div>
          <Badge className={`${
            (hackathon.status === 'open' || hackathon.status === 'OPEN') ? 'bg-green-500' :
            (hackathon.status === 'closed' || hackathon.status === 'CLOSED') ? 'bg-red-500' :
            (hackathon.status === 'completed' || hackathon.status === 'COMPLETED') ? 'bg-blue-500' : 'bg-gray-500'
          } text-white`}>
            {(hackathon.status === 'open' || hackathon.status === 'OPEN') ? 'مفتوح' :
             (hackathon.status === 'closed' || hackathon.status === 'CLOSED') ? 'مغلق' :
             (hackathon.status === 'completed' || hackathon.status === 'COMPLETED') ? 'مكتمل' : 'مسودة'}
          </Badge>
        </motion.div>

        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#01645e]">تفاصيل الهاكاثون</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#3ab666]" />
                    <div>
                      <span className="font-semibold text-[#01645e]">تاريخ البداية:</span>
                      <br />
                      {formatDate(hackathon.startDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#3ab666]" />
                    <div>
                      <span className="font-semibold text-[#01645e]">تاريخ النهاية:</span>
                      <br />
                      {formatDate(hackathon.endDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#3ab666]" />
                    <div>
                      <span className="font-semibold text-[#01645e]">انتهاء التسجيل:</span>
                      <br />
                      {formatDate(hackathon.registrationDeadline)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#3ab666]" />
                    <div>
                      <span className="font-semibold text-[#01645e]">المشاركين:</span>
                      <br />
                      {hackathon.participantCount} {hackathon.maxParticipants ? `/ ${hackathon.maxParticipants}` : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            {hackathon.categories && hackathon.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-[#01645e]">فئات الهاكاثون</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {hackathon.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-[#3ab666] border-[#3ab666]">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {hackathon.requirements && hackathon.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-[#01645e]">متطلبات المشاركة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {hackathon.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#3ab666] mt-1">•</span>
                        <span className="text-[#8b7632]">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#01645e]">التسجيل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRegistrationOpen() ? (
                  <>
                    <p className="text-[#8b7632] text-sm">
                      التسجيل مفتوح حتى {formatDate(hackathon.registrationDeadline)}
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={handleRegisterClick}
                        className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
                      >
                        <Users className="w-4 h-4 ml-2" />
                        {user ? 'سجل في الهاكاثون' : 'سجل دخول للمشاركة'}
                      </Button>

                      <div className="text-center text-sm text-gray-500">أو</div>

                      <Button
                        onClick={() => router.push(`/hackathons/${params.id}/simple-register`)}
                        variant="outline"
                        className="w-full border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white"
                      >
                        <Users className="w-4 h-4 ml-2" />
                        تسجيل سريع بدون حساب
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        التسجيل السريع لا يتطلب إنشاء حساب أو كلمة مرور
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-red-600 font-semibold mb-2">التسجيل مغلق</p>
                    <p className="text-[#8b7632] text-sm">
                      انتهى موعد التسجيل في {formatDate(hackathon.registrationDeadline)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prizes */}
            {hackathon.prizes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-[#01645e] flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    الجوائز
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="font-semibold text-yellow-800">🥇 المركز الأول</span>
                    <span className="text-yellow-700">{hackathon.prizes.first}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-800">🥈 المركز الثاني</span>
                    <span className="text-gray-700">{hackathon.prizes.second}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="font-semibold text-orange-800">🥉 المركز الثالث</span>
                    <span className="text-orange-700">{hackathon.prizes.third}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
