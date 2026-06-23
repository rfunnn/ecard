"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Heart, Eye, Loader2, Sparkles } from "lucide-react"
import { addToCart } from "@/lib/cart"
import { TemplatePhoneFrame } from "@/components/TemplatePhoneFrame"
import type { TemplateForFrame } from "@/components/TemplatePhoneFrame"

interface Template extends TemplateForFrame {
  id: string
  name: string
  previewUrl?: string
}

const STORAGE_KEY = "kad_liked_templates"

function getLikedIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch { return [] }
}

function saveLikedIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    // Dispatch storage event so NavLikesButton updates
    window.dispatchEvent(new Event("storage"))
  } catch {}
}

function LikedTemplateCard({
  template,
  onUnlike,
  onTryNow,
  onView,
  creating,
}: {
  template: Template
  onUnlike: () => void
  onTryNow: () => void
  onView: () => void
  creating: boolean
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
      <TemplatePhoneFrame template={template} />

      <p className="text-sm font-bold text-gray-800 tracking-wide text-center">
        {template.slug.toUpperCase().replace(/-/g, "")}
      </p>
      <p className="text-xs text-gray-400 -mt-2 text-center">{template.nameMs}</p>

      <div className="flex items-center gap-1.5 w-full">
        {/* TRY NOW */}
        <button
          onClick={onTryNow}
          disabled={creating}
          className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 hover:border-gray-500 text-gray-700 hover:text-gray-900 text-[11px] font-semibold py-1.5 rounded-full transition-all disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "TRY NOW"}
        </button>

        {/* VIEW */}
        <button
          onClick={onView}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-700 rounded-full transition-all shrink-0"
          title="Lihat pratonton"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* UNLIKE — filled red, click removes from likes */}
        <button
          onClick={onUnlike}
          className="w-8 h-8 flex items-center justify-center border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all shrink-0"
          title="Buang dari senarai suka"
        >
          <Heart className="w-3.5 h-3.5 fill-red-500" />
        </button>
      </div>
    </div>
  )
}

export default function LikesPage() {
  const router = useRouter()
  const [allTemplates,  setAllTemplates]  = useState<Template[]>([])
  const [likedIds,      setLikedIds]      = useState<string[]>([])
  const [loading,       setLoading]       = useState(true)
  const [creating,      setCreating]      = useState<string | null>(null)

  useEffect(() => {
    const ids = getLikedIds()
    setLikedIds(ids)

    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setAllTemplates(d.templates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const likedTemplates = allTemplates.filter((t) => likedIds.includes(t.id))

  const handleUnlike = (id: string) => {
    const next = likedIds.filter((i) => i !== id)
    setLikedIds(next)
    saveLikedIds(next)
  }

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Nav */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-13 py-3">
          <Link
            href="/new"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Semak Imbas</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-red-400 text-red-400" />
            <h1 className="text-sm font-semibold text-gray-800">Templat Disukai</h1>
            {likedIds.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                {likedIds.length}
              </span>
            )}
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">

        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                <div className="mx-auto bg-gray-200 rounded-[22px]" style={{ width: "110px", aspectRatio: "9/19.5" }} />
                <div className="h-3 bg-gray-200 rounded mt-4 mx-6" />
                <div className="h-7 bg-gray-100 rounded-full mt-3" />
              </div>
            ))}
          </div>

        ) : likedIds.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <Heart className="w-8 h-8 text-red-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Tiada templat disukai lagi</h2>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Tekan ikon ❤ pada templat yang anda suka semasa melayari koleksi kami
            </p>
            <Link
              href="/new"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Layari Templat
            </Link>
          </div>

        ) : likedTemplates.length === 0 && !loading ? (
          /* IDs saved but templates not found from API */
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">Templat tidak dapat dimuatkan. Cuba lagi.</p>
          </div>

        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              {likedTemplates.length} templat disimpan
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {likedTemplates.map((t) => (
                <LikedTemplateCard
                  key={t.id}
                  template={t}
                  onUnlike={() => handleUnlike(t.id)}
                  onTryNow={() => handleTryNow(t)}
                  onView={() => handleView(t)}
                  creating={creating === t.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
