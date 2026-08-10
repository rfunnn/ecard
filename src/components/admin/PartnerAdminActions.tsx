"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, PauseCircle, Loader2, ChevronDown } from "lucide-react"

interface Props {
  partnerId: string
  currentStatus: string
  currentRate: number
}

export function PartnerAdminActions({ partnerId, currentStatus, currentRate }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [rate, setRate] = useState((currentRate / 100).toFixed(2))
  const [showRate, setShowRate] = useState(false)

  async function updatePartner(payload: Record<string, unknown>, label: string) {
    if (loading) return
    setLoading(label)
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        alert(data.error ?? `Gagal: ${label}`)
      }
    } finally {
      setLoading(null)
    }
  }

  async function saveRate() {
    const rmValue = parseFloat(rate)
    if (isNaN(rmValue) || rmValue < 0) {
      alert("Kadar mestilah 0 atau lebih")
      return
    }
    const sen = Math.round(rmValue * 100)
    await updatePartner({ partnerRate: sen }, "rate")
    setShowRate(false)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {currentStatus !== "ACTIVE" && (
        <button
          onClick={() => updatePartner({ status: "ACTIVE" }, "approve")}
          disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
        >
          {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          Lulus
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => updatePartner({ status: "REJECTED" }, "reject")}
          disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
        >
          {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
          Tolak
        </button>
      )}
      {currentStatus === "ACTIVE" && (
        <button
          onClick={() => updatePartner({ status: "SUSPENDED" }, "suspend")}
          disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
        >
          {loading === "suspend" ? <Loader2 className="w-3 h-3 animate-spin" /> : <PauseCircle className="w-3 h-3" />}
          Gantung
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setShowRate((v) => !v)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
        >
          Kadar <ChevronDown className="w-3 h-3" />
        </button>
        {showRate && (
          <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[180px]">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kadar (RM / kad)</label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">RM</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                onClick={saveRate}
                disabled={loading === "rate"}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg font-medium disabled:opacity-50"
              >
                {loading === "rate" ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
