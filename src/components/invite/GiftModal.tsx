"use client"

import { ExternalLink, Gift } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import type { InvitationCardData } from "@/types/invitation"

interface GiftModalProps {
  isOpen: boolean
  onClose: () => void
  card: InvitationCardData
  onAnalytic?: (event: string) => void
}

export function GiftModal({ isOpen, onClose, card, onAnalytic }: GiftModalProps) {
  const lang = card.language === "ms"
  const { primaryColor } = card.theme
  const items = card.giftItems ?? []

  function handleItemClick(link: string) {
    onAnalytic?.("GIFT_CLICK")
    window.open(link, "_blank", "noopener,noreferrer")
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang ? "Hadiah" : "Gift Registry"}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-cream/20">
          <Gift className="w-10 h-10" />
          <p className="text-sm">{lang ? "Tiada item hadiah" : "No gift items"}</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.link)}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 active:scale-95 transition-all text-left"
            >
              {/* 1:1 image */}
              <div className="w-full" style={{ aspectRatio: "1/1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.label ?? "gift"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Label + link icon */}
              <div
                className="absolute inset-x-0 bottom-0 px-2.5 py-2 flex items-center justify-between gap-1"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}
              >
                <span className="text-xs text-white font-medium truncate leading-snug">
                  {item.label ?? (lang ? "Pautan" : "Link")}
                </span>
                <ExternalLink
                  className="w-3.5 h-3.5 shrink-0 opacity-70"
                  style={{ color: primaryColor }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-[10px] text-cream/20 pb-4">
        {lang ? "Ketik gambar untuk membuka pautan hadiah" : "Tap an image to open the gift link"}
      </p>
    </Modal>
  )
}
