"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label="Tukar tema"
      className="flex items-center justify-center w-8 h-8 rounded-full text-[var(--tx-2)] hover:text-[var(--tx-1)] hover:bg-[var(--sf)] transition-colors"
      style={{ border: "1px solid var(--bd)" }}
    >
      {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  )
}
