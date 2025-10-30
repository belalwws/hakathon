"use client"

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface InteractiveCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export default function InteractiveCard({ 
  children, 
  className = "", 
  intensity = 1 
}: InteractiveCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    setMousePosition({
      x: (e.clientX - centerX) / rect.width * intensity,
      y: (e.clientY - centerY) / rect.height * intensity
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: mousePosition.y * 10,
        rotateY: mousePosition.x * 10,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#c3e956]/20 to-[#3ab666]/20 blur-xl"
        animate={{
          opacity: isHovered ? 0.6 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{
          background: `linear-gradient(${mousePosition.x * 45 + 45}deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Floating particles on hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#c3e956] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-20, -40],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
