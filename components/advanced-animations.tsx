'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface ParallaxSectionProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function ParallaxSection({ children, speed = 0.5, className = '' }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -50 * speed])
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <motion.div ref={ref} style={{ y: springY }} className={className}>
      {children}
    </motion.div>
  )
}

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '', className = '' }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration])

  return (
    <div ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  )
}

interface ConfettiProps {
  active: boolean
  duration?: number
}

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    color: string
    size: number
    delay: number
  }>>([])

  useEffect(() => {
    if (active) {
      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [active, duration])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size
          }}
          initial={{ y: particle.y, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: 0,
            rotate: 720
          }}
          transition={{
            duration: 3,
            delay: particle.delay,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  className?: string
}

export function ScrollReveal({ 
  children, 
  direction = 'up', 
  delay = 0, 
  className = '' 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  const variants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: -50, opacity: 0 },
    right: { x: 50, opacity: 0 }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={variants[direction]}
      animate={isVisible ? { x: 0, y: 0, opacity: 1 } : variants[direction]}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  duration?: number
  yOffset?: number
  className?: string
}

export function FloatingElement({ 
  children, 
  duration = 3, 
  yOffset = 20, 
  className = '' 
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-yOffset, yOffset, -yOffset]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}
