'use client'

import { useEffect, useState } from 'react'

export function MagneticCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })

      const target = e.target as HTMLElement
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A'
      )
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <>
      {/* Main cursor */}
      <div
        className="fixed w-4 h-4 pointer-events-none z-[9999] hidden lg:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div
          className={`w-full h-full rounded-full border-2 transition-all duration-200 ${
            isPointer 
              ? 'border-indigo-600 dark:border-indigo-400 scale-150' 
              : 'border-gray-600 dark:border-gray-400'
          } ${
            isClicking ? 'scale-75' : ''
          }`}
        />
      </div>

      {/* Trailing cursor */}
      <div
        className="fixed w-8 h-8 pointer-events-none z-[9998] hidden lg:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.15s ease-out'
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-200 ${
            isPointer 
              ? 'bg-indigo-600/20 dark:bg-indigo-400/20 scale-100' 
              : 'bg-gray-600/10 dark:bg-gray-400/10 scale-75'
          } ${
            isClicking ? 'scale-50' : ''
          }`}
        />
      </div>
    </>
  )
}
