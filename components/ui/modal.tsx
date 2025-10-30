"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#01645e]">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = 'موافق',
  cancelText = 'إلغاء',
  showCancel = false
}: AlertModalProps) {
  const icons = {
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    error: <AlertCircle className="w-12 h-12 text-red-500" />,
    warning: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
    info: <Info className="w-12 h-12 text-blue-500" />
  }

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={`mx-auto w-fit p-4 rounded-full ${colors[type]} border mb-4`}>
          {icons[type]}
        </div>
        
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          {message}
        </p>
        
        <div className="flex gap-3 justify-center">
          {showCancel && (
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            className={`px-6 ${
              type === 'success' ? 'bg-green-600 hover:bg-green-700' :
              type === 'error' ? 'bg-red-600 hover:bg-red-700' :
              type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'warning'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      type={type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'info'}
      onConfirm={handleConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      showCancel={true}
    />
  )
}
