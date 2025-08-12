"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  Users,
  Target,
  Lightbulb,
  Cog,
  TrendingUp,
  Presentation,
  Star,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Phone,
  Linkedin,
  Mail,
  MapPin,
  Crown,
  Medal,
  Award,
  FileText,
  Share2,
  Play,
  LogIn,
  MousePointer,
  BarChart3,
  Rocket,
  Clock,
} from "lucide-react"

// Types
interface TeamMember {
  name: string
  role: string
}

interface Team {
  name: string
  project: string
  members: TeamMember[]
}

interface EvaluationStage {
  id: string
  title: string
  weight: number
  color: string
  icon: any
  description: string
}

interface EvaluationResult {
  team: string
  project: string
  judge: string
  s1: number
  s2: number
  s3: number
  s4: number
  s5: number
  weighted: number
  comments: string
  timestamp: string
}

// Mock users for authentication
const MOCK_USERS = [
  { email: "judge1@email.com", password: "pass123", name: "المحكم الأول" },
  { email: "judge2@email.com", password: "pass123", name: "المحكم الثاني" },
  { email: "judge3@email.com", password: "pass123", name: "المحكم الثالث" },
]

// Evaluation stages
const EVALUATION_STAGES: EvaluationStage[] = [
  {
    id: "strategic",
    title: "التوافق مع الأهداف الاستراتيجية",
    weight: 20,
    color: "#6C4AB6",
    icon: Target,
    description: "تقييم مدى توافق الفكرة مع رؤية وأهداف المؤسسة الاستراتيجية",
  },
  {
    id: "innovation",
    title: "ابتكارية الفكرة",
    weight: 25,
    color: "#6FA8FF",
    icon: Lightbulb,
    description: "تقييم مستوى الإبداع والجدة والأصالة في الحل المقترح",
  },
  {
    id: "feasibility",
    title: "قابلية التطبيق",
    weight: 25,
    color: "#8EA7FF",
    icon: Cog,
    description: "تقييم إمكانية تنفيذ الفكرة عملياً وتقنياً ومالياً",
  },
  {
    id: "impact",
    title: "التأثير على المؤسسة",
    weight: 20,
    color: "#6C4AB6",
    icon: TrendingUp,
    description: "تقييم الأثر المتوقع على أداء وكفاءة وتطوير المؤسسة",
  },
  {
    id: "presentation",
    title: "مهارات العرض",
    weight: 10,
    color: "#6FA8FF",
    icon: Presentation,
    description: "تقييم جودة العرض والتقديم ومهارات التواصل",
  },
]

