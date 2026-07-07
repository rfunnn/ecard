"use client"

import Link from "next/link"
import { FileText } from "lucide-react"

export function NavCartButton() {
  return (
    <Link
      href="/dashboard"
      className="relative flex items-center gap-1.5 text-[var(--tx-2)] hover:text-[var(--tx-1)] text-sm transition-colors px-3 py-2"
    >
      <FileText className="w-4 h-4" />
      <span className="hidden sm:inline">Kad Saya</span>
    </Link>
  )
}
