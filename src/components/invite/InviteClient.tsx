"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { TemplateRenderer } from "@/components/templates/TemplateRenderer"
import { MusicPlayer } from "./MusicPlayer"
import { ActionBar } from "./ActionBar"
import type { InvitationCardData } from "@/types/invitation"
import { SCROLL_SPEED_MS } from "@/types/invitation"
import { ChevronLeft } from "lucide-react"

interface InviteClientProps {
  card: InvitationCardData
}

export function InviteClient({ card }: InviteClientProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement | undefined>(undefined)
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const isPausedRef = useRef<boolean>(false)
  const musicToggleRef = useRef<(() => void) | undefined>(undefined)
  const [isMusicMuted, setIsMusicMuted] = useState(true)
  const hasMusicPlayer = !!(card.media?.audioEnabled && card.media?.youtubeVideoId)

  const fireAnalytic = useCallback(async (event: string) => {
    try {
      await fetch(`/api/analytics/${card.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      })
    } catch {
      // silent fail
    }
  }, [card.slug])

  useEffect(() => {
    fireAnalytic("VIEW")
  }, [fireAnalytic])

  useEffect(() => {
    const cfg = card.scrollConfig
    if (!cfg?.autoScroll) return

    const el = scrollRef.current
    if (!el) return

    const speed = SCROLL_SPEED_MS[cfg.speed]

    const scroll = () => {
      if (isPausedRef.current) return
      // Stop at bottom — do not loop back to top
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) return
      el.scrollTop += 1
    }

    scrollIntervalRef.current = setInterval(scroll, speed)

    const handleInteraction = () => {
      if (!cfg.pauseOnHover) return
      isPausedRef.current = true
      setTimeout(() => { isPausedRef.current = false }, 3000)
    }

    el.addEventListener("touchstart", handleInteraction, { passive: true })
    el.addEventListener("mousedown", handleInteraction)

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current)
      el.removeEventListener("touchstart", handleInteraction)
      el.removeEventListener("mousedown", handleInteraction)
    }
  }, [card.scrollConfig])

  const image1 = card.template.image1Url
  const image2 = card.template.image2Url
  // When image2 exists use it as background; fall back to bgImageUrl then bgColor
  const bgOverlay = card.theme.bgOpacity > 0 ? card.theme.bgOpacity : 0.45
  const bgStyle = image2
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,${bgOverlay}),rgba(0,0,0,${bgOverlay})),url(${image2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : card.theme.bgImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,${card.theme.bgOpacity}),rgba(0,0,0,${card.theme.bgOpacity})),url(${card.theme.bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {}

  return (
    <div className="fixed inset-0 overflow-hidden">

      {/* ── Fixed background (Image 2) — stays static while content scrolls ── */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: card.theme.bgColor, ...bgStyle }}
      />

      {/* ── Back button ── */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm transition-all hover:opacity-80"
        style={{
          background: `${card.theme.bgColor}cc`,
          color: card.theme.primaryColor,
          border: `1px solid ${card.theme.primaryColor}25`,
        }}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Kembali
      </button>

      {/* ── Preview watermark (unpublished) ── */}
      {!card.isPublished && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 py-2 px-4 text-xs font-medium backdrop-blur-sm"
          style={{
            background: "rgba(0,0,0,0.82)",
            color: "#D4AF37",
            borderTop: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <span className="opacity-60 tracking-[0.2em] uppercase">Pratonton Sahaja</span>
          <span className="opacity-30">•</span>
          <span className="opacity-70">Terbitkan kad untuk menghapuskan watermark ini</span>
        </div>
      )}

      {/* ── Card — centred portrait column, scrolls over fixed background ── */}
      <div className="absolute inset-0 flex justify-center overflow-x-hidden z-10">
        <div
          ref={(el) => { if (el) scrollRef.current = el }}
          className="relative w-full max-w-md overflow-y-auto overscroll-none"
          style={{ scrollbarWidth: "none" }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {/* ── Image 1 — sits behind the first screen of content (absolute, scrolls with page) ── */}
          {image1 && (
            <div
              className="absolute top-0 left-0 right-0 pointer-events-none z-0"
              style={{ height: "100svh" }}
            >
              <img
                src={image1}
                alt=""
                className="absolute inset-0 w-full h-full object-cover select-none"
                draggable={false}
              />
            </div>
          )}

          {/* ── Template content starts at position 0, overlaid on Image 1 ── */}
          <div className="relative z-10">
            <TemplateRenderer card={card} />

            {hasMusicPlayer && (
              <MusicPlayer
                media={card.media}
                onAnalytic={fireAnalytic}
                toggleRef={musicToggleRef}
                onMuteChange={setIsMusicMuted}
              />
            )}

            <ActionBar
              card={card}
              onAnalytic={fireAnalytic}
              onMusicToggle={() => musicToggleRef.current?.()}
              isMusicMuted={isMusicMuted}
              hasMusicPlayer={hasMusicPlayer}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
