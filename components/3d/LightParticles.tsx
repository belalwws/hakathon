"use client"

import React from 'react'
import { motion } from 'framer-motion'

export default function LightParticles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 3,
    color: [
      'bg-yellow-400',
      'bg-blue-400', 
      'bg-green-400',
      'bg-purple-400',
      'bg-pink-400',
      'bg-cyan-400'
    ][Math.floor(Math.random() * 6)]
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${particle.color} rounded-full opacity-60`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            boxShadow: `0 0 ${particle.size * 2}px currentColor`,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        >
          {/* Inner glow */}
          <div 
            className="absolute inset-0 rounded-full bg-white opacity-50"
            style={{
              filter: 'blur(1px)',
            }}
          />
          
          {/* Outer glow */}
          <div 
            className={`absolute inset-0 rounded-full ${particle.color} opacity-30`}
            style={{
              transform: 'scale(2)',
              filter: 'blur(2px)',
            }}
          />
        </motion.div>
      ))}
      
      {/* Firefly trails */}
      {particles.slice(0, 8).map((particle) => (
        <motion.div
          key={`trail-${particle.id}`}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
        >
          <motion.div
            className="w-0.5 h-8 bg-gradient-to-t from-transparent via-yellow-400 to-transparent opacity-40"
            animate={{
              rotate: [0, 360],
              scaleY: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: particle.duration * 1.5,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        </motion.div>
      ))}
      
      {/* Sparkle effects */}
      {particles.slice(0, 5).map((particle) => (
        <motion.div
          key={`sparkle-${particle.id}`}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: particle.delay + 1,
            repeatDelay: 3,
          }}
        >
          <div className="relative">
            {/* Four-pointed star */}
            <div className="absolute w-4 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-0.5 h-4 bg-white transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-3 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
            <div className="absolute w-0.5 h-3 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
