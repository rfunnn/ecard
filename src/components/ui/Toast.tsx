"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => remove(id), 4000)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none w-[calc(100vw-2rem)] max-w-sm"
      >
        {toasts.map((t) => (
          <ToastBubble key={t.id} item={t} onDismiss={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const Icon =
    item.type === "success" ? CheckCircle2 : item.type === "error" ? AlertCircle : Info

  const cls =
    item.type === "success"
      ? "bg-emerald-900/95 border-emerald-500/30 text-emerald-200"
      : item.type === "error"
        ? "bg-red-900/95 border-red-500/30 text-red-200"
        : "bg-[#1c1c1c]/95 border-white/10 text-white"

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm text-sm ${cls}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 leading-snug">{item.message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
        aria-label="Tutup"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
