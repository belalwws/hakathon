'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Users, Star, Download, Mail, FileText } from 'lucide-react'

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
  totalScore: number
  averageScore: number
  evaluationsCount: number
  rank: number
}

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
}

export default function ResultsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [results, setResults] = useState<TeamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingEmails, setSendingEmails] = useState(false)

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
        if (data.hackathons?.length > 0) {
          setSelectedHackathon(data.hackathons[0])
          fetchResults(data.hackathons[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async (hackathonId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/evaluations`)
      if (response.ok) {
        const data = await response.json()
        const teamsWithRanks = data.teams
          .sort((a: TeamResult, b: TeamResult) => b.totalScore - a.totalScore)
          .map((team: TeamResult, index: number) => ({
            ...team,
            rank: index + 1
          }))
        setResults(teamsWithRanks)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHackathonChange = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon)
    fetchResults(hackathon.id)
  }

  const sendCertificatesAndEmails = async () => {
    if (!selectedHackathon) return
    
    setSendingEmails(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon.id}/send-certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        alert('تم إرسال الشهادات والإيميلات بنجاح!')
      } else {
        alert('حدث خطأ في إرسال الشهادات')
      }
    } catch (error) {
      console.error('Error sending certificates:', error)
      alert('حدث خطأ في إرسال الشهادات')
    } finally {
      setSendingEmails(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />
      default:
        return <div className="w-8 h-8 bg-[#01645e] rounded-full flex items-center justify-center text-white font-bold">{rank}</div>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600'
      case 2:
        return 'from-gray-300 to-gray-500'
      case 3:
        return 'from-amber-400 to-amber-600'
      default:
        return 'from-[#01645e] to-[#3ab666]'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto"></div>
          <p className="mt-4 text-[#01645e] text-xl">جاري تحميل النتائج...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl w-24 h-24 mx-auto flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-4">
            🏆 نتائج الهاكاثون
          </h1>
          <p className="text-[#8b7632] text-xl">النتائج النهائية وترتيب الفرق المتنافسة</p>
        </motion.div>

        {/* Hackathon Selection */}
        {hackathons.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-xl font-bold text-[#01645e] mb-4">اختر الهاكاثون:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hackathons.map((hackathon) => (
                  <button
                    key={hackathon.id}
                    onClick={() => handleHackathonChange(hackathon)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedHackathon?.id === hackathon.id
                        ? 'border-[#01645e] bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10'
                        : 'border-gray-200 hover:border-[#01645e]/50'
                    }`}
                  >
                    <h4 className="font-bold text-[#01645e]">{hackathon.title}</h4>
                    <p className="text-sm text-[#8b7632] mt-1">{hackathon.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {selectedHackathon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={sendCertificatesAndEmails}
                  disabled={sendingEmails}
                  className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  {sendingEmails ? 'جاري الإرسال...' : 'إرسال الشهادات والإيميلات'}
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] hover:from-[#2d8f52] hover:to-[#a8d142] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  طباعة النتائج
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {selectedHackathon && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-2xl font-bold text-[#01645e] mb-6 text-center">
                نتائج {selectedHackathon.title}
              </h2>
              
              <div className="space-y-4">
                {results.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-r ${getRankColor(team.rank)} p-1 rounded-2xl shadow-lg`}
                  >
                    <div className="bg-white rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {getRankIcon(team.rank)}
                          <div>
                            <h3 className="text-xl font-bold text-[#01645e]">{team.name}</h3>
                            <p className="text-[#8b7632]">فريق رقم {team.teamNumber}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-2xl font-bold text-[#01645e]">{team.totalScore.toFixed(2)}</div>
                          <div className="text-sm text-[#8b7632]">النتيجة النهائية</div>
                        </div>
                      </div>

                      {team.ideaTitle && (
                        <div className="mb-4">
                          <h4 className="font-bold text-[#01645e] mb-2">فكرة المشروع:</h4>
                          <p className="text-[#8b7632]">{team.ideaTitle}</p>
                          {team.ideaDescription && (
                            <p className="text-sm text-[#8b7632] mt-1">{team.ideaDescription}</p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-[#01645e] mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            أعضاء الفريق:
                          </h4>
                          <div className="space-y-1">
                            {team.participants.map((participant, idx) => (
                              <div key={idx} className="text-sm text-[#8b7632]">
                                {participant.user.name} - {participant.teamRole}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-[#01645e] mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            تفاصيل التقييم:
                          </h4>
                          <div className="text-sm text-[#8b7632] space-y-1">
                            <div>المتوسط: {team.averageScore.toFixed(2)}</div>
                            <div>عدد التقييمات: {team.evaluationsCount}</div>
                            <div>الترتيب: #{team.rank}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedHackathon && results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-[#01645e]/20 shadow-xl">
              <FileText className="w-16 h-16 text-[#8b7632] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#01645e] mb-2">لا توجد نتائج متاحة</h3>
              <p className="text-[#8b7632]">لم يتم العثور على نتائج لهذا الهاكاثون بعد</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
