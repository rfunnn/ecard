"use client"

import { useState } from "react"
import { Phone, CirclePlay, CirclePause, MapPin, Gift, Mail, Heart, QrCode } from "lucide-react"
import { motion } from "framer-motion"
import type { InvitationCardData } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { GiftModal } from "./GiftModal"
import { LocationModal } from "./LocationModal"
import { ContactModal } from "./ContactModal"
import { QRModal } from "./QRModal"

interface ActionBarProps {
  card: InvitationCardData
  onAnalytic?: (event: string) => void
  onMusicToggle?: () => void
  isMusicMuted?: boolean
  hasMusicPlayer?: boolean
  onRsvpOpen?: () => void
  contained?: boolean
}

export function ActionBar({
  card,
  onAnalytic,
  onMusicToggle,
  isMusicMuted = true,
  hasMusicPlayer = false,
  onRsvpOpen,
  contained = false,
}: ActionBarProps) {
  const [giftOpen, setGiftOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const handleMapClick = () => {
    setLocationOpen(true)
  }

  const wCfg = card.wizardConfig as WizardConfig | undefined
  const hasMap = !!(card.venueMapUrl || card.venueAddress || wCfg?.googleMapsUrl || wCfg?.wazeUrl)
  const hasWhatsApp = !!card.whatsappNumber
  const hasGifts = (card.giftItems?.length ?? 0) > 0
  // Gift section visible only when there are wishlist items or explicit bank account details
  const hasGiftContent = hasGifts || !!(wCfg?.bankAccountNumber)
  const seg = wCfg?.segments
  const hasRsvp = (seg?.attendance !== false) && (!wCfg || wCfg.rsvp?.mode !== "NONE")
  const { primaryColor, bgColor } = card.theme

  const footerRawBg = wCfg?.footerBgColor || bgColor || "#ffffff"
  const footerOpacity = (wCfg?.footerBgOpacity ?? 70) / 100
  const footerIconCol = wCfg?.footerIconColor || primaryColor
  const footerBg = hexToRgba(footerRawBg, footerOpacity)

  return (
    <>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", damping: 20 }}
        className={`${contained ? "absolute" : "fixed"} bottom-0 left-0 right-0 z-50`}
        style={{
          background: footerBg,
          borderTop: `1.5px solid ${footerIconCol}50`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-3 pb-4 max-w-md mx-auto">

          {/* Phone / Contact */}
          <button
            onClick={() => setContactOpen(true)}
            disabled={!hasWhatsApp}
            aria-label={card.language === "ms" ? "Hubungi" : "Contact"}
            className="flex flex-col items-center gap-1.5 w-14 transition-all active:scale-90"
            style={{ opacity: hasWhatsApp ? 0.9 : 0.3 }}
          >
            <Phone className="w-6 h-6" style={{ color: footerIconCol, strokeWidth: 1.5 }} />
            <span className="text-[10px] tracking-wide" style={{ color: footerIconCol }}>
              {card.language === "ms" ? "Hubungi" : "Contact"}
            </span>
          </button>

          {/* Music play/pause */}
          <button
            onClick={hasMusicPlayer ? onMusicToggle : undefined}
            disabled={!hasMusicPlayer}
            aria-label={isMusicMuted ? "Play music" : "Pause music"}
            className="flex flex-col items-center gap-1.5 w-14 transition-all active:scale-90"
            style={{ opacity: hasMusicPlayer ? 0.9 : 0.3 }}
          >
            {isMusicMuted ? (
              <CirclePlay className="w-6 h-6" style={{ color: footerIconCol, strokeWidth: 1.5 }} />
            ) : (
              <CirclePause className="w-6 h-6" style={{ color: footerIconCol, strokeWidth: 1.5 }} />
            )}
            <span className="text-[10px] tracking-wide" style={{ color: footerIconCol }}>
              {card.language === "ms" ? "Lagu" : "Music"}
            </span>
          </button>

          {/* Location / Map */}
          <button
            onClick={handleMapClick}
            disabled={!hasMap}
            aria-label={card.language === "ms" ? "Lokasi" : "Location"}
            className="flex flex-col items-center gap-1.5 w-14 transition-all active:scale-90"
            style={{ opacity: hasMap ? 0.9 : 0.3 }}
          >
            <MapPin className="w-6 h-6" style={{ color: footerIconCol, strokeWidth: 1.5 }} />
            <span className="text-[10px] tracking-wide" style={{ color: footerIconCol }}>
              {card.language === "ms" ? "Lokasi" : "Location"}
            </span>
          </button>

          {/* Gift */}
          {hasGiftContent && (
            <button
              onClick={() => { onAnalytic?.("GIFT_CLICK"); setGiftOpen(true) }}
              aria-label={card.language === "ms" ? "Hadiah" : "Gift"}
              className="flex flex-col items-center gap-1.5 w-14 transition-all active:scale-90"
              style={{ opacity: 0.9 }}
            >
              <Gift className="w-6 h-6" style={{ color: footerIconCol, strokeWidth: 1.5 }} />
              <span className="text-[10px] tracking-wide" style={{ color: footerIconCol }}>
                {card.language === "ms" ? "Hadiah" : "Gift"}
              </span>
            </button>
          )}

          {/* RSVP */}
          {hasRsvp && (
            <button
              onClick={() => { onRsvpOpen?.() }}
              aria-label="RSVP"
              className="flex flex-col items-center gap-1.5 w-14 transition-all active:scale-90"
              style={{ opacity: 0.9 }}
            >
              <div className="relative">
                <Mail className="w-6 h-6" style={{ color: footerIconCol, strokeWidth: 1.5 }} />
                <Heart
                  className="absolute -top-1 -right-1 w-3 h-3"
                  style={{ color: footerIconCol, fill: footerIconCol }}
                />
              </div>
              <span className="text-[10px] tracking-wide" style={{ color: footerIconCol }}>RSVP</span>
            </button>
          )}

          {/* QR Code */}
          <button
            onClick={() => setQrOpen(true)}
            aria-label={card.language === "ms" ? "Kod QR" : "QR Code"}
            className="flex flex-col items-center gap-1.5 w-14 transition-all active:scale-90"
            style={{ opacity: 0.9 }}
          >
            <QrCode className="w-6 h-6" style={{ color: footerIconCol, strokeWidth: 1.5 }} />
            <span className="text-[10px] tracking-wide" style={{ color: footerIconCol }}>
              {card.language === "ms" ? "Kod QR" : "QR Code"}
            </span>
          </button>

        </div>
      </motion.div>

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        card={card}
        onAnalytic={onAnalytic}
        contained={contained}
      />

      <LocationModal
        isOpen={locationOpen}
        onClose={() => setLocationOpen(false)}
        card={card}
        onAnalytic={onAnalytic}
        contained={contained}
      />

      <GiftModal
        isOpen={giftOpen}
        onClose={() => setGiftOpen(false)}
        card={card}
        onAnalytic={onAnalytic}
        contained={contained}
      />

      <QRModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        card={card}
        contained={contained}
      />
    </>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "")
  if (h.length < 6) return `rgba(255,255,255,${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
