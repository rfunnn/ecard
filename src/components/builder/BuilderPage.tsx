"use client"

import { useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  FileText, Palette, Music, RefreshCw, Gift, Share2,
  ChevronLeft, Save, Eye
} from "lucide-react"
import { useBuilderStore } from "@/store/builderStore"
import { addToCart } from "@/lib/cart"
import { ContentPanel } from "./ContentPanel"
import { StylePanel } from "./StylePanel"
import { MediaPanel } from "./MediaPanel"
import { ScrollPanel } from "./ScrollPanel"
import { GiftPanel } from "./GiftPanel"
import { SharePanel } from "./SharePanel"
import { CardPreview } from "./CardPreview"
import { Button } from "@/components/ui/Button"
import type { InvitationCardData } from "@/types/invitation"

interface BuilderPageProps {
  initialCard: InvitationCardData
}

type Panel = "content" | "style" | "media" | "scroll" | "gift" | "share"

const TABS: { id: Panel; label: string; labelMs: string; icon: React.ElementType }[] = [
  { id: "content", label: "Content",  labelMs: "Kandungan", icon: FileText },
  { id: "style",   label: "Style",    labelMs: "Gaya",      icon: Palette },
  { id: "media",   label: "Music",    labelMs: "Muzik",     icon: Music },
  { id: "scroll",  label: "Scroll",   labelMs: "Skrol",     icon: RefreshCw },
  { id: "gift",    label: "Gift",     labelMs: "Hadiah",    icon: Gift },
  { id: "share",   label: "Share",    labelMs: "Kongsi",    icon: Share2 },
]

export function BuilderPage({ initialCard }: BuilderPageProps) {
  const router = useRouter()
  const { card, isDirty, isSaving, setCard, setActivePanel, activePanel, markClean, setIsSaving, updateContent } =
    useBuilderStore()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lang = initialCard.language === "ms"

  useEffect(() => {
    setCard(initialCard)
  }, [initialCard, setCard])

  const save = useCallback(async (data: Partial<InvitationCardData>, saveToCart = false) => {
    setIsSaving(true)
    try {
      const { theme, media, scrollConfig, ...rest } = data
      await fetch(`/api/cards/${initialCard.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, theme, media, scrollConfig }),
      })
      markClean()
      if (saveToCart) addToCart(initialCard.slug)
    } catch {
      // silent retry — store remains dirty
    } finally {
      setIsSaving(false)
    }
  }, [initialCard.slug, markClean, setIsSaving])

  // Debounced auto-save on every dirty change
  useEffect(() => {
    if (!isDirty) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => save(card), 1500)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [card, isDirty, save])

  async function handlePublishToggle(published: boolean) {
    updateContent({ isPublished: published })
    await save({ ...card, isPublished: published })
  }

  async function handlePasswordSet(password: string | null) {
    await fetch(`/api/cards/${initialCard.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
      <div className="w-14 shrink-0 border-r border-white/5 flex flex-col items-center py-4 gap-1 bg-[#080808]">
        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-cream/30 hover:text-cream/60 hover:bg-white/5 transition-colors mb-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-6 h-px bg-white/10 mb-2" />

        {TABS.map(({ id, icon: Icon, labelMs, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
              activePanel === id
                ? "bg-gold/15 text-gold"
                : "text-cream/30 hover:text-cream/60 hover:bg-white/5"
            }`}
          >
            <Icon className="w-4.5 h-4.5" />
            {/* Tooltip */}
            <span className="absolute left-12 bg-[#111] text-cream/80 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50">
              {lang ? labelMs : label}
            </span>
            {activePanel === id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl border border-gold/30"
              />
            )}
          </button>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save indicator */}
        {(isSaving || isDirty) && (
          <div className="w-10 h-10 flex items-center justify-center">
            {isSaving ? (
              <Save className="w-4 h-4 text-gold animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-gold/60" />
            )}
          </div>
        )}

        {/* Preview link */}
        {card.isPublished && (
          <a
            href={`/invite/${card.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-cream/30 hover:text-cream/60 hover:bg-white/5 transition-colors"
            title={lang ? "Buka kad" : "Open card"}
          >
            <Eye className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Panel */}
      <div className="w-72 shrink-0 border-r border-white/5 bg-[#0d0d0d] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {activePanel === "content" && <ContentPanel />}
          {activePanel === "style"   && <StylePanel />}
          {activePanel === "media"   && <MediaPanel />}
          {activePanel === "scroll"  && <ScrollPanel />}
          {activePanel === "gift"    && <GiftPanel />}
          {activePanel === "share"   && (
            <SharePanel
              onPublishToggle={handlePublishToggle}
              onPasswordSet={handlePasswordSet}
            />
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#080808]">
          <div className="flex items-center gap-2">
            <span className="font-playfair text-sm text-cream/70">
              {card.title || (lang ? "Kad Tanpa Tajuk" : "Untitled Card")}
            </span>
            {isDirty && (
              <span className="text-[10px] text-gold/50 bg-gold/10 px-2 py-0.5 rounded-full">
                {lang ? "Belum simpan" : "Unsaved"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              loading={isSaving}
              onClick={() => save(card, true)}
            >
              <Save className="w-3.5 h-3.5" />
              {lang ? "Simpan" : "Save"}
            </Button>
            {card.isPublished && (
              <a href={`/invite/${card.slug}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  <Eye className="w-3.5 h-3.5" />
                  {lang ? "Lihat Kad" : "View Card"}
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-hidden">
          <CardPreview />
        </div>
      </div>
    </div>
  )
}
