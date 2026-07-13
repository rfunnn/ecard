"use client"

import { Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Pencil, ImageIcon, Gift, Mail, Eye, Printer,
  MoreVertical, ExternalLink, Plus, ChevronDown, Trash2, Copy, Check, BarChart2,
  Link2, AlertCircle,
} from "lucide-react"
import type { WizardConfig } from "@/types/config"
import { generatePrintHTML } from "@/lib/print-card"
import { removeFromCart } from "@/lib/cart"

type Card = {
  id: string
  slug: string
  cardNum: number | null
  title: string
  groomName: string | null
  brideName: string | null
  isPublished: boolean
  expiresAt: string | null
  language: string
  viewCount: number
  updatedAt: string
  createdAt: string
  eventDate: string | null
  wizardConfig: WizardConfig | null
  template: { name: string; nameMs: string; category: string; image1Url: string | null } | null
  theme: { primaryColor: string; bgColor: string } | null
}

type LikedTemplate = {
  id: string; slug: string; name: string; nameMs: string
  category: string; thumbnail: string; previewUrl?: string | null
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  )
}

function formatEventDate(iso: string | null): string {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  } catch { return "" }
}

function CardThumbnail({ card }: { card: Card }) {
  const accent = card.theme?.primaryColor ?? "#D4AF37"
  const bg     = card.theme?.bgColor      ?? "#1a0a00"
  const img    = card.template?.image1Url ?? null

  const displayName = card.groomName && card.brideName
    ? `${card.groomName} & ${card.brideName}`
    : card.groomName ?? card.title ?? "–"

  const category = card.template?.category === "WEDDING" ? "Walimatul Urus"
    : card.template?.category === "BIRTHDAY" ? "Jemputan"
    : card.template?.nameMs ?? "Jemputan"

  return (
    <div className="shrink-0 flex flex-col items-center gap-1.5" style={{ width: "clamp(72px, 22vw, 96px)" }}>
      {/* Phone wrapper with side buttons */}
      <div className="relative w-full select-none" style={{ aspectRatio: "9/19.5" }}>
        {/* Phone body */}
        <div
          className="absolute inset-0 rounded-[22px] shadow-xl overflow-hidden"
          style={{ border: "5px solid #2d2d2d", background: bg }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className="w-8 h-2.5 bg-[#2d2d2d] rounded-b-xl" />
          </div>

          {/* Screen */}
          {img ? (
            <>
              <Image src={img} alt="" fill className="object-cover" draggable={false} sizes="96px" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1.5 bg-black/30">
                <span className="text-[7px] uppercase tracking-[0.2em] mb-1 text-white/70">{category}</span>
                <span className="text-[9px] font-playfair leading-tight text-white drop-shadow-md">{displayName}</span>
                <div className="mt-2 w-5 h-px bg-white/40" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1.5">
              <span className="text-[7px] uppercase tracking-[0.2em] mb-1 opacity-50" style={{ color: accent }}>{category}</span>
              <span className="text-[9px] font-playfair leading-tight" style={{ color: accent }}>{displayName}</span>
              <div className="mt-2 w-5 h-px opacity-25" style={{ background: accent }} />
            </div>
          )}

          {/* Home bar */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className="w-6 h-0.5 rounded-full bg-white/20" />
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute left-[-2px] top-[18%] w-[2px] h-3 bg-gray-600 rounded-l-sm" />
        <div className="absolute left-[-2px] top-[27%] w-[2px] h-4 bg-gray-600 rounded-l-sm" />
        <div className="absolute left-[-2px] top-[38%] w-[2px] h-4 bg-gray-600 rounded-l-sm" />
        <div className="absolute right-[-2px] top-[24%] w-[2px] h-5 bg-gray-600 rounded-r-sm" />
      </div>

      {/* Template name below */}
      {card.template && (
        <p className="text-[9px] text-[var(--tx-2)] text-center leading-tight w-full truncate px-0.5">
          {card.template.nameMs || card.template.name}
        </p>
      )}
    </div>
  )
}

// Sanitise a raw string into a URL-safe path segment:
// lowercase, spaces → hyphens, strip anything not [a-z0-9-], collapse repeated hyphens
function sanitizeSuffix(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
}

function suffixError(val: string): string | null {
  if (val === "") return null
  if (val.length < 2)  return "Minimum 2 aksara."
  if (val.length > 60) return "Maksimum 60 aksara."
  if (/^-|-$/.test(val)) return "Tidak boleh bermula atau berakhir dengan sempang."
  return null
}

function InviteLinkRow({ card }: { card: Card }) {
  const storageKey = `invite-suffix-${card.slug}`
  const [suffix, setSuffix]   = useState("")
  const [origin, setOrigin]   = useState("https://ekadku.com")
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState("")
  const [copied, setCopied]   = useState(false)

  // Load persisted suffix and resolve origin on mount
  useEffect(() => {
    setOrigin(window.location.origin)
    try {
      setSuffix(localStorage.getItem(storageKey) ?? "")
    } catch { /* ignore */ }
  }, [storageKey])

  const baseUrl = card.cardNum ? `${origin}/${card.cardNum}` : `${origin}/${card.slug}`
  const fullUrl = suffix ? `${baseUrl}/${suffix}` : baseUrl
  const error   = suffixError(draft)

  function openEditor() {
    setDraft(suffix)
    setEditing(true)
  }

  function saveSuffix() {
    if (error) return
    const trimmed = draft.replace(/^-+|-+$/g, "")
    setSuffix(trimmed)
    try { localStorage.setItem(storageKey, trimmed) } catch { /* ignore */ }
    setEditing(false)
  }

  function cancelEdit() {
    setDraft(suffix)
    setEditing(false)
  }

  function handleDraftChange(raw: string) {
    setDraft(sanitizeSuffix(raw))
  }

  function copyLink() {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mb-3 space-y-2">
      {/* Base URL row */}
      <div>
        <p className="text-[10px] text-[var(--tx-3)] mb-1">Pautan Jemputan:</p>
        <div className="flex items-center gap-1 bg-[var(--pg-alt)] border border-[var(--bd)] rounded-lg px-2 py-1.5">
          <span className="text-[11px] text-[var(--tx-2)] truncate flex-1 font-mono">
            {fullUrl.replace(/^https?:\/\//, "")}
          </span>
          <button onClick={copyLink} className="ml-1 p-1 rounded transition-colors hover:bg-[var(--sf)]" title="Salin pautan">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--tx-3)]" />}
          </button>
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-[var(--sf)] rounded transition-colors">
            <ExternalLink className="w-3 h-3 text-[var(--tx-3)]" />
          </a>
        </div>
      </div>

      {/* Custom suffix editor */}
      {!editing ? (
        <button
          onClick={openEditor}
          className="flex items-center gap-1.5 text-[11px] text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors group"
        >
          <Link2 className="w-3 h-3" />
          {suffix
            ? <span>Nama pautan: <span className="font-mono text-[var(--tx-2)]">/{suffix}</span></span>
            : <span className="group-hover:underline">+ Tambah nama pada pautan</span>
          }
          <span className="text-[10px] text-[var(--tx-3)] opacity-60 group-hover:opacity-100">(pilihan)</span>
        </button>
      ) : (
        <div className="rounded-lg border border-[var(--bd)] bg-[var(--pg-alt)] p-2.5 space-y-2">
          <p className="text-[10px] text-[var(--tx-3)] font-medium">
            Tambah nama selepas pautan asas — kedua-dua URL berfungsi
          </p>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-[var(--tx-3)] shrink-0 truncate max-w-[140px]">
              {card.cardNum ? `…/${card.cardNum}/` : `…/${card.slug}/`}
            </span>
            <input
              autoFocus
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveSuffix()
                if (e.key === "Escape") cancelEdit()
              }}
              placeholder="nama-anda"
              maxLength={60}
              className={`flex-1 min-w-0 border rounded px-2 py-1 bg-[var(--pg)] text-[var(--tx-1)] focus:outline-none focus:ring-1 ${
                error ? "border-red-400 focus:ring-red-400" : "border-[var(--bd)] focus:ring-gold/40"
              }`}
            />
          </div>
          {error ? (
            <p className="flex items-center gap-1 text-[10px] text-red-500">
              <AlertCircle className="w-3 h-3 shrink-0" />{error}
            </p>
          ) : draft ? (
            <p className="text-[10px] text-[var(--tx-3)] font-mono truncate">
              {card.cardNum ? `→ …/${card.cardNum}/${draft}` : `→ …/${card.slug}/${draft}`}
            </p>
          ) : (
            <p className="text-[10px] text-[var(--tx-3)]">
              Huruf kecil, nombor dan sempang sahaja. Contoh: <span className="font-mono">ahmad-dan-sara</span>
            </p>
          )}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={saveSuffix}
              disabled={!!error || draft === suffix}
              className="text-[11px] font-semibold px-3 py-1 rounded bg-[var(--tx-1)] text-[var(--pg)] hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              Simpan
            </button>
            <button onClick={cancelEdit} className="text-[11px] text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors px-2 py-1">
              Batal
            </button>
            {suffix && (
              <button
                onClick={() => { setSuffix(""); setDraft(""); try { localStorage.removeItem(storageKey) } catch { /* ignore */ } setEditing(false) }}
                className="ml-auto text-[11px] text-red-400 hover:text-red-600 transition-colors"
              >
                Buang nama
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CardRow({ card, onRemove }: { card: Card; onRemove: (slug: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [printing, setPrinting] = useState(false)
  const lang = card.language === "ms"

  const displayName =
    card.groomName && card.brideName
      ? `${card.groomName} & ${card.brideName}`
      : card.title || "Kad Jemputan"

  const eventDateStr = formatEventDate(
    (card.wizardConfig as WizardConfig | null)?.startDateTime ?? card.eventDate
  )

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
      alert(lang ? "Sila benarkan popup untuk mencetak." : "Please allow popups to print.")
      return
    }
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); setPrinting(false) }, 1400)
  }

  const actionBtn = "flex items-center gap-1 text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors py-1 px-1.5 rounded hover:bg-[var(--sf)]"

  return (
    <div className="flex gap-4 py-6">
      <CardThumbnail card={card} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-[var(--tx-1)] text-sm leading-tight">{displayName}</h3>
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1 rounded hover:bg-[var(--sf)] transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-[var(--tx-3)]" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-7 z-20 bg-[var(--float)] border border-[var(--float-bd)] rounded-xl shadow-lg py-1 w-36">
                  <Link href={`/builder/${card.slug}`} className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--tx-2)] hover:bg-[var(--sf)]">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <Link href={card.cardNum ? `/${card.cardNum}` : `/${card.slug}`} target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--tx-2)] hover:bg-[var(--sf)]">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </Link>
                  <button onClick={() => { setMenuOpen(false); handlePrint() }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--tx-2)] hover:bg-[var(--sf)]">
                    <Printer className="w-3.5 h-3.5" /> Print Card
                  </button>
                  <hr className="my-1 border-[var(--bd)]" />
                  <button onClick={() => { setMenuOpen(false); onRemove(card.slug) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {eventDateStr && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-amber-600 font-medium">{eventDateStr}</span>
            <ChevronDown className="w-3 h-3 text-amber-600" />
          </div>
        )}

        <InviteLinkRow card={card} />

        <div className="flex items-center flex-wrap gap-1 mb-3">
          <Link href={`/builder/${card.slug}`} className={actionBtn}><Pencil className="w-3.5 h-3.5" /> Edit</Link>
          <Link href={`/builder/${card.slug}?page=11`} className={actionBtn}><ImageIcon className="w-3.5 h-3.5" /> Gallery</Link>
          <Link href={`/builder/${card.slug}?page=10`} className={actionBtn}><Gift className="w-3.5 h-3.5" /> Gifts</Link>
          <Link href={`/builder/${card.slug}?page=7`} className={actionBtn}><Mail className="w-3.5 h-3.5" /> RSVP</Link>
          {card.isPublished && (
            <Link href={`/dashboard/${card.slug}/report`} className={`${actionBtn} font-semibold`} style={{ color: card.theme?.primaryColor ?? undefined }}>
              <BarChart2 className="w-3.5 h-3.5" />{lang ? "Laporan" : "Report"}
            </Link>
          )}
          <Link href={card.cardNum ? `/${card.cardNum}` : `/${card.slug}`} target="_blank" className={actionBtn}><Eye className="w-3.5 h-3.5" /> Preview</Link>
          <button onClick={handlePrint} disabled={printing} className={`${actionBtn} text-amber-600 hover:text-amber-800`}>
            {printing ? <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
            Print Card
          </button>
        </div>

        {!card.isPublished && (
          <Link href={`/checkout?slug=${card.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[var(--tx-1)] text-[var(--tx-1)] px-4 py-1.5 rounded-full hover:bg-[var(--tx-1)] hover:text-[var(--pg)] transition-colors">
            PAY NOW
          </Link>
        )}
        {card.isPublished && (() => {
          const expiry = card.expiresAt ? new Date(card.expiresAt) : null
          const now = new Date()
          const daysLeft = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
          const isExpired = daysLeft !== null && daysLeft <= 0
          const isExpiringSoon = !isExpired && daysLeft !== null && daysLeft <= 30
          const expiryLabel = expiry
            ? expiry.toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" })
            : null
          return (
            <div className="flex flex-col gap-1">
              {isExpired ? (
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium w-fit text-red-600 bg-red-500/10 border border-red-500/20">
                  Luput{expiryLabel ? ` · ${expiryLabel}` : ""}
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium w-fit ${
                  isExpiringSoon
                    ? "text-amber-600 bg-amber-500/10 border border-amber-500/20"
                    : "text-green-600 bg-green-500/10 border border-green-500/20"
                }`}>
                  Active{expiryLabel ? ` · Luput ${expiryLabel}` : ""}
                </span>
              )}
              {isExpiringSoon && daysLeft !== null && (
                <p className="text-[11px] text-amber-500">
                  Pautan tamat dalam {daysLeft} hari
                </p>
              )}
              {isExpired && (
                <Link
                  href={`/checkout?slug=${card.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors underline underline-offset-2 w-fit"
                >
                  Perbaharui pautan →
                </Link>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function DashboardInner() {
  const { data: session, status } = useSession()
  const router  = useRouter()
  const params  = useSearchParams()
  const tab     = params.get("tab") ?? "orders"

  const [cards,        setCards]        = useState<Card[]>([])
  const [likes,        setLikes]        = useState<LikedTemplate[]>([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [likesLoading, setLikesLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/dashboard")
  }, [status, router])

  const loadCards = useCallback(async () => {
    setCardsLoading(true)
    const res = await fetch("/api/user/cards")
    if (res.ok) setCards((await res.json()).cards)
    setCardsLoading(false)
  }, [])

  const loadLikes = useCallback(async () => {
    setLikesLoading(true)
    const res = await fetch("/api/user/likes")
    if (res.ok) setLikes((await res.json()).likes)
    setLikesLoading(false)
  }, [])

  const handleRemove = useCallback(async (slug: string) => {
    if (!confirm("Padam kad ini secara kekal? Tindakan ini tidak boleh dibatalkan.")) return

    // Optimistic removal
    setCards(prev => prev.filter(c => c.slug !== slug))

    try {
      const res = await fetch(`/api/cards/${slug}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`Delete failed (${res.status})`)
      removeFromCart(slug)
    } catch (err) {
      console.error("Failed to remove card:", err)
      // Reload from server on failure so the list is consistent
      const res = await fetch("/api/user/cards")
      if (res.ok) setCards((await res.json()).cards)
      alert("Gagal memadam kad. Sila cuba lagi.")
    }
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    if (tab === "orders")    loadCards()
    if (tab === "favorites") loadLikes()
  }, [status, tab, loadCards, loadLikes])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--pg)]">
        <div className="w-8 h-8 border-2 border-[var(--bd)] border-t-[var(--tx-1)] rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  const sideNav = [
    { key: "orders",    label: "ORDERS" },
    { key: "favorites", label: "FAVORITES" },
    { key: "profile",   label: "MY PROFILE" },
  ]

  return (
    <div className="min-h-screen bg-[var(--pg)] flex">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-44 shrink-0 border-r border-[var(--bd)] py-8 px-6 gap-5">
        <div className="mb-2 text-[10px] font-bold tracking-widest text-[var(--tx-3)] uppercase">Menu</div>
        {sideNav.map(({ key, label }) => (
          <Link
            key={key}
            href={`/dashboard?tab=${key}`}
            className={`text-xs font-bold tracking-widest transition-colors ${
              tab === key
                ? "text-[var(--tx-1)] underline underline-offset-4 decoration-2"
                : "text-[var(--tx-3)] hover:text-[var(--tx-1)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-10 py-6 md:py-8">
        {/* Mobile tab nav */}
        <div className="md:hidden flex gap-5 mb-5 border-b border-[var(--bd)] overflow-x-auto scrollbar-hide">
          {sideNav.map(({ key, label }) => (
            <Link
              key={key}
              href={`/dashboard?tab=${key}`}
              className={`shrink-0 pb-2.5 text-[11px] font-bold tracking-widest transition-colors ${
                tab === key
                  ? "text-[var(--tx-1)] border-b-2 border-[var(--tx-1)]"
                  : "text-[var(--tx-3)] hover:text-[var(--tx-1)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-lg sm:text-xl font-black tracking-widest text-[var(--tx-1)] uppercase">
            {tab === "orders" ? "Orders" : tab === "favorites" ? "Favorites" : "My Profile"}
          </h1>
          <Link
            href="/templates"
            className="flex items-center gap-1.5 shrink-0 bg-[var(--tx-1)] text-[var(--pg)] text-[11px] sm:text-xs font-black tracking-widest uppercase px-3 sm:px-4 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create New Card</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>

        {/* ── ORDERS tab ── */}
        {tab === "orders" && (
          <>
            {cardsLoading ? (
              <div className="flex justify-center py-24">
                <div className="w-7 h-7 border-2 border-[var(--bd)] border-t-[var(--tx-1)] rounded-full animate-spin" />
              </div>
            ) : cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <p className="text-[var(--tx-3)] text-sm">No cards yet.</p>
                <Link
                  href="/templates"
                  className="text-xs font-bold bg-[var(--tx-1)] text-[var(--pg)] px-5 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                >
                  Create Your First Card
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--bd)]">
                {cards.map(card => (
                  <CardRow key={card.id} card={card} onRemove={handleRemove} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── FAVORITES tab ── */}
        {tab === "favorites" && (
          <>
            {likesLoading ? (
              <div className="flex justify-center py-24">
                <div className="w-7 h-7 border-2 border-[var(--bd)] border-t-[var(--tx-1)] rounded-full animate-spin" />
              </div>
            ) : likes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <p className="text-[var(--tx-3)] text-sm">No liked templates yet.</p>
                <Link href="/templates" className="text-xs font-bold bg-[var(--tx-1)] text-[var(--pg)] px-5 py-2.5 rounded-lg hover:opacity-80 transition-opacity">
                  Browse Templates
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {likes.map(tpl => (
                  <div key={tpl.id} className="flex flex-col items-center gap-3">
                    <div
                      className="relative w-full rounded-2xl overflow-hidden shadow"
                      style={{ aspectRatio: "9/19.5", background: "#1a1a1a" }}
                    >
                      {tpl.thumbnail && (
                        <Image src={tpl.thumbnail} alt={tpl.nameMs} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[var(--tx-1)] text-center">{tpl.nameMs || tpl.name}</p>
                    <div className="flex gap-2 w-full">
                      <Link
                        href={`/templates?template=${tpl.slug}`}
                        className="flex-1 text-center text-xs font-bold bg-[var(--tx-1)] text-[var(--pg)] py-2 rounded-lg hover:opacity-80 transition-opacity"
                      >
                        Use
                      </Link>
                      <Link
                        href={tpl.previewUrl ?? `/invite/${tpl.slug}`}
                        target="_blank"
                        className="flex-1 text-center text-xs font-bold border border-[var(--bd)] text-[var(--tx-2)] py-2 rounded-lg hover:bg-[var(--sf)] transition-colors"
                      >
                        Preview
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PROFILE tab ── */}
        {tab === "profile" && (
          <div className="max-w-sm space-y-4">
            <div className="rounded-2xl border border-[var(--bd)] bg-[var(--pg-alt)] p-5">
              <p className="text-xs text-[var(--tx-3)] mb-1">Name</p>
              <p className="font-semibold text-[var(--tx-1)]">{session.user.name ?? "–"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--bd)] bg-[var(--pg-alt)] p-5">
              <p className="text-xs text-[var(--tx-3)] mb-1">Email</p>
              <p className="font-semibold text-[var(--tx-1)]">{session.user.email ?? "–"}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
