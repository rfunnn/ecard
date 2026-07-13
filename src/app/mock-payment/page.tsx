export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { CheckCircle2, XCircle, Clock, AlertTriangle, FlaskConical } from "lucide-react"
import { simulateSuccess, simulateFailure, simulatePending } from "./actions"

interface Props {
  searchParams: Promise<{
    billCode?:  string
    orderId?:   string
    amount?:    string
    billName?:  string
    billTo?:    string
    returnUrl?: string
  }>
}

export default async function MockPaymentPage({ searchParams }: Props) {
  if (process.env.TOYYIBPAY_MOCK !== "true") {
    redirect("/")
  }

  const sp        = await searchParams
  const billCode  = sp.billCode  ?? ""
  const orderId   = sp.orderId   ?? ""
  const amount    = Number(sp.amount ?? "0")
  const billName  = sp.billName  ?? "Pembayaran"
  const billTo    = sp.billTo    ?? ""
  const returnUrl = sp.returnUrl ?? "/"

  if (!billCode || !orderId) {
    redirect("/")
  }

  const amountRM = (amount / 100).toFixed(2)

  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col items-center justify-center px-4 py-12">

      {/* Mock mode banner */}
      <div className="w-full max-w-md mb-5 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Mock Payment — Testing Only</p>
          <p className="text-[11px] text-amber-400/70 mt-0.5">No real money is charged. This page only appears when <code className="font-mono bg-amber-500/10 px-1 rounded">TOYYIBPAY_MOCK=true</code>.</p>
        </div>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-[var(--bd)] bg-[var(--pg-alt)] overflow-hidden shadow-xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--bd)] text-center">
          <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-1">Simulasi Pembayaran</p>
          <p className="text-2xl font-bold text-gold">RM {amountRM}</p>
          <p className="text-sm text-[var(--tx-2)] mt-1 truncate">{billName}</p>
          {billTo && <p className="text-xs text-[var(--tx-3)] mt-0.5">{billTo}</p>}
        </div>

        {/* Order details */}
        <div className="px-6 py-4 space-y-2 border-b border-[var(--bd)]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--tx-3)]">Order ID</span>
            <span className="text-[var(--tx-2)] font-mono">{orderId.slice(0, 16)}…</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--tx-3)]">Bill Code</span>
            <span className="text-[var(--tx-2)] font-mono">{billCode}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--tx-3)]">Jumlah</span>
            <span className="text-[var(--tx-1)] font-semibold">RM {amountRM}</span>
          </div>
        </div>

        {/* Simulation actions */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-4">Pilih Senario Ujian</p>

          {/* Success */}
          <form action={simulateSuccess}>
            <input type="hidden" name="billCode"  value={billCode} />
            <input type="hidden" name="orderId"   value={orderId} />
            <input type="hidden" name="returnUrl" value={returnUrl} />
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-left"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Simulate Successful Payment</p>
                <p className="text-[11px] text-emerald-400/70">Order → PAID, cards published</p>
              </div>
            </button>
          </form>

          {/* Pending / timeout */}
          <form action={simulatePending}>
            <input type="hidden" name="returnUrl" value={returnUrl} />
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors text-left"
            >
              <Clock className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Simulate Pending / Timeout</p>
                <p className="text-[11px] text-amber-400/70">Order stays PENDING — tests the 36 s polling timeout</p>
              </div>
            </button>
          </form>

          {/* Failure */}
          <form action={simulateFailure}>
            <input type="hidden" name="orderId"   value={orderId} />
            <input type="hidden" name="returnUrl" value={returnUrl} />
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-left"
            >
              <XCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Simulate Failed Payment</p>
                <p className="text-[11px] text-red-400/70">Order → FAILED, retry prompt shown</p>
              </div>
            </button>
          </form>
        </div>

        {/* Footer note */}
        <div className="px-6 py-4 border-t border-[var(--bd)] flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[var(--tx-3)] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[var(--tx-3)]">
            Each button directly calls the fulfillment logic — no external HTTP call to ToyyibPay is made.
            Remove <code className="font-mono bg-[var(--sf)] px-1 rounded">TOYYIBPAY_MOCK=true</code> from your <code className="font-mono bg-[var(--sf)] px-1 rounded">.env</code> for production.
          </p>
        </div>
      </div>
    </div>
  )
}
