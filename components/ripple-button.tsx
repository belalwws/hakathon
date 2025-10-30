'use client'

import { useState, MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Button, ButtonProps } from './ui/button'

interface RippleButtonProps extends ButtonProps {
  children: React.ReactNode
}

interface Ripple {
  x: number
  y: number
  size: number
  id: number
}

export function RippleButton({ children, className = '', ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const addRipple = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now()
    }

    setRipples([...ripples, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((r) => r.id !== newRipple.id))
    }, 600)
  }

  return (
    <Button
      className={`relative overflow-hidden ${className}`}
      onClick={(e) => {
        addRipple(e)
        props.onClick?.(e)
      }}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 dark:bg-white/20 rounded-full pointer-events-none"
          initial={{
            width: ripple.size,
            height: ripple.size,
            x: ripple.x,
            y: ripple.y,
            opacity: 1,
            scale: 0
          }}
          animate={{
            scale: 2,
            opacity: 0
          }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </Button>
  )
}
