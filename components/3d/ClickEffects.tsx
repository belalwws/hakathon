"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ClickEffect {
  id: number
  x: number
  y: number
}

export default function ClickEffects() {
  const [clicks, setClicks] = useState<ClickEffect[]>([])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newClick: ClickEffect = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      }
      
      setClicks(prev => [...prev, newClick])
      
      // Remove click effect after animation
      setTimeout(() => {
        setClicks(prev => prev.filter(click => click.id !== newClick.id))
      }, 1000)
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {clicks.map((click) => (
          <div key={click.id}>
            {/* Main explosion */}
            <motion.div
              className="absolute"
              style={{
                left: click.x - 25,
                top: click.y - 25,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#c3e956] to-[#3ab666] opacity-60" />
            </motion.div>

            {/* Ripple waves */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border-2 border-[#c3e956] rounded-full"
                style={{
                  left: click.x - 20,
                  top: click.y - 20,
                  width: 40,
                  height: 40,
                }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3 + i, opacity: 0 }}
                transition={{ 
                  duration: 0.8 + i * 0.2, 
                  delay: i * 0.1,
                  ease: "easeOut" 
                }}
              />
            ))}

            {/* Particle burst */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const distance = 50 + Math.random() * 30
              
              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-[#c3e956]"
                  style={{
                    left: click.x - 4,
                    top: click.y - 4,
                  }}
                  initial={{ 
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                />
              )
            })}

            {/* Star burst */}
            <motion.div
              className="absolute"
              style={{
                left: click.x - 15,
                top: click.y - 15,
              }}
              initial={{ scale: 0, rotate: 0, opacity: 1 }}
              animate={{ scale: 1.5, rotate: 180, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <svg width="30" height="30" viewBox="0 0 30 30">
                <path
                  d="M15,2 L18,12 L28,15 L18,18 L15,28 L12,18 L2,15 L12,12 Z"
                  fill="#c3e956"
                  opacity="0.8"
                />
              </svg>
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
