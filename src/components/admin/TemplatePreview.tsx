"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause } from "lucide-react"
import type { TemplateDisplayConfig } from "@/types/template-admin"

interface Props {
  image1Url?: string
  image2Url?: string
  config: TemplateDisplayConfig
}

export function TemplatePreview({ image1Url, image2Url, config }: Props) {
  const scrollRef = useRef<HTMLDivElement | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement | undefined>(undefined)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [frameH, setFrameH] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0–1 through section 1

  const { scrollSettings: ss, page1 } = config

  // Measure phone frame height
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setFrameH(el.clientHeight)
    const ro = new ResizeObserver(() => setFrameH(el.clientHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Auto-scroll play/pause
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!frameH) return
    const el = e.currentTarget
    const p = Math.min(el.scrollTop / (frameH * ss.imageSwitchOffset), 1)
    setProgress(p)
  }

  const switchPoint = frameH * ss.imageSwitchOffset

  // Which bg to show based on scroll
  const showingImage2 = progress >= 1

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pratonton Langsung</p>

      {/* Phone frame */}
      <div
        className="relative bg-gray-800 rounded-[28px] border-[6px] border-gray-800 shadow-2xl overflow-hidden"
        style={{ width: "180px", aspectRatio: "9/19.5" }}
      >
        {/* Notch */}
        <div className="absolute top-0.5 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <div className="w-16 h-3 bg-gray-800 rounded-b-xl" />
        </div>

        {/* Phone screen */}
        <div
          ref={(el) => { if (el) containerRef.current = el }}
          className="absolute inset-0 bg-gray-900 overflow-hidden"
        >
          {/* Fixed background layer */}
          <div className="absolute inset-0 z-0">
            {/* Image 1 bg (fades out as progress reaches 1) */}
            {image1Url && (
              <img
                src={image1Url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: showingImage2 ? 0 : 1 }}
              />
            )}
            {!image1Url && !showingImage2 && (
              <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900" />
            )}

            {/* Image 2 bg (fades in) */}
            {image2Url && (
              <img
                src={image2Url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: showingImage2 ? 1 : 0 }}
              />
            )}
            {!image2Url && showingImage2 && (
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-950" />
            )}
            {/* Dim overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Scrollable content layer */}
          <div
            ref={(el) => { if (el) scrollRef.current = el }}
            className="absolute inset-0 z-10 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
            onScroll={handleScroll}
          >
            {/* Section 1 — full frame height, overlaid on image1 */}
            <div
              className="relative flex flex-col items-center justify-center text-center text-white px-4"
              style={{ height: frameH || "100%" }}
            >
              {page1.overlayText.title || page1.overlayText.subtitle ? (
                <>
                  {page1.overlayText.title && (
                    <p className="text-sm font-bold leading-tight drop-shadow">
                      {page1.overlayText.title}
                    </p>
                  )}
                  {page1.overlayText.subtitle && (
                    <p className="text-xs opacity-75 mt-1 drop-shadow">
                      {page1.overlayText.subtitle}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2 opacity-40">
                  <div className="w-20 h-2 bg-white/60 rounded-full mx-auto" />
                  <div className="w-14 h-1.5 bg-white/40 rounded-full mx-auto" />
                </div>
              )}
              <p className="absolute bottom-3 text-[9px] text-white/50 animate-bounce">↓ tatal</p>
            </div>

            {/* Transition marker */}
            {frameH > 0 && (
              <div
                className="relative flex items-center justify-center py-2"
                style={{ top: 0 }}
              >
                <div className="flex items-center gap-1.5 bg-amber-500/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                  <span>peralihan pada {Math.round(ss.imageSwitchOffset * 100)}%</span>
                </div>
              </div>
            )}

            {/* Section 2 — content over image2, min-height 2× frame */}
            <div
              className="relative"
              style={{ minHeight: frameH ? frameH * 2 : "200%" }}
            >
              <div className="px-3 pt-4 pb-8 space-y-3">
                {config.page2.scrollContent.map((block, i) => (
                  <div key={i} className="text-white/90">
                    {block.type === "text" ? (
                      <p className="text-[10px] leading-relaxed drop-shadow">
                        {block.value || <span className="opacity-40 italic">blok teks {i + 1}</span>}
                      </p>
                    ) : (
                      <div className="h-16 bg-white/15 rounded-lg flex items-center justify-center">
                        <span className="text-[9px] text-white/50">imej</span>
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t border-white/20 pt-3 space-y-3">
                  {config.page3Plus.scrollContent.map((block, i) => (
                    <div key={i} className="text-white/90">
                      {block.type === "text" ? (
                        <p className="text-[10px] leading-relaxed drop-shadow">
                          {block.value || <span className="opacity-40 italic">blok teks {i + 1}</span>}
                        </p>
                      ) : (
                        <div className="h-16 bg-white/15 rounded-lg flex items-center justify-center">
                          <span className="text-[9px] text-white/50">imej</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <div className="w-10 h-0.5 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-44 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Auto scroll toggle */}
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
    </div>
  )
}
