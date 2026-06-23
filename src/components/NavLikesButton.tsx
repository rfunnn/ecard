"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"

export function NavLikesButton() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kad_liked_templates")
      const ids = stored ? (JSON.parse(stored) as string[]) : []
      setCount(ids.length)
    } catch {}

    // Listen for storage changes (other tabs or same-page updates)
    const onStorage = () => {
      try {
        const stored = localStorage.getItem("kad_liked_templates")
        const ids = stored ? (JSON.parse(stored) as string[]) : []
        setCount(ids.length)
      } catch {}
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <Link
      href="/likes"
      className="relative flex items-center gap-1.5 text-[var(--tx-2)] hover:text-[var(--tx-1)] text-sm transition-colors px-3 py-2"
    >
      <Heart className={`w-4 h-4 ${count > 0 ? "fill-red-400 text-red-400" : ""}`} />
      <span className="hidden sm:inline">Suka</span>
      {count > 0 && (
        <span className="absolute -top-0.5 right-0 sm:static sm:ml-0.5 min-w-[18px] h-[18px] text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center px-1 font-bold leading-none">
          {count}
        </span>
      )}
    </Link>
  )
}
