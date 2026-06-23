"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Heart, ChevronLeft, Eye, Loader2, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { addToCart } from "@/lib/cart"
import type { TemplateCategory } from "@/types/invitation"
import { TemplatePhoneFrame } from "@/components/TemplatePhoneFrame"
import { NavLikesButton } from "@/components/NavLikesButton"

// ─── types ──────────────────────────────────────────────────────────────────

interface Template {
  id: string
  slug: string
  name: string
  nameMs: string
  category: TemplateCategory
  thumbnail: string
  previewUrl?: string
  defaultConfig: {
    primaryColor?: string
    bgColor?: string
    titleFont?: string
  }
}

// ─── constants ───────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "latest",  label: "By Latest" },
  { value: "name",    label: "By Name" },
  { value: "popular", label: "By Popular" },
]

const THEME_FILTERS: { key: TemplateCategory | "ALL"; label: string }[] = [
  { key: "ALL",       label: "All" },
  { key: "WEDDING",   label: "Perkahwinan" },
  { key: "BIRTHDAY",  label: "Hari Lahir" },
  { key: "CORPORATE", label: "Korporat" },
  { key: "GENERIC",   label: "Umum" },
]

const COLOR_SWATCHES = [
  "#1a1a1a", "#B8960C", "#f9c5d1", "#9e9e9e",
  "#ffffff", "#9c27b0", "#2196f3", "#4caf50",
  "#e91e63", "#f48fb1", "#ff9800", "#ffeb3b",
]

const FALLBACK_TEMPLATES: Template[] = [
  { id: "wedding-classic",  slug: "wedding-classic",  name: "Wedding Classic",   nameMs: "Perkahwinan Klasik",  category: "WEDDING",   thumbnail: "", defaultConfig: { primaryColor: "#D4AF37", bgColor: "#1a0a00", titleFont: "Playfair Display" } },
  { id: "wedding-modern",   slug: "wedding-modern",   name: "Wedding Modern",    nameMs: "Perkahwinan Moden",   category: "WEDDING",   thumbnail: "", defaultConfig: { primaryColor: "#C0A050", bgColor: "#0d0d0d",  titleFont: "Cinzel" } },
  { id: "birthday-fun",     slug: "birthday-fun",     name: "Birthday Fun",      nameMs: "Hari Lahir Ceria",    category: "BIRTHDAY",  thumbnail: "", defaultConfig: { primaryColor: "#8B5CF6", bgColor: "#1a0a2a",  titleFont: "Dancing Script" } },
  { id: "birthday-elegant", slug: "birthday-elegant", name: "Birthday Elegant",  nameMs: "Hari Lahir Elegan",   category: "BIRTHDAY",  thumbnail: "", defaultConfig: { primaryColor: "#EC4899", bgColor: "#1a0011",  titleFont: "Great Vibes" } },
  { id: "corporate-pro",    slug: "corporate-pro",    name: "Corporate Pro",     nameMs: "Korporat Pro",        category: "CORPORATE", thumbnail: "", defaultConfig: { primaryColor: "#10B981", bgColor: "#0a1a0a",  titleFont: "Montserrat" } },
  { id: "generic-classic",  slug: "generic-classic",  name: "Generic Classic",   nameMs: "Umum Klasik",         category: "GENERIC",   thumbnail: "", defaultConfig: { primaryColor: "#D4AF37", bgColor: "#0a0a0a",  titleFont: "Playfair Display" } },
]

