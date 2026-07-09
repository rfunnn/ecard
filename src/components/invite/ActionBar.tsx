"use client"

import { useState } from "react"
import { Phone, CirclePlay, CirclePause, MapPin, Gift, Mail, Heart } from "lucide-react"
import { motion } from "framer-motion"
import type { InvitationCardData } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { GiftModal } from "./GiftModal"
import { LocationModal } from "./LocationModal"
import { ContactModal } from "./ContactModal"

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

  return (
    <>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", damping: 20 }}
        className={`${contained ? "absolute" : "fixed"} bottom-0 left-0 right-0 z-50`}
        style={{
          background: bgColor,
          borderTop: `1px solid ${primaryColor}30`,
        }}
      >
        <div className="flex items-center justify-around px-3 py-2 max-w-md mx-auto">

          {/* Phone / Contact */}
          <button
            onClick={() => setContactOpen(true)}
            disabled={!hasWhatsApp}
            aria-label={card.language === "ms" ? "Hubungi" : "Contact"}
            className="flex items-center justify-center w-10 h-10 transition-all active:scale-90"
            style={{ opacity: hasWhatsApp ? 0.85 : 0.3 }}
          >
            <Phone
              className="w-5 h-5"
              style={{ color: primaryColor, strokeWidth: 1.5 }}
            />
          </button>

          {/* Music play/pause */}
          <button
            onClick={hasMusicPlayer ? onMusicToggle : undefined}
            disabled={!hasMusicPlayer}
            aria-label={isMusicMuted ? "Play music" : "Pause music"}
            className="flex items-center justify-center w-10 h-10 transition-all active:scale-90"
            style={{ opacity: hasMusicPlayer ? 0.85 : 0.3 }}
          >
            {isMusicMuted ? (
              <CirclePlay
                className="w-5 h-5"
                style={{ color: primaryColor, strokeWidth: 1.5 }}
              />
            ) : (
              <CirclePause
                className="w-5 h-5"
                style={{ color: primaryColor, strokeWidth: 1.5 }}
              />
            )}
          </button>

          {/* Location / Map */}
          <button
            onClick={handleMapClick}
            disabled={!hasMap}
            aria-label={card.language === "ms" ? "Lokasi" : "Location"}
            className="flex items-center justify-center w-10 h-10 transition-all active:scale-90"
            style={{ opacity: hasMap ? 0.85 : 0.3 }}
          >
            <MapPin
              className="w-5 h-5"
              style={{ color: primaryColor, strokeWidth: 1.5 }}
            />
          </button>

          {/* Gift — only shown when wishlist items or bank details are available */}
          {hasGiftContent && (
            <button
              onClick={() => { onAnalytic?.("GIFT_CLICK"); setGiftOpen(true) }}
              aria-label={card.language === "ms" ? "Hadiah" : "Gift"}
              className="flex items-center justify-center w-10 h-10 transition-all active:scale-90"
              style={{ opacity: 0.85 }}
            >
              <Gift
                className="w-5 h-5"
                style={{ color: primaryColor, strokeWidth: 1.5 }}
              />
            </button>
          )}

          {/* RSVP — only shown when attendance segment and RSVP mode are enabled */}
          {hasRsvp && (
            <button
              onClick={() => { onRsvpOpen?.() }}
              aria-label="RSVP"
              className="flex items-center justify-center w-10 h-10 transition-all active:scale-90"
              style={{ opacity: 0.85 }}
            >
              <div className="relative">
                <Mail
                  className="w-5 h-5"
                  style={{ color: primaryColor, strokeWidth: 1.5 }}
                />
                <Heart
                  className="absolute -top-1 -right-1 w-3 h-3"
                  style={{ color: primaryColor, fill: primaryColor }}
                />
              </div>
            </button>
          )}

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
    </>
  )
}
