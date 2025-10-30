'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <AnimatePresence mode="wait">
        {isAnimating && (
          <motion.div
            key="transition-overlay"
            className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 z-[200] flex items-center justify-center"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.5, ease: [0.87, 0, 0.13, 1] }}
            style={{ originY: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="text-white text-4xl font-bold"
            >
              HackPro
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  )
}
