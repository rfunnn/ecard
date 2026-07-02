"use client"

import { Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Pencil, ImageIcon, Gift, Mail, Eye, Printer,
  MoreVertical, ExternalLink, Plus, ChevronDown, Trash2, Copy, Check, BarChart2,
} from "lucide-react"
import type { WizardConfig } from "@/types/config"
import { generatePrintHTML } from "@/lib/print-card"

type Card = {
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

  return (
    <div
      className="relative shrink-0 rounded-[14px] overflow-hidden shadow-lg"
      style={{ width: 70, aspectRatio: "9/19.5", background: bg, border: "4px solid #2a2a2a" }}
    >
      {/* notch */}
      <div className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <div className="w-7 h-2 bg-[#2a2a2a] rounded-b-md" />
      </div>

      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1 text-center">
          <span className="text-[8px] tracking-widest mb-1 opacity-50" style={{ color: accent }}>
            {card.template?.category === "WEDDING" ? "WALIMATUL URUS" : "JEMPUTAN"}
          </span>
          <span className="text-[9px] font-semibold leading-tight" style={{ color: accent }}>
            {card.groomName ?? card.title ?? "–"}
          </span>
        </div>
      )}

      {/* home bar */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <div className="w-5 h-0.5 rounded-full bg-white/20" />
      </div>
    </div>
  )
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-1 p-1 rounded transition-colors hover:bg-gray-100"
      title="Copy link"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-600" />
        : <Copy className="w-3.5 h-3.5 text-gray-400" />
      }
    </button>
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

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/invite/${card.slug}`
    : `/invite/${card.slug}`

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

  const actionBtn = "flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors py-1 px-1.5 rounded hover:bg-gray-100"

  return (
    <div className="flex gap-4 py-6">
      {/* Thumbnail */}
      <CardThumbnail card={card} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{displayName}</h3>
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-36"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  href={`/builder/${card.slug}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <Link
                  href={`/invite/${card.slug}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handlePrint() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Card
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => { setMenuOpen(false); onRemove(card.slug) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        {eventDateStr && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-amber-700 font-medium">{eventDateStr}</span>
            <ChevronDown className="w-3 h-3 text-amber-700" />
          </div>
        )}

        {/* Invitation link */}
        <div className="mb-3">
          <p className="text-[10px] text-gray-400 mb-0.5">Your Invitation Link:</p>
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
            <span className="text-[11px] text-gray-600 truncate flex-1 font-mono">
              {inviteUrl.replace(/^https?:\/\//, "")}
            </span>
            <CopyLinkButton url={inviteUrl} />
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center flex-wrap gap-1 mb-3">
          <Link href={`/builder/${card.slug}`} className={actionBtn}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <Link href={`/builder/${card.slug}?page=2`} className={actionBtn}>
            <ImageIcon className="w-3.5 h-3.5" /> Gallery
          </Link>
          <Link href={`/builder/${card.slug}?page=10`} className={actionBtn}>
            <Gift className="w-3.5 h-3.5" /> Gifts
          </Link>
          <Link href={`/builder/${card.slug}?page=7`} className={actionBtn}>
            <Mail className="w-3.5 h-3.5" /> RSVP
          </Link>
          {card.isPublished && (
            <Link
              href={`/dashboard/${card.slug}/report`}
              className={`${actionBtn} font-semibold`}
              style={{ color: card.theme?.primaryColor ?? undefined }}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {lang ? "Laporan" : "Report"}
            </Link>
          )}
          <Link href={`/invite/${card.slug}`} target="_blank" className={actionBtn}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </Link>
          <button
            onClick={handlePrint}
            disabled={printing}
            className={`${actionBtn} text-amber-700 hover:text-amber-900`}
            title="Preview physical card for printing"
          >
            {printing
              ? <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              : <Printer className="w-3.5 h-3.5" />
            }
            Print Card
          </button>
        </div>

        {/* Pay now */}
        {!card.isPublished && (
          <Link
            href="/checkout"
            className="inline-flex items-center gap-1.5 text-xs font-semibold border border-gray-800 text-gray-800 px-4 py-1.5 rounded-full hover:bg-gray-800 hover:text-white transition-colors"
          >
            PAY NOW
          </Link>
        )}

        {card.isPublished && (
          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-medium">
            Active
          </span>
        )}
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

  useEffect(() => {
    if (status !== "authenticated") return
    if (tab === "orders")    loadCards()
    if (tab === "favorites") loadLikes()
  }, [status, tab, loadCards, loadLikes])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  function handleRemove(slug: string) {
    setCards(prev => prev.filter(c => c.slug !== slug))
  }

  const sideNav = [
    { key: "orders",    label: "ORDERS" },
    { key: "favorites", label: "FAVORITES" },
    { key: "profile",   label: "MY PROFILE" },
  ]

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-44 shrink-0 border-r border-gray-100 py-10 px-6 gap-6">
        {sideNav.map(({ key, label }) => (
          <Link
            key={key}
            href={key === "profile" ? "/profile" : `/dashboard?tab=${key}`}
            className={`text-xs font-bold tracking-widest transition-colors ${
              tab === key
                ? "text-gray-900 underline underline-offset-4 decoration-2"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {label}
          </Link>
        ))}
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 px-6 md:px-10 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black tracking-widest text-gray-900 uppercase">
            {tab === "orders" ? "Orders" : tab === "favorites" ? "Favorites" : "My Profile"}
          </h1>
          <Link
            href="/new"
            className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-black tracking-widest uppercase px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Card
          </Link>
        </div>

        {/* ── ORDERS tab ── */}
        {tab === "orders" && (
          <>
            {cardsLoading ? (
              <div className="flex justify-center py-24">
                <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
              </div>
            ) : cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <p className="text-gray-400 text-sm">No cards yet.</p>
                <Link
                  href="/new"
                  className="text-xs font-bold bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Create Your First Card
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
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
                <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
              </div>
            ) : likes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <p className="text-gray-400 text-sm">No liked templates yet.</p>
                <Link href="/new" className="text-xs font-bold bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors">
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
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tpl.thumbnail} alt={tpl.nameMs} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-800 text-center">{tpl.nameMs || tpl.name}</p>
                    <div className="flex gap-2 w-full">
                      <Link
                        href={`/new?template=${tpl.slug}`}
                        className="flex-1 text-center text-xs font-bold bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Use
                      </Link>
                      <Link
                        href={tpl.previewUrl ?? `/invite/${tpl.slug}`}
                        target="_blank"
                        className="flex-1 text-center text-xs font-bold border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
            <div className="rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">Name</p>
              <p className="font-semibold text-gray-900">{session.user.name ?? "–"}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{session.user.email ?? "–"}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
