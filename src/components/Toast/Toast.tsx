import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { bem, cn } from '@/utils/cn'
import './Toast.scss'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number
}

interface ToastItemProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

const b = 'toast'

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 3000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const icons: Record<ToastVariant, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <motion.div
      className={cn(
        bem(b, undefined, { [`variant-${toast.variant ?? 'info'}`]: true })
      )}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      role="alert"
      aria-live="polite"
    >
      <span className={bem(b, 'icon')} aria-hidden="true">
        {icons[toast.variant ?? 'info']}
      </span>
      <span className={bem(b, 'message')}>{toast.message}</span>
    </motion.div>
  )
}

// Simple global toast state
type ToastListener = (toasts: ToastMessage[]) => void
let toasts: ToastMessage[] = []
const listeners = new Set<ToastListener>()

function notify() {
  listeners.forEach((l) => l([...toasts]))
}

export const toast = {
  show: (message: string, variant?: ToastVariant, duration?: number) => {
    const id = crypto.randomUUID()
    toasts = [...toasts, { id, message, variant, duration }]
    notify()
    return id
  },
  success: (message: string) => toast.show(message, 'success'),
  error: (message: string) => toast.show(message, 'error'),
  warning: (message: string) => toast.show(message, 'warning'),
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  },
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastMessage[]>([])

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  const dismiss = useCallback((id: string) => toast.dismiss(id), [])

  return createPortal(
    <div className={`${b}-container`} aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
