"use client"

import { useState, useCallback } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto remove after duration
    const duration = notification.duration || 5000
    setTimeout(() => {
      removeNotification(id)
    }, duration)
    
    return id
  }, [removeNotification])

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return showNotification({ type: 'success', title, message, duration })
  }, [showNotification])

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return showNotification({ type: 'error', title, message, duration: duration || 7000 })
  }, [showNotification])

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return showNotification({ type: 'warning', title, message, duration })
  }, [showNotification])

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return showNotification({ type: 'info', title, message, duration })
  }, [showNotification])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  }
}

// Global notification system using browser notifications
export function useSystemNotifications() {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }, [])

  const showSystemNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    const hasPermission = await requestPermission()
    
    if (!hasPermission) {
      console.warn('Notification permission not granted')
      return null
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })

    return notification
  }, [requestPermission])

  return {
    requestPermission,
    showSystemNotification,
    isSupported: 'Notification' in window,
    permission: typeof window !== 'undefined' ? Notification.permission : 'default'
  }
}
