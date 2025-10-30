"use client"

import React, { useRef } from 'react'

export default function Globe3D() {
  const globeRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className="relative w-80 h-80 mx-auto"
      style={{ transition: 'transform 200ms ease' }}
    >
      {/* Globe Container */}
      <div
        ref={globeRef}
        className="relative w-full h-full rounded-full shadow-2xl overflow-hidden cursor-pointer"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, rgba(58, 182, 102, 0.8) 0%, transparent 60%),
            linear-gradient(135deg, #0a4a44 0%, #2d7a52 30%, #4a9d5f 60%, #7bc142 100%)
          `,
          animation: 'globeSpin 30s linear infinite',
          boxShadow: `
            inset -20px -20px 50px rgba(0,0,0,0.3),
            inset 20px 20px 50px rgba(255,255,255,0.1),
            0 0 50px rgba(195, 233, 86, 0.3)
          `
        }}
      >
        {/* Continents - Simplified shapes */}
        <div className="absolute inset-0">
          {/* Africa/Europe */}
          <div className="absolute top-1/4 left-1/2 w-8 h-12 bg-green-800/40 rounded-lg transform -translate-x-1/2 rotate-12" />
          {/* Asia */}
          <div className="absolute top-1/3 right-1/4 w-10 h-8 bg-green-700/40 rounded-full" />
          {/* Americas */}
          <div className="absolute top-1/4 left-1/4 w-6 h-16 bg-green-600/40 rounded-full transform -rotate-12" />
          {/* Australia */}
          <div className="absolute bottom-1/3 right-1/3 w-4 h-3 bg-green-800/40 rounded-full" />
        </div>

        {/* Globe Grid Lines */}
        <div className="absolute inset-0">
          {/* Latitude lines */}
          {[...Array(4)].map((_, i) => (
            <div
              key={`lat-${i}`}
              className="absolute w-full border-t border-white/15"
              style={{
                top: `${(i + 1) * 20}%`,
                borderRadius: '50%',
                transform: `perspective(200px) rotateX(${(i - 1.5) * 15}deg)`
              }}
            />
          ))}
          {/* Longitude lines */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`lon-${i}`}
              className="absolute h-full border-l border-white/15"
              style={{
                left: `${(i + 1) * 16.66}%`,
                borderRadius: '50%',
                transform: `perspective(200px) rotateY(${(i - 2.5) * 20}deg)`
              }}
            />
          ))}
        </div>

        {/* Innovation Points */}
        <div
          className="absolute top-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-2 h-2 bg-cyan-400 rounded-full"
          style={{ animation: 'pulse 1.5s ease-in-out infinite 0.5s' }}
        />
        <div
          className="absolute bottom-1/3 left-1/2 w-2.5 h-2.5 bg-green-400 rounded-full"
          style={{ animation: 'pulse 1.8s ease-in-out infinite 1s' }}
        />
        <div
          className="absolute top-3/4 right-1/3 w-2 h-2 bg-purple-400 rounded-full"
          style={{ animation: 'pulse 2.2s ease-in-out infinite 1.5s' }}
        />

        {/* Atmosphere glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 via-transparent to-black/20" />
      </div>

      {/* Orbital Rings */}
      <div
        className="absolute inset-0 rounded-full border-2 border-[#c3e956]/40"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(195, 233, 86, 0.3) 50%, transparent 100%)',
          animation: 'ringRotate 20s linear infinite'
        }}
      />
      <div
        className="absolute inset-4 rounded-full border border-[#3ab666]/30"
        style={{
          background: 'conic-gradient(from 180deg, transparent 0%, rgba(58, 182, 102, 0.2) 50%, transparent 100%)',
          animation: 'ringRotateRev 30s linear infinite'
        }}
      />

      {/* Floating Particles */}
      <div className="absolute -inset-12">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#c3e956] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 6px currentColor',
              animation: `float ${4 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite`
            }}
          />
        ))}
      </div>

      {/* Satellite dots */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`satellite-${i}`}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transformOrigin: `0 ${120 + i * 20}px`,
            animation: `orbit ${8 + i * 2}s linear infinite`
          }}
        />
      ))}
    </div>
  )
}

// Add CSS animations
const styles = `
  @keyframes globeSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }

  @keyframes ringRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes ringRotateRev {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }

  @keyframes float {
    0%, 100% { transform: translate(0, -15px) scale(0.9); opacity: 0.6; }
    50% { transform: translate(0, 15px) scale(1.1); opacity: 1; }
  }

  @keyframes orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
