"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2, XCircle, PauseCircle, Loader2, ChevronDown,
  FileText, RotateCcw,
} from "lucide-react"

interface Props {
  partnerId: string
  currentStatus: string
  currentRate: number
}

export function PartnerStatusActions({ partnerId, currentStatus, currentRate }: Props) {
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
    if (isNaN(rmValue) || rmValue < 0) { alert("Kadar mestilah 0 atau lebih"); return }
    await updatePartner({ partnerRate: Math.round(rmValue * 100) }, "rate")
    setShowRate(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus !== "ACTIVE" && (
        <button onClick={() => updatePartner({ status: "ACTIVE" }, "approve")} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Lulus
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button onClick={() => updatePartner({ status: "REJECTED" }, "reject")} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          Tolak
        </button>
      )}
      {currentStatus === "ACTIVE" && (
        <button onClick={() => updatePartner({ status: "SUSPENDED" }, "suspend")} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "suspend" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PauseCircle className="w-3.5 h-3.5" />}
          Gantung
        </button>
      )}
      {currentStatus === "SUSPENDED" && (
        <button onClick={() => updatePartner({ status: "ACTIVE" }, "reactivate")} disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "reactivate" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          Aktifkan Semula
        </button>
      )}

      <div className="relative">
        <button onClick={() => setShowRate((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors">
          Edit Kadar <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {showRate && (
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[200px]">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kadar (RM / kad)</label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">RM</span>
                <input type="number" min="0" step="0.50" value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <button onClick={saveRate} disabled={loading === "rate"}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg font-semibold disabled:opacity-50">
                {loading === "rate" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface GenerateInvoiceProps {
  partnerId: string
  defaultPeriod: string
}

export function GenerateInvoiceButton({ partnerId, defaultPeriod }: GenerateInvoiceProps) {
  const router = useRouter()
  const [period, setPeriod] = useState(defaultPeriod)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function generate() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/billing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, billingPeriod: period }),
      })
      const data = await res.json() as { invoice?: { invoiceNumber: string }; error?: string }
      if (res.ok) {
        router.refresh()
      } else {
        setError(data.error ?? "Jana invois gagal")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <input
          type="month"
          value={period}
          onChange={(e) => { setPeriod(e.target.value); setError("") }}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
        />
        <button onClick={generate} disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          Jana Invois
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface InvoiceActionsProps {
  invoiceId: string
  currentStatus: string
}

export function InvoiceActions({ invoiceId, currentStatus }: InvoiceActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function update(status: string, label: string) {
    if (!confirm(`Tandakan invois ini sebagai "${label}"?`)) return
    setLoading(label)
    try {
      const res = await fetch(`/api/admin/billing/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        alert(data.error ?? "Gagal kemaskini invois")
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentStatus === "ISSUED" && (
        <button onClick={() => update("PAID", "Dibayar")} disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "Dibayar" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          Dibayar
        </button>
      )}
      {(currentStatus === "ISSUED" || currentStatus === "DRAFT") && (
        <button onClick={() => update("VOID", "Dibatal")} disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 text-xs font-semibold transition-colors">
          {loading === "Dibatal" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
          Batal
        </button>
      )}
      {currentStatus === "OVERDUE" && (
        <button onClick={() => update("PAID", "Dibayar")} disabled={!!loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
          {loading === "Dibayar" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          Dibayar
        </button>
      )}
    </div>
  )
}