export default function HackathonEvaluationSystem() {
  const [currentPage, setCurrentPage] = useState<"landing" | "login" | "teamInput" | "evaluation" | "results" | "demo">(
    "landing",
  )
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Team input state
  const [teamName, setTeamName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ name: "", role: "" }])

  // Load data from localStorage
  useEffect(() => {
    const savedResults = localStorage.getItem("hackathon_results")
    if (savedResults) {
      try {
        setEvaluationResults(JSON.parse(savedResults))
      } catch (error) {
        console.error("Error loading results:", error)
      }
    }
  }, [])

  // Save results to localStorage
  useEffect(() => {
    if (evaluationResults.length > 0) {
      localStorage.setItem("hackathon_results", JSON.stringify(evaluationResults))
    }
  }, [evaluationResults])

  // Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    const user = MOCK_USERS.find((u) => u.email === loginEmail && u.password === loginPassword)
    if (user) {
      setCurrentUser(user)
      setCurrentPage("team-input")
    } else {
      setLoginError("بيانات الدخول غير صحيحة")
    }
  }

  // Team management
  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", role: "" }])
  }

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index))
    }
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const startEvaluation = () => {
    if (teamName && projectName) {
      setCurrentTeam({
        name: teamName,
        project: projectName,
        members: teamMembers.filter((m) => m.name.trim() !== ""),
      })
      setCurrentPage("evaluation")
      setCurrentStage(0)
      setRatings({})
      setComments({})
    }
  }

  // Evaluation logic
  const calculateWeightedScore = (ratings: Record<string, number>): number => {
    let weighted = 0
    EVALUATION_STAGES.forEach((stage) => {
      weighted += (ratings[stage.id] || 0) * (stage.weight / 100)
    })
    return Math.round(weighted * 100) / 100
  }

  const handleStageComplete = () => {
    if (currentStage < EVALUATION_STAGES.length - 1) {
      setCurrentStage(currentStage + 1)
    } else {
      // Complete evaluation
      const result: EvaluationResult = {
        team: currentTeam!.name,
        project: currentTeam!.project,
        judge: currentUser.email,
        s1: ratings.strategic || 0,
        s2: ratings.innovation || 0,
        s3: ratings.feasibility || 0,
        s4: ratings.impact || 0,
        s5: ratings.presentation || 0,
        weighted: calculateWeightedScore(ratings),
        comments: Object.values(comments).join("; "),
        timestamp: new Date().toISOString(),
      }

      setEvaluationResults((prev) => [...prev, result])
      setShowCelebration(true)
      setTimeout(() => {
        setShowCelebration(false)
        setCurrentPage("results")
      }, 4000)
    }
  }

  // Enhanced Export functionality with proper CSV/Excel support
  const exportToCSV = () => {
    if (evaluationResults.length === 0) return

    const headers = [
      "اسم الفريق",
      "اسم المشروع",
      "بريد المحكم",
      "التوافق الاستراتيجي (20%)",
      "ابتكارية الفكرة (25%)",
      "قابلية التطبيق (25%)",
      "التأثير المؤسسي (20%)",
      "مهارات العرض (10%)",
      "النتيجة المرجحة",
      "الملاحظات",
      "التاريخ",
    ]

    const csvRows = evaluationResults.map((result) => {
      const row = [
        result.team.replace(/"/g, '""'),
        result.project.replace(/"/g, '""'),
        result.judge,
        result.s1,
        result.s2,
        result.s3,
        result.s4,
        result.s5,
        result.weighted,
        result.comments.replace(/"/g, '""'),
        new Date(result.timestamp).toLocaleString("ar-SA"),
      ]
      return row.map((field) => (typeof field === "string" ? `"${field}"` : field)).join(",")
    })

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `نتائج_الهاكاثون_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    if (evaluationResults.length === 0) return

    const jsonData = {
      exportDate: new Date().toISOString(),
      totalResults: evaluationResults.length,
      results: evaluationResults.map((result) => ({
        teamName: result.team,
        projectName: result.project,
        judgeEmail: result.judge,
        scores: {
          strategic: result.s1,
          innovation: result.s2,
          feasibility: result.s3,
          impact: result.s4,
          presentation: result.s5,
        },
        weightedScore: result.weighted,
        comments: result.comments,
        timestamp: result.timestamp,
      })),
    }

    const jsonString = JSON.stringify(jsonData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `نتائج_الهاكاثون_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const resetSystem = () => {
    setCurrentPage("team-input")
    setCurrentTeam(null)
    setCurrentStage(0)
    setRatings({})
    setComments({})
    setTeamName("")
    setProjectName("")
    setTeamMembers([{ name: "", role: "" }])
  }

  // Get sorted results for ranking
  const getSortedResults = () => {
    return [...evaluationResults].sort((a, b) => b.weighted - a.weighted)
  }

  // Star Rating Component
  const StarRating = ({
    rating,
    onRate,
    color,
  }: { rating: number; onRate: (rating: number) => void; color: string }) => {
    const [hoverRating, setHoverRating] = useState(0)

    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-all duration-200 hover:scale-110 focus:outline-none"
          >
            <Star
              size={32}
              fill={star <= (hoverRating || rating) ? color : "transparent"}
              stroke={color}
              className="cursor-pointer"
            />
          </button>
        ))}
      </div>
    )
  }

  // Celebration Component
  const CelebrationScreen = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-[#6C4AB6] via-[#6FA8FF] to-[#8EA7FF] flex items-center justify-center z-50">
      <div className="text-center space-y-8 animate-fade-in">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="relative"
        >
          <Trophy size={120} className="text-yellow-400 mx-auto animate-bounce" />
          <div className="absolute -top-4 -right-4 animate-spin">
            <Star size={40} className="text-yellow-300" fill="currentColor" />
          </div>
          <div className="absolute -bottom-4 -left-4 animate-pulse">
            <Crown size={40} className="text-yellow-400" fill="currentColor" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-6xl font-bold text-white">🎉 تهانينا! 🎉</h1>
          <p className="text-2xl text-yellow-300">تم إكمال التقييم بنجاح</p>
          <div className="text-8xl font-bold text-yellow-400">
            {evaluationResults.length > 0 ? evaluationResults[evaluationResults.length - 1].weighted.toFixed(1) : "0.0"}
          </div>
          <p className="text-xl text-white">من 5.0</p>
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              rotate: 0,
              scale: 0,
            }}
            animate={{
              y: -100,
              rotate: 360,
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          >
            {i % 3 === 0 ? (
              <Star size={20} className="text-yellow-400" fill="currentColor" />
            ) : i % 3 === 1 ? (
              <Trophy size={16} className="text-yellow-300" />
            ) : (
              <Crown size={18} className="text-yellow-500" fill="currentColor" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )

  // Demo Page
  if (currentPage === "demo") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F4FB] via-[#EAF2FD] to-[#E9F2FD] relative overflow-hidden">
        {/* 3D Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
                z: [0, Math.random() * 100 - 50],
                rotateX: [0, 360],
                rotateY: [0, 360],
                scale: [1, Math.random() + 0.5, 1],
              }}
              transition={{
                duration: Math.random() * 8 + 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <div
                className={`w-${Math.floor(Math.random() * 8) + 4} h-${Math.floor(Math.random() * 8) + 4} bg-gradient-to-r from-[#6C4AB6]/20 to-[#6FA8FF]/20 rounded-full blur-sm`}
              />
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-[#E6E9F2] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <motion.button
                onClick={() => setCurrentPage("landing")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-4 rtl:space-x-reverse"
              >
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] shadow-lg">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1F2A44]">العودة للرئيسية</h1>
                </div>
              </motion.button>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#6C4AB6]">العرض التوضيحي</h2>
                <p className="text-sm text-[#9AA3B2]">تعلم كيفية استخدام النظام</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-[#6C4AB6]/10 to-[#6FA8FF]/10 border border-[#6C4AB6]/20 rounded-full px-6 py-3 mb-6">
              <span className="text-[#6C4AB6] font-semibold">🎥 شاهد وتعلم</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#1F2A44] to-[#6C4AB6] bg-clip-text text-transparent">
                كيفية استخدام
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] bg-clip-text text-transparent">
                نظام التقييم
              </span>
            </h1>
            <p className="text-xl text-[#9AA3B2] max-w-3xl mx-auto leading-relaxed">
              تعلم خطوة بخطوة كيفية تقييم الفرق والحصول على أفضل النتائج من خلال هذا العرض التوضيحي التفاعلي
            </p>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-8 shadow-2xl mb-12 relative overflow-hidden"
          >
            <div className="aspect-video bg-gradient-to-br from-[#6C4AB6]/10 to-[#6FA8FF]/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* 3D Play Button */}
              <motion.div
                whileHover={{ scale: 1.1, rotateY: 15 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer group"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                  <Play className="w-10 h-10 text-white mr-1" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#6C4AB6]/20 to-[#6FA8FF]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
              </motion.div>

              {/* Floating Elements */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-[#1F2A44]">مباشر</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6C4AB6]" />
                  <span className="text-sm font-semibold text-[#1F2A44]">15 دقيقة</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-[#1F2A44] mb-2">العرض التوضيحي الشامل</h3>
              <p className="text-[#9AA3B2]">شرح مفصل لجميع خطوات التقييم من البداية حتى النهاية</p>
            </div>
          </motion.div>

          {/* Steps Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { step: "01", title: "تسجيل الدخول", desc: "ابدأ بتسجيل الدخول للنظام", icon: LogIn, color: "#6C4AB6" },
              { step: "02", title: "إدخال الفرق", desc: "أضف أسماء الفرق المشاركة", icon: Users, color: "#6FA8FF" },
              { step: "03", title: "عملية التقييم", desc: "قيم كل فريق حسب المعايير", icon: Star, color: "#10B981" },
              {
                step: "04",
                title: "النتائج النهائية",
                desc: "اطلع على الترتيب وصدر النتائج",
                icon: Trophy,
                color: "#F59E0B",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-[#E6E9F2]">{item.step}</div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${item.color}20` }}>
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                  </div>
                  <h3 className="font-bold text-[#1F2A44] text-lg mb-2">{item.title}</h3>
                  <p className="text-[#9AA3B2] text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Features */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1F2A44] mb-4">مميزات تفاعلية</h2>
              <p className="text-[#9AA3B2] text-lg">اكتشف المميزات المتقدمة في نظام التقييم</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "تقييم تفاعلي",
                  desc: "واجهة سهلة ومرنة للتقييم",
                  icon: MousePointer,
                  gradient: "from-[#6C4AB6] to-[#8B5CF6]",
                },
                {
                  title: "تصدير متقدم",
                  desc: "تصدير النتائج بصيغ متعددة",
                  icon: Download,
                  gradient: "from-[#6FA8FF] to-[#3B82F6]",
                },
                {
                  title: "تحليلات فورية",
                  desc: "رؤى وإحصائيات مباشرة",
                  icon: BarChart3,
                  gradient: "from-[#10B981] to-[#059669]",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg mb-4 w-fit`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-[#1F2A44] text-lg mb-2">{feature.title}</h3>
                  <p className="text-[#9AA3B2]">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <motion.button
                onClick={() => setCurrentPage("login")}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(108, 74, 182, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white px-10 py-4 text-xl font-bold rounded-2xl shadow-xl transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-3">
                  <Rocket className="w-6 h-6" />
                  ابدأ التجربة الآن
                  <ArrowLeft className="w-6 h-6" />
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Landing Page - Enhanced Version
  if (currentPage === "landing") {
    return (
      <div className="min-h-screen bg-[#F6F4FB] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                x: [0, Math.random() * 150 - 75],
                y: [0, Math.random() * 150 - 75],
                z: [0, Math.random() * 50 - 25],
                rotateX: [0, 360],
                rotateY: [0, 360],
                rotateZ: [0, 180],
                scale: [1, Math.random() + 0.8, 1],
                opacity: [0.1, 0.6, 0.1],
              }}
              transition={{
                duration: Math.random() * 6 + 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <div
                className="bg-gradient-to-r from-[#6C4AB6]/20 to-[#6FA8FF]/20 rounded-full blur-sm"
                style={{
                  width: `${Math.random() * 20 + 10}px`,
                  height: `${Math.random() * 20 + 10}px`,
                }}
              />
            </motion.div>
          ))}

          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`shape-${i}`}
              className="absolute"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                rotateX: [0, 360],
                rotateY: [0, 360],
                rotateZ: [0, 180],
              }}
              transition={{
                duration: Math.random() * 10 + 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <div
                className={`bg-gradient-to-r from-[#6C4AB6]/10 to-[#6FA8FF]/10 ${
                  i % 3 === 0 ? "rounded-full" : i % 3 === 1 ? "rounded-lg rotate-45" : "rounded-none"
                } border border-[#6C4AB6]/20`}
                style={{
                  width: `${Math.random() * 30 + 20}px`,
                  height: `${Math.random() * 30 + 20}px`,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-[#E6E9F2] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4 rtl:space-x-reverse"
              >
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1F2A44]">هاكاثون الابتكار الحكومي</h1>
                  <p className="text-sm text-[#9AA3B2]">نظام التقييم الاحترافي المتطور</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center space-x-6 rtl:space-x-reverse"
              >
                <nav className="flex space-x-8 rtl:space-x-reverse">
                  <a href="#features" className="text-[#1F2A44] hover:text-[#6C4AB6] font-medium transition-colors">
                    المميزات
                  </a>
                  <a href="#criteria" className="text-[#1F2A44] hover:text-[#6C4AB6] font-medium transition-colors">
                    معايير التقييم
                  </a>
                  <a href="#contact" className="text-[#1F2A44] hover:text-[#6C4AB6] font-medium transition-colors">
                    تواصل معنا
                  </a>
                </nav>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-right"
              >
                <div className="mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="inline-block"
                  >
                    <div className="bg-gradient-to-r from-[#6C4AB6]/10 to-[#6FA8FF]/10 border border-[#6C4AB6]/20 rounded-full px-6 py-3 mb-6">
                      <span className="text-[#6C4AB6] font-semibold text-lg">🏆 المنصة الرسمية للتقييم</span>
                    </div>
                  </motion.div>

                  <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-[#1F2A44] to-[#6C4AB6] bg-clip-text text-transparent">
                      نظام تقييم
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] bg-clip-text text-transparent">
                      هاكاثون الابتكار
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-[#6FA8FF] to-[#8EA7FF] bg-clip-text text-transparent">
                      الحكومي
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-[#9AA3B2] mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    منصة احترافية وتفاعلية مدعومة بأحدث التقنيات لتقييم وترتيب فرق الهاكاثون باستخدام معايير دقيقة ونظام
                    تقييم متقدم يضمن العدالة والشفافية
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.button
                      onClick={() => setCurrentPage("login")}
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(108, 74, 182, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white px-10 py-5 text-xl font-bold rounded-2xl shadow-xl transition-all duration-300 transform relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <Trophy className="w-6 h-6" />
                        ابدأ رحلة التقييم
                        <ArrowLeft className="w-6 h-6" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>

                    <motion.button
                      onClick={() => setCurrentPage("demo")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/80 backdrop-blur-sm border-2 border-[#6C4AB6] text-[#6C4AB6] hover:bg-[#6C4AB6] hover:text-white px-10 py-5 text-xl font-bold rounded-2xl shadow-lg transition-all duration-300"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <Users className="w-6 h-6" />
                        شاهد العرض التوضيحي
                      </span>
                    </motion.button>
                  </div>

                  <div className="mt-8 flex items-center justify-center lg:justify-start gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#6C4AB6]">5</div>
                      <div className="text-sm text-[#9AA3B2]">معايير تقييم</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#6C4AB6]">100%</div>
                      <div className="text-sm text-[#9AA3B2]">دقة النتائج</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#6C4AB6]">∞</div>
                      <div className="text-sm text-[#9AA3B2]">عدد الفرق</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Content - Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1000%20%D9%85%D9%8A%D8%AD%D8%A7-OcJeqRH84ElCNSZ3bbGOFHaUtukCye.png"
                    alt="فريق هاكاثون الابتكار يعمل في بيئة تقنية متطورة"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6C4AB6]/20 to-transparent" />

                  {/* Floating Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#1F2A44]">نشط الآن</div>
                        <div className="text-sm text-[#9AA3B2]">جلسة تقييم مباشرة</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[#1F2A44]">4.9/5</div>
                        <div className="text-sm text-[#9AA3B2]">تقييم المستخدمين</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#6C4AB6]/20 to-[#6FA8FF]/20 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#6FA8FF]/20 to-[#8EA7FF]/20 rounded-full blur-xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-block bg-gradient-to-r from-[#6C4AB6]/10 to-[#6FA8FF]/10 border border-[#6C4AB6]/20 rounded-full px-6 py-3 mb-6">
                <span className="text-[#6C4AB6] font-semibold">✨ لماذا نظامنا الأفضل؟</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1F2A44] mb-6">
                مميزات تجعلنا <span className="text-[#6C4AB6]">الخيار الأول</span>
              </h2>
              <p className="text-xl text-[#9AA3B2] max-w-3xl mx-auto leading-relaxed">
                نوفر تجربة تقييم شاملة ومتقدمة تضمن العدالة والشفافية مع أحدث التقنيات والمعايير العالمية
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Trophy,
                  title: "تقييم احترافي",
                  desc: "نظام تقييم متقدم بمعايير واضحة ومحددة وفقاً لأفضل الممارسات العالمية",
                  color: "#6C4AB6",
                  gradient: "from-[#6C4AB6] to-[#8B5CF6]",
                },
                {
                  icon: Users,
                  title: "إدارة الفرق",
                  desc: "تنظيم وإدارة فرق الهاكاثون بسهولة مع إمكانية تتبع الأداء والتقدم",
                  color: "#6FA8FF",
                  gradient: "from-[#6FA8FF] to-[#3B82F6]",
                },
                {
                  icon: Target,
                  title: "معايير دقيقة",
                  desc: "5 معايير أساسية مع أوزان محددة تضمن تقييماً عادلاً وشاملاً",
                  color: "#10B981",
                  gradient: "from-[#10B981] to-[#059669]",
                },
                {
                  icon: Star,
                  title: "تجربة تفاعلية",
                  desc: "واجهة سهلة الاستخدام وتفاعلية مع تصميم عصري ومتجاوب",
                  color: "#F59E0B",
                  gradient: "from-[#F59E0B] to-[#D97706]",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group relative"
                >
                  <div className="glass rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-white/20 relative overflow-hidden">
                    {/* Background Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />

                    <div className="relative z-10">
                      <div className="flex justify-center mb-6">
                        <div
                          className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <feature.icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-[#1F2A44] mb-4 text-center group-hover:text-[#6C4AB6] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-[#9AA3B2] text-center leading-relaxed">{feature.desc}</p>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-3xl" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Criteria Section */}
        <section id="criteria" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-block bg-gradient-to-r from-[#6C4AB6]/10 to-[#6FA8FF]/10 border border-[#6C4AB6]/20 rounded-full px-6 py-3 mb-6">
                <span className="text-[#6C4AB6] font-semibold">📊 معايير التقييم</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1F2A44] mb-6">
                <span className="text-[#6C4AB6]">خمسة معايير</span> أساسية
              </h2>
              <p className="text-xl text-[#9AA3B2] max-w-3xl mx-auto">
                نظام تقييم شامل ومتوازن يغطي جميع جوانب المشروع من الفكرة إلى التنفيذ
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "التوافق الاستراتيجي", weight: "20%", color: "#6C4AB6", icon: Target },
                { title: "ابتكارية الفكرة", weight: "25%", color: "#6FA8FF", icon: Lightbulb },
                { title: "قابلية التطبيق", weight: "25%", color: "#10B981", icon: Cog },
                { title: "التأثير على المؤسسة", weight: "20%", color: "#8B5CF6", icon: TrendingUp },
                { title: "مهارات العرض", weight: "10%", color: "#F59E0B", icon: Presentation },
              ].map((criteria, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: `${criteria.color}20` }}>
                        <criteria.icon className="w-6 h-6" style={{ color: criteria.color }} />
                      </div>
                      <div
                        className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg"
                        style={{ backgroundColor: criteria.color }}
                      >
                        {criteria.weight}
                      </div>
                    </div>
                    <h3 className="font-bold text-[#1F2A44] text-lg mb-2">{criteria.title}</h3>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E6E9F2] rounded-full h-2 mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: criteria.weight }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: criteria.color }}
                      />
                    </div>

                    <p className="text-[#9AA3B2] text-sm">معيار أساسي في تقييم المشاريع المشاركة</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-4 bg-white/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1F2A44] mb-4">تواصل معنا</h2>
                  <p className="text-[#1F2A44] text-lg md:text-xl mb-2">لا زالت عندك أسئلة؟</p>
                  <p className="text-[#1F2A44] text-lg md:text-xl">راسلنا واحنا جاهزين للإجابة على جميع استفساراتك</p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#EAF2FD] border border-[#6C4AB6]/20 rounded-xl p-6 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1F2A44] mb-2">اتصل بنا</h3>
                    <p className="text-[#6C4AB6] font-semibold">+966 54 220 3700</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#EAF2FD] border border-[#6C4AB6]/20 rounded-xl p-6 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1F2A44] mb-2">البريد الإلكتروني</h3>
                    <p className="text-[#6C4AB6] font-semibold text-sm">info@hackathon.gov.sa</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#EAF2FD] border border-[#6C4AB6]/20 rounded-xl p-6 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Linkedin className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1F2A44] mb-2">لينكد إن</h3>
                    <a
                      href="https://www.linkedin.com/in/osama-badandy?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0077B5] font-semibold hover:underline text-sm"
                    >
                      osama-badandy
                    </a>
                  </motion.div>
                </div>

                <div className="space-y-6">
                  {/* Problem Type Selector */}
                  <div className="relative">
                    <select className="w-full h-12 bg-[#EAF2FD] text-[#1F2A44] border border-[#6C4AB6] px-4 py-3 text-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]/20 rounded-lg">
                      <option value="">نوع المشكلة</option>
                      <option value="technical">مشكلة تقنية</option>
                      <option value="account">مشكلة في الحساب</option>
                      <option value="evaluation">استفسار حول التقييم</option>
                      <option value="general">استفسار عام</option>
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 opacity-50"
                      >
                        <path
                          d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="bg-[#E9F2FD] border border-[#6C4AB6] rounded-lg p-6 sm:p-8">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          className="w-full h-12 bg-white text-[#1F2A44] placeholder-[#9AA3B2] border border-[#E6E9F2] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]/20 focus:border-[#6C4AB6] transition-all rounded-lg"
                          placeholder="الاسم"
                          required
                        />
                        <input
                          type="email"
                          className="w-full h-12 bg-white text-[#1F2A44] placeholder-[#9AA3B2] border border-[#E6E9F2] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]/20 focus:border-[#6C4AB6] transition-all rounded-lg"
                          placeholder="البريد الإلكتروني"
                          required
                        />
                      </div>

                      <input
                        type="text"
                        className="w-full h-12 bg-white text-[#1F2A44] placeholder-[#9AA3B2] border border-[#E6E9F2] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]/20 focus:border-[#6C4AB6] transition-all rounded-lg"
                        placeholder="الموضوع"
                        required
                      />

                      <textarea
                        className="w-full bg-white text-[#1F2A44] placeholder-[#9AA3B2] border border-[#E6E9F2] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C4AB6]/20 focus:border-[#6C4AB6] transition-all min-h-[120px] resize-none rounded-lg"
                        placeholder="رسالتك"
                        required
                      />

                      <div className="flex justify-center pt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white text-[#6C4AB6] border-2 border-[#6C4AB6] hover:bg-[#6C4AB6] hover:text-white transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl"
                          type="submit"
                        >
                          إرسال الرسالة
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1F2A44] text-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF]">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">هاكاثون الابتكار</h3>
                    <p className="text-sm text-gray-300">الحكومي</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  منصة احترافية لتقييم وترتيب فرق الهاكاثون باستخدام أحدث التقنيات والمعايير العالمية
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#features" className="text-gray-300 hover:text-[#6FA8FF] transition-colors">
                      المميزات
                    </a>
                  </li>
                  <li>
                    <a href="#criteria" className="text-gray-300 hover:text-[#6FA8FF] transition-colors">
                      معايير التقييم
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="text-gray-300 hover:text-[#6FA8FF] transition-colors">
                      تواصل معنا
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">تواصل معنا</h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    <span>info@hackathon-innovation.gov.sa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" />
                    <span>+966 54 220 3700</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4" />
                    <span>الرياض، المملكة العربية السعودية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-4 h-4" />
                    <a
                      href="https://www.linkedin.com/in/osama-badandy?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#6FA8FF] transition-colors"
                    >
                      osama-badandy
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-8 text-center">
              <p className="text-gray-300">© 2024 هاكاثون الابتكار الحكومي. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // Show celebration screen
  if (showCelebration) {
    return <CelebrationScreen />
  }

  // Login Page
  if (currentPage === "login") {
    return (
      <div className="min-h-screen bg-[#F6F4FB] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#1F2A44] mb-2">تسجيل الدخول</h2>
            <p className="text-[#9AA3B2]">ادخل بياناتك للوصول إلى نظام التقييم</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[#1F2A44] font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-4 bg-[#F6F4FB] border border-[#E6E9F2] rounded-xl text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>

            <div>
              <label className="block text-[#1F2A44] font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-4 bg-[#F6F4FB] border border-[#E6E9F2] rounded-xl text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20 pr-12"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9AA3B2] hover:text-[#6C4AB6]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              تسجيل الدخول
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-sm text-[#9AA3B2] text-center mb-3">حسابات تجريبية للاختبار:</p>
            {MOCK_USERS.map((user, index) => (
              <button
                key={index}
                onClick={() => {
                  setLoginEmail(user.email)
                  setLoginPassword(user.password)
                  setLoginError("")
                }}
                className="w-full bg-[#F6F4FB] border border-[#E6E9F2] text-[#1F2A44] hover:bg-[#6C4AB6]/10 hover:border-[#6C4AB6] py-2 px-4 rounded-lg text-sm transition-all duration-200"
              >
                {user.name}: {user.email}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Team Input Page
  if (currentPage === "team-input") {
    return (
      <div className="min-h-screen bg-[#F6F4FB] p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 pt-8"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#1F2A44] mb-2">إدخال بيانات الفريق</h1>
            <p className="text-[#9AA3B2] text-lg">أدخل معلومات الفريق والمشروع قبل بدء التقييم</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-8"
          >
            {/* Basic Info */}
            <div className="glass rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#1F2A44] mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-[#6C4AB6]" />
                معلومات أساسية
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#1F2A44] font-medium mb-2">اسم الفريق *</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full p-4 bg-[#F6F4FB] border border-[#E6E9F2] rounded-xl text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                    placeholder="مثال: فريق الابتكار الرقمي"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#1F2A44] font-medium mb-2">اسم المشروع *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-4 bg-[#F6F4FB] border border-[#E6E9F2] rounded-xl text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                    placeholder="مثال: منصة الخدمات الذكية"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="glass rounded-3xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#1F2A44] flex items-center gap-3">
                  <Users className="w-6 h-6 text-[#6C4AB6]" />
                  أعضاء الفريق
                  <span className="bg-[#6C4AB6]/10 text-[#6C4AB6] px-3 py-1 rounded-full text-sm font-medium">
                    {teamMembers.filter((m) => m.name.trim() !== "").length} عضو
                  </span>
                </h2>
                <button
                  onClick={addTeamMember}
                  className="bg-[#6C4AB6] hover:bg-[#5b3fa0] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                >
                  <Plus size={16} />
                  إضافة عضو
                </button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-[#1F2A44] font-medium mb-2 text-sm">اسم العضو {index + 1}</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                        className="w-full p-3 bg-[#F6F4FB] border border-[#E6E9F2] rounded-lg text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                        placeholder="اسم العضو"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[#1F2A44] font-medium mb-2 text-sm">التخصص/الدور</label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, "role", e.target.value)}
                        className="w-full p-3 bg-[#F6F4FB] border border-[#E6E9F2] rounded-lg text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20"
                        placeholder="مثال: مطور تطبيقات"
                      />
                    </div>
                    {teamMembers.length > 1 && (
                      <button
                        onClick={() => removeTeamMember(index)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startEvaluation}
                disabled={!teamName || !projectName}
                className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center gap-3">
                  <Target size={24} />
                  ابدأ التقييم
                  <ArrowLeft size={24} />
                </span>
              </button>
              <p className="text-[#9AA3B2] text-sm mt-4">تأكد من إدخال جميع البيانات المطلوبة قبل المتابعة</p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Evaluation Page
  if (currentPage === "evaluation") {
    const currentStageData = EVALUATION_STAGES[currentStage]
    const canProceed = ratings[currentStageData.id] > 0

    return (
      <div className="min-h-screen bg-[#F6F4FB]">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-[#E6E9F2] p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-[#1F2A44]">تقييم: {currentTeam?.name}</h1>
              <p className="text-[#9AA3B2] text-sm">{currentTeam?.project}</p>
            </div>
            <div className="bg-[#6C4AB6]/10 text-[#6C4AB6] px-4 py-2 rounded-full font-medium">
              المرحلة {currentStage + 1} من {EVALUATION_STAGES.length}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="glass rounded-3xl shadow-xl p-10 mb-8"
            >
              <div className="text-center mb-10">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{
                    backgroundColor: `${currentStageData.color}20`,
                    border: `2px solid ${currentStageData.color}`,
                  }}
                >
                  <currentStageData.icon size={48} style={{ color: currentStageData.color }} />
                </div>

                <h2 className="text-3xl font-bold text-[#1F2A44] mb-4">{currentStageData.title}</h2>
                <p className="text-[#9AA3B2] text-lg mb-6 max-w-2xl mx-auto">{currentStageData.description}</p>

                <div
                  className="inline-block px-6 py-2 rounded-full text-white font-semibold"
                  style={{
                    backgroundColor: `${currentStageData.color}30`,
                    border: `1px solid ${currentStageData.color}`,
                    color: currentStageData.color,
                  }}
                >
                  الوزن: {currentStageData.weight}%
                </div>
              </div>

              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#1F2A44] mb-6">قيّم هذا المعيار</h3>
                  <StarRating
                    rating={ratings[currentStageData.id] || 0}
                    onRate={(rating) => setRatings((prev) => ({ ...prev, [currentStageData.id]: rating }))}
                    color={currentStageData.color}
                  />
                  {ratings[currentStageData.id] && (
                    <p className="text-[#9AA3B2] mt-4">
                      التقييم: {ratings[currentStageData.id]}/5 -{" "}
                      {["ضعيف جداً", "ضعيف", "متوسط", "جيد", "ممتاز"][ratings[currentStageData.id] - 1]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#1F2A44] font-medium mb-3">ملاحظات (اختياري)</label>
                  <textarea
                    value={comments[currentStageData.id] || ""}
                    onChange={(e) => setComments((prev) => ({ ...prev, [currentStageData.id]: e.target.value }))}
                    className="w-full p-4 bg-[#F6F4FB] border border-[#E6E9F2] rounded-xl text-[#1F2A44] placeholder:text-[#9AA3B2] focus:border-[#6C4AB6] focus:ring-[#6C4AB6]/20 resize-none"
                    placeholder="أضف ملاحظاتك حول هذا المعيار..."
                    rows={4}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
              disabled={currentStage === 0}
              className="bg-white hover:bg-[#F6F4FB] disabled:bg-gray-100 text-[#1F2A44] disabled:text-gray-400 px-6 py-3 rounded-xl font-medium border border-[#E6E9F2] transition-all duration-200 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <ArrowRight size={20} />
                السابق
              </span>
            </button>

            <div className="flex gap-2">
              {EVALUATION_STAGES.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index < currentStage
                      ? "bg-green-400"
                      : index === currentStage
                        ? "bg-[#6C4AB6] animate-pulse"
                        : "bg-[#E6E9F2]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleStageComplete}
              disabled={!canProceed}
              className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {currentStage === EVALUATION_STAGES.length - 1 ? (
                  <>
                    إنهاء التقييم
                    <CheckCircle size={20} />
                  </>
                ) : (
                  <>
                    التالي
                    <ArrowLeft size={20} />
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results Page with Enhanced Ranking
  if (currentPage === "results") {
    const sortedResults = getSortedResults()
    const latestResult = evaluationResults[evaluationResults.length - 1]

    return (
      <div className="min-h-screen bg-[#F6F4FB] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-float">
              <Trophy size={64} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold text-[#1F2A44] mb-4">النتائج النهائية</h1>
            <p className="text-xl text-[#9AA3B2]">تقييم مكتمل بنجاح مع ترتيب الفرق</p>
          </motion.div>

          {/* Main Score Card */}
          {latestResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass rounded-3xl shadow-xl p-12 mb-12 bg-gradient-to-r from-[#6C4AB6]/5 to-[#6FA8FF]/5"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Trophy size={48} className="text-white" />
                </div>

                <h2 className="text-4xl font-bold text-[#1F2A44] mb-2">{latestResult.team}</h2>
                <p className="text-xl text-[#9AA3B2] mb-8">{latestResult.project}</p>

                <div className="text-7xl font-bold text-[#6C4AB6] mb-4">{latestResult.weighted.toFixed(1)}</div>
                <p className="text-2xl text-[#9AA3B2] mb-6">من 5.0</p>

                <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full inline-block font-semibold">
                  تقييم مكتمل ✓
                </div>
              </div>
            </motion.div>
          )}

          {/* Teams Ranking */}
          {sortedResults.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="glass rounded-3xl shadow-xl p-10 mb-12"
            >
              <h3 className="text-3xl font-bold text-[#1F2A44] text-center mb-8 flex items-center justify-center gap-3">
                <Crown className="w-8 h-8 text-[#6C4AB6]" />
                ترتيب الفرق
              </h3>

              <div className="space-y-4">
                {sortedResults.map((result, index) => {
                  const getRankIcon = (rank: number) => {
                    if (rank === 0) return <Crown className="w-8 h-8 text-yellow-500" fill="currentColor" />
                    if (rank === 1) return <Medal className="w-8 h-8 text-gray-400" />
                    if (rank === 2) return <Award className="w-8 h-8 text-amber-600" />
                    return (
                      <div className="w-8 h-8 bg-[#6C4AB6] rounded-full flex items-center justify-center text-white font-bold">
                        {rank + 1}
                      </div>
                    )
                  }

                  const getRankBg = (rank: number) => {
                    if (rank === 0) return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
                    if (rank === 1) return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                    if (rank === 2) return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
                    return "bg-white border-[#E6E9F2]"
                  }

                  return (
                    <motion.div
                      key={`${result.team}-${result.timestamp}`}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className={`${getRankBg(index)} border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getRankIcon(index)}
                          <div>
                            <h4 className="text-xl font-bold text-[#1F2A44]">{result.team}</h4>
                            <p className="text-[#9AA3B2]">{result.project}</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-3xl font-bold text-[#6C4AB6] mb-1">{result.weighted.toFixed(1)}</div>
                          <div className="text-sm text-[#9AA3B2]">من 5.0</div>
                        </div>
                      </div>

                      {/* Score breakdown */}
                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {[
                          { label: "استراتيجي", score: result.s1, color: "#6C4AB6" },
                          { label: "ابتكار", score: result.s2, color: "#6FA8FF" },
                          { label: "تطبيق", score: result.s3, color: "#10B981" },
                          { label: "تأثير", score: result.s4, color: "#8B5CF6" },
                          { label: "عرض", score: result.s5, color: "#F59E0B" },
                        ].map((item, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-sm font-semibold" style={{ color: item.color }}>
                              {item.score}/5
                            </div>
                            <div className="text-xs text-[#9AA3B2]">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Detailed Scores */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="glass rounded-3xl shadow-xl p-10 mb-12"
          >
            <h3 className="text-2xl font-bold text-[#1F2A44] text-center mb-8">تفصيل التقييم الأخير</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EVALUATION_STAGES.map((stage, index) => {
                const score = latestResult ? (latestResult[`s${index + 1}` as keyof EvaluationResult] as number) : 0
                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                    className="bg-[#F6F4FB] rounded-2xl p-6 border border-[#E6E9F2]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <stage.icon size={32} style={{ color: stage.color }} />
                      <span className="text-2xl font-bold" style={{ color: stage.color }}>
                        {score}/5
                      </span>
                    </div>
                    <h4 className="font-bold text-[#1F2A44] text-sm mb-2">{stage.title}</h4>
                    <div className="text-xs text-[#9AA3B2] mb-3">الوزن: {stage.weight}%</div>
                    <div className="w-full bg-[#E6E9F2] rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / 5) * 100}%` }}
                        transition={{ delay: 1 + index * 0.1, duration: 1, ease: "easeOut" }}
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <button
              onClick={exportToCSV}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <FileText size={24} />
                تحميل CSV
              </span>
            </button>

            <button
              onClick={exportToJSON}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <Download size={24} />
                تحميل JSON
              </span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "نتائج هاكاثون الابتكار",
                    text: `تم تقييم ${evaluationResults.length} فريق بنجاح`,
                    url: window.location.href,
                  })
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <Share2 size={24} />
                مشاركة النتائج
              </span>
            </button>

            <button
              onClick={resetSystem}
              className="bg-gradient-to-r from-[#6C4AB6] to-[#6FA8FF] hover:from-[#5b3fa0] hover:to-[#5a96e8] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <RotateCcw size={24} />
                تقييم فريق جديد
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
