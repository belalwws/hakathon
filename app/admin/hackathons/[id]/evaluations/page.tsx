"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Star, Users, FileText, Award, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'

interface EvaluationData {
  hackathon: {
    id: string
    title: string
    evaluationCriteria: Array<{
      id: string
      name: string
      description: string
      maxScore: number
    }>
  }
  teams: Array<{
    id: string
    name: string
    teamNumber: number
    participants: Array<{
      user: { name: string }
      teamRole: string
    }>
    ideaTitle?: string
    ideaDescription?: string
    scores: Array<{
      criterionId: string
      score: number
      maxScore: number
      criterion: {
        name: string
      }
      judge: {
        user: {
          name: string
          email: string
        }
      }
      createdAt: string
    }>
    totalScore: number
    averageScore: number
  }>
}

export default function EvaluationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }

    if (resolvedParams) {
      fetchEvaluations()
    }
  }, [user, resolvedParams])

  const fetchEvaluations = async () => {
    if (!resolvedParams) return

    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}/evaluations`)
      if (response.ok) {
        const data = await response.json()
        setEvaluationData(data)
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#2d1b69] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c3e956]/20 border-t-[#c3e956] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">جاري تحميل التقييمات...</p>
        </div>
      </div>
    )
  }

  if (!evaluationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#2d1b69] flex items-center justify-center">
        <div className="text-center text-white">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <h3 className="text-xl font-semibold mb-2">لا توجد تقييمات</h3>
          <p className="text-white/70">لم يتم العثور على تقييمات لهذا الهاكاثون</p>
        </div>
      </div>
    )
  }

  const sortedTeams = [...evaluationData.teams].sort((a, b) => b.totalScore - a.totalScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#2d1b69] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#01645e]/20 to-[#3ab666]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl">
                <BarChart3 className="w-16 h-16 text-white mx-auto" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-[#c3e956] to-[#3ab666] bg-clip-text text-transparent mb-4">
              نتائج التقييم
            </h1>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-2">{evaluationData.hackathon.title}</h2>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-blue-300/30">
                  <span className="text-blue-200 text-sm">إجمالي الفرق</span>
                  <div className="text-white font-bold text-lg">{evaluationData.teams.length}</div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-300/30">
                  <span className="text-green-200 text-sm">معايير التقييم</span>
                  <div className="text-white font-bold text-lg">{evaluationData.hackathon.evaluationCriteria.length}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Teams Rankings */}
          <div className="grid gap-6">
            {sortedTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl ${
                  index === 0 ? 'ring-4 ring-yellow-400/50' : 
                  index === 1 ? 'ring-4 ring-gray-300/50' : 
                  index === 2 ? 'ring-4 ring-orange-400/50' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                  {/* Rank & Team Info */}
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900' :
                      'bg-white/20 text-white'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                      <p className="text-white/70">فريق رقم {team.teamNumber}</p>
                      {team.ideaTitle && (
                        <p className="text-[#c3e956] font-semibold mt-1">{team.ideaTitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-1 lg:text-center">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                      <div className="text-3xl font-bold text-white mb-2">
                        {team.totalScore.toFixed(1)} / {evaluationData.hackathon.evaluationCriteria.reduce((sum, c) => sum + c.maxScore, 0)}
                      </div>
                      <div className="text-white/70">النتيجة الإجمالية</div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              team.averageScore >= star ? 'text-yellow-400 fill-current' : 'text-white/30'
                            }`}
                          />
                        ))}
                        <span className="text-white/70 text-sm mr-2">({team.averageScore.toFixed(1)})</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h4 className="text-white font-semibold mb-3">تفاصيل التقييم</h4>
                      <div className="space-y-3">
                        {team.scores.map((score, idx) => {
                          // Convert score back to stars for display
                          const stars = (score.score / score.maxScore) * 5
                          return (
                            <div key={`${score.criterionId}-${idx}`} className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <span className="text-white/90 text-sm font-medium">{score.criterion.name}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[#c3e956] text-xs">👤 {score.judge.user.name}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${
                                          stars >= star ? 'text-yellow-400 fill-current' : 'text-white/30'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-white text-sm font-semibold">
                                    {score.score}/{score.maxScore}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
