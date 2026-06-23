"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Pencil, Eye, Trash2, Plus, ShoppingBag, Clock } from "lucide-react"
import Link from "next/link"
import { getCartSlugs, removeFromCart } from "@/lib/cart"

interface CartCard {
  slug: string
  title: string
  groomName?: string
  brideName?: string
  language: string
  updatedAt: string
  template: {
    name: string
    nameMs: string
    category: string
  }
  theme: { primaryColor: string; bgColor: string } | null
}

const CATEGORY_EMOJI: Record<string, string> = {
  WEDDING: "💍",
  BIRTHDAY: "🎂",
  CORPORATE: "🏢",
  GENERIC: "✉️",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: Props) {
  const [cards, setCards] = useState<CartCard[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    const slugs = getCartSlugs()
    if (slugs.length === 0) {
      setCards([])
      return
    }
    setLoading(true)
    fetch(`/api/cards?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((d) => setCards(d.cards ?? []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false))
  }, [isOpen])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [onClose])

  function handleRemove(slug: string) {
    removeFromCart(slug)
    setCards((prev) => prev.filter((c) => c.slug !== slug))
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-sm h-full bg-[#0f0f0f] border-l border-white/10 flex flex-col shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-gold" />
                <h2 className="font-playfair text-base text-cream">Kad Saya</h2>
                {cards.length > 0 && (
                  <span className="text-xs bg-gold/20 text-gold rounded-full px-2 py-0.5 font-semibold">
                    {cards.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-cream/40 hover:text-cream hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 px-6 text-center">
                  <ShoppingBag className="w-10 h-10 text-cream/10 mb-3" />
                  <p className="text-cream/40 text-sm">Tiada kad disimpan</p>
                  <p className="text-cream/20 text-xs mt-1">Buat kad baru untuk mula</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {cards.map((card) => {
                    const accent = card.theme?.primaryColor ?? "#D4AF37"
                    const bg = card.theme?.bgColor ?? "#1a0a00"
                    const displayName =
                      card.groomName && card.brideName
                        ? `${card.groomName} & ${card.brideName}`
                        : card.title || "Kad Jemputan"
                    const firstName = displayName.split(" & ")[0]

                    return (
                      <div
                        key={card.slug}
                        className="flex gap-3 p-4 hover:bg-white/[0.03] transition-colors"
                      >
                        {/* Mini thumbnail */}
                        <div
                          className="shrink-0 w-11 rounded-lg overflow-hidden"
                          style={{ aspectRatio: "3/4", background: bg, border: `1px solid ${accent}30` }}
                        >
                          <div className="h-0.5 w-full" style={{ background: accent }} />
                          <div className="flex flex-col items-center justify-center h-full gap-0.5 px-1">
                            <span className="text-sm">{CATEGORY_EMOJI[card.template.category] ?? "✉️"}</span>
                            <p
                              className="font-great-vibes text-[7px] text-center leading-tight"
                              style={{ color: accent }}
                            >
                              {firstName}
                            </p>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-cream font-medium truncate">{displayName}</p>
                          <p className="text-xs text-cream/40 mt-0.5">
                            {CATEGORY_EMOJI[card.template.category]} {card.template.nameMs}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock className="w-2.5 h-2.5 text-cream/20" />
                            <span className="text-[11px] text-cream/25">{formatDate(card.updatedAt)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end justify-between shrink-0">
                          <div className="flex flex-col items-end gap-2">
                            <Link
                              href={`/builder/${card.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-1 text-[11px] text-gold/60 hover:text-gold transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </Link>
                            <Link
                              href={`/invite/${card.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-1 text-[11px] text-cream/35 hover:text-cream/70 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Lihat
                            </Link>
                          </div>
                          <button
                            onClick={() => handleRemove(card.slug)}
                            className="flex items-center gap-1 text-[11px] text-red-500/30 hover:text-red-400 transition-colors"
                            title="Buang dari senarai"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 p-4 border-t border-white/10">
              <Link
                href="/new"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Buat Kad Baru
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
