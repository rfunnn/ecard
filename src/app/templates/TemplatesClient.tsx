"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Heart, Eye, Loader2, SlidersHorizontal, X, Search, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { TemplateCategory } from "@/types/invitation"
import { TemplatePhoneFrame } from "@/components/TemplatePhoneFrame"
import { useLikes } from "@/hooks/useLikes"

// ─── types ───────────────────────────────────────────────────────────────────

interface Template {
  id: string
  slug: string
  name: string
  nameMs: string
  category: TemplateCategory
  thumbnail: string
  previewUrl?: string
  createdAt?: string
  defaultConfig: {
    primaryColor?: string
    primaryColors?: string[]
    bgColor?: string
    titleFont?: string
  }
}

// ─── constants ───────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "latest",  label: "Terbaru" },
  { value: "name",    label: "Nama" },
  { value: "popular", label: "Popular" },
]

const THEME_FILTERS: { key: TemplateCategory | "ALL"; label: string; emoji: string }[] = [
  { key: "ALL",       label: "Semua",       emoji: "✦" },
  { key: "WEDDING",   label: "Perkahwinan", emoji: "💍" },
  { key: "BIRTHDAY",  label: "Hari Lahir",  emoji: "🎂" },
  { key: "CORPORATE", label: "Korporat",    emoji: "🏢" },
  { key: "GENERIC",   label: "Umum",        emoji: "✉️" },
]

const COLOR_SWATCHES = [
  "#1a1a1a", "#B8960C", "#f9c5d1", "#9e9e9e",
  "#ffffff", "#9c27b0", "#2196f3", "#4caf50",
  "#e91e63", "#f48fb1", "#ff9800", "#ffeb3b",
]

const ITEMS_PER_PAGE = 12

const FALLBACK_TEMPLATES: Template[] = [
  { id: "wedding-classic",  slug: "wedding-classic",  name: "Wedding Classic",   nameMs: "Perkahwinan Klasik",  category: "WEDDING",   thumbnail: "", defaultConfig: { primaryColor: "#D4AF37", bgColor: "#1a0a00", titleFont: "Playfair Display" } },
  { id: "wedding-modern",   slug: "wedding-modern",   name: "Wedding Modern",    nameMs: "Perkahwinan Moden",   category: "WEDDING",   thumbnail: "", defaultConfig: { primaryColor: "#C0A050", bgColor: "#0d0d0d",  titleFont: "Cinzel" } },
  { id: "birthday-fun",     slug: "birthday-fun",     name: "Birthday Fun",      nameMs: "Hari Lahir Ceria",    category: "BIRTHDAY",  thumbnail: "", defaultConfig: { primaryColor: "#8B5CF6", bgColor: "#1a0a2a",  titleFont: "Dancing Script" } },
  { id: "birthday-elegant", slug: "birthday-elegant", name: "Birthday Elegant",  nameMs: "Hari Lahir Elegan",   category: "BIRTHDAY",  thumbnail: "", defaultConfig: { primaryColor: "#EC4899", bgColor: "#1a0011",  titleFont: "Great Vibes" } },
  { id: "corporate-pro",    slug: "corporate-pro",    name: "Corporate Pro",     nameMs: "Korporat Pro",        category: "CORPORATE", thumbnail: "", defaultConfig: { primaryColor: "#10B981", bgColor: "#0a1a0a",  titleFont: "Montserrat" } },
  { id: "generic-classic",  slug: "generic-classic",  name: "Generic Classic",   nameMs: "Umum Klasik",         category: "GENERIC",   thumbnail: "", defaultConfig: { primaryColor: "#D4AF37", bgColor: "#0a0a0a",  titleFont: "Playfair Display" } },
]

