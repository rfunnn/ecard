"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { useSession } from "next-auth/react"

export function NavCartButton() {
  const { data: session } = useSession()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!session) { setCount(0); return }
    fetch("/api/user/cards")
      .then(r => r.json())
      .then(d => setCount(d.cards?.length ?? 0))
      .catch(() => {})
  }, [session])

  return (
    <Link
      href="/dashboard"
      className="relative flex items-center gap-1.5 text-[var(--tx-2)] hover:text-[var(--tx-1)] text-sm transition-colors px-3 py-2"
    >
      <FileText className="w-4 h-4" />
      <span className="hidden sm:inline">Kad Saya</span>
      {count > 0 && (
        <span className="min-w-[18px] h-[18px] text-[10px] bg-gold text-ink rounded-full flex items-center justify-center px-1 font-bold leading-none">
          {count}
        </span>
      )}
    </Link>
  )
}
