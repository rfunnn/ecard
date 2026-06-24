"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { TemplateRenderer } from "@/components/templates/TemplateRenderer"
import type { InvitationCardData, TemplateCategory } from "@/types/invitation"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"
import type { TemplateDisplayConfig } from "@/types/template-admin"

interface Props {
  image1Url?: string
  image2Url?: string
  config: TemplateDisplayConfig
  name?: string
  slug?: string
  category?: string
}

function buildMockCard(
  name: string,
  slug: string,
  category: string,
  image1Url: string | undefined,
  image2Url: string | undefined,
): InvitationCardData {
  const cat = (category || "WEDDING") as TemplateCategory
  return {
    id: "preview",
    slug: slug || "preview",
    templateId: "preview",
    title: cat === "WEDDING" ? "Adam & Hawa" : "Majlis Pratonton",
    groomName: cat === "WEDDING" ? "Adam" : undefined,
    brideName:  cat === "WEDDING" ? "Hawa" : undefined,
    subtitle:
      cat === "WEDDING"   ? "Walimatul Urus" :
      cat === "BIRTHDAY"  ? "Majlis Hari Jadi" :
      cat === "CORPORATE" ? "Majlis Korporat" :
                            "Jemputan",
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    eventTime: "10:00",
    venueName: "Dewan Seri Mahkota",
    venueAddress: "No. 1, Jalan Utama, 50000 Kuala Lumpur",
    description:
      "Dengan penuh kesyukuran, kami mempersilakan Dato’ | Datin | Tuan | Puan hadir ke majlis kami.",
    isPublished: true,
    language: "ms",
    viewCount: 0,
    theme: { ...DEFAULT_THEME },
    media: { ...DEFAULT_MEDIA },
    scrollConfig: { ...DEFAULT_SCROLL },
    template: {
      slug: slug || "preview",
      name: name || "Template",
      category: cat,
      image1Url: image1Url ?? null,
      image2Url: image2Url ?? null,
    },
    giftItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function TemplatePreview({ image1Url, image2Url, name = "", slug = "", category = "WEDDING" }: Props) {
  const screenRef   = useRef<HTMLDivElement | undefined>(undefined)
  const scrollRef   = useRef<HTMLDivElement | undefined>(undefined)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [frameH,    setFrameH]    = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [scrollKey, setScrollKey] = useState(0)

  const mockCard = buildMockCard(name, slug, category, image1Url, image2Url)

  // Measure phone screen height for image1 sizing
  useEffect(() => {
    const el = screenRef.current
    if (!el) return
    setFrameH(el.clientHeight)
    const ro = new ResizeObserver(() => setFrameH(el.clientHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const el = scrollRef.current
        if (!el) return
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
          el.scrollTop = 0
        } else {
          el.scrollTop += 1.5
        }
      }, 30)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying])

  const handleReplay = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setScrollKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pratonton Langsung</p>

      {/* Phone frame */}
      <div
        className="relative bg-gray-800 rounded-[28px] border-[6px] border-gray-800 shadow-2xl overflow-hidden"
        style={{ width: "220px", aspectRatio: "9/19.5" }}
      >
        {/* Notch */}
        <div className="absolute top-0.5 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <div className="w-16 h-3 bg-gray-800 rounded-b-xl" />
        </div>

        {/* Phone screen */}
        <div
          ref={(el) => { if (el) screenRef.current = el }}
          className="absolute inset-0 overflow-hidden"
          style={{ backgroundColor: DEFAULT_THEME.bgColor }}
        >
          {/* Image 2 — fixed background, revealed as image 1 scrolls away */}
          {image2Url && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src={image2Url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>
          )}

          {/* Scrollable content layer */}
          <div
            key={scrollKey}
            ref={(el) => { if (el) scrollRef.current = el }}
            className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Image 1 — covers first screen, scrolls away to reveal image 2 */}
            {image1Url && frameH > 0 && (
              <div
                className="absolute top-0 left-0 right-0 pointer-events-none z-0"
                style={{ height: frameH }}
              >
                <img
                  src={image1Url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            )}

            {/* Rendered template */}
            <div className="relative z-10">
              <TemplateRenderer card={mockCard} />
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <div className="w-10 h-0.5 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {isPlaying ? (
            <><Pause className="w-3 h-3" /> Berhenti</>
          ) : (
            <><Play className="w-3 h-3" /> Auto Skrol</>
          )}
        </button>
        <button
          type="button"
          onClick={handleReplay}
          title="Ulang ke atas"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Ulang
        </button>
      </div>
    </div>
  )
}
