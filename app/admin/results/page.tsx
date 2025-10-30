"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Star, Download, Share2, Eye, Users, BarChart3, Clock, CheckCircle, AlertCircle, Zap, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ExcelExporter } from '@/lib/excel-export'

interface Hackathon {
  id: string
  title: string
  evaluationOpen: boolean
  evaluationCriteria: Array<{
    id: string
    name: string
    description: string
    maxScore: number
  }>
}

interface TeamResult {
  id: string
  teamNumber: number
  name: string
  ideaTitle?: string
  ideaDescription?: string
  participants: Array<{
    user: { name: string }
    teamRole: string
  }>
  scores: Array<{
    criterionId: string
    score: number
    maxScore: number
    criterion: { name: string }
    judge: {
      user: { name: string, email: string }
    }
    createdAt: string
  }>
  totalScore: number
  averageScore: number
  evaluationsCount: number
  rank: number
}

interface JudgeActivity {
  id: string
  name: string
  email: string
  evaluatedTeams: number
  totalTeams: number
  lastActivity?: string
  isActive: boolean
  progress: number
}

interface JudgesSummary {
  totalJudges: number
  activeJudges: number
  completedEvaluations: number
  averageProgress: number
}

export default function ResultsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [results, setResults] = useState<TeamResult[]>([])
  const [judges, setJudges] = useState<JudgeActivity[]>([])
  const [judgesSummary, setJudgesSummary] = useState<JudgesSummary | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Wait until auth state is resolved to avoid redirecting early
    if (loading) return
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchHackathons()
  }, [user, loading, router])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons)
        if (data.hackathons.length > 0) {
          setSelectedHackathon(data.hackathons[0])
          fetchEvaluations(data.hackathons[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const fetchEvaluations = async (hackathonId: string) => {
    setRefreshing(true)
    try {
      const [evaluationsRes, judgesRes] = await Promise.all([
        fetch(`/api/admin/hackathons/${hackathonId}/evaluations`),
        fetch(`/api/admin/hackathons/${hackathonId}/judges-activity`)
      ])

      if (evaluationsRes.ok) {
        const evaluationsData = await evaluationsRes.json()
        const teamsWithRanks = evaluationsData.teams
          .sort((a: TeamResult, b: TeamResult) => b.totalScore - a.totalScore)
          .map((team: TeamResult, index: number) => ({
            ...team,
            rank: index + 1,
            evaluationsCount: team.scores.length
          }))
        setResults(teamsWithRanks)
      }

      if (judgesRes.ok) {
        const judgesData = await judgesRes.json()
        setJudges(judgesData.judges)
        setJudgesSummary(judgesData.summary)
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const exportToExcel = async () => {
    if (!selectedHackathon || results.length === 0) {
      alert('لا توجد بيانات للتصدير')
      return
    }

    try {
      // Prepare results data
      const resultsData = results.map(team => ({
        rank: team.rank,
        teamName: team.name,
        teamNumber: team.teamNumber,
        projectName: team.projectName || 'غير محدد',
        totalScore: team.totalScore?.toFixed(2) || '0.00',
        evaluationsCount: team.evaluationsCount || 0,
        membersCount: team.participants?.length || 0,
        members: team.participants?.map(p => p.user.name).join(', ') || 'غير محدد'
      }))

      // Prepare judges summary data
      const judgesData = judgesSummary?.map(judge => ({
        judgeName: judge.name,
        judgeEmail: judge.email,
        totalEvaluations: judge.totalEvaluations,
        averageScore: judge.averageScore?.toFixed(2) || '0.00',
        lastEvaluation: judge.lastEvaluation
      })) || []

      await ExcelExporter.exportMultipleSheets(`نتائج_${selectedHackathon.title}.xlsx`, [
        {
          name: 'النتائج النهائية',
          columns: [
            { key: 'rank', header: 'الترتيب', width: 10, format: 'number' },
            { key: 'teamName', header: 'اسم الفريق', width: 20 },
            { key: 'teamNumber', header: 'رقم الفريق', width: 12 },
            { key: 'projectName', header: 'اسم المشروع', width: 25 },
            { key: 'totalScore', header: 'النتيجة الإجمالية', width: 15 },
            { key: 'evaluationsCount', header: 'عدد التقييمات', width: 15, format: 'number' },
            { key: 'membersCount', header: 'عدد الأعضاء', width: 12, format: 'number' },
            { key: 'members', header: 'أعضاء الفريق', width: 40 }
          ],
          data: resultsData
        },
        {
          name: 'ملخص المحكمين',
          columns: [
            { key: 'judgeName', header: 'اسم المحكم', width: 20 },
            { key: 'judgeEmail', header: 'البريد الإلكتروني', width: 25 },
            { key: 'totalEvaluations', header: 'عدد التقييمات', width: 15, format: 'number' },
            { key: 'averageScore', header: 'متوسط النتيجة', width: 15 },
            { key: 'lastEvaluation', header: 'آخر تقييم', width: 18, format: 'date' }
          ],
          data: judgesData
        }
      ])
    } catch (error) {
      console.error('Error exporting results:', error)
      alert('حدث خطأ في تصدير البيانات')
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2: return <Medal className="w-6 h-6 text-gray-400" />
      case 3: return <Award className="w-6 h-6 text-orange-500" />
      default: return <span className="w-6 h-6 flex items-center justify-center text-[#01645e] font-bold">{rank}</span>
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري تحميل النتائج...</p>
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
              <h1 className="text-3xl font-bold text-[#01645e] mb-2">🏆 لوحة تحكم التقييم</h1>
              <p className="text-[#8b7632]">مراقبة شاملة للتقييمات والنتائج في الوقت الفعلي</p>
              {selectedHackathon && (
                <div className="mt-2">
                  <Badge className="bg-[#3ab666] text-white">
                    {selectedHackathon.title}
                  </Badge>
                  <Badge className={`mr-2 ${selectedHackathon.evaluationOpen ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {selectedHackathon.evaluationOpen ? '🟢 التقييم مفتوح' : '🔴 التقييم مغلق'}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => selectedHackathon && fetchEvaluations(selectedHackathon.id)}
                disabled={refreshing}
                className="bg-[#01645e] hover:bg-[#01645e]/90"
              >
                {refreshing ? (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 ml-2" />
                )}
                تحديث البيانات
              </Button>
              <Button
                onClick={exportToExcel}
                disabled={!selectedHackathon || results.length === 0}
                className="bg-[#3ab666] hover:bg-[#3ab666]/90"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير النتائج ({results.length})
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {judgesSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="border-[#01645e]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8b7632]">إجمالي المحكمين</p>
                    <p className="text-2xl font-bold text-[#01645e]">{judgesSummary.totalJudges}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#3ab666]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#3ab666]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8b7632]">المحكمين النشطين</p>
                    <p className="text-2xl font-bold text-[#3ab666]">{judgesSummary.activeJudges}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#c3e956]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8b7632]">التقييمات المكتملة</p>
                    <p className="text-2xl font-bold text-[#c3e956]">{judgesSummary.completedEvaluations}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-[#c3e956]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8b7632]">متوسط التقدم</p>
                    <p className="text-2xl font-bold text-yellow-600">{judgesSummary.averageProgress}%</p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="teams">ترتيب الفرق</TabsTrigger>
              <TabsTrigger value="judges">نشاط المحكمين</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Teams */}
                <Card className="border-[#01645e]/20">
                  <CardHeader>
                    <CardTitle className="text-[#01645e] flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      أفضل 5 فرق
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.slice(0, 5).map((team) => (
                        <div key={team.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-[#c3e956]/10 to-[#3ab666]/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getRankIcon(team.rank)}
                            <div>
                              <p className="font-semibold text-[#01645e]">{team.name}</p>
                              <p className="text-sm text-[#8b7632]">فريق رقم {team.teamNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#01645e]">{team.totalScore.toFixed(1)}</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    team.averageScore >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Judge Activity Summary */}
                <Card className="border-[#3ab666]/20">
                  <CardHeader>
                    <CardTitle className="text-[#01645e] flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      ملخص نشاط المحكمين
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {judges.slice(0, 5).map((judge) => (
                        <div key={judge.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 rounded-lg">
                          <div>
                            <p className="font-semibold text-[#01645e]">{judge.name}</p>
                            <p className="text-sm text-[#8b7632]">{judge.evaluatedTeams} من {judge.totalTeams} فريق</p>
                          </div>
                          <div className="text-right">
                            <div className={`w-16 h-2 rounded-full bg-gray-200 overflow-hidden`}>
                              <div
                                className={`h-full ${getProgressColor(judge.progress)} transition-all duration-300`}
                                style={{ width: `${judge.progress}%` }}
                              />
                            </div>
                            <p className="text-sm text-[#8b7632] mt-1">{judge.progress}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="mt-6">
              <Card className="border-[#01645e]/20">
                <CardHeader>
                  <CardTitle className="text-[#01645e] flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    ترتيب الفرق النهائي
                  </CardTitle>
                  <CardDescription>
                    جميع الفرق مرتبة حسب النتائج مع تفاصيل التقييم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الترتيب</TableHead>
                          <TableHead className="text-right">الفريق</TableHead>
                          <TableHead className="text-right">الأعضاء</TableHead>
                          <TableHead className="text-right">فكرة المشروع</TableHead>
                          <TableHead className="text-right">النتيجة الإجمالية</TableHead>
                          <TableHead className="text-right">المتوسط</TableHead>
                          <TableHead className="text-right">عدد التقييمات</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((team) => (
                          <TableRow key={team.id} className="hover:bg-[#c3e956]/5">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getRankIcon(team.rank)}
                                <span className="font-semibold">#{team.rank}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-[#01645e]">{team.name}</p>
                                <p className="text-sm text-[#8b7632]">فريق رقم {team.teamNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {team.participants.map((participant, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="text-[#01645e]">{participant.user.name}</span>
                                    <span className="text-[#8b7632] mr-1">({participant.teamRole})</span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {team.ideaTitle ? (
                                <div>
                                  <p className="font-medium text-[#01645e]">{team.ideaTitle}</p>
                                  {team.ideaDescription && (
                                    <p className="text-sm text-[#8b7632] mt-1 line-clamp-2">
                                      {team.ideaDescription}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">لم يتم رفع الفكرة</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <p className="text-xl font-bold text-[#01645e]">{team.totalScore.toFixed(1)}</p>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3 h-3 ${
                                        team.averageScore >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-[#3ab666]">{team.averageScore.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-[#c3e956] text-[#01645e]">
                                {team.evaluationsCount} تقييم
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" className="border-[#01645e] text-[#01645e]">
                                <Eye className="w-4 h-4 ml-1" />
                                التفاصيل
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Judges Tab */}
            <TabsContent value="judges" className="mt-6">
              <Card className="border-[#3ab666]/20">
                <CardHeader>
                  <CardTitle className="text-[#01645e] flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    نشاط المحكمين التفصيلي
                  </CardTitle>
                  <CardDescription>
                    مراقبة تقدم كل محكم في تقييم الفرق
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {judges.map((judge) => (
                      <motion.div
                        key={judge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-white to-[#c3e956]/5 rounded-xl p-6 border border-[#01645e]/10 shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${judge.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <h3 className="font-semibold text-[#01645e]">{judge.name}</h3>
                              <p className="text-sm text-[#8b7632]">{judge.email}</p>
                            </div>
                          </div>
                          <Badge className={judge.isActive ? 'bg-green-500' : 'bg-red-500'}>
                            {judge.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-[#8b7632]">التقدم</span>
                              <span className="text-sm font-semibold text-[#01645e]">{judge.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-full ${getProgressColor(judge.progress)} transition-all duration-500`}
                                style={{ width: `${judge.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-[#01645e]/5 rounded-lg">
                              <p className="text-2xl font-bold text-[#01645e]">{judge.evaluatedTeams}</p>
                              <p className="text-xs text-[#8b7632]">فريق مقيم</p>
                            </div>
                            <div className="text-center p-3 bg-[#3ab666]/5 rounded-lg">
                              <p className="text-2xl font-bold text-[#3ab666]">{judge.totalTeams - judge.evaluatedTeams}</p>
                              <p className="text-xs text-[#8b7632]">فريق متبقي</p>
                            </div>
                          </div>

                          {judge.lastActivity && (
                            <div className="flex items-center gap-2 text-sm text-[#8b7632]">
                              <Clock className="w-4 h-4" />
                              <span>آخر نشاط: {formatTimeAgo(judge.lastActivity)}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-center">
                            {judge.progress === 100 ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-semibold">مكتمل</span>
                              </div>
                            ) : judge.progress === 0 ? (
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-semibold">لم يبدأ</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-yellow-600">
                                <Clock className="w-5 h-5" />
                                <span className="font-semibold">قيد التقييم</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {judges.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">لا يوجد محكمين</h3>
                      <p className="text-gray-500">لم يتم تعيين محكمين لهذا الهاكاثون بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
