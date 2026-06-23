"use client"

import { Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { TemplatePhoneFrame } from "@/components/TemplatePhoneFrame"

type Card = {
  id: string; slug: string; title: string
  groomName: string | null; brideName: string | null
  isPublished: boolean; language: string; viewCount: number
  updatedAt: string; createdAt: string
  template: { name: string; nameMs: string; category: string } | null
  theme: { primaryColor: string; bgColor: string } | null
}

type LikedTemplate = {
  id: string; slug: string; name: string; nameMs: string
  category: string; thumbnail: string; previewUrl?: string | null
  image1Url?: string | null
  defaultConfig: { primaryColor?: string; bgColor?: string }
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
  const router     = useRouter()
  const params     = useSearchParams()
  const tab        = params.get("tab") ?? "cards"

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
    if (res.ok) {
      const body = await res.json()
      setCards(body.cards)
    }
    setCardsLoading(false)
  }, [])

  const loadLikes = useCallback(async () => {
    setLikesLoading(true)
    const res = await fetch("/api/user/likes")
    if (res.ok) {
      const body = await res.json()
      setLikes(body.likes)
    }
    setLikesLoading(false)
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    if (tab === "cards") loadCards()
    if (tab === "likes") loadLikes()
  }, [status, tab, loadCards, loadLikes])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  const displayName = session.user.name ?? session.user.email ?? "Pengguna"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                ← Laman Utama
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Dashboard</h1>
              <p className="text-sm text-gray-500">Selamat datang, {displayName}</p>
            </div>
            <Link
              href="/new"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              + Buat Kad Baru
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-b border-gray-200">
            {[
              { key: "cards", label: "Kad Saya" },
              { key: "likes", label: "Templat Suka" },
            ].map(({ key, label }) => (
              <Link
                key={key}
                href={`/dashboard?tab=${key}`}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  tab === key
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Cards Tab */}
        {tab === "cards" && (
          <>
            {cardsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-4">Belum ada kad dibuat</p>
                <Link
                  href="/new"
                  className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                >
                  Buat Kad Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">
                      {card.template?.category === "WEDDING" ? "💍" :
                       card.template?.category === "BIRTHDAY" ? "🎂" : "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {card.title || [card.groomName, card.brideName].filter(Boolean).join(" & ") || card.slug}
                      </p>
                      <p className="text-xs text-gray-400">
                        {card.template?.nameMs ?? card.template?.name ?? "—"} ·{" "}
                        {new Date(card.updatedAt).toLocaleDateString("ms-MY")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          card.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {card.isPublished ? "Aktif" : "Draf"}
                      </span>
                      <span className="text-xs text-gray-400">{card.viewCount} tontonan</span>
                      <Link
                        href={`/builder/${card.slug}`}
                        className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/invite/${card.slug}`}
                        target="_blank"
                        className="text-xs border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Lihat
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Likes Tab */}
        {tab === "likes" && (
          <>
            {likesLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : likes.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-4">Belum ada templat disukai</p>
                <Link
                  href="/new"
                  className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                >
                  Layari Templat
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {likes.map((tpl) => (
                  <div key={tpl.id} className="flex flex-col items-center gap-3">
                    <TemplatePhoneFrame
                      template={{
                        slug:          tpl.slug,
                        nameMs:        tpl.nameMs,
                        category:      tpl.category,
                        thumbnail:     tpl.thumbnail,
                        defaultConfig: tpl.defaultConfig as { primaryColor?: string; bgColor?: string },
                      }}
                      size="sm"
                    />
                    <p className="text-xs font-medium text-gray-700 text-center">{tpl.nameMs || tpl.name}</p>
                    <div className="flex gap-1 w-full">
                      <Link
                        href={`/invite/${tpl.slug}`}
                        target="_blank"
                        className="flex-1 text-center text-xs bg-gray-900 text-white py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cuba
                      </Link>
                      <Link
                        href={tpl.previewUrl ?? `/invite/${tpl.slug}`}
                        target="_blank"
                        className="flex-1 text-center text-xs border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Lihat
                      </Link>
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