// PhoneFrame is now the shared TemplatePhoneFrame component

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
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
      {/* Phone frame */}
      <TemplatePhoneFrame template={template} previewName={previewName} />

      {/* Template code */}
      <p className="text-sm font-bold text-gray-800 tracking-wide text-center">
        {template.slug.toUpperCase().replace(/-/g, "")}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 w-full">
        {/* TRY NOW */}
        <button
          onClick={onTryNow}
          disabled={creating}
          className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 hover:border-gray-500 text-gray-700 hover:text-gray-900 text-[11px] font-semibold py-1.5 rounded-full transition-all disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            "TRY NOW"
          )}
        </button>

        {/* VIEW */}
        <button
          onClick={onView}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-700 rounded-full transition-all shrink-0"
          title="View preview"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* LIKE */}
        <button
          onClick={onLike}
          className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all shrink-0 ${
            liked
              ? "border-red-300 bg-red-50 text-red-500"
              : "border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-400"
          }`}
          title={liked ? "Unlike" : "Like"}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
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
          <p className="font-semibold text-gray-800">Filter</p>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sort By */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort By</p>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 pr-8"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
          </div>
        </div>
      </div>

      {/* Design Themes */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Design Themes</p>
        <div className="space-y-1.5">
          {THEME_FILTERS.map((f) => (
            <label key={f.key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeThemes.has(f.key)}
                onChange={() => toggleTheme(f.key)}
                className="w-3.5 h-3.5 accent-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                {f.label}
              </span>
              <span className="text-xs text-gray-400">({counts[f.key] ?? 0})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color</p>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(activeColor === color ? null : color)}
              className={`w-8 h-8 rounded-full transition-all ${
                activeColor === color
                  ? "ring-2 ring-offset-1 ring-gray-700 scale-110"
                  : "hover:scale-105"
              }`}
              style={{
                background: color,
                border: color === "#ffffff" ? "1px solid #e5e7eb" : "none",
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Apply button */}
      <button
        onClick={onApply}
        className="w-full py-2 border border-gray-400 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-lg transition-colors tracking-wider"
      >
        APPLY FILTER
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewCardPage() {
  const router = useRouter()

  const [templates,    setTemplates]    = useState<Template[]>([])
  const [loading,      setLoading]      = useState(true)
  const [sort,         setSort]         = useState("latest")
  const [activeThemes, setActiveThemes] = useState<Set<string>>(
    new Set(THEME_FILTERS.map((f) => f.key))
  )
  const [activeColor,  setActiveColor]  = useState<string | null>(null)
  const [previewName,  setPreviewName]  = useState("")
  const [nameInput,    setNameInput]    = useState("")
  const [liked,        setLiked]        = useState<Set<string>>(new Set())
  const [creating,     setCreating]     = useState<string | null>(null)
  const [mobileFilter, setMobileFilter] = useState(false)

  // Persist likes in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kad_liked_templates")
      if (stored) setLiked(new Set(JSON.parse(stored) as string[]))
    } catch {}
  }, [])

  const saveLikes = (next: Set<string>) => {
    setLiked(next)
    try { localStorage.setItem("kad_liked_templates", JSON.stringify([...next])) } catch {}
  }

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates?.length ? d.templates : FALLBACK_TEMPLATES))
      .catch(() => setTemplates(FALLBACK_TEMPLATES))
      .finally(() => setLoading(false))
  }, [])

  const handleSetName = () => setPreviewName(nameInput.trim())

  // Derive filtered + sorted list
  const filtered = templates.filter((t) => {
    const themeOk = activeThemes.has("ALL") || activeThemes.has(t.category) || activeThemes.size === 0
    return themeOk
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.nameMs.localeCompare(b.nameMs)
    return 0 // "latest" and "popular" keep API order
  })

  const handleTryNow = useCallback(async (template: Template) => {
    if (creating) return
    setCreating(template.id)
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, title: "Jemputan", language: "ms" }),
      })
      if (!res.ok) throw new Error("Failed")
      const { card } = await res.json()
      addToCart(card.slug)
      router.push(`/builder/${card.slug}`)
    } catch {
      setCreating(null)
    }
  }, [creating, router])

  const handleView = (template: Template) => {
    const url = template.previewUrl ?? "/invite/demo"
    window.open(url, "_blank", "noopener noreferrer")
  }

  const handleLike = (id: string) => {
    const next = new Set(liked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    saveLikes(next)
  }

  const sidebarProps = {
    templates,
    sort, setSort,
    activeThemes, setActiveThemes,
    activeColor, setActiveColor,
    onApply: () => setMobileFilter(false),
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top nav ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-13 py-3">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
          <h1 className="text-sm font-semibold text-gray-800">Pilih Templat</h1>
          <div className="flex items-center gap-2">
            <NavLikesButton />
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilter(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block w-52 xl:w-60 shrink-0 bg-white border-r border-gray-200 min-h-full">
          <Sidebar {...sidebarProps} />
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 px-4 sm:px-6 py-5 space-y-5">

          {/* Personalised name banner */}
          <div className="bg-gray-100 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Set your name(s) for a personalised preview
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adam & Hawa"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetName()}
                className="flex-1 border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-400"
              />
              <button
                onClick={handleSetName}
                className="px-5 py-2 border border-gray-400 text-gray-700 hover:bg-gray-200 text-sm font-semibold rounded-lg transition-colors tracking-wider shrink-0"
              >
                SET NAME
              </button>
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-500">
            {sorted.length} templat dijumpai
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                  <div className="mx-auto bg-gray-200 rounded-[22px]" style={{ width: "110px", aspectRatio: "9/19.5" }} />
                  <div className="h-3 bg-gray-200 rounded mt-4 mx-6" />
                  <div className="h-7 bg-gray-100 rounded-full mt-3" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-base font-medium">Tiada templat dijumpai</p>
              <p className="text-sm mt-1">Cuba tukar penapis anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
              {sorted.map((t) => (
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
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilter(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto">
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
