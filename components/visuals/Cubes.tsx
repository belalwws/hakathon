"use client"

import React, { useEffect, useRef } from 'react'

export default function Cubes() {
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

    const cubes = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      tx: (i % 6) * 26 + width / 2 - 6 * 13,
      ty: Math.floor(i / 6) * 26 + height / 2 - 3 * 13,
      s: Math.random() * 0.02 + 0.01,
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
      for (const c of cubes) {
        // move towards target then disperse
        const assemble = (Math.sin(c.p * Math.PI * 2) > 0)
        const targetX = assemble ? c.tx : Math.random() * width
        const targetY = assemble ? c.ty : Math.random() * height
        c.x += (targetX - c.x) * c.s
        c.y += (targetY - c.y) * c.s
        c.p += 0.003

        // draw cube as isometric square with shadow
        const size = 10
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate(0.25)
        ctx.fillStyle = 'rgba(1,100,94,0.12)'
        ctx.fillRect(-size, -size, size * 2, size * 2)
        ctx.strokeStyle = 'rgba(58,182,102,0.5)'
        ctx.lineWidth = 1
        ctx.strokeRect(-size, -size, size * 2, size * 2)
        ctx.restore()
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



