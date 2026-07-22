"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2, Home, ExternalLink } from "lucide-react"
import { removeFromCart } from "@/lib/cart"

interface OrderCard {
  slug:    string
  cardNum: number | null
  name:    string | null
  package: string
  amount:  number
}

interface OrderStatus {
  status:      string
  totalAmount: number
  paidAt:      string | null
  isRenewal:   boolean
  isUpgrade:   boolean
  cards:       OrderCard[]
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const orderId      = searchParams.get("orderId")

  const [order,   setOrder]   = useState<OrderStatus | null>(null)
  const [polling, setPolling] = useState(true)
  const [error,   setError]   = useState(false)
  const attemptsRef = useRef(0)

  const fetchStatus = useCallback(async () => {
    if (!orderId) { setError(true); setPolling(false); return }

    try {
      const res  = await fetch(`/api/checkout/status?orderId=${orderId}`)
      if (!res.ok) { setError(true); setPolling(false); return }

      const data = (await res.json()) as OrderStatus
      setOrder(data)

      if (data.status === "PAID") {
        // Clear the paid card slugs from cart
        data.cards.forEach((c) => removeFromCart(c.slug))
        setPolling(false)
      } else if (data.status === "FAILED" || data.status === "CANCELLED") {
        setPolling(false)
      } else {
        // PENDING — keep polling (up to 12 attempts = 36 s)
        attemptsRef.current += 1
        if (attemptsRef.current >= 12) {
          setPolling(false)
        }
      }
    } catch {
      setError(true)
      setPolling(false)
    }
  }, [orderId])

  // Initial fetch + polling
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!polling) return
    const id = setInterval(fetchStatus, 3000)
    return () => clearInterval(id)
  }, [polling, fetchStatus])

  // ── Redirect if no orderId ──
  useEffect(() => {
    if (!orderId) router.replace("/")
  }, [orderId, router])

  if (!orderId) return null

  // ── Loading / polling ──
  if (!order || (order.status === "PENDING" && polling)) {
    return (
      <div className="min-h-screen bg-[var(--pg)] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mb-5">
          <Loader2 className="w-7 h-7 text-gold animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--tx-1)] mb-2">Mengesahkan Pembayaran…</h1>
        <p className="text-sm text-[var(--tx-3)] max-w-xs">
          Sila tunggu sebentar. Ini mungkin mengambil masa sehingga 30 saat.
        </p>
      </div>
    )
  }

  // ── Error / not found ──
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--pg)] flex flex-col items-center justify-center px-4 text-center">
        <XCircle className="w-14 h-14 text-red-400 mb-4" />
        <h1 className="text-xl font-semibold text-[var(--tx-1)] mb-2">Ralat</h1>
        <p className="text-sm text-[var(--tx-3)] mb-6">Tidak dapat mengesahkan status pesanan.</p>
        <Link href="/" className="text-gold text-sm hover:underline">Kembali ke laman utama</Link>
      </div>
    )
  }

  // ── Payment failed ──
  if (order.status === "FAILED" || order.status === "CANCELLED") {
    return (
      <div className="min-h-screen bg-[var(--pg)] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-5">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--tx-1)] mb-2">Pembayaran Tidak Berjaya</h1>
        <p className="text-sm text-[var(--tx-3)] mb-6 max-w-sm">
          Pembayaran anda tidak dapat diproses. Sila cuba lagi atau hubungi kami jika masalah berterusan.
        </p>
        <div className="flex gap-3">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/25 text-gold text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            Cuba Lagi
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[var(--bd)] text-[var(--tx-2)] text-sm font-medium px-5 py-2.5 rounded-full transition-colors hover:bg-[var(--sf)]"
          >
            <Home className="w-4 h-4" /> Laman Utama
          </Link>
        </div>
      </div>
    )
  }

  // ── Pending but timed out ──
  if (order.status === "PENDING") {
    return (
      <div className="min-h-screen bg-[var(--pg)] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mb-5">
          <Loader2 className="w-7 h-7 text-gold" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--tx-1)] mb-2">Sedang Diproses</h1>
        <p className="text-sm text-[var(--tx-3)] mb-6 max-w-sm">
          Pembayaran anda sedang disahkan. Kad anda akan diterbitkan secara automatik sebaik sahaja pengesahan selesai.
        </p>
        <Link href="/templates" className="text-gold text-sm hover:underline">Kembali ke templat</Link>
      </div>
    )
  }

  // ── Payment success ──
  const totalRM = (order.totalAmount / 100).toFixed(2)

  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-playfair text-[var(--tx-1)] mb-2">Pembayaran Berjaya!</h1>
          <p className="text-sm text-[var(--tx-3)]">
            {order.isUpgrade
              ? `RM${totalRM} telah dibayar. Pakej kad anda berjaya dinaik taraf. Ciri baharu kini tersedia dalam builder.`
              : order.isRenewal
                ? `RM${totalRM} telah dibayar. Pautan kad anda telah dilanjutkan 6 bulan lagi.`
                : `RM${totalRM} telah dibayar. Kad anda kini diterbitkan dan boleh dikongsi.`
            }
          </p>
        </div>

        {/* Published / renewed cards */}
        <div className="rounded-xl border border-[var(--bd)] bg-[var(--pg-alt)] overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-[var(--bd)]">
            <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest">
              {order.isUpgrade
            ? `Pakej Dinaik Taraf (${order.cards.length})`
            : order.isRenewal
              ? `Kad Diperbaharui (${order.cards.length})`
              : `Kad Diterbitkan (${order.cards.length})`
          }
            </p>
          </div>
          <div className="divide-y divide-[var(--bd)]">
            {order.cards.map((card) => (
              <div key={card.slug} className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[var(--tx-1)] font-medium truncate">
                    {card.name || "Kad Jemputan"}
                  </p>
                  <p className="text-xs text-[var(--tx-3)]">{card.package} — RM{(card.amount / 100).toFixed(0)}</p>
                </div>
                <Link
                  href={card.cardNum ? `/${card.cardNum}` : `/${card.slug}`}
                  target="_blank"
                  className="shrink-0 flex items-center gap-1 text-[11px] text-gold hover:text-gold/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Lihat
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {order.isUpgrade && order.cards.length > 0 ? (
            <Link
              href={`/builder/${order.cards[0].slug}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold hover:bg-gold/90 text-ink text-sm font-bold transition-all"
            >
              Buka Builder — Guna Ciri Baharu
            </Link>
          ) : (
            <Link
              href="/templates"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold hover:bg-gold/90 text-ink text-sm font-bold transition-all"
            >
              Buat Kad Lain
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[var(--bd)] text-[var(--tx-2)] text-sm font-medium hover:bg-[var(--sf)] transition-colors"
          >
            <Home className="w-4 h-4" /> Laman Utama
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
