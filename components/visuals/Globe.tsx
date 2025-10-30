"use client"

import React, { useEffect, useRef } from 'react'

// Lightweight canvas-based rotating globe with glowing dots
export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.clientWidth
    let height = canvas.clientHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.scale(dpr, dpr)

    const radius = Math.min(width, height) / 2 - 4
    let t = 0

    const points = Array.from({ length: 120 }, () => ({
      lat: (Math.random() * 180 - 90) * (Math.PI / 180),
      lon: (Math.random() * 360 - 180) * (Math.PI / 180),
      glow: Math.random() * 0.6 + 0.4,
    }))

    function project(lat: number, lon: number, rot: number) {
      const x = Math.cos(lat) * Math.sin(lon + rot)
      const y = Math.sin(lat)
      const z = Math.cos(lat) * Math.cos(lon + rot)
      return { x, y, z }
    }

    function draw() {
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr)
        canvas.height = Math.floor(height * dpr)
        ctx.scale(dpr, dpr)
      }
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2

      // sphere
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(1,100,94,0.08)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(58,182,102,0.25)'
      ctx.lineWidth = 1
      ctx.stroke()

      // meridians/parallels subtle
      ctx.strokeStyle = 'rgba(1,100,94,0.15)'
      ctx.lineWidth = 0.5
      for (let i = -60; i <= 60; i += 30) {
        ctx.beginPath()
        ctx.arc(cx, cy, radius * Math.cos((i * Math.PI) / 180), 0, Math.PI * 2)
        ctx.stroke()
      }

      // points
      const rot = t * 0.002
      for (const p of points) {
        const pr = project(p.lat, p.lon, rot)
        if (pr.z < 0) continue // back face hidden for depth
        const px = cx + pr.x * radius
        const py = cy - pr.y * radius
        const s = (pr.z + 1) * 1.2
        const r = 2.2 * s
        const g = p.glow * s
        const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 2)
        grad.addColorStop(0, `rgba(195,233,86,${0.9 * g})`)
        grad.addColorStop(1, 'rgba(195,233,86,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fill()
      }

      t += 16
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}



