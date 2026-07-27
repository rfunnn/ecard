"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gift, Loader2 } from "lucide-react"

type Tier = "bronze" | "silver" | "gold"

const TIER_LABELS: Record<Tier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold:   "Gold",
}

export function PublishFreeButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [tier, setTier] = useState<Tier>("gold")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePublish() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/cards/${slug}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        alert((data as { error?: string }).error ?? "Failed to publish")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors"
      >
        <Gift className="w-3 h-3" />
        Publish Free
      </button>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <select
        value={tier}
        onChange={(e) => setTier(e.target.value as Tier)}
        disabled={loading}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
      >
        {(Object.keys(TIER_LABELS) as Tier[]).map((t) => (
          <option key={t} value={t}>{TIER_LABELS[t]}</option>
        ))}
      </select>
      <button
        onClick={handlePublish}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gift className="w-3 h-3" />}
        OK
      </button>
      <button
        onClick={() => setOpen(false)}
        disabled={loading}
        className="px-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
      >
        Batal
      </button>
    </div>
  )
}
