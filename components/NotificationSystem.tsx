"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useNotifications, type Notification } from '@/hooks/use-notifications'

interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function NotificationSystem({ position = 'top-right' }: NotificationSystemProps) {
  const { notifications, removeNotification } = useNotifications()

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2 max-w-sm w-full`}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onRemove: () => void
  position: string
}

function NotificationItem({ notification, onRemove, position }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getAnimationDirection = () => {
    if (position.includes('right')) {
      return { x: 300 }
    } else {
      return { x: -300 }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...getAnimationDirection(), scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ 
        opacity: 0, 
        ...getAnimationDirection(), 
        scale: 0.5, 
        transition: { duration: 0.2 } 
      }}
      className={`
        shadow-lg rounded-lg pointer-events-auto border-2
        ${getBgColor()}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="mr-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm opacity-75">
                {notification.message}
              </p>
            )}
          </div>
          <div className="mr-4 flex-shrink-0 flex">
            <button
              className="rounded-md inline-flex opacity-50 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity"
              onClick={onRemove}
            >
              <span className="sr-only">إغلاق</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Hook to use notifications globally
export function useGlobalNotifications() {
  const notifications = useNotifications()
  
  // Enhanced notification functions with better UX
  const showSuccess = (title: string, message?: string) => {
    return notifications.showSuccess(title, message, 4000)
  }
  
  const showError = (title: string, message?: string) => {
    return notifications.showError(title, message, 8000)
  }
  
  const showWarning = (title: string, message?: string) => {
    return notifications.showWarning(title, message, 6000)
  }
  
  const showInfo = (title: string, message?: string) => {
    return notifications.showInfo(title, message, 5000)
  }

  // Specialized notifications for common scenarios
  const showUploadSuccess = (fileName?: string) => {
    return showSuccess(
      'تم الرفع بنجاح!',
      fileName ? `تم رفع ${fileName} بنجاح` : 'تم رفع الملف بنجاح'
    )
  }

  const showUploadError = (error?: string) => {
    return showError(
      'فشل في رفع الملف',
      error || 'حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى.'
    )
  }

  const showSaveSuccess = () => {
    return showSuccess('تم الحفظ بنجاح!', 'تم حفظ التغييرات بنجاح')
  }

  const showSaveError = (error?: string) => {
    return showError(
      'فشل في الحفظ',
      error || 'حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة مرة أخرى.'
    )
  }

  const showDeleteSuccess = (itemName?: string) => {
    return showSuccess(
      'تم الحذف بنجاح!',
      itemName ? `تم حذف ${itemName} بنجاح` : 'تم حذف العنصر بنجاح'
    )
  }

  const showDeleteError = (error?: string) => {
    return showError(
      'فشل في الحذف',
      error || 'حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.'
    )
  }

  const showAuthError = () => {
    return showError(
      'انتهت صلاحية الجلسة',
      'يرجى تسجيل الدخول مرة أخرى للمتابعة'
    )
  }

  const showNetworkError = () => {
    return showError(
      'مشكلة في الاتصال',
      'تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
    )
  }

  return {
    ...notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showUploadSuccess,
    showUploadError,
    showSaveSuccess,
    showSaveError,
    showDeleteSuccess,
    showDeleteError,
    showAuthError,
    showNetworkError
  }
}
