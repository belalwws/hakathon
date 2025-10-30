'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'

export function BackgroundAnimations() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Fix hydration error - only render animations on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particles
    const particles: Particle[] = []
    const particleCount = 50

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * (canvas?.width || 0)
        this.y = Math.random() * (canvas?.height || 0)
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        
        // Different colors for light/dark mode
        const colors = theme === 'dark' 
          ? ['rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)']
          : ['rgba(99, 102, 241, 0.2)', 'rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        if (!canvas) return
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            if (!ctx) return
            ctx.strokeStyle = theme === 'dark'
              ? `rgba(99, 102, 241, ${0.2 * (1 - distance / 120)})`
              : `rgba(99, 102, 241, ${0.1 * (1 - distance / 120)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme])

  return (
    <>
      {/* Canvas Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Floating Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 dark:from-indigo-600/15 dark:to-blue-600/15 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Floating Shapes - Only render on client to avoid hydration */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
          {[...Array(6)].map((_, i) => {
            const randomX = Math.random() * 100
            const randomY = Math.random() * 100
            const randomMove = Math.random() * 100 - 50
            const randomDuration = 15 + Math.random() * 10
            
            return (
              <motion.div
                key={i}
                className="absolute w-20 h-20 border-2 border-indigo-300/20 dark:border-indigo-500/20 rounded-lg"
                style={{
                  left: `${randomX}%`,
                  top: `${randomY}%`,
                }}
                animate={{
                  x: [0, randomMove],
                  y: [0, randomMove],
                  rotate: [0, 360],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: randomDuration,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 2,
                }}
              />
            )
          })}
        </div>
      )}

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          zIndex: 3,
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </>
  )
}
