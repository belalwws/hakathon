"use client"

import React from 'react'
import { motion } from 'framer-motion'

export default function FloatingCubes() {
  const cubes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    color: [
      'from-[#01645e] to-[#3ab666]',
      'from-[#3ab666] to-[#c3e956]',
      'from-[#c3e956] to-[#8b7632]',
      'from-[#8b7632] to-[#01645e]'
    ][Math.floor(Math.random() * 4)]
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cubes.map((cube) => (
        <motion.div
          key={cube.id}
          className={`absolute bg-gradient-to-br ${cube.color} opacity-20 rounded-lg shadow-lg`}
          style={{
            width: cube.size,
            height: cube.size,
            left: `${cube.x}%`,
            top: `${cube.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotateX: [0, 360],
            rotateY: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: cube.duration,
            repeat: Infinity,
            delay: cube.delay,
            ease: "easeInOut",
          }}
        >
          {/* Inner cube for 3D effect */}
          <div className="absolute inset-2 bg-white/10 rounded backdrop-blur-sm" />
          
          {/* Glowing edges */}
          <div className="absolute inset-0 rounded-lg border border-white/30" />
          
          {/* Corner highlights */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full" />
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/30 rounded-full" />
        </motion.div>
      ))}
      
      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full">
        {cubes.slice(0, 4).map((cube, i) => {
          const nextCube = cubes[(i + 1) % 4]
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${cube.x}%`}
              y1={`${cube.y}%`}
              x2={`${nextCube.x}%`}
              y2={`${nextCube.y}%`}
              stroke="url(#gradient)"
              strokeWidth="1"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.5,
              }}
            />
          )
        })}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c3e956" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3ab666" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#01645e" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
