"use client"

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Node {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

export default function InnovationNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize nodes
    const initNodes = () => {
      nodesRef.current = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 2,
        color: [
          '#c3e956',
          '#3ab666', 
          '#01645e',
          '#8b7632'
        ][Math.floor(Math.random() * 4)]
      }))
    }
    initNodes()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update node positions
      nodesRef.current.forEach(node => {
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1

        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x))
        node.y = Math.max(0, Math.min(canvas.height, node.y))
      })

      // Draw connections
      ctx.strokeStyle = 'rgba(195, 233, 86, 0.3)'
      ctx.lineWidth = 1
      
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i]
          const nodeB = nodesRef.current[j]
          const distance = Math.sqrt(
            Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2)
          )

          if (distance < 150) {
            const opacity = 1 - distance / 150
            ctx.globalAlpha = opacity * 0.5
            
            // Create gradient line
            const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y)
            gradient.addColorStop(0, nodeA.color)
            gradient.addColorStop(1, nodeB.color)
            ctx.strokeStyle = gradient

            ctx.beginPath()
            ctx.moveTo(nodeA.x, nodeA.y)
            ctx.lineTo(nodeB.x, nodeB.y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      ctx.globalAlpha = 1
      nodesRef.current.forEach(node => {
        // Node glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.size * 3
        )
        gradient.addColorStop(0, node.color + 'AA')
        gradient.addColorStop(1, node.color + '00')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Node core
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fill()

        // Node highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.beginPath()
        ctx.arc(node.x - node.size * 0.3, node.y - node.size * 0.3, node.size * 0.3, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Overlay text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-center"
        >
          <div className="text-white/20 text-6xl font-bold mb-2">INNOVATION</div>
          <div className="text-white/10 text-2xl">NETWORK</div>
        </motion.div>
      </div>
    </motion.div>
  )
}
