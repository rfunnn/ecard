"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, ArrowRight } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col items-center justify-center px-5 text-center">
      <div className="relative mb-8">
        <AlertTriangle className="w-14 h-14 text-gold/40" />
      </div>

      <h1 className="font-playfair text-2xl lg:text-3xl text-[var(--tx-1)] mb-3">
        Ralat Berlaku
      </h1>
      <p className="text-[var(--tx-2)] text-sm lg:text-base max-w-sm mb-8 leading-relaxed">
        Maaf, sesuatu yang tidak dijangka telah berlaku. Sila cuba lagi atau kembali ke laman utama.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-gold text-ink font-semibold px-6 py-2.5 rounded-full hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 active:scale-95 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Cuba Semula
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-[var(--bd)] hover:border-gold/40 text-[var(--tx-1)] px-6 py-2.5 rounded-full transition-all text-sm hover:bg-[var(--sf)] active:scale-95"
        >
          Laman Utama
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <p className="mt-10 text-[11px] text-[var(--tx-3)]">ekadku.com</p>
    </div>
  )
}
