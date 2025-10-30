'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { 
  Trophy, Users, Calendar, Settings, Bell, Search, Menu,
  BarChart3, Shield, Building2, Plus, TrendingUp, UserPlus,
  Clock, CheckCircle2, XCircle, Gavel, Eye
} from 'lucide-react'
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface OrganizationStats {
  totalHackathons: number
  activeHackathons: number
  totalParticipants: number
  pendingParticipants: number
  approvedParticipants: number
  rejectedParticipants: number
  totalUsers: number
  totalTeams: number
  totalJudges: number
  recentHackathons: any[]
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <div className="w-24 h-24 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-10 w-10 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading Dashboard...'}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {language === 'ar' ? 'لوحة تحكم المؤسسة' : 'Organization Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'بحث...' : 'Search...'} 
                className="bg-transparent border-none outline-none text-sm w-64"
              />
            </div>
            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs text-gray-500">
                  {language === 'ar' ? 'مدير' : 'Admin'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4 space-y-2">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600`}
            >
              <BarChart3 className="h-4 w-4" />
              {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </Button>
            <Link href="/admin/hackathons">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Trophy className="h-4 w-4" />
                {language === 'ar' ? 'الهاكاثونات' : 'Hackathons'}
              </Button>
            </Link>
            <Link href="/admin/participants">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Users className="h-4 w-4" />
                {language === 'ar' ? 'المشاركين' : 'Participants'}
              </Button>
            </Link>
            <Link href="/admin/judges">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Gavel className="h-4 w-4" />
                {language === 'ar' ? 'الحكام' : 'Judges'}
              </Button>
            </Link>
            {user?.role === 'master' && (
              <Link href="/admin/users">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {language === 'ar' ? 'المستخدمين' : 'Users'}
                </Button>
              </Link>
            )}
            <Link href="/admin/settings">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <Settings className="h-4 w-4" />
                {language === 'ar' ? 'الإعدادات' : 'Settings'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {language === 'ar' ? `مرحباً، ${user?.name} 👋` : `Welcome back, ${user?.name} 👋`}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {language === 'ar' ? 'إليك نظرة عامة على مؤسستك' : 'Here\'s an overview of your organization'}
              </p>
            </motion.div>

            {/* Stats Grid */}
            {stats && (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                >
                    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center justify-between mb-4">
                        <Trophy className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        <Badge className="bg-indigo-600">{language === 'ar' ? 'هاكاثونات' : 'Hackathons'}</Badge>
                      </div>
                      <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.totalHackathons}</div>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                        {stats.activeHackathons} {language === 'ar' ? 'نشط' : 'active'}
                      </p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                        <Badge className="bg-green-600">{language === 'ar' ? 'مشاركين' : 'Participants'}</Badge>
                      </div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalParticipants}</div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {stats.pendingParticipants} {language === 'ar' ? 'معلق' : 'pending'}
                      </p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-4">
                        <Gavel className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        <Badge className="bg-purple-600">{language === 'ar' ? 'حكام' : 'Judges'}</Badge>
                      </div>
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.totalJudges}</div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                        {language === 'ar' ? 'محكّم' : 'total judges'}
                      </p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-4">
                        <UserPlus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        <Badge className="bg-orange-600">{language === 'ar' ? 'مستخدمين' : 'Users'}</Badge>
                      </div>
                      <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.totalUsers}</div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        {language === 'ar' ? 'في مؤسستك' : 'in your org'}
                      </p>
                    </Card>
                  </motion.div>

                  {/* Participants Status */}
                  <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold">{language === 'ar' ? 'معلقة' : 'Pending'}</h3>
                    </div>
                    <div className="text-2xl font-bold">{stats?.pendingParticipants || 0}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${((stats?.pendingParticipants || 0) / (stats?.totalParticipants || 1)) * 100}%` }}></div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">{language === 'ar' ? 'مقبولة' : 'Approved'}</h3>
                    </div>
                    <div className="text-2xl font-bold">{stats?.approvedParticipants || 0}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${((stats?.approvedParticipants || 0) / (stats?.totalParticipants || 1)) * 100}%` }}></div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold">{language === 'ar' ? 'مرفوضة' : 'Rejected'}</h3>
                    </div>
                    <div className="text-2xl font-bold">{stats?.rejectedParticipants || 0}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${((stats?.rejectedParticipants || 0) / (stats?.totalParticipants || 1)) * 100}%` }}></div>
                    </div>
                  </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => router.push('/admin/hackathons/create')}
                      >
                        <Plus className="h-4 w-4" />
                        {language === 'ar' ? 'إنشاء هاكاثون جديد' : 'Create New Hackathon'}
                      </Button>
                      <Button 
                        className="w-full justify-start gap-2" 
                        variant="outline"
                        onClick={() => router.push('/admin/participants')}
                      >
                        <Eye className="h-4 w-4" />
                        {language === 'ar' ? 'عرض المشاركين' : 'View Participants'}
                      </Button>
                      <Button 
                        className="w-full justify-start gap-2" 
                        variant="outline"
                        onClick={() => router.push('/admin/judges')}
                      >
                        <Gavel className="h-4 w-4" />
                        {language === 'ar' ? 'إدارة الحكام' : 'Manage Judges'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
