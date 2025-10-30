"use client"

import { useEffect } from 'react'

export function HeartbeatTracker() {
  useEffect(() => {
    // Throttle variables
    let lastActivityTime = Date.now()
    let isActive = true

    // Send heartbeat every 2 minutes
    const sendHeartbeat = async () => {
      try {
        const response = await fetch('/api/user/heartbeat', {
          method: 'POST',
          credentials: 'include'
        })

        // Don't log errors for expected failures (no token, etc.)
        if (!response.ok && response.status !== 200) {
          // Only log unexpected errors
          console.warn('Heartbeat failed with status:', response.status)
        }
      } catch (error) {
        // Silent fail - network errors are expected sometimes
        // Don't spam console
      }
    }

    // Send initial heartbeat after a short delay
    const initialTimeout = setTimeout(() => {
      sendHeartbeat()
    }, 1000) // 1 second delay to let auth settle

    // Set up interval to send heartbeat every 2 minutes
    const interval = setInterval(() => {
      if (isActive) {
        sendHeartbeat()
      }
    }, 2 * 60 * 1000) // 2 minutes

    // Throttle activity events (only send once per minute)
    const throttledActivity = () => {
      const now = Date.now()
      if (now - lastActivityTime > 60 * 1000) { // 1 minute
        lastActivityTime = now
        sendHeartbeat()
      }
    }

    // Listen for user activity
    window.addEventListener('mousemove', throttledActivity)
    window.addEventListener('keydown', throttledActivity)
    window.addEventListener('click', throttledActivity)

    // Cleanup
    return () => {
      isActive = false
      clearTimeout(initialTimeout)
      clearInterval(interval)
      window.removeEventListener('mousemove', throttledActivity)
      window.removeEventListener('keydown', throttledActivity)
      window.removeEventListener('click', throttledActivity)
    }
  }, [])

  return null // This component doesn't render anything
}

