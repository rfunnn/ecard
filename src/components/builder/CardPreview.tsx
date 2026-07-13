"use client"

import { useBuilderStore } from "@/store/builderStore"
import { TemplateRenderer } from "@/components/templates/TemplateRenderer"
import type { InvitationCardData } from "@/types/invitation"
import { Monitor, Smartphone } from "lucide-react"

export function CardPreview() {
  const { card, previewMode, setPreviewMode } = useBuilderStore()

  if (!card.slug || !card.template) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-cream/30 text-sm">Pilih templat untuk melihat pratonton</p>
    </div>
  )

  const fullCard = card as InvitationCardData

  return (
    <div className="flex flex-col h-full bg-[#080808]">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <span className="text-xs text-cream/30 uppercase tracking-wider">Pratonton</span>
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5">
          <button
            onClick={() => setPreviewMode("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
              previewMode === "mobile"
                ? "bg-gold text-ink font-medium"
                : "text-cream/40 hover:text-cream/60"
            }`}
          >
            <Smartphone className="w-3 h-3" />
            Mobil
          </button>
          <button
            onClick={() => setPreviewMode("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
              previewMode === "desktop"
                ? "bg-gold text-ink font-medium"
                : "text-cream/40 hover:text-cream/60"
            }`}
          >
            <Monitor className="w-3 h-3" />
            Desktop
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6">
        {previewMode === "mobile" ? (
          <div className="relative shrink-0" style={{ width: 320 }}>
            {/* Phone frame */}
            <div
              className="relative rounded-[40px] overflow-hidden border-2 border-white/10 shadow-2xl"
              style={{ height: 640 }}
            >
              {/* Static background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: card.theme?.bgColor ?? "#0a0a0a",
                  backgroundImage: card.theme?.bgImageUrl
                    ? `linear-gradient(rgba(0,0,0,${card.theme.bgOpacity}),rgba(0,0,0,${card.theme.bgOpacity})), url(${card.theme.bgImageUrl})`
                    : "none",
                  backgroundSize: card.theme?.bgImageUrl ? "100% auto" : "cover",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-6 z-10 bg-black/20">
                <span className="text-[10px] text-white/50">9:41</span>
                <div className="w-20 h-4 bg-black rounded-full" />
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-1.5 border border-white/40 rounded-sm">
                    <div className="w-2/3 h-full bg-white/40 rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Scrollable content over static background */}
              <div className="absolute inset-0 overflow-y-auto pt-10 z-10" style={{ scrollbarWidth: "none" }}>
                <TemplateRenderer card={fullCard} />
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-1.5 left-0 right-0 flex justify-center z-20">
                <div className="w-24 h-1 bg-white/20 rounded-full" />
              </div>
            </div>

            {/* Phone notch overlay */}
            <div className="absolute top-0 left-0 right-0 flex justify-center pt-2 pointer-events-none">
              <div className="w-28 h-6 bg-black rounded-b-2xl" />
            </div>
          </div>
        ) : (
          <div
            className="relative w-full max-w-2xl rounded-xl overflow-hidden border border-white/10 shadow-xl"
            style={{ height: 600 }}
          >
            {/* Static background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: card.theme?.bgColor ?? "#0a0a0a",
                backgroundImage: card.theme?.bgImageUrl
                  ? `linear-gradient(rgba(0,0,0,${card.theme.bgOpacity}),rgba(0,0,0,${card.theme.bgOpacity})), url(${card.theme.bgImageUrl})`
                  : "none",
                backgroundSize: card.theme?.bgImageUrl ? "100% auto" : "cover",
                backgroundPosition: "top center",
                backgroundRepeat: "no-repeat",
              }}
            />
            {/* Scrollable content over static background */}
            <div className="absolute inset-0 overflow-y-auto z-10">
              <TemplateRenderer card={fullCard} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
