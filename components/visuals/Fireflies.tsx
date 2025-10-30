"use client"

import React, { useEffect, useRef } from 'react'

export default function Fireflies() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let width = canvas.clientWidth
    let height = canvas.clientHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.scale(dpr, dpr)

    const N = 40
    const fireflies = Array.from({ length: N }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      p: Math.random(),
    }))

    function draw() {
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        ctx.scale(dpr, dpr)
      }
      ctx.clearRect(0, 0, width, height)
      for (const f of fireflies) {
        f.x += f.vx + Math.sin(f.p * Math.PI * 2) * 0.2
        f.y += f.vy + Math.cos(f.p * Math.PI * 2) * 0.2
        f.p += 0.003
        if (f.x < -10) f.x = width + 10
        if (f.x > width + 10) f.x = -10
        if (f.y < -10) f.y = height + 10
        if (f.y > height + 10) f.y = -10

        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6)
        grad.addColorStop(0, 'rgba(195,233,86,0.9)')
        grad.addColorStop(1, 'rgba(195,233,86,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}



