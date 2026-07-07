"use client"

import { Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import {
  FileText, Heart, Pencil, Eye, Printer,
  Trash2, Plus, CreditCard, Clock, AlertTriangle,
  Link2, Copy, Check, Share2, Download, QrCode,
  ImageIcon, Gift, Mail, BarChart2,
} from "lucide-react"
import type { WizardConfig } from "@/types/config"
import { generatePrintHTML } from "@/lib/print-card"

interface Card {
  id: string
  slug: string
  title: string
  groomName: string | null
  brideName: string | null
  isPublished: boolean
  language: string
  viewCount: number
  updatedAt: string
  createdAt: string
  eventDate: string | null
  wizardConfig: WizardConfig | null
  template: { name: string; nameMs: string; category: string; image1Url: string | null } | null
  theme: { primaryColor: string; bgColor: string } | null
}

interface LikedTemplate {
  id: string; slug: string; name: string; nameMs: string
  category: string; thumbnail: string; previewUrl?: string | null
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
  } catch { return iso }
}

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://ekadku.com"

function SharePanel({ card, onSlugChange }: { card: Card; onSlugChange: (oldSlug: string, newSlug: string) => void }) {
  const [input, setInput] = useState(card.slug)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shareUrl = `${BASE_URL}/invite/${card.slug}`
  const isMs = card.language === "ms"

  useEffect(() => {
    let cancelled = false
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(shareUrl, { width: 256, margin: 2, color: { dark: "#1a1a1a", light: "#ffffff" } })
        .then((url) => { if (!cancelled) setQrDataUrl(url) })
        .catch(() => {})
    }).catch(() => {})
    return () => { cancelled = true }
  }, [shareUrl])

  const handleSave = useCallback(async () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed === card.slug) return
    setSaving(true); setError(null)
    try {
      const res = await fetch(`/api/cards/${card.slug}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newSlug: trimmed }),
      })
      const data = await res.json() as { slug?: string; error?: string }
      if (!res.ok) { setError(data.error ?? (isMs ? "Gagal menyimpan." : "Failed.")); return }
      onSlugChange(card.slug, data.slug!)
    } catch {
      setError(isMs ? "Tiada sambungan." : "Connection error.")
    } finally { setSaving(false) }
  }, [card.slug, input, isMs, onSlugChange])

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  function nativeShare() {
    if (!navigator.share) { copyLink(); return }
    navigator.share({ title: card.title, url: shareUrl }).catch(() => {})
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

      <div className="flex gap-2 items-center">
        <span className="text-[11px] text-[var(--tx-3)] shrink-0">{BASE_URL}/invite/</span>
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setError(null) }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="nama-anda"
          className="flex-1 min-w-0 border border-[var(--bd)] rounded-lg px-2.5 py-1.5 text-xs bg-[var(--pg)] text-[var(--tx-1)] focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <button
          onClick={handleSave}
          disabled={saving || input.trim() === card.slug || input.trim().length < 3}
          className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors disabled:opacity-40"
        >
          {saving ? "..." : "Simpan"}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}

      <div className="flex gap-3 items-start">
        <div className="shrink-0 rounded-xl overflow-hidden border border-[var(--bd)] bg-white p-1.5" style={{ width: 80, height: 80 }}>
          {qrDataUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={qrDataUrl} alt="QR" className="w-full h-full" />
            : <div className="w-full h-full flex items-center justify-center"><QrCode className="w-6 h-6 text-gray-200 animate-pulse" /></div>
          }
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <button onClick={copyLink} className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors">
            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Disalin!</> : <><Copy className="w-3.5 h-3.5" />Salin Pautan</>}
          </button>
          <button onClick={nativeShare} className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors">
            <Share2 className="w-3.5 h-3.5" />Kongsi
          </button>
          <button onClick={downloadQr} disabled={!qrDataUrl} className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--bd)] transition-colors disabled:opacity-40">
            <Download className="w-3.5 h-3.5" />Muat Turun QR
          </button>
        </div>
      </div>

      {!card.isPublished && (
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
            Kad belum dibayar — akan ada tanda air (watermark) apabila dikongsi.
          </p>
        </div>
      )}
    </div>
  )
}

function CardTile({
  card,
  onRemove,
  onSlugChange,
}: {
  card: Card
  onRemove: (slug: string) => void
  onSlugChange: (oldSlug: string, newSlug: string) => void
}) {
  const [shareOpen, setShareOpen] = useState(false)
  const [printing, setPrinting] = useState(false)

  const accent = card.theme?.primaryColor ?? "#D4AF37"
  const bg = card.theme?.bgColor ?? "#1a0a00"
  const img = card.template?.image1Url ?? null
  const displayName =
    card.groomName && card.brideName
      ? `${card.groomName} & ${card.brideName}`
      : card.title || "Kad Jemputan"
  const emoji = CAT_EMOJI[card.template?.category ?? ""] ?? "✉️"
  const actionBtn = "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--sf)] transition-colors"

  function handlePrint() {
    setPrinting(true)
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
      setPrinting(false)
      alert("Sila benarkan popup untuk mencetak.")
      return
    }
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); setPrinting(false) }, 1400)
  }

  return (
    <div className="rounded-2xl border border-[var(--bd)] bg-[var(--pg-alt)] overflow-hidden">
      {/* Card info row */}
      <div className="flex gap-3 p-4">
        {/* Thumbnail */}
        <div
          className="relative shrink-0 rounded-xl overflow-hidden"
          style={{ width: 54, aspectRatio: "3/4", background: bg, border: `1.5px solid ${accent}35` }}
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          ) : (
            <>
              <div style={{ height: 3, background: accent }} />
              <div className="flex flex-col items-center justify-center gap-1 px-1 mt-2">
                <span className="text-base leading-none">{emoji}</span>
                <span className="font-great-vibes text-[7px] text-center leading-tight" style={{ color: accent }}>
                  {displayName.split(" & ")[0]}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <h3 className="font-semibold text-[var(--tx-1)] text-sm leading-tight truncate pr-1">
              {displayName}
            </h3>
            <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              card.isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            }`}>
              {card.isPublished ? "Aktif" : "Draf"}
            </span>
          </div>
          <p className="text-xs text-[var(--tx-2)]">{emoji} {card.template?.nameMs || card.template?.name}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="w-3 h-3 text-[var(--tx-3)]" />
            <span className="text-[11px] text-[var(--tx-3)]">{formatDate(card.updatedAt)}</span>
          </div>
          {card.viewCount > 0 && (
            <p className="text-[11px] text-[var(--tx-3)] mt-0.5">{card.viewCount} tontonan</p>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--bd)]" />

      {/* Quick builder shortcuts */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none">
        <Link href={`/builder/${card.slug}?page=2`} className="shrink-0 flex items-center gap-1 text-[11px] text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors py-1 px-2 rounded-lg hover:bg-[var(--sf)]">
          <ImageIcon className="w-3 h-3" />Galeri
        </Link>
        <Link href={`/builder/${card.slug}?page=10`} className="shrink-0 flex items-center gap-1 text-[11px] text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors py-1 px-2 rounded-lg hover:bg-[var(--sf)]">
          <Gift className="w-3 h-3" />Hadiah
        </Link>
        <Link href={`/builder/${card.slug}?page=7`} className="shrink-0 flex items-center gap-1 text-[11px] text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors py-1 px-2 rounded-lg hover:bg-[var(--sf)]">
          <Mail className="w-3 h-3" />RSVP
        </Link>
        {card.isPublished && (
          <Link href={`/dashboard/${card.slug}/report`} className="shrink-0 flex items-center gap-1 text-[11px] text-gold hover:text-gold/80 transition-colors py-1 px-2 rounded-lg hover:bg-gold/10">
            <BarChart2 className="w-3 h-3" />Laporan
          </Link>
        )}
      </div>

      <div className="border-t border-[var(--bd)]" />

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Link href={`/builder/${card.slug}`} className={actionBtn}>
          <Pencil className="w-3.5 h-3.5" />Edit
        </Link>
        <Link href={`/invite/${card.slug}`} target="_blank" className={actionBtn}>
          <Eye className="w-3.5 h-3.5" />Lihat
        </Link>
        <button
          onClick={() => setShareOpen(v => !v)}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors ${
            shareOpen ? "border-gold/50 text-gold bg-gold/10" : "border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--sf)]"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />Kongsi
        </button>
        <button
          onClick={handlePrint}
          disabled={printing}
          className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-60"
        >
          {printing
            ? <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            : <Printer className="w-3.5 h-3.5" />
          }
          Cetak
        </button>
        {!card.isPublished && (
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-1 text-xs font-bold py-2 px-3 rounded-lg bg-gold text-ink hover:bg-gold/90 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
          </Link>
        )}
        <button
          onClick={() => onRemove(card.slug)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--bd)] text-[var(--tx-3)] hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {shareOpen && (
        <>
          <div className="border-t border-[var(--bd)]" />
          <SharePanel card={card} onSlugChange={onSlugChange} />
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  )
}

function DashboardInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useSearchParams()
  const tab = params.get("tab") ?? "cards"

  const [cards, setCards] = useState<Card[]>([])
  const [likes, setLikes] = useState<LikedTemplate[]>([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [likesLoading, setLikesLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/dashboard")
  }, [status, router])

  const loadCards = useCallback(async () => {
    setCardsLoading(true)
    try {
      const res = await fetch("/api/user/cards")
      if (res.ok) setCards((await res.json()).cards)
    } finally { setCardsLoading(false) }
  }, [])

  const loadLikes = useCallback(async () => {
    setLikesLoading(true)
    try {
      const res = await fetch("/api/user/likes")
      if (res.ok) setLikes((await res.json()).likes)
    } finally { setLikesLoading(false) }
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    if (tab === "cards")     loadCards()
    if (tab === "favorites") loadLikes()
  }, [status, tab, loadCards, loadLikes])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--pg)]">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  function handleRemove(slug: string) {
    setCards(prev => prev.filter(c => c.slug !== slug))
  }

  function handleSlugChange(oldSlug: string, newSlug: string) {
    setCards(prev => prev.map(c => c.slug === oldSlug ? { ...c, slug: newSlug } : c))
  }

  const tabs = [
    { key: "cards",     label: "Kad Saya",     icon: FileText },
    { key: "favorites", label: "Templat Suka", icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-[var(--pg)]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-[var(--pg-nav)] backdrop-blur-sm border-b border-[var(--bd)]">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 h-14">
          <FileText className="w-4 h-4 text-gold" />
          <h1 className="font-semibold text-[var(--tx-1)] text-sm">Kad Saya</h1>
          {tab === "cards" && cards.length > 0 && (
            <span className="text-[11px] bg-gold/20 text-gold rounded-full px-2 py-0.5 font-bold tabular-nums">
              {cards.length}
            </span>
          )}
          <Link
            href="/new"
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gold border border-gold/30 rounded-lg px-3 py-1.5 hover:bg-gold/10 transition-colors"
          >
            <Plus className="w-3 h-3" />Buat Baru
          </Link>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto flex border-t border-[var(--bd)]">
          {tabs.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={`/dashboard?tab=${key}`}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                tab === key
                  ? "border-gold text-gold"
                  : "border-transparent text-[var(--tx-3)] hover:text-[var(--tx-2)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-16">

        {/* ── Kad Saya tab ── */}
        {tab === "cards" && (
          <>
            {cardsLoading && (
              <div className="flex items-center justify-center py-24">
                <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!cardsLoading && cards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--sf)] flex items-center justify-center">
                  <FileText className="w-8 h-8 text-[var(--tx-3)]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--tx-1)] mb-1">Tiada Kad Lagi</h2>
                  <p className="text-sm text-[var(--tx-2)]">Buat kad jemputan digital anda sekarang</p>
                </div>
                <Link
                  href="/new"
                  className="flex items-center gap-2 bg-gold text-ink font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-gold/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />Buat Kad Baru
                </Link>
              </div>
            )}

            {!cardsLoading && cards.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-[var(--tx-2)]">{cards.length} kad jemputan</p>
                  <Link
                    href="/checkout"
                    className="flex items-center gap-1.5 bg-gold text-ink text-xs font-bold px-4 py-2 rounded-xl hover:bg-gold/90 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Bayar &amp; Terbitkan
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cards.map(card => (
                    <CardTile
                      key={card.id}
                      card={card}
                      onRemove={handleRemove}
                      onSlugChange={handleSlugChange}
                    />
                  ))}
                </div>

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
          </>
        )}

        {/* ── Templat Suka tab ── */}
        {tab === "favorites" && (
          <>
            {likesLoading && (
              <div className="flex items-center justify-center py-24">
                <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!likesLoading && likes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--sf)] flex items-center justify-center">
                  <Heart className="w-8 h-8 text-[var(--tx-3)]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--tx-1)] mb-1">Tiada Templat Disukai</h2>
                  <p className="text-sm text-[var(--tx-2)]">Terokai koleksi templat kami</p>
                </div>
                <Link
                  href="/new"
                  className="flex items-center gap-2 bg-gold text-ink font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-gold/90 transition-colors"
                >
                  Lihat Templat
                </Link>
              </div>
            )}

            {!likesLoading && likes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {likes.map(tpl => (
                  <div key={tpl.id} className="rounded-2xl border border-[var(--bd)] bg-[var(--pg-alt)] overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "9/19.5", background: "#1a1a1a" }}
                    >
                      {tpl.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tpl.thumbnail} alt={tpl.nameMs} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                          {CAT_EMOJI[tpl.category] ?? "✉️"}
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-xs font-semibold text-[var(--tx-1)] text-center leading-tight">
                        {tpl.nameMs || tpl.name}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/new?template=${tpl.slug}`}
                          className="flex-1 text-center text-[11px] font-bold bg-gold text-ink py-1.5 rounded-lg hover:bg-gold/90 transition-colors"
                        >
                          Guna
                        </Link>
                        <Link
                          href={tpl.previewUrl ?? `/invite/${tpl.slug}`}
                          target="_blank"
                          className="flex-1 text-center text-[11px] font-medium border border-[var(--bd)] text-[var(--tx-2)] py-1.5 rounded-lg hover:bg-[var(--sf)] transition-colors"
                        >
                          Lihat
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
