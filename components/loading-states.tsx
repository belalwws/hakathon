'use client'

import { motion } from 'framer-motion'

export function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      >
        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
        </div>
      </motion.div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  )
}

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}
