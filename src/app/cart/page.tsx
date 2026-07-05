"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import {
  ChevronLeft, ShoppingBag, Pencil, Eye, Printer,
  Trash2, Plus, CreditCard, Clock, AlertTriangle,
  Link2, Copy, Check, Share2, Download, QrCode,
} from "lucide-react"
import { getCartSlugs, removeFromCart, addToCart } from "@/lib/cart"
import type { WizardConfig } from "@/types/config"
import { generatePrintHTML } from "@/lib/print-card"

interface CartCard {
  slug: string
  title: string
  groomName?: string | null
  brideName?: string | null
  language: string
  isPublished: boolean
  updatedAt: string
  template: { name: string; nameMs: string; category: string }
  theme: { primaryColor: string; bgColor: string } | null
  wizardConfig?: WizardConfig | null
}

const CAT_EMOJI: Record<string, string> = {
  WEDDING: "💍",
  BIRTHDAY: "🎂",
  CORPORATE: "🏢",
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ms-MY", {
      day: "numeric", month: "long", year: "numeric",
    })
  } catch {
    return iso
  }
}

const BASE_URL = typeof window !== "undefined"
  ? window.location.origin
  : "https://ekadku.com"

// ── Share / QR panel for a single card ───────────────────────────────────────
function SharePanel({ card, onSlugChange }: { card: CartCard; onSlugChange: (oldSlug: string, newSlug: string) => void }) {
  const [input,      setInput]      = useState(card.slug)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)
  const [qrDataUrl,  setQrDataUrl]  = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const shareUrl = `${BASE_URL}/invite/${card.slug}`
  const isMs = card.language === "ms"

  // Generate QR whenever card.slug changes
  useEffect(() => {
    let cancelled = false
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: { dark: "#1a1a1a", light: "#ffffff" },
      }).then((url) => {
        if (!cancelled) setQrDataUrl(url)
      }).catch(() => {})
    }).catch(() => {})
    return () => { cancelled = true }
  }, [shareUrl])

  const handleSave = useCallback(async () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed === card.slug) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/cards/${card.slug}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newSlug: trimmed }),
      })
      const data = await res.json() as { slug?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? (isMs ? "Gagal menyimpan." : "Failed to save."))
        return
      }
      onSlugChange(card.slug, data.slug!)
    } catch {
      setError(isMs ? "Tiada sambungan. Cuba lagi." : "Connection error. Try again.")
    } finally {
      setSaving(false)
    }
  }, [card.slug, input, isMs, onSlugChange])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback — select in the displayed URL
    }
  }

  async function nativeShare() {
    if (!navigator.share) { copyLink(); return }
    try {
      await navigator.share({ title: card.title, url: shareUrl })
    } catch {
      // user cancelled
    }
  }

  function downloadQr() {
    if (!qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `qr-${card.slug}.png`
    a.click()
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--tx-3)] uppercase tracking-widest">
        <Link2 className="w-3 h-3" />
        {isMs ? "Pautan Perkongsian" : "Share Link"}
      </div>

      {/* Custom link editor */}
      <div className="flex gap-2 items-center">
        <span className="text-[11px] text-[var(--tx-3)] shrink-0">
          {BASE_URL}/invite/
        </span>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            setError(null)
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="nama-anda"
          className="flex-1 min-w-0 border border-[var(--bd)] rounded-lg px-2.5 py-1.5 text-xs bg-[var(--pg)] text-[var(--tx-1)] focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <button
          onClick={handleSave}
          disabled={saving || input.trim() === card.slug || input.trim().length < 3}
          className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors disabled:opacity-40"
        >
          {saving ? "..." : (isMs ? "Simpan" : "Save")}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}

      {/* QR + actions row */}
      <div className="flex gap-3 items-start">
        {/* QR code */}
        <div className="shrink-0 rounded-xl overflow-hidden border border-[var(--bd)] bg-white p-1.5" style={{ width: 80, height: 80 }}>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR" className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <QrCode className="w-6 h-6 text-gray-200 animate-pulse" />
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Buttons */}
        <div className="flex-1 flex flex-col gap-1.5">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors"
          >
            {copied
              ? <><Check className="w-3.5 h-3.5 text-emerald-500" />{isMs ? "Disalin!" : "Copied!"}</>
              : <><Copy className="w-3.5 h-3.5" />{isMs ? "Salin Pautan" : "Copy Link"}</>
            }
          </button>
          <button
            onClick={nativeShare}
            className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {isMs ? "Kongsi" : "Share"}
          </button>
          <button
            onClick={downloadQr}
            disabled={!qrDataUrl}
            className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            {isMs ? "Muat Turun QR" : "Download QR"}
          </button>
        </div>
      </div>

      {/* Watermark notice for unpublished */}
      {!card.isPublished && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-snug">
            {isMs
              ? "Kad belum dibayar — akan ada tanda air (watermark) apabila dikongsi."
              : "Card not paid — a watermark will appear when shared."}
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const [cards, setCards]     = useState<CartCard[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [printing, setPrinting] = useState<string | null>(null)
  const [openShare, setOpenShare] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
    const slugs = getCartSlugs()
    if (slugs.length === 0) { setLoading(false); return }
    fetch(`/api/cards?slugs=${slugs.join(",")}`)
      .then(r => r.json())
      .then(d => {
        const order = getCartSlugs()
        const map = new Map<string, CartCard>(
          (d.cards ?? []).map((c: CartCard) => [c.slug, c])
        )
        setCards(order.map(s => map.get(s)).filter(Boolean) as CartCard[])
      })
      .catch(() => setCards([]))
      .finally(() => setLoading(false))
  }, [])

  function handleRemove(slug: string) {
    removeFromCart(slug)
    setCards(prev => prev.filter(c => c.slug !== slug))
  }

  function handleSlugChange(oldSlug: string, newSlug: string) {
    // Update localStorage cart
    removeFromCart(oldSlug)
    addToCart(newSlug)
    // Update local state
    setCards(prev => prev.map(c => c.slug === oldSlug ? { ...c, slug: newSlug } : c))
    // Update open share panels
    setOpenShare(prev => {
      const next = new Set(prev)
      if (next.has(oldSlug)) { next.delete(oldSlug); next.add(newSlug) }
      return next
    })
  }

  function toggleShare(slug: string) {
    setOpenShare(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  function handlePrint(card: CartCard) {
    setPrinting(card.slug)
    const html = generatePrintHTML({
      slug: card.slug,
      title: card.title,
      groomName: card.groomName,
      brideName: card.brideName,
      language: card.language,
      isPublished: card.isPublished,
      wizardConfig: card.wizardConfig,
      theme: card.theme,
    })
    const w = window.open("", "_blank", "width=900,height=760")
    if (!w) {
      setPrinting(null)
      alert(card.language === "ms"
        ? "Sila benarkan popup untuk mencetak."
        : "Please allow popups to print.")
      return
    }
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); setPrinting(null) }, 1400)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[var(--pg)]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-[var(--pg-nav)] backdrop-blur-sm border-b border-[var(--bd)]">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link href="/" className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <ShoppingBag className="w-4 h-4 text-gold" />
          <h1 className="font-semibold text-[var(--tx-1)] text-sm">Kad Saya</h1>
          {cards.length > 0 && (
            <span className="text-[11px] bg-gold/20 text-gold-dark rounded-full px-2 py-0.5 font-bold tabular-nums">
              {cards.length}
            </span>
          )}
          <Link
            href="/new"
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gold border border-gold/30 rounded-lg px-3 py-1.5 hover:bg-gold/10 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Buat Baru
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-16">

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bd)] flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-[var(--tx-3)]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--tx-1)] mb-1">Tiada Kad Tersimpan</h2>
              <p className="text-sm text-[var(--tx-2)]">Buat kad jemputan digital anda sekarang</p>
            </div>
            <Link
              href="/new"
              className="flex items-center gap-2 bg-gold text-ink font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-gold/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat Kad Baru
            </Link>
          </div>
        )}

        {!loading && cards.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--tx-2)]">{cards.length} reka bentuk tersimpan</p>
              <Link
                href="/checkout"
                className="flex items-center gap-1.5 bg-gold text-ink text-xs font-bold px-4 py-2 rounded-xl hover:bg-gold/90 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Bayar &amp; Terbitkan
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map(card => {
                const accent = card.theme?.primaryColor ?? "#D4AF37"
                const bg = card.theme?.bgColor ?? "#1a0a00"
                const displayName =
                  card.groomName && card.brideName
                    ? `${card.groomName} & ${card.brideName}`
                    : card.title || "Kad Jemputan"
                const emoji = CAT_EMOJI[card.template.category] ?? "✉️"
                const isPrinting = printing === card.slug
                const shareOpen = openShare.has(card.slug)

                return (
                  <div
                    key={card.slug}
                    className="rounded-2xl border border-[var(--bd)] bg-[var(--pg-alt)] overflow-hidden"
                  >
                    {/* Info row */}
                    <div className="flex gap-3 p-4">
                      <div
                        className="shrink-0 rounded-xl overflow-hidden"
                        style={{ width: 54, aspectRatio: "3/4", background: bg, border: `1.5px solid ${accent}35` }}
                      >
                        <div style={{ height: 3, background: accent }} />
                        <div className="flex flex-col items-center justify-center gap-1 px-1 mt-2">
                          <span className="text-base leading-none">{emoji}</span>
                          <span className="font-great-vibes text-[7px] text-center leading-tight" style={{ color: accent }}>
                            {displayName.split(" & ")[0]}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <h3 className="font-semibold text-[var(--tx-1)] text-sm leading-tight truncate pr-1">
                            {displayName}
                          </h3>
                          <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            card.isPublished
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {card.isPublished ? "Aktif" : "Draf"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--tx-2)]">
                          {emoji} {card.template.nameMs || card.template.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="w-3 h-3 text-[var(--tx-3)]" />
                          <span className="text-[11px] text-[var(--tx-3)]">{formatDate(card.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[var(--bd)]" />

                    {/* Actions */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      <Link
                        href={`/builder/${card.slug}`}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <Link
                        href={`/invite/${card.slug}`}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat
                      </Link>
                      <button
                        onClick={() => toggleShare(card.slug)}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors ${
                          shareOpen
                            ? "border-gold/50 text-gold bg-gold/10"
                            : "border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)]"
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Kongsi
                      </button>
                      <button
                        onClick={() => handlePrint(card)}
                        disabled={isPrinting}
                        className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-60"
                      >
                        {isPrinting
                          ? <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                          : <Printer className="w-3.5 h-3.5" />
                        }
                        Cetak
                      </button>
                      <button
                        onClick={() => handleRemove(card.slug)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--bd)] text-[var(--tx-3)] hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Share panel */}
                    {shareOpen && (
                      <>
                        <div className="border-t border-[var(--bd)]" />
                        <SharePanel card={card} onSlugChange={handleSlugChange} />
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Print hint */}
            <div className="mt-6 rounded-xl border border-[var(--bd)] bg-[var(--sf)] px-4 py-3">
              <div className="flex items-start gap-3">
                <Printer className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[var(--tx-1)] mb-0.5">Cara mencetak kad fizikal</p>
                  <p className="text-[11px] text-[var(--tx-2)] leading-relaxed">
                    Klik <strong>Cetak</strong> untuk jana 4 halaman kad jemputan bersaiz 5×7 inci (127×178mm).
                    Guna kertas Matte atau Glossy 200gsm dan tetapkan saiz kertas sebagai 5×7 inci dalam tetapan pencetak anda.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
