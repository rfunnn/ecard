"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function InviteError({
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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6 text-center">
      <AlertTriangle className="w-12 h-12 text-neutral-600 mb-5" />
      <h1 className="text-lg font-semibold text-white mb-2">
        Kad Tidak Dapat Dimuatkan
      </h1>
      <p className="text-sm text-neutral-400 max-w-xs mb-6 leading-relaxed">
        Ralat berlaku semasa memuatkan jemputan ini. Sila cuba lagi.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Cuba Semula
      </button>
    </div>
  )
}
