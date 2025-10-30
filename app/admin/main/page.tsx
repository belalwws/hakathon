"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, Settings, Plus, BarChart3, FileText, Eye, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  totalHackathons: number
  activeHackathons: number
  totalParticipants: number
  totalTeams: number
  totalJudges: number
  recentHackathons: Array<{
    id: string
    title: string
    isActive: boolean
    participantCount: number
    teamCount: number
    startDate: string
  }>
}

export default function AdminMainDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchDashboardStats()
  }, [user, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto mb-4"></div>
          <p className="text-[#01645e] text-lg">جاري تحميل لوحة التحكم...</p>
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
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">لوحة تحكم الإدارة</h1>
            <p className="text-[#8b7632] text-lg">مرحباً {user?.name}، إدارة شاملة لمنصة الهاكاثونات</p>
          </div>
          
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Link href="/admin/hackathons">
              <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-5 h-5 ml-2" />
                إنشاء هاكاثون جديد
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي الهاكاثونات</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.totalHackathons || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">الهاكاثونات النشطة</p>
                  <p className="text-3xl font-bold text-[#3ab666]">{stats?.activeHackathons || 0}</p>
                </div>
                <Trophy className="w-8 h-8 text-[#3ab666]" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي المشاركين</p>
                  <p className="text-3xl font-bold text-[#c3e956]">{stats?.totalParticipants || 0}</p>
                </div>
                <Users className="w-8 h-8 text-[#8b7632]" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي الفرق</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.totalTeams || 0}</p>
                </div>
                <Trophy className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي المحكمين</p>
                  <p className="text-3xl font-bold text-[#3ab666]">{stats?.totalJudges || 0}</p>
                </div>
                <Users className="w-8 h-8 text-[#3ab666]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Link href="/admin/hackathons">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-[#01645e] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إدارة الهاكاثونات</h3>
                <p className="text-[#8b7632] text-sm">إنشاء وإدارة الهاكاثونات المختلفة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/participants-temp">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-[#3ab666] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">المشاركين المسجلين</h3>
                <p className="text-[#8b7632] text-sm">مراجعة وإدارة طلبات المشاركة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/judges">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-[#c3e956] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إدارة المحكمين</h3>
                <p className="text-[#8b7632] text-sm">تعيين وإدارة المحكمين</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/experts">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-[#8b7632] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إدارة الخبراء</h3>
                <p className="text-[#8b7632] text-sm">تعيين وإدارة الخبراء</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-[#8b7632] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">إدارة المستخدمين</h3>
                <p className="text-[#8b7632] text-sm">عرض وإدارة المستخدمين المسجلين</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Recent Hackathons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-[#01645e]">الهاكاثونات الحديثة</CardTitle>
                  <CardDescription>آخر الهاكاثونات المنشأة</CardDescription>
                </div>
                <Link href="/admin/hackathons">
                  <Button variant="outline">
                    عرض الكل
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentHackathons?.map((hackathon, index) => (
                  <motion.div
                    key={hackathon.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#01645e]">{hackathon.title}</h4>
                        <p className="text-sm text-[#8b7632]">
                          {hackathon.participantCount} مشارك • {hackathon.teamCount} فريق
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <Badge variant={hackathon.isActive ? "default" : "secondary"}>
                        {hackathon.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                      <p className="text-sm text-[#8b7632]">
                        {new Date(hackathon.startDate).toLocaleDateString('ar-SA')}
                      </p>
                      <Link href={`/admin/hackathons/${hackathon.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )) || (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                    <p className="text-[#8b7632]">لا توجد هاكاثونات حتى الآن</p>
                    <Link href="/admin/hackathons">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 ml-2" />
                        إنشاء أول هاكاثون
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
