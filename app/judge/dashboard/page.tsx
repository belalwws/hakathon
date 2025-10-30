"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Users, CheckCircle, Clock, Award, BarChart3, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface JudgeStats {
  totalTeams: number
  evaluatedTeams: number
  pendingTeams: number
  averageScore: number
  myEvaluations: Array<{
    teamId: string
    teamName: string
    teamNumber: number
    score: number
    evaluatedAt: string
    category: string
  }>
}

export default function JudgeDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<JudgeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'judge') {
      router.push('/login')
      return
    }
    fetchJudgeStats()
  }, [user, router])

  const fetchJudgeStats = async () => {
    try {
      // Mock data for judge dashboard
      const mockStats: JudgeStats = {
        totalTeams: 18,
        evaluatedTeams: 12,
        pendingTeams: 6,
        averageScore: 4.2,
        myEvaluations: [
          {
            teamId: '1',
            teamName: 'فريق الابتكار',
            teamNumber: 1,
            score: 4.8,
            evaluatedAt: new Date().toISOString(),
            category: 'الذكاء الاصطناعي'
          },
          {
            teamId: '2',
            teamName: 'فريق التقنية',
            teamNumber: 2,
            score: 4.5,
            evaluatedAt: new Date(Date.now() - 86400000).toISOString(),
            category: 'تطبيقات الويب'
          },
          {
            teamId: '3',
            teamName: 'فريق المستقبل',
            teamNumber: 3,
            score: 4.2,
            evaluatedAt: new Date(Date.now() - 172800000).toISOString(),
            category: 'إنترنت الأشياء'
          }
        ]
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching judge stats:', error)
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

  const completionPercentage = stats ? (stats.evaluatedTeams / stats.totalTeams) * 100 : 0

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
            <h1 className="text-4xl font-bold text-[#01645e] mb-2">لوحة تحكم المحكم</h1>
            <p className="text-[#8b7632] text-lg">مرحباً {user?.name}، تقييم مشاريع الهاكاثون</p>
          </div>
          
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Link href="/judge/evaluate">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Star className="w-5 h-5 ml-2" />
                بدء التقييم
              </Button>
            </Link>
            <Link href="/judge/results">
              <Button variant="outline">
                <BarChart3 className="w-5 h-5 ml-2" />
                عرض النتائج
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">تقدم التقييم</h3>
                  <p className="text-white/80">تم تقييم {stats?.evaluatedTeams} من {stats?.totalTeams} فريق</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{completionPercentage.toFixed(0)}%</div>
                  <div className="text-white/80">مكتمل</div>
                </div>
              </div>
              <Progress value={completionPercentage} className="h-3 bg-white/20" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">إجمالي الفرق</p>
                  <p className="text-3xl font-bold text-[#01645e]">{stats?.totalTeams || 0}</p>
                </div>
                <Users className="w-8 h-8 text-[#01645e]" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">تم التقييم</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.evaluatedTeams || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">في الانتظار</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.pendingTeams || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8b7632]">متوسط تقييمي</p>
                  <p className="text-3xl font-bold text-purple-600">{stats?.averageScore.toFixed(1) || '0.0'}</p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Link href="/judge/evaluate">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-[#01645e] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">تقييم الفرق</h3>
                <p className="text-[#8b7632] text-sm">تقييم مشاريع الفرق المشاركة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/judge/teams">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-[#3ab666] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">عرض الفرق</h3>
                <p className="text-[#8b7632] text-sm">استعراض جميع الفرق المشاركة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/judge/results">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-[#c3e956] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#01645e] mb-2">النتائج</h3>
                <p className="text-[#8b7632] text-sm">عرض نتائج التقييم</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Recent Evaluations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-[#01645e]">آخر التقييمات</CardTitle>
                  <CardDescription>التقييمات التي قمت بها مؤخراً</CardDescription>
                </div>
                <Link href="/judge/my-evaluations">
                  <Button variant="outline">
                    عرض الكل
                    <FileText className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.myEvaluations?.map((evaluation, index) => (
                  <motion.div
                    key={evaluation.teamId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#01645e]">{evaluation.teamName}</h4>
                        <p className="text-sm text-[#8b7632]">
                          فريق رقم {evaluation.teamNumber} • {evaluation.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#01645e]">{evaluation.score.toFixed(1)}</div>
                        <div className="text-xs text-[#8b7632]">من 5.0</div>
                      </div>
                      <div className="text-sm text-[#8b7632]">
                        {new Date(evaluation.evaluatedAt).toLocaleDateString('ar-SA')}
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )) || (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 text-[#8b7632] mx-auto mb-4 opacity-50" />
                    <p className="text-[#8b7632]">لم تقم بأي تقييمات بعد</p>
                    <Link href="/judge/evaluate">
                      <Button className="mt-4">
                        ابدأ التقييم الآن
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
