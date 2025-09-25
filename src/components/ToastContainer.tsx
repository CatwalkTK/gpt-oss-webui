'use client'

import { useState, useCallback } from 'react'
import Toast from './Toast'

interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

let toastContainer: {
  addToast: (message: string, type: ToastItem['type'], duration?: number) => void
} | null = null

export function showToast(message: string, type: ToastItem['type'] = 'info', duration?: number) {
  if (toastContainer) {
    toastContainer.addToast(message, type, duration)
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info', duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const toast: ToastItem = { id, message, type, duration }

    setToasts(prev => [...prev, toast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Register global toast container
  toastContainer = { addToast }

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}