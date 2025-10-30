"use client"

import React from 'react'
import { motion } from 'framer-motion'

export default function Hackathon3DText() {
  return (
    <div className="relative select-none">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-black tracking-tight"
        style={{
          textShadow:
            '0 10px 30px rgba(1,100,94,0.25), 0 2px 0 rgba(1,100,94,0.3), 0 4px 0 rgba(1,100,94,0.2)'
        }}
      >
        <span className="bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent">
          HACKATHON
        </span>
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute -inset-x-4 -bottom-2 h-2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(195,233,86,0.5), rgba(195,233,86,0))'
        }}
      />
    </div>
  )
}



