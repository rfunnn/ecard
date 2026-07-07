"use client"

import { Suspense } from "react"
import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, ShoppingBag, Shield, Loader2,
  CheckCircle2, Package, Sparkles, Video, Paintbrush,
} from "lucide-react"
import { getCartSlugs } from "@/lib/cart"
import { PaymentMethods } from "@/components/checkout/PaymentMethods"

// ─── types ───────────────────────────────────────────────────────────────────

interface WizardConfigSlice {
  packageType?: string
  addOnCustomDesign?: boolean
  addOnCoverVideo?: boolean
}

interface CartCard {
  id: string
  slug: string
  title: string
  groomName?: string
  brideName?: string
  isPublished: boolean
  wizardConfig: WizardConfigSlice | null
  template: { name: string; nameMs: string; category: string }
  theme: { primaryColor: string; bgColor: string } | null
}

// ─── pricing helpers ─────────────────────────────────────────────────────────

const PACKAGE_PRICES: Record<string, number> = { bronze: 30, silver: 40, gold: 60 }
const PACKAGE_LABELS: Record<string, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold" }

function parsePackage(raw?: string) {
  const key = (raw ?? "bronze").split("(")[0].trim().toLowerCase()
  return {
    key,
    label: PACKAGE_LABELS[key] ?? "Bronze",
    price: PACKAGE_PRICES[key] ?? 30,
  }
}

function cardTotal(wc: WizardConfigSlice | null): number {
  const { price } = parsePackage(wc?.packageType)
  return price + (wc?.addOnCustomDesign ? 10 : 0) + (wc?.addOnCoverVideo ? 10 : 0)
}

const CATEGORY_EMOJI: Record<string, string> = {
  WEDDING: "💍", BIRTHDAY: "🎂", CORPORATE: "🏢", GENERIC: "✉️",
}

const PACKAGE_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold:   "#D4AF37",
}

// ─── card row ────────────────────────────────────────────────────────────────

function CardRow({ card }: { card: CartCard }) {
  const wc = card.wizardConfig
  const pkg = parsePackage(wc?.packageType)
  const total = cardTotal(wc)
  const accent = card.theme?.primaryColor ?? "#D4AF37"
  const bg = card.theme?.bgColor ?? "#1a0a00"
  const displayName = card.groomName && card.brideName
    ? `${card.groomName} & ${card.brideName}`
    : card.title || "Kad Jemputan"

  if (card.isPublished) {
    return (
      <div className="flex gap-4 p-4 rounded-xl border border-[var(--bd)] bg-[var(--pg-alt)] opacity-60">
        <div
          className="shrink-0 w-10 rounded-lg overflow-hidden flex flex-col items-center justify-center"
          style={{ aspectRatio: "3/4", background: bg, border: `1px solid ${accent}30` }}
        >
          <span className="text-base">{CATEGORY_EMOJI[card.template.category] ?? "✉️"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--tx-1)] truncate">{displayName}</p>
          <p className="text-xs text-[var(--tx-3)] mt-0.5">{card.template.nameMs}</p>
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> Sudah Aktif
          </span>
        </div>
        <p className="text-sm text-[var(--tx-3)] shrink-0">—</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-[var(--bd)] bg-[var(--pg-alt)] hover:border-gold/20 transition-colors">
      <div
        className="shrink-0 w-10 rounded-lg overflow-hidden flex flex-col items-center justify-center"
        style={{ aspectRatio: "3/4", background: bg, border: `1px solid ${accent}30` }}
      >
        <div className="h-0.5 w-full" style={{ background: accent }} />
        <span className="text-base mt-auto mb-auto">{CATEGORY_EMOJI[card.template.category] ?? "✉️"}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--tx-1)] truncate">{displayName}</p>
        <p className="text-xs text-[var(--tx-3)] mt-0.5">{card.template.nameMs}</p>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5"
            style={{
              color: PACKAGE_COLORS[pkg.key] ?? "#D4AF37",
              background: `${PACKAGE_COLORS[pkg.key] ?? "#D4AF37"}15`,
              border: `1px solid ${PACKAGE_COLORS[pkg.key] ?? "#D4AF37"}30`,
            }}
          >
            <Package className="w-2.5 h-2.5" />
            {pkg.label} — RM{pkg.price}
          </span>

          {wc?.addOnCustomDesign && (
            <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded-full px-2 py-0.5">
              <Paintbrush className="w-2.5 h-2.5" /> Reka Bentuk +RM10
            </span>
          )}
          {wc?.addOnCoverVideo && (
            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-2 py-0.5">
              <Video className="w-2.5 h-2.5" /> Video Cover +RM10
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-bold text-gold">RM{total}</p>
      </div>
    </div>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  )
}

