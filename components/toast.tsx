'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const toastColors = {
  success: 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600',
  error: 'from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600',
  warning: 'from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600',
  info: 'from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600'
}

export function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = toastIcons[toast.type]

  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 min-w-[320px] max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${toastColors[toast.type]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {toast.message}
          </p>
          {toast.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}
