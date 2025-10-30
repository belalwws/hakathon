"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, FileText, Star, ChevronLeft, ChevronRight, Save, BarChart3, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal'

interface EvaluationCriterion {
  id: string
  name: string
  description?: string
  maxScore: number
}

interface Team {
  id: string
  name: string
  teamNumber: number
  ideaTitle?: string
  ideaDescription?: string
  ideaFile?: string
  participants: Array<{
    id: string
    teamRole: string
    user: {
      name: string
      preferredRole?: string
    }
  }>
}

interface JudgeSettings {
  showTeamNames: boolean
  showProjectTitles: boolean
  showProjectDescriptions: boolean
  showPresentationFiles: boolean
  showTeamMembers: boolean
  allowFileDownload: boolean
  evaluationOnly: boolean
  showPreviousScores: boolean
  anonymousMode: boolean
  customMessage: string
}

interface Hackathon {
  id: string
  title: string
  evaluationOpen: boolean
  evaluationCriteria: EvaluationCriterion[]
  teams: Team[]
  judgeSettings?: JudgeSettings
}

export default function JudgeEvaluation() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0)
  const [scores, setScores] = useState<{ [criterionId: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showSuccess, showError, showInfo, ModalComponents } = useModal()

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'judge') return
    fetchHackathons()
  }, [user, authLoading])

  // Reset criterion index when team changes
  useEffect(() => {
    setCurrentCriterionIndex(0)
  }, [currentTeamIndex])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/judge/hackathons')
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        const hackathonsWithSettings = await Promise.all(
          (data.hackathons || []).map(async (hackathon: Hackathon) => {
            try {
              const settingsResponse = await fetch(`/api/admin/hackathons/${hackathon.id}/judge-settings`)
              if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json()
                return { ...hackathon, judgeSettings: settingsData.settings }
              }
            } catch (error) {
              console.error('Error fetching judge settings for hackathon:', hackathon.id, error)
            }
            return hackathon
          })
        )
        setHackathons(hackathonsWithSettings)
        if (hackathonsWithSettings.length > 0) {
          setSelectedHackathon(hackathonsWithSettings[0])
        }
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentTeam = selectedHackathon?.teams[currentTeamIndex]
  const currentCriterion = selectedHackathon?.evaluationCriteria[currentCriterionIndex]
  const judgeSettings = selectedHackathon?.judgeSettings || {
    showTeamNames: true,
    showProjectTitles: true,
    showProjectDescriptions: true,
    showPresentationFiles: true,
    showTeamMembers: true,
    allowFileDownload: true,
    evaluationOnly: false,
    showPreviousScores: false,
    anonymousMode: false,
    customMessage: ''
  }

  const handleScoreChange = (criterionId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: score
    }))
  }

  const goToNext = async () => {
    if (!selectedHackathon) return

    // If not the last criterion, go to next criterion
    if (currentCriterionIndex < selectedHackathon.evaluationCriteria.length - 1) {
      setCurrentCriterionIndex(prev => prev + 1)
    }
    // If last criterion and not last team, go to next team
    else if (currentTeamIndex < selectedHackathon.teams.length - 1) {
      goToNextTeam()
    }
    // If last criterion of last team, save final evaluation and show completion message
    else {
      // Save the final team evaluation first
      const saved = await saveEvaluation(false)
      if (saved) {
        showSuccess("🎉 تهانينا! لقد أكملت تقييم جميع الفرق بنجاح!\n\nشكراً لك على جهودك في التقييم.", "🏆 تم إكمال التقييم")
        // Optionally redirect to judge dashboard
        // router.push('/judge')
      } else {
        showError("يجب إكمال تقييم جميع المعايير قبل إنهاء التقييم")
      }
    }
  }

  const goToPrevious = () => {
    if (!selectedHackathon) return

    // If not the first criterion, go to previous criterion
    if (currentCriterionIndex > 0) {
      setCurrentCriterionIndex(prev => prev - 1)
    }
    // If first criterion and not first team, go to previous team (last criterion)
    else if (currentTeamIndex > 0) {
      goToPreviousTeam()
      setCurrentCriterionIndex(selectedHackathon.evaluationCriteria.length - 1)
    }
  }

  const isLastStep = selectedHackathon ?
    (currentCriterionIndex === selectedHackathon.evaluationCriteria.length - 1 &&
     currentTeamIndex === selectedHackathon.teams.length - 1) : false
  const isFirstStep = currentCriterionIndex === 0 && currentTeamIndex === 0

  const getNextButtonText = () => {
    if (!selectedHackathon) return "التالي"

    if (currentCriterionIndex < selectedHackathon.evaluationCriteria.length - 1) {
      return "المعيار التالي"
    } else if (currentTeamIndex < selectedHackathon.teams.length - 1) {
      return "الفريق التالي"
    } else {
      return "إنهاء التقييم"
    }
  }

  const saveEvaluation = async (showAlert = true) => {
    if (!currentTeam || !selectedHackathon) return false

    // Check if all criteria are scored
    const missingScores = selectedHackathon.evaluationCriteria.filter(
      criterion => !scores[criterion.id] || scores[criterion.id] < 1
    )

    if (missingScores.length > 0) {
      if (showAlert) {
        alert("يجب تقييم جميع المعايير قبل الانتقال للفريق التالي")
      }
      return false
    }

    setSaving(true)
    try {
      const response = await fetch('/api/judge/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId: selectedHackathon.id,
          teamId: currentTeam.id,
          scores: scores
        })
      })

      if (response.ok) {
        if (showAlert) {
          showSuccess("تم حفظ التقييم بنجاح!")
        }
        setScores({}) // Clear scores for next team
        setCurrentCriterionIndex(0) // Reset to first criterion
        return true
      } else {
        const error = await response.json()
        if (showAlert) {
          showError(error.error || "فشل في حفظ التقييم")
        }
        return false
      }
    } catch (error) {
      console.error('Error saving evaluation:', error)
      if (showAlert) {
        showError("حدث خطأ في حفظ التقييم")
      }
      return false
    } finally {
      setSaving(false)
    }
  }

  const goToNextTeam = async () => {
    if (!selectedHackathon || currentTeamIndex >= selectedHackathon.teams.length - 1) return

    // Check if current team evaluation is complete
    const missingScores = selectedHackathon.evaluationCriteria.filter(
      criterion => !scores[criterion.id] || scores[criterion.id] < 1
    )

    if (missingScores.length > 0) {
      alert(`يجب إكمال تقييم جميع المعايير قبل الانتقال للفريق التالي.\nالمعايير المتبقية: ${missingScores.length}`)
      return
    }

    // Save current team evaluation
    const saved = await saveEvaluation(false)
    if (saved) {
      setCurrentTeamIndex(prev => prev + 1)
      setCurrentCriterionIndex(0) // Start from first criterion for new team

      // Scroll to top smoothly to show new team info
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  const goToPreviousTeam = async () => {
    if (!selectedHackathon || currentTeamIndex <= 0) return

    // Check if current team has any scores
    const hasScores = selectedHackathon.evaluationCriteria.some(
      criterion => scores[criterion.id] && scores[criterion.id] > 0
    )

    if (hasScores) {
      const confirmMove = window.confirm(
        `سيتم فقدان التقييمات الحالية للفريق.\nهل تريد العودة للفريق السابق؟`
      )
      if (!confirmMove) return
    }

    // Move to previous team and clear scores
    setScores({})
    setCurrentTeamIndex(prev => prev - 1)
    // Don't reset criterion index - let user continue from where they were

    // Scroll to top smoothly to show new team info
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
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

  if (!selectedHackathon || !selectedHackathon.evaluationOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#2d1b69] flex items-center justify-center">
        <div className="text-center text-white">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <h3 className="text-xl font-semibold mb-2">التقييم غير متاح</h3>
          <p className="text-white/70">
            {hackathons.length === 0 ? 
              'لا توجد هاكاثونات متاحة للتقييم' :
              'التقييم مغلق حالياً. يرجى المحاولة لاحقاً'
            }
          </p>
        </div>
      </div>
    )
  }

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#2d1b69] flex items-center justify-center">
        <div className="text-center text-white">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <h3 className="text-xl font-semibold mb-2">لا توجد فرق للتقييم</h3>
          <p className="text-white/70">تم الانتهاء من تقييم جميع الفرق</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#c3e956]/30 to-[#3ab666]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#01645e]/30 to-[#3ab666]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#c3e956]/20 to-[#01645e]/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl">
                <Trophy className="w-16 h-16 text-white mx-auto" />
              </div>
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mt-6 mb-4">
              تقييم الفرق المتنافسة
            </h1>

            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 max-w-2xl mx-auto border border-[#01645e]/20 shadow-xl">
              <h2 className="text-2xl font-semibold text-[#01645e] mb-2">{selectedHackathon.title}</h2>

              {/* Custom Message for Judges */}
              {judgeSettings.customMessage && (
                <div className="bg-gradient-to-r from-[#c3e956]/10 to-[#3ab666]/10 border border-[#3ab666]/20 rounded-xl p-4 mb-4">
                  <p className="text-[#01645e] text-center font-medium">{judgeSettings.customMessage}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-[#01645e]/30">
                  <span className="text-[#01645e] text-sm font-medium">الفريق الحالي</span>
                  <div className="text-[#01645e] font-bold text-lg">{currentTeamIndex + 1} من {selectedHackathon.teams.length}</div>
                </div>
                <div className="bg-gradient-to-r from-[#3ab666]/10 to-[#c3e956]/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-[#3ab666]/30">
                  <span className="text-[#3ab666] text-sm font-medium">المعيار الحالي</span>
                  <div className="text-[#3ab666] font-bold text-lg">{currentCriterionIndex + 1} من {selectedHackathon.evaluationCriteria.length}</div>
                </div>
                <div className="bg-gradient-to-r from-[#c3e956]/10 to-[#01645e]/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-[#c3e956]/30">
                  <span className="text-[#8b7632] text-sm font-medium">تقدم الفريق</span>
                  <div className="text-[#8b7632] font-bold text-lg">{Math.round(((currentTeamIndex) / selectedHackathon.teams.length) * 100)}%</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Team Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-[#01645e]/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-[#01645e]/30">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-[#01645e] font-bold text-xl">{currentTeam.teamNumber}</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#01645e]">
                      {judgeSettings.anonymousMode ? `فريق رقم ${currentTeam.teamNumber}` :
                       judgeSettings.showTeamNames ? currentTeam.name : `فريق رقم ${currentTeam.teamNumber}`}
                    </h2>
                    <p className="text-[#8b7632]">فريق رقم {currentTeam.teamNumber}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Team Members */}
                {judgeSettings.showTeamMembers && !judgeSettings.evaluationOnly && (
                  <div className="bg-gradient-to-br from-[#01645e]/5 to-[#3ab666]/5 backdrop-blur-sm rounded-2xl p-6 border border-[#01645e]/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[#01645e]">أعضاء الفريق</h3>
                    </div>
                    <div className="space-y-4">
                      {currentTeam.participants.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-4 bg-white/80 rounded-xl p-4 border border-[#01645e]/10 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full flex items-center justify-center shadow-md">
                            <span className="text-[#01645e] font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-[#01645e] font-semibold">
                              {judgeSettings.anonymousMode ? `عضو ${index + 1}` : participant.user.name}
                            </p>
                            <p className="text-[#8b7632] text-sm">{participant.teamRole}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}


              </div>
            </div>
          </motion.div>

          {/* Enhanced Evaluation Criteria */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 border border-[#01645e]/20 shadow-xl">
                <Star className="w-8 h-8 text-[#c3e956]" />
                <div>
                  <h3 className="text-2xl font-bold text-[#01645e]">تقييم المعايير</h3>
                  <p className="text-[#8b7632]">معيار {currentCriterionIndex + 1} من {selectedHackathon.evaluationCriteria.length}</p>
                </div>
              </div>
            </div>

            {/* Single Criterion Card */}
            {currentCriterion && (
              <motion.div
                key={currentCriterion.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-[#01645e]/20 shadow-2xl">
                  {/* Criterion Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-[#01645e] font-bold text-2xl">{currentCriterionIndex + 1}</span>
                    </div>
                    <h4 className="text-3xl font-bold text-[#01645e] mb-4">{currentCriterion.name}</h4>
                    {currentCriterion.description && (
                      <p className="text-[#8b7632] text-lg leading-relaxed mb-6 max-w-lg mx-auto">{currentCriterion.description}</p>
                    )}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c3e956]/20 to-[#3ab666]/20 rounded-xl px-4 py-2">
                      <Trophy className="w-5 h-5 text-[#c3e956]" />
                      <span className="text-[#01645e] font-medium">الحد الأقصى: {currentCriterion.maxScore} نقاط</span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="text-center">
                    <p className="text-[#8b7632] text-lg mb-6 font-medium">اختر التقييم من 1 إلى 5 نجوم:</p>
                    <div className="flex items-center justify-center gap-3 mb-8">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          onClick={() => handleScoreChange(currentCriterion.id, star)}
                          whileHover={{ scale: 1.4 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-6xl transition-all duration-300 relative group"
                        >
                          {scores[currentCriterion.id] >= star ? (
                            // Filled star when selected
                            <span className="text-[#c3e956] drop-shadow-2xl filter brightness-110">
                              ⭐
                            </span>
                          ) : (
                            // Empty star when not selected
                            <span className="text-gray-300 group-hover:text-[#c3e956]/50 transition-colors duration-200">
                              ☆
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {/* Score Display */}
                    <div className="mt-6">
                      {scores[currentCriterion.id] ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="bg-gradient-to-r from-[#3ab666]/20 to-[#c3e956]/20 rounded-2xl px-6 py-4 border border-[#3ab666]/30"
                        >
                          <div className="text-[#01645e] font-bold text-2xl mb-1">
                            {scores[currentCriterion.id]} من 5 نجوم
                          </div>
                          <div className="text-[#8b7632] text-lg">
                            {(scores[currentCriterion.id] * currentCriterion.maxScore / 5).toFixed(0)} / {currentCriterion.maxScore} نقطة
                          </div>
                          <div className="flex items-center justify-center mt-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-600 text-sm font-medium">تم التقييم ✓</span>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="bg-gray-100 rounded-2xl px-6 py-4 border border-gray-200">
                          <span className="text-gray-500 font-medium text-lg">لم يتم التقييم بعد</span>
                          <div className="flex items-center justify-center mt-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-red-600 text-sm font-medium">في انتظار التقييم</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            </motion.div>
          {/* Unified Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col lg:flex-row justify-between items-center gap-6"
          >
            {/* Previous Button */}
            <motion.button
              onClick={goToPrevious}
              disabled={isFirstStep || saving}
              whileHover={{ scale: isFirstStep || saving ? 1 : 1.05 }}
              whileTap={{ scale: isFirstStep || saving ? 1 : 0.95 }}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                isFirstStep || saving
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                  : 'bg-white/90 backdrop-blur-sm text-[#01645e] hover:bg-white border border-[#01645e]/20 shadow-lg hover:shadow-xl'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
              <span>السابق</span>
            </motion.button>

            {/* Enhanced Progress Indicator */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 border border-[#01645e]/20 shadow-lg">
              <div className="text-center">
                <p className="text-[#01645e] font-bold text-xl mb-2">
                  {currentTeam?.name} - معيار {currentCriterionIndex + 1}
                </p>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-[#8b7632]">الفريق:</span>
                    <span className="text-[#01645e] font-semibold ml-1">
                      {currentTeamIndex + 1} / {selectedHackathon.teams.length}
                    </span>
                  </div>
                  <div className="w-1 h-4 bg-gray-300 rounded"></div>
                  <div className="text-sm">
                    <span className="text-[#8b7632]">المعيار:</span>
                    <span className="text-[#01645e] font-semibold ml-1">
                      {currentCriterionIndex + 1} / {selectedHackathon.evaluationCriteria.length}
                    </span>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-[#01645e] to-[#3ab666] h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${((currentTeamIndex * selectedHackathon.evaluationCriteria.length + currentCriterionIndex + 1) /
                        (selectedHackathon.teams.length * selectedHackathon.evaluationCriteria.length)) * 100}%`
                    }}
                  />
                </div>
                <p className="text-[#8b7632] text-xs">
                  التقدم الإجمالي: {Math.round(((currentTeamIndex * selectedHackathon.evaluationCriteria.length + currentCriterionIndex + 1) /
                    (selectedHackathon.teams.length * selectedHackathon.evaluationCriteria.length)) * 100)}%
                </p>
              </div>
            </div>

            {/* Next Button */}
            <motion.button
              onClick={goToNext}
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.05 }}
              whileTap={{ scale: saving ? 1 : 0.95 }}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                saving
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                  : isLastStep
                    ? 'bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-white shadow-lg hover:shadow-xl hover:from-[#d97706]/90 hover:to-[#f59e0b]/90'
                    : 'bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white shadow-lg hover:shadow-xl hover:from-[#01645e]/90 hover:to-[#3ab666]/90'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <span>{getNextButtonText()}</span>
                  <ChevronLeft className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Detailed Progress Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Team Summary */}
              <Card className="border-[#01645e]/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#01645e] mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    الفريق الحالي
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#8b7632]">اسم الفريق:</span>
                      <span className="font-semibold text-[#01645e]">{currentTeam?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b7632]">رقم الفريق:</span>
                      <span className="font-semibold text-[#01645e]">{currentTeam?.teamNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b7632]">عدد الأعضاء:</span>
                      <span className="font-semibold text-[#01645e]">{currentTeam?.participants.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Criterion Summary */}
              <Card className="border-[#3ab666]/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#01645e] mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    المعيار الحالي
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#8b7632]">اسم المعيار:</span>
                      <span className="font-semibold text-[#01645e] text-right max-w-32 truncate">
                        {currentCriterion?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b7632]">الحد الأقصى:</span>
                      <span className="font-semibold text-[#01645e]">{currentCriterion?.maxScore} نقطة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b7632]">التقييم:</span>
                      <span className={`font-semibold ${currentCriterion?.id && scores[currentCriterion.id] ? 'text-green-600' : 'text-red-600'}`}>
                        {currentCriterion?.id && scores[currentCriterion.id] ? `${scores[currentCriterion.id]} نجوم` : 'غير مقيم'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Progress */}
              <Card className="border-[#c3e956]/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#01645e] mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    التقدم الإجمالي
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[#8b7632] text-sm">المعايير المقيمة:</span>
                        <span className="font-semibold text-[#01645e]">
                          {selectedHackathon.evaluationCriteria.filter(c => scores[c.id]).length} / {selectedHackathon.evaluationCriteria.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(selectedHackathon.evaluationCriteria.filter(c => scores[c.id]).length / selectedHackathon.evaluationCriteria.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[#8b7632] text-sm">التقدم الكلي:</span>
                        <span className="font-semibold text-[#01645e]">
                          {Math.round(((currentTeamIndex * selectedHackathon.evaluationCriteria.length + selectedHackathon.evaluationCriteria.filter(c => scores[c.id]).length) /
                            (selectedHackathon.teams.length * selectedHackathon.evaluationCriteria.length)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#01645e] to-[#3ab666] h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${((currentTeamIndex * selectedHackathon.evaluationCriteria.length + selectedHackathon.evaluationCriteria.filter(c => scores[c.id]).length) /
                              (selectedHackathon.teams.length * selectedHackathon.evaluationCriteria.length)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Components */}
      <ModalComponents />
    </div>
  )
}
