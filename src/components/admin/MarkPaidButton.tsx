"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

export function MarkPaidButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!confirm("Mark this order as paid and publish its cards?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/mark-paid`, {
        method: "POST",
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        alert((data as { error?: string }).error ?? "Failed to mark as paid")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <CheckCircle2 className="w-3 h-3" />
      )}
      Mark Paid
    </button>
  )
}
