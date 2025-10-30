"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Star, Users, TrendingUp, Download, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Feedback {
  id: string
  participantName: string
  participantEmail: string
  overallRating: number
  responses: Record<string, any>
  suggestions?: string
  createdAt: string
}

interface FeedbackStats {
  totalResponses: number
  averageRating: number
  ratingDistribution: Record<number, number>
  responseRate: number
}

export default function FeedbackResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const hackathonId = params.hackathonId as string

  const [loading, setLoading] = useState(true)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [hackathonTitle, setHackathonTitle] = useState("")
  const [ratingScale, setRatingScale] = useState(5)

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchFeedbacks()
  }, [hackathonId, user])

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`/api/admin/feedback-results/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data.feedbacks)
        setStats(data.stats)
        setHackathonTitle(data.hackathonTitle)
        setRatingScale(data.ratingScale)
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (feedbacks.length === 0) return

    const headers = ['الاسم', 'البريد الإلكتروني', 'التقييم العام', 'الاقتراحات', 'التاريخ']
    const rows = feedbacks.map(f => [
      f.participantName,
      f.participantEmail,
      f.overallRating,
      f.suggestions || '',
      new Date(f.createdAt).toLocaleDateString('ar-EG')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `feedback_${hackathonTitle}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-purple-900 mb-2">نتائج تقييم الهاكاثون</h1>
              <p className="text-purple-600 text-lg">{hackathonTitle}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={exportToCSV}
                disabled={feedbacks.length === 0}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-purple-600 text-purple-600"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                رجوع
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm mb-1">إجمالي الردود</p>
                      <p className="text-4xl font-bold">{stats.totalResponses}</p>
                    </div>
                    <Users className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm mb-1">متوسط التقييم</p>
                      <p className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</p>
                      <p className="text-pink-100 text-xs">من {ratingScale}</p>
                    </div>
                    <Star className="w-12 h-12 text-pink-200 fill-pink-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">نسبة الاستجابة</p>
                      <p className="text-4xl font-bold">{stats.responseRate.toFixed(0)}%</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div>
                    <p className="text-green-100 text-sm mb-3">توزيع التقييمات</p>
                    <div className="space-y-1">
                      {Object.entries(stats.ratingDistribution)
                        .sort(([a], [b]) => parseInt(b) - parseInt(a))
                        .slice(0, 3)
                        .map(([rating, count]) => (
                          <div key={rating} className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                            <span>{rating} نجوم:</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Feedbacks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                جميع التقييمات ({feedbacks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">لا توجد تقييمات بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback, index) => (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-6 border rounded-xl hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-50 to-pink-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-purple-900">{feedback.participantName}</h3>
                          <p className="text-sm text-purple-600">{feedback.participantEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(feedback.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full">
                          <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                          <span className="font-bold text-lg">{feedback.overallRating}</span>
                          <span className="text-sm">/ {ratingScale}</span>
                        </div>
                      </div>

                      {feedback.suggestions && (
                        <div className="mt-4 p-4 bg-white rounded-lg border-r-4 border-purple-500">
                          <p className="text-sm font-semibold text-purple-900 mb-2">💬 الاقتراحات والملاحظات:</p>
                          <p className="text-gray-700">{feedback.suggestions}</p>
                        </div>
                      )}

                      {Object.keys(feedback.responses).length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-semibold text-purple-900">📋 الإجابات الإضافية:</p>
                          <div className="grid gap-2">
                            {Object.entries(feedback.responses).map(([key, value]) => (
                              <div key={key} className="p-3 bg-white rounded-lg text-sm">
                                <span className="text-gray-600">{key}:</span>
                                <span className="text-gray-900 font-medium mr-2">{value}</span>
                              </div>
                            ))}
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
      </div>
    </div>
  )
}

