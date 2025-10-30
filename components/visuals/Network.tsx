"use client"

import React, { useEffect, useRef } from 'react'

export default function Network() {
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

    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
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
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
      }
      // draw edges
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 140) {
            const alpha = 1 - dist / 140
            ctx.strokeStyle = `rgba(1,100,94,${0.2 * alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      // draw nodes
      for (const n of nodes) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 6)
        grad.addColorStop(0, 'rgba(58,182,102,0.8)')
        grad.addColorStop(1, 'rgba(58,182,102,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2)
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



