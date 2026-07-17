"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { TemplateRenderer } from "@/components/templates/TemplateRenderer"
import { MusicPlayer } from "./MusicPlayer"
import { ActionBar } from "./ActionBar"
import { RSVPModal } from "./RSVPModal"
import { EffectAnimation } from "./EffectAnimation"
import type { InvitationCardData } from "@/types/invitation"
import { SCROLL_SPEED_CFG } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { ChevronLeft } from "lucide-react"
import { OpeningGate } from "./OpeningGate"

interface InviteClientProps {
  card: InvitationCardData
  onClose?: () => void
  demoBadge?: string
}

export function InviteClient({ card, onClose, demoBadge }: InviteClientProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const isPausedRef = useRef<boolean>(false)
  const musicToggleRef = useRef<(() => void) | undefined>(undefined)
  const [isMusicMuted, setIsMusicMuted] = useState(true)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const hasMusicPlayer = !!(card.media?.audioEnabled && card.media?.youtubeVideoId)

  const fireAnalytic = useCallback(async (event: string) => {
    if (demoBadge) return
    try {
      await fetch(`/api/analytics/${card.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      })
    } catch {
      // silent fail
    }
  }, [card.slug, demoBadge])

  useEffect(() => {
    fireAnalytic("VIEW")
  }, [fireAnalytic])

  const wCfg            = card.wizardConfig as WizardConfig | undefined
  const musicStartSeconds = (() => {
    const t = wCfg?.musicStartTime ?? "00:00"
    const [m, s] = t.split(":").map(Number)
    return (m || 0) * 60 + (s || 0)
  })()
  const effectAnimation = wCfg?.effectAnimation   ?? "Tiada"
  const effectColor     = wCfg?.effectColor       ?? "#ffffff"
  const effectSizeScale = (wCfg?.effectSize ?? 100) / 100
  const openingStyle    = wCfg?.openingStyle      ?? "Tiada"
  const openingStyleColor = wCfg?.openingStyleColor ?? "#1a1a1a"

  const [gateOpen, setGateOpen] = useState(() => openingStyle !== "Tiada")

  useEffect(() => {
    const cfg = card.scrollConfig
    if (!cfg?.autoScroll) return
    if (gateOpen) return

    const el = scrollRef.current
    if (!el) return

    const { intervalMs, px } = SCROLL_SPEED_CFG[cfg.speed ?? "MEDIUM"]
    const startDelayMs = ((card.wizardConfig as { scrollDelay?: number } | undefined)?.scrollDelay ?? 3.5) * 1000

    const scroll = () => {
      if (isPausedRef.current) return
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) return
      el.scrollTop += px
    }

    const handleInteraction = () => {
      if (!cfg.pauseOnHover) return
      isPausedRef.current = true
      setTimeout(() => { isPausedRef.current = false }, 3000)
    }

    el.addEventListener("touchstart", handleInteraction, { passive: true })
    el.addEventListener("mousedown", handleInteraction)

    const startTimeout = setTimeout(() => {
      scrollIntervalRef.current = setInterval(scroll, intervalMs)
    }, startDelayMs)

    return () => {
      clearTimeout(startTimeout)
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current)
      el.removeEventListener("touchstart", handleInteraction)
      el.removeEventListener("mousedown", handleInteraction)
    }
  }, [card.scrollConfig, card.wizardConfig, gateOpen])

  const image1 = card.template.image1Url
  const image2 = card.template.image2Url

  const hasBgImage = !!(card.theme.bgImageUrl && !image1 && !image2)

  return (
    <div className="fixed inset-0 overflow-hidden">

      {/* ── Full-screen background — solid colour that shows outside the card column ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: card.theme.bgColor,
          backgroundImage: hasBgImage
            ? `linear-gradient(rgba(0,0,0,${card.theme.bgOpacity}),rgba(0,0,0,${card.theme.bgOpacity})),url(${card.theme.bgImageUrl})`
            : "none",
          backgroundSize: hasBgImage ? "100% auto" : "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* ── Back button ── */}
      <button
        onClick={() => {
          if (onClose) { onClose(); return }
          if (window.history.length > 1) {
            router.back()
          } else {
            router.push("/templates")
          }
        }}
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

      {/* ── Demo package badge ── */}
      {demoBadge && (
        <div
          className="fixed top-4 right-4 z-50 text-[10px] font-bold tracking-[0.12em] px-3 py-1 rounded-full border pointer-events-none select-none"
          style={{
            background: `${card.theme.bgColor}dd`,
            borderColor: `${card.theme.primaryColor}40`,
            color: card.theme.primaryColor,
            backdropFilter: "blur(8px)",
          }}
        >
          {demoBadge}
        </div>
      )}

      {/* ── Preview watermark (unpublished) ── */}
      {!card.isPublished && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="w-full max-w-md flex flex-col items-center py-3 select-none"
            style={{ background: "rgba(150,150,150,0.55)", backdropFilter: "blur(2px)" }}
          >
            <span className="text-sm font-bold tracking-[0.4em] uppercase" style={{ color: "#fff" }}>
              PREVIEW ONLY
            </span>
          </div>
        </div>
      )}

      {/* ── Centred card column ── */}
      <div className="absolute inset-0 flex justify-center overflow-x-hidden z-10">

        {/*
          Two-layer card column:
          - Outer div: relative positioning parent, fills the column width (max-w-md)
          - Image 2: absolute inset-0, z-0 — fills exactly the card column, stays put (not scrollable)
          - Inner div: absolute inset-0, overflow-y-auto, z-10 — scrollable content layer
          - Image 1: absolute at top of scroll layer, 100svh tall — covers image2 on page 1, scrolls away
        */}
        <div className="relative w-full max-w-md h-full">

          {/* ── Particle effect — contained to the card column ── */}
          <EffectAnimation effect={effectAnimation} color={effectColor} sizeScale={effectSizeScale} contained />

          {/* ── Image 2 — card-column-wide background, revealed as image1 scrolls away ── */}
          {image2 && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image
                src={image2}
                alt=""
                fill
                className="object-cover select-none"
                draggable={false}
                sizes="(max-width: 448px) 100vw, 448px"
              />
            </div>
          )}

          {/* ── Scrollable content layer ── */}
          <div
            ref={(el) => { scrollRef.current = el }}
            className="absolute inset-0 overflow-y-auto overscroll-none z-10"
            style={{ scrollbarWidth: "none" }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>

            {/* ── Image 1 — first viewport only, scrolls with content to reveal image2 ── */}
            {image1 && (
              <div
                className="absolute top-0 left-0 right-0 pointer-events-none z-0"
                style={{ height: "100svh" }}
              >
                <Image
                  src={image1}
                  alt=""
                  fill
                  className="object-cover select-none"
                  draggable={false}
                  priority
                  sizes="(max-width: 448px) 100vw, 448px"
                />
              </div>
            )}

            {/* ── Template content — overlaid on image1 (page 1), then on image2 (page 2+) ── */}
            <div className="relative z-10">
              {!gateOpen && (
                <>
                  <TemplateRenderer card={card} onRsvpOpen={() => { fireAnalytic("RSVP_OPEN"); setRsvpOpen(true) }} revealed={true} scrollContainerRef={scrollRef} />

                  {hasMusicPlayer && (
                    <MusicPlayer
                      media={card.media}
                      onAnalytic={fireAnalytic}
                      toggleRef={musicToggleRef}
                      startSeconds={musicStartSeconds}
                      onMuteChange={setIsMusicMuted}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Action bar — contained within the max-w-md card column ── */}
          <ActionBar
            card={card}
            onAnalytic={fireAnalytic}
            onMusicToggle={() => musicToggleRef.current?.()}
            isMusicMuted={isMusicMuted}
            hasMusicPlayer={hasMusicPlayer}
            onRsvpOpen={() => setRsvpOpen(true)}
            contained
          />

          <RSVPModal
            isOpen={rsvpOpen}
            onClose={() => setRsvpOpen(false)}
            card={card}
            onAnalytic={fireAnalytic}
            contained
          />
        </div>
      </div>

      {/* ── Opening gate — shown on top of card until user taps ── */}
      {gateOpen && (
        <OpeningGate
          style={openingStyle}
          color={openingStyleColor}
          onOpen={() => setGateOpen(false)}
          displayName={wCfg?.displayName}
          eventType={wCfg?.eventType}
          eventDate={wCfg?.dayAndDate}
        />
      )}
    </div>
  )
}
