"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Heart, Eye, Loader2, Sparkles } from "lucide-react"
import { TemplatePhoneFrame } from "@/components/TemplatePhoneFrame"
import type { TemplateForFrame } from "@/components/TemplatePhoneFrame"
import { useLikes } from "@/hooks/useLikes"

interface Template extends TemplateForFrame {
  id: string
  name: string
  previewUrl?: string
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
    <div className="bg-[var(--pg-alt)] rounded-xl p-2.5 border border-[var(--bd)] flex flex-col items-center gap-2 hover:border-gold/25 transition-all">
      <TemplatePhoneFrame template={template} />

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

        {/* UNLIKE */}
        <button
          onClick={onUnlike}
          className="w-8 h-8 flex items-center justify-center border border-red-400/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full transition-all shrink-0"
          title="Buang dari senarai suka"
        >
          <Heart className="w-3.5 h-3.5 fill-red-400" />
        </button>
      </div>
    </div>
  )
}

export default function LikesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { liked, toggle, loading: likesLoading } = useLikes()

  const [templates,    setTemplates]    = useState<Template[]>([])
  const [loading,      setLoading]      = useState(true)
  const [creating,     setCreating]     = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    setLoading(true)

    if (session?.user?.id) {
      // Logged-in: fetch liked templates directly from DB
      fetch("/api/user/likes")
        .then((r) => r.json())
        .then((d) => setTemplates(d.likes ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      // Guest: fetch all templates then filter by localStorage IDs
      fetch("/api/templates")
        .then((r) => r.json())
        .then((d) => setTemplates(d.templates ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status, session?.user?.id])

  // displayed = templates that are still in the liked set
  const displayed = templates.filter((t) => liked.has(t.id))

  const handleUnlike = (id: string) => {
    toggle(id)
  }

  const handleTryNow = useCallback(async (template: Template) => {
    if (creating) return
    // Guests get an ephemeral trial builder (no DB write, edits lost on refresh).
    // Only branch on a definite "unauthenticated" so a logged-in user caught in
    // the transient "loading" state still goes through the normal DB flow.
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
      // Stale JWT session (user row gone) — force a fresh login and come back here.
      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent("/likes")}`)
        return
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
      window.open(template.previewUrl, "_blank", "noopener noreferrer")
      return
    }
    window.open(`/invite/demo?template=${template.slug}`, "_blank", "noopener noreferrer")
  }

  const isLoading = status === "loading" || loading || likesLoading

  return (
    <div className="min-h-screen bg-[var(--pg)] flex flex-col">

      {/* Nav */}
      <div className="sticky top-0 z-40 bg-[var(--pg-nav)] backdrop-blur-md border-b border-[var(--bd)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
          <Link
            href="/new"
            className="flex items-center gap-2 text-[var(--tx-3)] hover:text-[var(--tx-1)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Semak Imbas</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-red-400 text-red-400" />
            <h1 className="text-sm font-semibold text-[var(--tx-1)]">Templat Disukai</h1>
            {displayed.length > 0 && (
              <span className="text-xs bg-red-500/15 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                {displayed.length}
              </span>
            )}
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[var(--pg-alt)] rounded-xl p-3 border border-[var(--bd)] animate-pulse">
                <div className="mx-auto bg-[var(--bd)] rounded-[22px]" style={{ width: "110px", aspectRatio: "9/19.5" }} />
                <div className="h-3 bg-[var(--bd)] rounded mt-4 mx-6" />
                <div className="h-7 bg-[var(--bd)] rounded-full mt-3" />
              </div>
            ))}
          </div>

        ) : liked.size === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5">
              <Heart className="w-8 h-8 text-red-400/50" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--tx-1)] mb-2">Tiada templat disukai lagi</h2>
            <p className="text-sm text-[var(--tx-3)] mb-6 max-w-xs">
              Tekan ikon ❤ pada templat yang anda suka semasa melayari koleksi kami
            </p>
            <Link
              href="/new"
              className="inline-flex items-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/25 text-gold text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Layari Templat
            </Link>
          </div>

        ) : displayed.length === 0 ? (
          <div className="py-16 text-center text-[var(--tx-3)]">
            <p className="text-sm">Templat tidak dapat dimuatkan. Cuba lagi.</p>
          </div>

        ) : (
          <>
            <p className="text-sm text-[var(--tx-3)] mb-5">
              {displayed.length} templat disimpan
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayed.map((t) => (
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
