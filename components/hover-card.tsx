'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, useRef, MouseEvent } from 'react'

interface HoverCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export function HoverCard({ children, className = '', intensity = 20 }: HoverCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovering(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 rounded-2xl blur-lg opacity-0"
        animate={{ opacity: isHovering ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  )
}