// ─── TemplateCard ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  previewName,
  liked,
  onLike,
  onTryNow,
  onView,
  creating,
}: {
  template: Template
  previewName: string
  liked: boolean
  onLike: () => void
  onTryNow: () => void
  onView: () => void
  creating: boolean
}) {
  return (
    <div className="bg-[var(--pg-alt)] rounded-xl p-2.5 border border-[var(--bd)] flex flex-col items-center gap-2 hover:border-gold/25 transition-all">
      <TemplatePhoneFrame template={template} previewName={previewName} />

      <p className="text-[11px] font-semibold text-[var(--tx-1)] tracking-wider text-center">
        {template.nameMs}
      </p>

      <div className="flex items-center gap-1.5 w-full">
        {/* TRY NOW */}
        <button
          onClick={onTryNow}
          disabled={creating}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gold/10 hover:bg-gold/20 border border-gold/20 hover:border-gold/40 text-gold text-[11px] font-semibold py-2 rounded-full transition-all disabled:opacity-50 active:scale-95"
        >
          {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Cuba"}
        </button>

        {/* VIEW */}
        <button
          onClick={onView}
          className="w-8 h-8 flex items-center justify-center border border-[var(--bd)] hover:border-gold/30 text-[var(--tx-3)] hover:text-[var(--tx-1)] rounded-full transition-all shrink-0"
          title="Lihat pratonton"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* LIKE */}
        <button
          onClick={onLike}
          className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all shrink-0 ${
            liked
              ? "border-red-400/40 bg-red-500/10 text-red-400"
              : "border-[var(--bd)] hover:border-red-400/40 text-[var(--tx-3)] hover:text-red-400"
          }`}
          title={liked ? "Nyahsuka" : "Suka"}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-400" : ""}`} />
        </button>
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  templates,
  sort,
  setSort,
  activeThemes,
  setActiveThemes,
  activeColor,
  setActiveColor,
  onApply,
  onClose,
}: {
  templates: Template[]
  sort: string
  setSort: (v: string) => void
  activeThemes: Set<string>
  setActiveThemes: (s: Set<string>) => void
  activeColor: string | null
  setActiveColor: (c: string | null) => void
  onApply: () => void
  onClose?: () => void
}) {
  const counts = THEME_FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = f.key === "ALL"
      ? templates.length
      : templates.filter((t) => t.category === f.key).length
    return acc
  }, {})

  const toggleTheme = (key: string) => {
    const next = new Set(activeThemes)
    if (key === "ALL") {
      if (next.has("ALL")) {
        next.clear()
      } else {
        THEME_FILTERS.forEach((f) => next.add(f.key))
      }
    } else {
      if (next.has(key)) {
        next.delete(key)
        next.delete("ALL")
      } else {
        next.add(key)
        const nonAll = THEME_FILTERS.filter((f) => f.key !== "ALL")
        if (nonAll.every((f) => next.has(f.key))) next.add("ALL")
      }
    }
    setActiveThemes(next)
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      {onClose && (
        <div className="flex items-center justify-between">
          <p className="font-semibold text-[var(--tx-1)]">Penapis</p>
          <button onClick={onClose} className="p-1 text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sort By */}
      <div>
        <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-2.5">Atur Ikut</p>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none border border-[var(--bd)] rounded-xl px-3 py-2.5 text-sm text-[var(--tx-1)] bg-[var(--pg)] focus:outline-none focus:border-gold/40 pr-8 transition-colors"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--tx-3)] text-xs">▾</div>
        </div>
      </div>

      {/* Design Themes */}
      <div>
        <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-2.5">Tema Reka Bentuk</p>
        <div className="space-y-2">
          {THEME_FILTERS.map((f) => (
            <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeThemes.has(f.key)}
                onChange={() => toggleTheme(f.key)}
                className="w-3.5 h-3.5 accent-amber-500 rounded"
              />
              <span className="text-sm text-[var(--tx-2)] group-hover:text-[var(--tx-1)] flex-1 transition-colors">
                {f.emoji} {f.label}
              </span>
              <span className="text-[11px] text-[var(--tx-3)]">{counts[f.key] ?? 0}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-2.5">Warna</p>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(activeColor === color ? null : color)}
              className={`w-7 h-7 rounded-full transition-all ${
                activeColor === color
                  ? "ring-2 ring-offset-1 ring-gold scale-110"
                  : "hover:scale-105"
              }`}
              style={{
                background: color,
                border: color === "#ffffff" ? "1px solid var(--bd)" : "none",
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onApply}
        className="w-full py-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/20 hover:border-gold/40 text-gold text-sm font-semibold rounded-xl transition-all tracking-wide"
      >
        Guna Penapis
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TemplatesClient() {
  const router = useRouter()
  const { status } = useSession()

  const [templates,    setTemplates]    = useState<Template[]>([])
  const [loading,      setLoading]      = useState(true)
  const [sort,         setSort]         = useState("latest")
  const [activeThemes, setActiveThemes] = useState<Set<string>>(
    new Set(THEME_FILTERS.map((f) => f.key))
  )
  const [activeColor,  setActiveColor]  = useState<string | null>(null)
  const [previewName,  setPreviewName]  = useState("")
  const [nameInput,    setNameInput]    = useState("")
  const { liked, toggle } = useLikes()
  const [creating,        setCreating]        = useState<string | null>(null)
  const [draftLimitError, setDraftLimitError] = useState(false)
  const [mobileFilter,    setMobileFilter]    = useState(false)
  const [currentPage,     setCurrentPage]     = useState(1)

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates?.length ? d.templates : FALLBACK_TEMPLATES))
      .catch(() => setTemplates(FALLBACK_TEMPLATES))
      .finally(() => setLoading(false))
  }, [])

  const handleSetName = () => setPreviewName(nameInput.trim())

  const selectCategory = (key: string) => {
    if (key === "ALL") {
      setActiveThemes(new Set(THEME_FILTERS.map((f) => f.key)))
    } else {
      setActiveThemes(new Set([key, "ALL"].filter(k => k === key)))
    }
  }

  const activeSingleCategory = (): string => {
    const nonAll = [...activeThemes].filter(k => k !== "ALL")
    if (nonAll.length === 1) return nonAll[0]
    if (activeThemes.has("ALL") && activeThemes.size === THEME_FILTERS.length) return "ALL"
    return ""
  }

  const filtered = useMemo(() => templates.filter((t) => {
    const themeOk = activeThemes.has("ALL") || activeThemes.has(t.category) || activeThemes.size === 0
    const colorOk = !activeColor || (
      t.defaultConfig?.primaryColors?.includes(activeColor) ||
      t.defaultConfig?.primaryColor === activeColor
    )
    return themeOk && colorOk
  }), [templates, activeThemes, activeColor])

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sort === "name") return a.nameMs.localeCompare(b.nameMs)
    if (sort === "latest") {
      if (a.createdAt && b.createdAt) return b.createdAt.localeCompare(a.createdAt)
      return 0
    }
    if (sort === "popular") {
      const aLiked = liked.has(a.id) ? 1 : 0
      const bLiked = liked.has(b.id) ? 1 : 0
      return bLiked - aLiked
    }
    return 0
  }), [filtered, sort, liked])

  // Reset to page 1 whenever filters or sort change
  useEffect(() => { setCurrentPage(1) }, [sort, activeThemes, activeColor])

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const paginated  = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const pageNumbers = useMemo(() => {
    const pages: (number | "…")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("…")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("…")
      pages.push(totalPages)
    }
    return pages
  }, [totalPages, currentPage])

  const handleTryNow = useCallback(async (template: Template) => {
    if (creating) return
    if (status === "unauthenticated") {
      router.push(`/builder/try/${template.slug}`)
      return
    }
    setCreating(template.id)
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, title: "Jemputan", language: "ms" }),
      })
      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent("/templates")}`)
        return
      }
      if (res.status === 403) {
        const body = await res.json().catch(() => ({}))
        if (body.error === "DRAFT_LIMIT_EXCEEDED") {
          setDraftLimitError(true)
          setCreating(null)
          return
        }
      }
      if (!res.ok) throw new Error(`Create failed (${res.status})`)
      const { card } = await res.json()
      if (!card?.slug) throw new Error("Malformed response")
      router.push(`/builder/${card.slug}`)
    } catch (err) {
      console.error("handleTryNow failed:", err)
      alert("Gagal membuka pembina kad. Sila cuba lagi.")
      setCreating(null)
    }
  }, [creating, status, router])

  const handleView = (template: Template) => {
    if (template.previewUrl) {
      const url = previewName
        ? `${template.previewUrl}?name=${encodeURIComponent(previewName)}`
        : template.previewUrl
      window.open(url, "_blank", "noopener noreferrer")
      return
    }
    const params = new URLSearchParams({ template: template.slug })
    if (previewName) params.set("name", previewName)
    window.open(`/invite/demo?${params.toString()}`, "_blank", "noopener noreferrer")
  }

  const handleLike = (id: string) => {
    toggle(id)
  }

  const sidebarProps = {
    templates, sort, setSort,
    activeThemes, setActiveThemes,
    activeColor, setActiveColor,
    onApply: () => setMobileFilter(false),
  }

  const activeCat = activeSingleCategory()

  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col">

      {/* ── Draft limit error modal ── */}
      {draftLimitError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDraftLimitError(false)} />
          <div className="relative w-full max-w-sm bg-[var(--float)] border border-[var(--float-bd)] rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <h2 className="font-semibold text-[var(--tx-1)] text-base leading-snug">Had Draf Dicapai</h2>
                <p className="mt-1.5 text-sm text-[var(--tx-2)] leading-relaxed">
                  Anda sudah mempunyai <span className="font-semibold text-[var(--tx-1)]">3 draf reka bentuk</span> kad jemputan. Sila selesaikan atau padamkan salah satu draf sedia ada sebelum mencipta reka bentuk baharu.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setDraftLimitError(false)}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--bd)] text-[var(--tx-2)] hover:bg-[var(--sf)] transition-colors"
              >
                Tutup
              </button>
              <Link
                href="/dashboard"
                onClick={() => setDraftLimitError(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gold/10 border border-gold/25 text-gold hover:bg-gold/20 transition-colors font-medium"
              >
                Pergi ke Kad Saya
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-nav: page title + mobile filter ── */}
      <div className="bg-[var(--pg-nav)] border-b border-[var(--bd)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-10">
          <h1 className="font-playfair text-[15px] text-[var(--tx-1)]">Pilih Templat</h1>
          <button
            onClick={() => setMobileFilter(true)}
            className="lg:hidden flex items-center gap-1.5 text-[13px] text-[var(--tx-2)] border border-[var(--bd)] hover:border-gold/30 hover:text-[var(--tx-1)] rounded-full px-3 py-1.5 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Penapis
          </button>
        </div>

        {/* ── Mobile category pills ── */}
        <div className="lg:hidden border-t border-[var(--bd)] px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
          {THEME_FILTERS.map((f) => {
            const isActive = f.key === "ALL" ? activeCat === "ALL" : activeCat === f.key
            return (
              <button
                key={f.key}
                onClick={() => selectCategory(f.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  isActive
                    ? "bg-gold text-ink shadow-sm shadow-gold/20"
                    : "border border-[var(--bd)] text-[var(--tx-2)] hover:border-gold/30 hover:text-[var(--tx-1)]"
                }`}
              >
                <span>{f.emoji}</span>
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block w-52 xl:w-60 shrink-0 bg-[var(--pg-alt)] border-r border-[var(--bd)] min-h-full">
          <Sidebar {...sidebarProps} />
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 px-4 sm:px-6 py-4 space-y-4">

          {/* Name preview input */}
          <div className="rounded-xl border border-[var(--bd)] bg-[var(--pg-alt)] px-3 py-3">
            <p className="text-[13px] font-semibold text-[var(--tx-1)] mb-2.5">
              Tetapkan nama untuk pratonton peribadi
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--tx-3)]" />
                <input
                  type="text"
                  placeholder="Adam & Hawa"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSetName()}
                  className="w-full border border-[var(--bd)] bg-[var(--pg)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--tx-1)] focus:outline-none focus:border-gold/40 placeholder-[var(--tx-3)] transition-colors"
                />
              </div>
              <button
                onClick={handleSetName}
                className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/20 hover:border-gold/40 text-gold text-[12px] font-bold rounded-xl transition-all tracking-wider shrink-0 active:scale-95"
              >
                SET
              </button>
            </div>
          </div>

          {/* Result count */}
          <p className="text-[12px] text-[var(--tx-3)] px-0.5">
            {sorted.length === 0 ? "0 templat dijumpai" : (
              <>
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} daripada {sorted.length} templat
              </>
            )}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[var(--pg-alt)] rounded-2xl p-3.5 border border-[var(--bd)] animate-pulse">
                  <div className="mx-auto bg-[var(--sf)] rounded-[22px]" style={{ width: "110px", aspectRatio: "9/19.5" }} />
                  <div className="h-2.5 bg-[var(--sf)] rounded mt-4 mx-4" />
                  <div className="h-8 bg-[var(--sf)] rounded-full mt-3" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-playfair text-xl text-[var(--tx-1)] mb-2">Tiada templat dijumpai</p>
              <p className="text-sm text-[var(--tx-3)]">Cuba tukar penapis anda</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {paginated.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    previewName={previewName}
                    liked={liked.has(t.id)}
                    onLike={() => handleLike(t.id)}
                    onTryNow={() => handleTryNow(t)}
                    onView={() => handleView(t)}
                    creating={creating === t.id}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 py-6">
                  <button
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--bd)] text-[var(--tx-3)] hover:border-gold/40 hover:text-[var(--tx-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {pageNumbers.map((p, i) =>
                    p === "…" ? (
                      <span key={`ellipsis-${i}`} className="w-8 text-center text-[var(--tx-3)] text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                          currentPage === p
                            ? "bg-gold text-ink shadow-sm shadow-gold/20"
                            : "border border-[var(--bd)] text-[var(--tx-2)] hover:border-gold/40 hover:text-[var(--tx-1)]"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--bd)] text-[var(--tx-3)] hover:border-gold/40 hover:text-[var(--tx-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilter(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--pg)] shadow-2xl overflow-y-auto border-r border-[var(--bd)]">
            <Sidebar
              {...sidebarProps}
              onClose={() => setMobileFilter(false)}
              onApply={() => setMobileFilter(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
