'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Play, ArrowLeft, ChevronRight, RotateCcw, Crown, Zap } from 'lucide-react'
import './spectacular.css'
interface TeamResult {
  id: string
  teamName: string
  score: number
  position: number
  members: number
}
interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
}
export default function ResultsManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [results, setResults] = useState<TeamResult[]>([])
  // حالات العرض
  const [showMode, setShowMode] = useState(false)
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [currentReveal, setCurrentReveal] = useState<number | null>(null)
  const [revealedPositions, setRevealedPositions] = useState<number[]>([])
  const [isRevealing, setIsRevealing] = useState(false)
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchHackathons()
  }, [user, router])
  const fetchHackathons = async () => {
    try {
      // Use admin endpoint to include DRAFT and all statuses
      console.log('🔍 Fetching hackathons...')
      const response = await fetch('/api/admin/hackathons')
      console.log('📡 Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Received data:', data)
        // The API returns { hackathons: [...] }
        setHackathons(data.hackathons || [])
        console.log('✅ Hackathons set:', data.hackathons?.length || 0)
      } else {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
      }
    } catch (error) {
      console.error('💥 Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }
  const fetchResults = async (hackathonId: string) => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/evaluations`)
      if (response.ok) {
        const data = await response.json()
        // Transform the data to match our interface
        const transformedResults = data.teams
          .sort((a: any, b: any) => b.totalScore - a.totalScore)
          .map((team: any, index: number) => ({
            id: team.id,
            teamName: team.name,
            score: team.totalScore || 0,
            position: index + 1,
            members: team.participants?.length || 0
          }))
        setResults(transformedResults)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    }
  }
  const handleHackathonSelect = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon)
    fetchResults(hackathon.id)
  }
  // كشف المركز التالي
  const revealNext = () => {
    const nextPosition = Math.max(...revealedPositions, 0) + 1
    if (nextPosition <= results.length) {
      revealPosition(nextPosition)
    }
  }
  // كشف مركز معين مع تأثيرات مبهرة
  const revealPosition = async (position: number) => {
    if (revealedPositions.includes(position) || isRevealing) return
    
    setIsRevealing(true)
    setCurrentReveal(position)
    
    // تأثير التشويق (2 ثانية)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // كشف النتيجة مع تأثير مبهر
    setRevealedPositions(prev => [...prev, position])
    
    // إنهاء الكشف مع تأثير
    setTimeout(() => {
      setIsRevealing(false)
      setCurrentReveal(null)
    }, 1000)
  }
  // إعادة تعيين العرض
  const resetResults = () => {
    setCurtainOpen(false)
    setCurrentReveal(null)
    setRevealedPositions([])
    setIsRevealing(false)
  }
  // بدء العرض
  const startShow = () => {
    setShowMode(true)
    resetResults()
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center z-10">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6 animate-spin"></div>
          <p className="text-gray-700 text-xl font-medium">جاري تحميل المنصة...</p>
        </div>
      </div>
    )
  }
  return (
    <div className={`min-h-screen relative overflow-hidden ${
      showMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              showMode ? 'bg-blue-400/30' : 'bg-blue-300/20'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8,
              delay: Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Normal Mode */}
      {!showMode && (
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-8">
                <motion.div 
                  className="flex items-center justify-center gap-4 mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.div 
                    className="text-5xl"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🏆
                  </motion.div>
                  <div>
                    <motion.h1 
                      className="text-4xl font-bold bg-gradient-to-r from-[#01645e] via-blue-600 to-[#8b7632] bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      منصة عرض النتائج
                    </motion.h1>
                    <motion.p 
                      className="text-[#8b7632] text-lg mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      عرض نتائج الهاكاثون بطريقة مميزة
                    </motion.p>
                  </div>
                </motion.div>
              </div>
              <motion.h2 
                className="text-2xl font-bold text-[#01645e] mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy className="w-8 h-8" />
                </motion.div>
                اختر الهاكاثون
              </motion.h2>
              <div className="grid gap-4 mb-8">
                {(Array.isArray(hackathons) ? hackathons : []).map((hackathon, index) => (
                  <motion.div
                    key={hackathon.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleHackathonSelect(hackathon)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedHackathon?.id === hackathon.id
                        ? 'border-[#01645e] bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-[#01645e]/50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{ 
                          rotate: selectedHackathon?.id === hackathon.id ? [0, 360] : 0,
                          scale: selectedHackathon?.id === hackathon.id ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 2, repeat: selectedHackathon?.id === hackathon.id ? Infinity : 0 }}
                        className="text-3xl"
                      >
                        🚀
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#01645e] mb-2">{hackathon.title}</h3>
                        <p className="text-[#8b7632]">{hackathon.description}</p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                          <span>📅 {new Date(hackathon.startDate).toLocaleDateString('ar-SA')}</span>
                          <motion.span 
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              hackathon.status === 'completed' ? 'bg-green-100 text-green-800' :
                              hackathon.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {hackathon.status === 'completed' ? 'مكتمل' :
                             hackathon.status === 'active' ? 'نشط' : 'قادم'}
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <AnimatePresence>
                {selectedHackathon && results.length > 0 && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-blue-200 shadow-lg"
                      initial={{ y: 50 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <motion.h4
                        className="text-xl font-bold text-[#01645e] mb-2 flex items-center justify-center gap-2"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Trophy className="w-6 h-6" />
                        </motion.div>
                        {selectedHackathon.title}
                      </motion.h4>
                      <p className="text-[#8b7632]">
                        إجمالي الفرق:
                        <motion.span
                          className="font-bold text-[#01645e] mx-1"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {results.length}
                        </motion.span>
                        فريق
                      </p>
                    </motion.div>
                    <motion.button
                      onClick={startShow}
                      className="bg-gradient-to-r from-[#01645e] via-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto relative overflow-hidden group"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ y: 50 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Play className="w-6 h-6" />
                      </motion.div>
                      <span className="text-lg relative z-10">بدء عرض النتائج</span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-xl"
                      >
                        ✨
                      </motion.div>
                    </motion.button>
                    <motion.p
                      className="text-[#8b7632] mt-4 text-sm"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      جاهز لعرض النتائج بطريقة مميزة
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}
      {/* Show Mode */}
      <AnimatePresence>
        {showMode && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Control Panel */}
            <motion.div
              className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b-4 border-yellow-400 p-4 shadow-2xl"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.div
                    className="text-3xl"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    🏆
                  </motion.div>
                  <div>
                    <motion.h3
                      className="text-2xl font-bold text-white"
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(255,255,255,0.5)",
                          "0 0 30px rgba(255,255,255,0.8)",
                          "0 0 10px rgba(255,255,255,0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      لوحة التحكم
                    </motion.h3>
                    <p className="text-yellow-400 text-sm">
                      {selectedHackathon?.title}
                    </p>
                  </div>
                </motion.div>
                {/* Control Buttons */}
                <motion.div
                  className="flex flex-wrap items-center gap-3"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {/* Start Show */}
                  {!curtainOpen && (
                    <motion.button
                      onClick={() => setCurtainOpen(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 15px 30px rgba(0,255,0,0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Play className="w-5 h-5" />
                      </motion.div>
                      ابدأ العرض
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.button>
                  )}
                  {/* Reveal Next */}
                  {curtainOpen && (
                    <motion.button
                      onClick={revealNext}
                      disabled={isRevealing || revealedPositions.length >= results.length}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                      whileHover={{
                        scale: isRevealing ? 1 : 1.05,
                        boxShadow: "0 15px 30px rgba(0,100,255,0.3)"
                      }}
                      whileTap={{ scale: isRevealing ? 1 : 0.95 }}
                      animate={isRevealing ? {
                        boxShadow: ["0 0 0 rgba(255,255,0,0)", "0 0 30px rgba(255,255,0,0.5)", "0 0 0 rgba(255,255,0,0)"]
                      } : {}}
                      transition={{ duration: 1, repeat: isRevealing ? Infinity : 0 }}
                    >
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      النتيجة التالية
                    </motion.button>
                  )}
                  {/* Reset */}
                  <motion.button
                    onClick={resetResults}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center gap-2"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 15px 30px rgba(255,100,0,0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 1 }}
                      whileHover={{ rotate: [0, 360] }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.div>
                    إعادة تعيين
                  </motion.button>
                  {/* Exit */}
                  <motion.button
                    onClick={() => setShowMode(false)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center gap-2"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 15px 30px rgba(100,100,100,0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    إنهاء
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
            {/* Main Display Area */}
            <div className="flex-1 flex items-center justify-center relative p-8 overflow-hidden">
              {/* Pre-Show Message */}
              <AnimatePresence>
                {!curtainOpen && (
                  <motion.div
                    className="text-center relative z-10"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.8 }}
                  >
                    <motion.div
                      className="text-8xl mb-8"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🏆
                    </motion.div>
                    <motion.h2
                      className="text-5xl font-bold text-white mb-6"
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(255,255,255,0.5)",
                          "0 0 30px rgba(255,255,255,0.8)",
                          "0 0 10px rgba(255,255,255,0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      منصة عرض النتائج
                    </motion.h2>
                    <motion.p
                      className="text-yellow-400 text-xl"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      اضغط "ابدأ العرض" لبدء التجربة المميزة
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Ready for Results */}
              <AnimatePresence>
                {curtainOpen && revealedPositions.length === 0 && !isRevealing && (
                  <motion.div
                    className="text-center relative z-10"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ duration: 0.8 }}
                  >
                    <motion.div
                      className="text-8xl mb-8"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 360]
                      }}
                      transition={{
                        scale: { duration: 2, repeat: Infinity },
                        rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                      }}
                    >
                      🏆
                    </motion.div>
                    <motion.h2
                      className="text-4xl font-bold text-white mb-6"
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(255,215,0,0.5)",
                          "0 0 30px rgba(255,215,0,0.8)",
                          "0 0 10px rgba(255,215,0,0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      جاهز لعرض النتائج
                    </motion.h2>
                    <motion.p
                      className="text-yellow-400 text-lg"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      استخدم لوحة التحكم لبدء الكشف عن النتائج
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Revealing State */}
              <AnimatePresence>
                {isRevealing && currentReveal && (
                  <motion.div
                    className="text-center relative z-10"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="text-9xl mb-8"
                      animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, 180, 360],
                        filter: [
                          "hue-rotate(0deg)",
                          "hue-rotate(180deg)",
                          "hue-rotate(360deg)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ⚡
                    </motion.div>
                    <motion.h2
                      className="text-5xl font-bold text-yellow-400 mb-6"
                      animate={{
                        scale: [1, 1.1, 1],
                        textShadow: [
                          "0 0 20px rgba(255,255,0,0.5)",
                          "0 0 40px rgba(255,255,0,1)",
                          "0 0 20px rgba(255,255,0,0.5)"
                        ]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      جاري الكشف عن المركز #{currentReveal}
                    </motion.h2>
                    <motion.p
                      className="text-white text-xl"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      يرجى الانتظار...
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Current Revealed Result - Single Team Display */}
              <AnimatePresence>
                {curtainOpen && revealedPositions.length > 0 && !isRevealing && (
                  <motion.div
                    className="w-full max-w-2xl mx-auto relative z-10"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ duration: 0.8 }}
                  >
                    {(() => {
                      // عرض آخر نتيجة تم كشفها
                      const lastRevealedPosition = Math.max(...revealedPositions)
                      const team = results.find((_, index) => index + 1 === lastRevealedPosition)
                      if (!team) return null
                      const position = team.position
                      const isFirst = position === 1
                      const isSecond = position === 2
                      const isThird = position === 3
                      return (
                        <motion.div
                          className={`p-12 rounded-3xl border-4 shadow-2xl relative overflow-hidden mx-auto max-w-lg ${
                            isFirst ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200' :
                            isSecond ? 'border-gray-400 bg-gradient-to-br from-gray-100 to-gray-200' :
                            isThird ? 'border-amber-400 bg-gradient-to-br from-amber-100 to-amber-200' :
                            'border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200'
                          }`}
                          initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                          transition={{
                            duration: 1,
                            type: "spring",
                            stiffness: 100
                          }}
                        >
                          {/* Winner Glow Effect */}
                          {isFirst && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-3xl"
                              animate={{
                                opacity: [0.3, 0.7, 0.3],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <div className="text-center relative z-10">
                            <motion.div
                              className="text-8xl mb-6"
                              animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {isFirst ? '👑' : isSecond ? '🥈' : isThird ? '🥉' : '🏅'}
                            </motion.div>
                            <motion.div
                              className={`text-5xl font-bold mb-6 ${
                                isFirst ? 'text-yellow-600' :
                                isSecond ? 'text-gray-600' :
                                isThird ? 'text-amber-600' :
                                'text-blue-600'
                              }`}
                              animate={isFirst ? {
                                textShadow: [
                                  "0 0 10px rgba(255,215,0,0.5)",
                                  "0 0 30px rgba(255,215,0,1)",
                                  "0 0 10px rgba(255,215,0,0.5)"
                                ]
                              } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              المركز #{position}
                            </motion.div>
                            <motion.h3
                              className="text-4xl font-bold text-gray-800 mb-6"
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {team.teamName}
                            </motion.h3>
                            <p className="text-xl text-gray-600">عدد الأعضاء: {team.members}</p>
                          </div>
                        </motion.div>
                      )
                    })()}
                    {/* Next Position Hint */}
                    {revealedPositions.length < results.length && (
                      <motion.div
                        className="text-center mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        <motion.div
                          className="text-2xl text-yellow-400 font-bold"
                          animate={{
                            scale: [1, 1.1, 1],
                            textShadow: [
                              "0 0 10px rgba(255,255,0,0.5)",
                              "0 0 30px rgba(255,255,0,0.8)",
                              "0 0 10px rgba(255,255,0,0.5)"
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          النتيجة التالية: المركز #{Math.max(...revealedPositions, 0) + 1}
                        </motion.div>
                      </motion.div>
                    )}
                    {/* All Results Revealed */}
                    {revealedPositions.length === results.length && (
                      <motion.div
                        className="text-center mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        <motion.div
                          className="text-3xl text-green-400 font-bold"
                          animate={{
                            scale: [1, 1.1, 1],
                            textShadow: [
                              "0 0 10px rgba(0,255,0,0.5)",
                              "0 0 30px rgba(0,255,0,0.8)",
                              "0 0 10px rgba(0,255,0,0.5)"
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          🎉 تم عرض جميع النتائج 🎉
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
