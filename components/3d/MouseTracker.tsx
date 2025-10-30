"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MouseTracker() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMoving, setIsMoving] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsMoving(true)
      
      clearTimeout(timeout)
      timeout = setTimeout(() => setIsMoving(false), 150)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Main cursor trail */}
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-[#c3e956] to-[#3ab666] opacity-60"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
        animate={{
          scale: isMoving ? 1.5 : 1,
          opacity: isMoving ? 0.8 : 0.4,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />

      {/* Secondary trail */}
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-[#01645e] opacity-40"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
        }}
        animate={{
          scale: isMoving ? 1.2 : 0.8,
          opacity: isMoving ? 0.6 : 0.2,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          delay: 0.05,
        }}
      />

      {/* Particle trail */}
      {isMoving && (
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-[#c3e956]"
          style={{
            left: mousePosition.x - 4,
            top: mousePosition.y - 4,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Ripple effect on movement */}
      {isMoving && (
        <motion.div
          className="absolute border-2 border-[#3ab666] rounded-full"
          style={{
            left: mousePosition.x - 20,
            top: mousePosition.y - 20,
            width: 40,
            height: 40,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      )}
    </div>
  )
}
