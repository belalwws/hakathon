"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Sparkles, Heart, ThumbsUp, Zap, Send, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FeedbackForm {
  id: string
  hackathonId: string
  isEnabled: boolean
  title: string
  description?: string
  welcomeMessage?: string
  thankYouMessage?: string
  ratingScale: number
  coverImage?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  logoUrl?: string
  customCss?: string
  questions: Array<{
    id: string
    question: string
    type: 'rating' | 'text' | 'textarea'
    required: boolean
  }>
}

export default function FeedbackPage() {
  const params = useParams()
  const hackathonId = params.hackathonId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FeedbackForm | null>(null)
  const [hackathonTitle, setHackathonTitle] = useState("")
  
  const [participantName, setParticipantName] = useState("")
  const [participantEmail, setParticipantEmail] = useState("")
  const [overallRating, setOverallRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [suggestions, setSuggestions] = useState("")

  useEffect(() => {
    fetchForm()
  }, [hackathonId])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/feedback/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data.form)
        setHackathonTitle(data.hackathonTitle)
      }
    } catch (error) {
      console.error('Error fetching form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/feedback/${hackathonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName,
          participantEmail,
          overallRating,
          responses,
          suggestions
        })
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        alert('حدث خطأ في إرسال التقييم')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('حدث خطأ في إرسال التقييم')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!form || !form.isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">فورم التقييم غير متاح</h1>
          <p className="text-gray-600">عذراً، فورم التقييم غير مفعل حالياً</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="max-w-2xl w-full"
        >
          <div 
            className="rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`
            }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: Math.random() * 100 + "%",
                    y: "100%",
                    scale: 0
                  }}
                  animate={{
                    y: "-100%",
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white/30" />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <CheckCircle2 className="w-24 h-24 text-white mx-auto mb-6" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold text-white mb-4"
              >
                {form.thankYouMessage || "شكراً لك! 🎉"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-white/90 text-lg mb-8"
              >
                تم إرسال تقييمك بنجاح. نقدر وقتك وملاحظاتك القيمة!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="flex justify-center gap-4"
              >
                {[...Array(overallRating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                  >
                    <Star className="w-8 h-8 fill-yellow-300 text-yellow-300" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const ratingIcons = [
    { icon: Sparkles, label: "ضعيف", color: "#9370DB" },
    { icon: Zap, label: "مقبول", color: "#FFA500" },
    { icon: ThumbsUp, label: "جيد", color: "#4169E1" },
    { icon: Heart, label: "رائع", color: "#FF69B4" },
    { icon: Star, label: "ممتاز", color: "#FFD700" }
  ]

  return (
    <div 
      className="min-h-screen p-6 relative overflow-hidden"
      style={{ backgroundColor: form.backgroundColor }}
    >
      {/* Custom CSS */}
      {form.customCss && <style>{form.customCss}</style>}

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Cover Image */}
        {form.coverImage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-3xl overflow-hidden shadow-2xl"
          >
            <img src={form.coverImage} alt="Cover" className="w-full h-64 object-cover" />
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {form.logoUrl && (
            <img src={form.logoUrl} alt="Logo" className="w-24 h-24 mx-auto mb-6 rounded-full shadow-lg" />
          )}
          
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ 
              background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            {form.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">{hackathonTitle}</p>
          
          {form.description && (
            <p className="text-gray-500 max-w-2xl mx-auto">{form.description}</p>
          )}
        </motion.div>

        {/* Welcome Message */}
        {form.welcomeMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 rounded-2xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${form.accentColor}20, ${form.secondaryColor}20)`,
              borderRight: `4px solid ${form.accentColor}`
            }}
          >
            <p className="text-lg text-gray-700">{form.welcomeMessage}</p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-8"
        >
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-lg font-semibold mb-2 block">الاسم *</Label>
              <Input
                id="name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                required
                className="h-12 text-lg"
                placeholder="أدخل اسمك"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-lg font-semibold mb-2 block">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                required
                className="h-12 text-lg"
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
          </div>

          {/* Overall Rating - INNOVATIVE DESIGN */}
          <div className="text-center py-8">
            <Label className="text-2xl font-bold mb-6 block">
              كيف كانت تجربتك الإجمالية؟ ⭐
            </Label>
            
            <div className="flex justify-center gap-4 mb-4">
              {[...Array(form.ratingScale)].map((_, index) => {
                const rating = index + 1
                const IconComponent = ratingIcons[index % ratingIcons.length].icon
                const iconColor = ratingIcons[index % ratingIcons.length].color
                const isActive = rating <= (hoveredRating || overallRating)

                return (
                  <motion.button
                    key={rating}
                    type="button"
                    onClick={() => setOverallRating(rating)}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(0)}
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: isActive ? Infinity : 0,
                        repeatDelay: 0.5
                      }}
                    >
                      <IconComponent
                        className="w-16 h-16 transition-all duration-300"
                        style={{
                          color: isActive ? iconColor : "#D1D5DB",
                          fill: isActive ? iconColor : "none",
                          filter: isActive ? "drop-shadow(0 0 10px currentColor)" : "none"
                        }}
                      />
                    </motion.div>
                    
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                        >
                          <span className="text-sm font-bold" style={{ color: iconColor }}>
                            {ratingIcons[index % ratingIcons.length].label}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>

            {overallRating > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-semibold mt-8"
                style={{ color: form.primaryColor }}
              >
                تقييمك: {overallRating} من {form.ratingScale} ⭐
              </motion.p>
            )}
          </div>

          {/* Additional Questions */}
          {form.questions && form.questions.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-6">أسئلة إضافية</h3>
              {form.questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 rounded-2xl"
                  style={{ backgroundColor: `${form.accentColor}10` }}
                >
                  <Label className="text-lg font-semibold mb-3 block">
                    {q.question} {q.required && "*"}
                  </Label>
                  
                  {q.type === 'textarea' ? (
                    <Textarea
                      value={responses[q.id] || ""}
                      onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                      required={q.required}
                      rows={4}
                      className="text-lg"
                      placeholder="اكتب إجابتك هنا..."
                    />
                  ) : (
                    <Input
                      value={responses[q.id] || ""}
                      onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                      required={q.required}
                      className="h-12 text-lg"
                      placeholder="اكتب إجابتك هنا..."
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <div>
            <Label htmlFor="suggestions" className="text-lg font-semibold mb-3 block">
              اقتراحات أو ملاحظات إضافية
            </Label>
            <Textarea
              id="suggestions"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              rows={5}
              className="text-lg"
              placeholder="شاركنا أفكارك واقتراحاتك لتحسين الهاكاثون..."
            />
          </div>

          {/* Submit Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={submitting || overallRating === 0}
              className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6 ml-2" />
                  إرسال التقييم
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  )
}

