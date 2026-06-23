"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3", disabled && "opacity-50 pointer-events-none", className)}
    >
      {(label || description) && (
        <div className="flex-1">
          {label && <p className="text-sm text-cream/80">{label}</p>}
          {description && <p className="text-xs text-cream/40 mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
          checked ? "bg-gold" : "bg-white/15"
        )}
      >
        <motion.span
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ left: checked ? "calc(100% - 20px)" : "4px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}
