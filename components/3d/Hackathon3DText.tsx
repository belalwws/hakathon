"use client"

import React from 'react'
import { motion } from 'framer-motion'

export default function Hackathon3DText() {
  const arabicText = "هاكاثون الابتكار التقني"

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="relative flex items-center justify-center py-8"
    >
      <div className="relative text-center">
        {/* Main 3D Text */}
        <motion.div
          className="relative"
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
        >
          {/* Text Shadow/Depth */}
          <div
            className="absolute text-3xl md:text-5xl lg:text-6xl font-black text-[#01645e]/20 select-none"
            style={{
              transform: 'translate(3px, 3px)',
              filter: 'blur(1px)',
            }}
          >
            {arabicText}
          </div>

          {/* Main Text */}
          <div
            className="relative text-3xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br from-[#c3e956] via-[#3ab666] to-[#01645e] bg-clip-text text-transparent select-none"
            style={{
              textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {arabicText}
          </div>

          {/* Text Highlight */}
          <div
            className="absolute top-0 left-0 text-3xl md:text-5xl lg:text-6xl font-black text-white/15 select-none"
            style={{
              transform: 'translate(-1px, -1px)',
              WebkitTextStroke: '1px rgba(255,255,255,0.2)',
            }}
          >
            {arabicText}
          </div>

          {/* Glowing Effect */}
          <motion.div
            className="absolute inset-0 text-3xl md:text-5xl lg:text-6xl font-black text-[#c3e956] select-none"
            animate={{
              opacity: [0, 0.3, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            style={{
              filter: 'blur(2px)',
            }}
          >
            {arabicText}
          </motion.div>
        </motion.div>
        
        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
        >
          <div className="text-lg md:text-xl font-semibold text-[#8b7632] tracking-widest">
            الابتكار التقني
          </div>
          
          {/* Underline animation */}
          <motion.div
            className="h-0.5 bg-gradient-to-r from-transparent via-[#c3e956] to-transparent mt-2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 3 }}
          />
        </motion.div>
        
        {/* Floating particles around text */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#c3e956] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                x: [-5, 5, -5],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2 + 3,
              }}
            />
          ))}
        </div>
        
        {/* Reflection effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 3.5 }}
          className="absolute top-full left-0 w-full h-20 overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(195, 233, 86, 0.1) 0%, transparent 100%)',
            transform: 'scaleY(-1)',
            filter: 'blur(1px)',
          }}
        >
          <div className="flex">
            {Array.from(arabicText).map((letter, index) => (
              <div
                key={index}
                className="text-6xl md:text-8xl font-black bg-gradient-to-br from-[#c3e956] via-[#3ab666] to-[#01645e] bg-clip-text text-transparent select-none opacity-30"
              >
                {letter}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
