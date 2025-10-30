"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  Trophy,
  Star,
  Plus,
  ArrowRight,
  Mail,
  Settings,
  BarChart3,
  FileText,
  Code,
  Shield,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Gavel,
  GraduationCap,
  Award,
  Send,
  Upload,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  totalHackathons: number
  activeHackathons: number
  totalParticipants: number
  pendingParticipants: number
  approvedParticipants: number
  rejectedParticipants: number
  totalUsers: number
  recentHackathons: Array<{
    id: string
    title: string
    status: string
    participantCount: number
    startDate: string
  }>
  recentParticipants: Array<{
    id: string
    name: string
    email: string
    status: string
    registeredAt: string
    preferredRole: string
  }>
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalHackathons: 0,
    activeHackathons: 0,
    totalParticipants: 0,
    pendingParticipants: 0,
    approvedParticipants: 0,
    rejectedParticipants: 0,
    totalUsers: 0,
    recentHackathons: [],
    recentParticipants: []
  })
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Middleware protects this route. Avoid client redirect loops.
    fetchDashboardStats()
    fetchAnalytics()
  }, [])

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

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const sendWelcomeEmails = async () => {
    try {
      const response = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'welcome' })
      })
      
      if (response.ok) {
        alert('تم إرسال رسائل الترحيب بنجاح!')
      } else {
        alert('حدث خطأ في إرسال الرسائل')
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      alert('حدث خطأ في إرسال الرسائل')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 text-base font-medium">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1800px] mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              لوحة التحكم
            </h1>
            <p className="text-slate-600 text-base">
              مرحباً <span className="font-semibold text-slate-900">{user?.name}</span>، إليك نظرة عامة على المنصة
            </p>
          </div>
          <Link href="/admin/hackathons/create">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
              <Plus className="w-5 h-5 ml-2" />
              إنشاء هاكاثون
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Hackathons */}
          <Card className="border border-slate-200 hover:border-slate-300 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-slate-700" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">إجمالي الهاكاثونات</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalHackathons || 0}</p>
            </CardContent>
          </Card>

          {/* Active Hackathons */}
          <Card className="border border-slate-200 hover:border-slate-300 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-700" />
                </div>
                <div className="px-2 py-1 bg-slate-900 text-white text-xs font-medium rounded">
                  نشط
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">الهاكاثونات النشطة</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.activeHackathons || 0}</p>
            </CardContent>
          </Card>

          {/* Total Participants */}
          <Card className="border border-slate-200 hover:border-slate-300 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Users className="w-5 h-5 text-slate-700" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">إجمالي المشاركين</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalParticipants || 0}</p>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="border border-slate-200 hover:border-slate-300 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Users className="w-5 h-5 text-slate-700" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">المستخدمين المسجلين</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Participants Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Pending */}
          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Clock className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-xs font-medium text-slate-600">معلق</span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">طلبات معلقة</p>
              <p className="text-3xl font-bold text-slate-900 mb-3">{stats?.pendingParticipants || 0}</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-slate-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${(stats?.pendingParticipants / stats?.totalParticipants) * 100 || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Approved */}
          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-xs font-medium text-slate-600">مقبول</span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">طلبات مقبولة</p>
              <p className="text-3xl font-bold text-slate-900 mb-3">{stats?.approvedParticipants || 0}</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-slate-900 h-1.5 rounded-full transition-all"
                  style={{ width: `${(stats?.approvedParticipants / stats?.totalParticipants) * 100 || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Rejected */}
          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-xs font-medium text-slate-600">مرفوض</span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">طلبات مرفوضة</p>
              <p className="text-3xl font-bold text-slate-900 mb-3">{stats?.rejectedParticipants || 0}</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-slate-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(stats?.rejectedParticipants / stats?.totalParticipants) * 100 || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-lg mb-6">
              <TabsTrigger
                value="main"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                الرئيسية
              </TabsTrigger>
              <TabsTrigger
                value="management"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                الإدارة
              </TabsTrigger>
              <TabsTrigger
                value="evaluation"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                التقييم
              </TabsTrigger>
              <TabsTrigger
                value="communication"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                التواصل
              </TabsTrigger>
            </TabsList>

            {/* Main Tab */}
            <TabsContent value="main" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/hackathons">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Trophy className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">الهاكاثونات</h3>
                      <p className="text-sm text-slate-600">إدارة جميع الهاكاثونات</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/simple-participants">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Users className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">المشاركون</h3>
                      <p className="text-sm text-slate-600">إدارة المشاركين</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/judges">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Gavel className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">المحكمين</h3>
                      <p className="text-sm text-slate-600">إدارة المحكمين</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/experts">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <GraduationCap className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">الخبراء</h3>
                      <p className="text-sm text-slate-600">إدارة الخبراء</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            {/* Management Tab */}
            <TabsContent value="management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/users">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Users className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">المستخدمين</h3>
                      <p className="text-sm text-slate-600">إدارة حسابات المستخدمين</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/supervisors-management">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Shield className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">المشرفين</h3>
                      <p className="text-sm text-slate-600">إدارة المشرفين</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/forms">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <FileText className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">الفورمات</h3>
                      <p className="text-sm text-slate-600">إدارة النماذج</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/import-excel">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Upload className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">استيراد Excel</h3>
                      <p className="text-sm text-slate-600">استيراد البيانات</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            {/* Evaluation Tab */}
            <TabsContent value="evaluation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/evaluation">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Star className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">نظام التقييم</h3>
                      <p className="text-sm text-slate-600">معايير التقييم</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/results-management">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Trophy className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">النتائج</h3>
                      <p className="text-sm text-slate-600">إدارة النتائج</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/reports">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <BarChart3 className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">التقارير</h3>
                      <p className="text-sm text-slate-600">تقارير مفصلة</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/presentations">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Eye className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">العروض</h3>
                      <p className="text-sm text-slate-600">عروض المشاريع</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Recent Hackathons - Quick Access to Evaluations */}
              {stats?.recentHackathons && stats.recentHackathons.length > 0 && (
                <Card className="border border-slate-200 mt-6">
                  <CardHeader className="border-b border-slate-200 bg-white">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      الوصول السريع لتقييمات الهاكاثونات
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      عرض نتائج التقييم لكل هاكاثون
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stats.recentHackathons.slice(0, 4).map((hackathon) => (
                        <div
                          key={hackathon.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-slate-700" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{hackathon.title}</h4>
                              <p className="text-sm text-slate-600">
                                {hackathon.participantCount} مشارك
                              </p>
                            </div>
                          </div>
                          <Link href={`/admin/hackathons/${hackathon.id}/evaluations`}>
                            <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-900 hover:text-white">
                              <BarChart3 className="w-4 h-4 ml-2" />
                              التقييمات
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Communication Tab */}
            <TabsContent value="communication" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/email-management">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Mail className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">إدارة الإيميلات</h3>
                      <p className="text-sm text-slate-600">إرسال الإيميلات</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/email-templates">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <FileText className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">قوالب الإيميلات</h3>
                      <p className="text-sm text-slate-600">تخصيص القوالب</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/certificates-management">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Award className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">الشهادات</h3>
                      <p className="text-sm text-slate-600">إدارة الشهادات</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/send-certificates">
                  <Card className="border border-slate-200 hover:border-slate-900 hover:shadow-sm transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-slate-100 group-hover:bg-slate-900 rounded-lg transition-colors">
                          <Send className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">إرسال الشهادات</h3>
                      <p className="text-sm text-slate-600">إرسال للمشاركين</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Analytics Charts */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Participants Over Time */}
            <Card className="border border-slate-200">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-lg font-semibold text-slate-900">المشاركين خلال آخر 30 يوم</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.participantsChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={2} dot={{ fill: '#0f172a', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Hackathons */}
            <Card className="border border-slate-200">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-lg font-semibold text-slate-900">أكثر الهاكاثونات مشاركة</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topHackathonsChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Bar dataKey="participants" fill="#0f172a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Participants by Status */}
            <Card className="border border-slate-200">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-lg font-semibold text-slate-900">المشاركين حسب الحالة</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.statusChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.statusChart.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.status === 'pending' ? '#94a3b8' :
                          entry.status === 'approved' ? '#0f172a' : '#cbd5e1'
                        } />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Users by Role */}
            <Card className="border border-slate-200">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-lg font-semibold text-slate-900">المستخدمين حسب الدور</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.rolesChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" style={{ fontSize: '12px' }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Bar dataKey="value" fill="#0f172a" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Participants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-slate-200">
            <CardHeader className="border-b border-slate-200 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    المشاركين الجدد
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    آخر المشاركين المسجلين في المنصة
                  </CardDescription>
                </div>
                <Link href="/admin/simple-participants">
                  <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                    عرض الكل
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {stats?.recentParticipants?.length > 0 ? (
                  stats.recentParticipants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">
                            {participant.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm text-slate-600">{participant.email}</p>
                            <span className="text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{participant.preferredRole}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {participant.status === 'PENDING' && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                            معلق
                          </span>
                        )}
                        {participant.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded">
                            مقبول
                          </span>
                        )}
                        {participant.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded">
                            مرفوض
                          </span>
                        )}
                        <p className="text-sm text-slate-500 min-w-[90px] text-left">
                          {new Date(participant.registeredAt).toLocaleDateString('ar-SA', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">لا توجد مشاركين حتى الآن</h3>
                    <p className="text-sm text-slate-600 mb-4">ابدأ بإنشاء هاكاثون جديد لاستقبال المشاركين</p>
                    <Link href="/admin/hackathons/create">
                      <Button className="bg-slate-900 hover:bg-slate-800">
                        <Plus className="w-4 h-4 ml-2" />
                        إنشاء هاكاثون
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
