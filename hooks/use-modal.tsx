"use client"

import { useState, useCallback } from 'react'
import { AlertModal, ConfirmModal } from '@/components/ui/modal'

interface UseModalReturn {
  // Alert functions
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  
  // Confirm function
  showConfirm: (
    message: string, 
    onConfirm: () => void, 
    title?: string,
    confirmText?: string,
    cancelText?: string,
    type?: 'danger' | 'warning' | 'info'
  ) => void
  
  // Modal components to render
  ModalComponents: React.FC
}

export function useModal(): UseModalReturn {
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmText: string
    cancelText: string
    type: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'warning'
  })

  const showSuccess = useCallback((message: string, title: string = '✅ نجح العملية') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type: 'success'
    })
  }, [])

  const showError = useCallback((message: string, title: string = '❌ حدث خطأ') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type: 'error'
    })
  }, [])

  const showWarning = useCallback((message: string, title: string = '⚠️ تحذير') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type: 'warning'
    })
  }, [])

  const showInfo = useCallback((message: string, title: string = 'ℹ️ معلومات') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type: 'info'
    })
  }, [])

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title: string = '🤔 تأكيد العملية',
    confirmText: string = 'تأكيد',
    cancelText: string = 'إلغاء',
    type: 'danger' | 'warning' | 'info' = 'warning'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      type
    })
  }, [])

  const closeAlertModal = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  const closeConfirmModal = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  const ModalComponents: React.FC = useCallback(() => (
    <>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlertModal}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
      />
    </>
  ), [alertModal, confirmModal, closeAlertModal, closeConfirmModal])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    ModalComponents
  }
}

// Helper function to replace alert() calls
export function createModalAlert() {
  let modalHook: UseModalReturn | null = null

  return {
    setHook: (hook: UseModalReturn) => {
      modalHook = hook
    },
    alert: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      if (modalHook) {
        switch (type) {
          case 'success':
            modalHook.showSuccess(message)
            break
          case 'error':
            modalHook.showError(message)
            break
          case 'warning':
            modalHook.showWarning(message)
            break
          default:
            modalHook.showInfo(message)
        }
      } else {
        // Fallback to regular alert if hook not available
        alert(message)
      }
    },
    confirm: (message: string, onConfirm: () => void, title?: string) => {
      if (modalHook) {
        modalHook.showConfirm(message, onConfirm, title)
      } else {
        // Fallback to regular confirm if hook not available
        if (confirm(message)) {
          onConfirm()
        }
      }
    }
  }
}
