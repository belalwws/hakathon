"use client"

import React from 'react'
import { motion } from 'framer-motion'

export default function AnimatedBlobs() {
  const blobs = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 8 + Math.random() * 4,
    color: [
      'from-[#01645e]/20 to-[#3ab666]/30',
      'from-[#3ab666]/20 to-[#c3e956]/30',
      'from-[#c3e956]/20 to-[#8b7632]/30',
      'from-[#8b7632]/20 to-[#01645e]/30'
    ][Math.floor(Math.random() * 4)]
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className={`absolute bg-gradient-radial ${blob.color} rounded-full filter blur-xl`}
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [-30, 30, -30],
            y: [-20, 20, -20],
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            delay: blob.delay,
            ease: "easeInOut",
          }}
        >
          {/* Inner blob for layered effect */}
          <div 
            className={`absolute inset-4 bg-gradient-radial ${blob.color} rounded-full filter blur-sm opacity-60`}
          />
          
          {/* Core blob */}
          <div 
            className={`absolute inset-8 bg-gradient-radial ${blob.color} rounded-full opacity-80`}
          />
        </motion.div>
      ))}
      
      {/* Morphing shapes */}
      {blobs.slice(0, 3).map((blob) => (
        <motion.div
          key={`morph-${blob.id}`}
          className="absolute"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: blob.duration * 1.5,
            repeat: Infinity,
            delay: blob.delay + 2,
          }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" className="opacity-20">
            <motion.path
              d="M30,10 Q50,20 40,40 Q30,50 20,40 Q10,20 30,10"
              fill="url(#blobGradient)"
              animate={{
                d: [
                  "M30,10 Q50,20 40,40 Q30,50 20,40 Q10,20 30,10",
                  "M30,5 Q55,25 35,45 Q25,55 15,35 Q5,15 30,5",
                  "M30,10 Q50,20 40,40 Q30,50 20,40 Q10,20 30,10"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <defs>
              <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c3e956" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#3ab666" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#01645e" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

// Add custom CSS for radial gradients
const styles = `
  .bg-gradient-radial {
    background: radial-gradient(circle, var(--tw-gradient-stops));
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