function CheckoutInner() {
  const router = useRouter()
  const { status } = useSession()
  const params = useSearchParams()
  const specificSlug = params.get("slug")

  const [cards, setCards]     = useState<CartCard[]>([])
  const [loading, setLoading] = useState(true)
  const [paying,  setPaying]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = specificSlug
        ? `/checkout?slug=${specificSlug}`
        : "/checkout"
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
  }, [status, router, specificSlug])

  useEffect(() => {
    if (status !== "authenticated") return

    // When coming from dashboard "PAY NOW", only load that specific card.
    // Otherwise fall back to the full localStorage cart.
    const slugsToLoad = specificSlug ? [specificSlug] : getCartSlugs()

    if (slugsToLoad.length === 0) {
      setLoading(false)
      return
    }

    fetch(`/api/cards?slugs=${slugsToLoad.join(",")}`)
      .then((r) => r.json())
      .then((d) => setCards(d.cards ?? []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false))
  }, [status, specificSlug])

  const unpaidCards    = cards.filter((c) => !c.isPublished)
  const publishedCards = cards.filter((c) =>  c.isPublished)
  const subtotal       = unpaidCards.reduce((s, c) => s + cardTotal(c.wizardConfig), 0)

  const handlePay = useCallback(async () => {
    if (paying || unpaidCards.length === 0) return
    setError(null)
    setPaying(true)

    try {
      const res = await fetch("/api/checkout/create-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardSlugs: unpaidCards.map((c) => c.slug) }),
      })
      const data = await res.json() as { paymentUrl?: string; error?: string }

      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? "Ralat semasa membuat bil pembayaran.")
        return
      }

      window.location.href = data.paymentUrl
    } catch {
      setError("Masalah sambungan. Sila cuba lagi.")
    } finally {
      setPaying(false)
    }
  }, [paying, unpaidCards])

  const isLoading = status === "loading" || loading
  const backHref  = specificSlug ? "/dashboard" : "/templates"
  const backLabel = specificSlug ? "Kad Saya" : "Kembali"

  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col">

      {/* Nav */}
      <div className="sticky top-0 z-40 bg-[var(--pg-nav)] backdrop-blur-md border-b border-[var(--bd)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
          <Link
            href={backHref}
            className="flex items-center gap-2 text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{backLabel}</span>
          </Link>
          <h1 className="font-playfair text-[15px] text-[var(--tx-1)]">Pembayaran</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>

        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="w-12 h-12 text-[var(--tx-3)]/30 mb-4" />
            <h2 className="text-lg font-semibold text-[var(--tx-1)] mb-2">Tiada kad untuk dibayar</h2>
            <p className="text-sm text-[var(--tx-3)] mb-6">Buat kad dahulu untuk meneruskan pembayaran</p>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/25 text-gold text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Pilih Templat
            </Link>
          </div>

        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* ── Left: Card list ── */}
            <div className="space-y-3">
              {/* Context banner when paying for a single specific card */}
              {specificSlug && unpaidCards.length === 1 && (
                <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
                  <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--tx-1)]">Pembayaran untuk kad ini sahaja</p>
                    <p className="text-xs text-[var(--tx-3)] mt-0.5">
                      Kad lain dalam akaun anda tidak termasuk dalam transaksi ini.
                    </p>
                  </div>
                </div>
              )}

              {unpaidCards.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-3">
                    Kad Untuk Diterbitkan ({unpaidCards.length})
                  </p>
                  <div className="space-y-2">
                    {unpaidCards.map((c) => <CardRow key={c.slug} card={c} />)}
                  </div>
                </div>
              )}

              {publishedCards.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-3">
                    Sudah Aktif ({publishedCards.length})
                  </p>
                  <div className="space-y-2">
                    {publishedCards.map((c) => <CardRow key={c.slug} card={c} />)}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Order summary ── */}
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="rounded-xl border border-[var(--bd)] bg-[var(--pg-alt)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--bd)]">
                  <p className="font-semibold text-[var(--tx-1)]">Ringkasan Pesanan</p>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {unpaidCards.map((c) => {
                    const name = c.groomName && c.brideName
                      ? `${c.groomName} & ${c.brideName}`
                      : c.title || "Kad Jemputan"
                    const total = cardTotal(c.wizardConfig)
                    return (
                      <div key={c.slug} className="flex items-center justify-between text-sm">
                        <span className="text-[var(--tx-2)] truncate pr-2 max-w-[180px]">{name}</span>
                        <span className="text-[var(--tx-1)] font-medium shrink-0">RM{total}</span>
                      </div>
                    )
                  })}

                  {unpaidCards.length === 0 && (
                    <p className="text-sm text-[var(--tx-3)]">Semua kad sudah aktif.</p>
                  )}

                  {unpaidCards.length > 0 && (
                    <div className="border-t border-[var(--bd)] pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--tx-1)]">Jumlah</span>
                      <span className="text-lg font-bold text-gold">RM{subtotal}</span>
                    </div>
                  )}
                </div>

                {unpaidCards.length > 0 && (
                  <div className="px-5 pb-5 space-y-3">
                    {error && (
                      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}
                    <button
                      onClick={handlePay}
                      disabled={paying}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold hover:bg-gold/90 text-ink text-sm font-bold transition-all disabled:opacity-60 active:scale-[0.98]"
                    >
                      {paying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Memproses…</>
                      ) : (
                        <>Bayar RM{subtotal} Sekarang</>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--tx-3)]">
                      <Shield className="w-3 h-3" />
                      Pembayaran selamat melalui ToyyibPay
                    </div>
                  </div>
                )}
              </div>

              {unpaidCards.length > 0 && <PaymentMethods />}

              {unpaidCards.length > 0 && (
                <div className="rounded-xl border border-[var(--bd)] bg-[var(--pg-alt)] px-5 py-4">
                  <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-3">
                    Selepas Bayar
                  </p>
                  <ul className="space-y-2 text-xs text-[var(--tx-2)]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Kad diterbitkan dan boleh dikongsi serta-merta
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Pautan unik kad anda diaktifkan
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      RSVP dan respons tetamu berfungsi
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
