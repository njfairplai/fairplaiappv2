'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: number
}

/**
 * Centered modal with backdrop blur. Locks body scroll while open.
 * `maxWidth` stays inline because it's a caller-supplied runtime value.
 */
export default function Modal({ open, onClose, title, children, maxWidth = 400 }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose()
      }}
      className={cn(
        'fixed inset-0 z-[1000] flex items-center justify-center p-5',
        'bg-black/60 backdrop-blur-sm',
      )}
    >
      <div
        style={{ maxWidth }}
        className={cn(
          'relative w-full max-h-[80vh] overflow-y-auto rounded-2xl p-6',
          'bg-brand-paper text-brand-indigo',
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="m-0 font-satoshi text-lg font-extrabold text-brand-indigo">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'cursor-pointer border-none bg-transparent p-1',
                'text-brand-indigo-mute hover:text-brand-indigo',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-paper rounded',
              )}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
