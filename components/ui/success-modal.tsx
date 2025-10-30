'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, User, ArrowRight } from 'lucide-react'
import { Button } from './button'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  userName?: string
  onContinue?: () => void
  continueText?: string
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  userName,
  onContinue,
  continueText = 'متابعة'
}: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-[#01645e] mb-4"
              >
                {title}
              </motion.h2>

              {/* User Welcome */}
              {userName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-2xl p-4 mb-6"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <User className="w-5 h-5 text-[#3ab666]" />
                    <span className="text-[#01645e] font-semibold">مرحباً</span>
                  </div>
                  <p className="text-xl font-bold text-[#3ab666]">{userName}</p>
                </motion.div>
              )}

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-[#8b7632] text-lg leading-relaxed mb-8"
              >
                {message}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3"
              >
                {onContinue && (
                  <Button
                    onClick={onContinue}
                    className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white py-3 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    {continueText}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white py-3 px-6 rounded-xl font-semibold"
                >
                  إغلاق
                </Button>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#01645e] to-[#3ab666]" />
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * 100 - 50]
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.8 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="absolute w-2 h-2 bg-[#3ab666] rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
