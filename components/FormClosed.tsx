"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { XCircle, Clock, Calendar, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface FormClosedProps {
  formTitle: string
  closedAt?: Date
  message?: string
}

export function FormClosed({ formTitle, closedAt, message }: FormClosedProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 via-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>

          <CardContent className="p-8 md:p-12 text-center">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
              transition={{ 
                scale: { duration: 0.5 },
                rotate: { duration: 0.6, delay: 0.5 }
              }}
              className="mb-6"
            >
              <div className="relative inline-block">
                {/* Pulse effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute inset-0 bg-red-500 rounded-full blur-xl"
                />
                <XCircle className="w-24 h-24 text-red-500 relative z-10" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            >
              انتهت مهلة التسجيل
            </motion.h1>

            {/* Form Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-full">
                <Info className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-semibold text-lg">
                  {formTitle}
                </span>
              </div>
            </motion.div>

            {/* Main Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 md:p-8">
                <Clock className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  {message || 'عذراً، لقد انتهى موعد قبول الردود على هذا النموذج'}
                </p>
                <p className="text-gray-600 mt-4">
                  لم يعد بإمكانك تقديم الإجابات في الوقت الحالي
                </p>
              </div>
            </motion.div>

            {/* Closed Date Info */}
            {closedAt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-full shadow-sm">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div className="text-right">
                    <span className="text-sm text-gray-500 block">تاريخ الإغلاق</span>
                    <span className="font-bold text-gray-800">
                      {new Date(closedAt).toLocaleString('ar-SA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Decorative separator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => router.push('/')}
                  className="px-8 py-3 text-lg bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white hover:from-[#3ab666] hover:to-[#c3e956] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  العودة للصفحة الرئيسية
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="px-8 py-3 text-lg border-2 border-gray-300 hover:border-[#01645e] hover:text-[#01645e] transition-all duration-300"
                >
                  رجوع
                </Button>
              </motion.div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-500">
                للاستفسارات يرجى التواصل مع الإدارة
              </p>
            </motion.div>

            {/* Floating particles animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-red-400/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
