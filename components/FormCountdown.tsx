"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, Hourglass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

interface FormCountdownProps {
  targetDate: Date
  type: 'opening' | 'closing'
  formTitle: string
}

export function FormCountdown({ targetDate, type, formTitle }: FormCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 })
        // عند انتهاء الوقت، نعمل refresh واحد فقط
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        return true // نرجع true عشان نوقف الـ interval
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeRemaining({ days, hours, minutes, seconds, total: difference })
      return false
    }

    calculateTimeRemaining()
    const interval = setInterval(() => {
      const shouldStop = calculateTimeRemaining()
      if (shouldStop) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  const isOpening = type === 'opening'
  const gradientColors = isOpening 
    ? 'from-blue-500 via-purple-500 to-pink-500'
    : 'from-orange-500 via-red-500 to-pink-500'

  const iconColor = isOpening ? 'text-blue-500' : 'text-orange-500'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 via-[#3ab666]/5 to-[#01645e]/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${gradientColors} opacity-20 rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr ${gradientColors} opacity-20 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r ${gradientColors} opacity-10 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${gradientColors} p-1 relative`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>

          <CardContent className="p-8 md:p-12 text-center">
            {/* Icon Animation */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="mb-6"
            >
              {isOpening ? (
                <Clock className={`w-24 h-24 mx-auto ${iconColor}`} />
              ) : (
                <Hourglass className={`w-24 h-24 mx-auto ${iconColor}`} />
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-[#01645e] mb-4"
            >
              {formTitle}
            </motion.h1>

            {/* Status Message */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${gradientColors} text-white font-semibold text-lg shadow-lg`}>
                <Calendar className="w-5 h-5" />
                {isOpening ? (
                  <span>سيتم فتح النموذج خلال</span>
                ) : (
                  <span>الوقت المتبقي لإغلاق النموذج</span>
                )}
              </div>
            </motion.div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <AnimatePresence mode="wait">
                {[
                  { value: timeRemaining.days, label: 'يوم', key: 'days' },
                  { value: timeRemaining.hours, label: 'ساعة', key: 'hours' },
                  { value: timeRemaining.minutes, label: 'دقيقة', key: 'minutes' },
                  { value: timeRemaining.seconds, label: 'ثانية', key: 'seconds' }
                ].map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="relative"
                  >
                    <div className={`bg-gradient-to-br ${gradientColors} p-1 rounded-2xl shadow-lg`}>
                      <div className="bg-white rounded-xl p-6 relative overflow-hidden">
                        {/* Animated background effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-50"></div>
                        
                        <motion.div
                          key={item.value}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="relative z-10"
                        >
                          <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}>
                            {String(item.value).padStart(2, '0')}
                          </div>
                          <div className="text-sm md:text-base text-gray-600 font-semibold mt-2">
                            {item.label}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Target Date Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">
                  {isOpening ? 'موعد الفتح:' : 'موعد الإغلاق:'}
                </span>
                <span className="font-bold text-[#01645e]">
                  {new Date(targetDate).toLocaleString('ar-SA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="mt-8 text-gray-400"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-[#3ab666] to-[#c3e956] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gradient-to-r from-[#c3e956] to-[#01645e] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-sm mt-4">
                {isOpening 
                  ? 'سيتم تحديث الصفحة تلقائياً عند فتح النموذج' 
                  : 'يرجى التأكد من إرسال إجاباتك قبل انتهاء الوقت'}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
