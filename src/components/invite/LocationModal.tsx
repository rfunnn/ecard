"use client"

import type { InvitationCardData } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { InviteBottomSheet } from "./InviteBottomSheet"

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  card: InvitationCardData
  onAnalytic?: (event: string) => void
  contained?: boolean
}

const GOOGLE_MAPS_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const WAZE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="11" r="9" fill="#33CCFF"/>
    <path d="M12 4C8.13 4 5 7.13 5 11c0 2.38 1.19 4.47 3 5.74V18a1 1 0 001 1h6a1 1 0 001-1v-1.26C17.81 15.47 19 13.38 19 11c0-3.87-3.13-7-7-7z" fill="#33CCFF"/>
    <circle cx="9.5" cy="10.5" r="1.5" fill="#1a1a2e"/>
    <circle cx="14.5" cy="10.5" r="1.5" fill="#1a1a2e"/>
    <path d="M9.5 14c.83 1 4.17 1 5 0" stroke="#1a1a2e" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="16" cy="7" r="1.5" fill="#FF6633"/>
  </svg>
)

export function LocationModal({ isOpen, onClose, card, onAnalytic, contained }: LocationModalProps) {
  const wizardConfig = card.wizardConfig as WizardConfig | undefined
  const { primaryColor: _primaryColor, bgColor } = card.theme
  const primaryColor = wizardConfig?.footerIconColor || _primaryColor

  const mapsUrl = wizardConfig?.googleMapsUrl || card.venueMapUrl || ""
  const wazeUrl = wizardConfig?.wazeUrl || ""
  const hasMaps = !!(mapsUrl || card.venueAddress)
  const hasWaze = !!wazeUrl

  const heading = card.language === "ms" ? "LOKASI" : "LOCATION"

  if (!hasMaps && !hasWaze) return null

  function openMaps() {
    onAnalytic?.("MAP_CLICK")
    const url = mapsUrl || (card.venueAddress
      ? `https://maps.google.com/?q=${encodeURIComponent(card.venueAddress)}`
      : "")
    if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

  function openWaze() {
    onAnalytic?.("WAZE_CLICK")
    if (wazeUrl) window.open(wazeUrl, "_blank", "noopener,noreferrer")
  }

  const navButtonStyle: React.CSSProperties = {
    border: `1.5px solid ${primaryColor}`,
    color: primaryColor,
    background: "transparent",
  }

  return (
    <InviteBottomSheet isOpen={isOpen} onClose={onClose} contained={contained}>
      <div
        className="w-full max-w-md rounded-2xl px-6 py-5 shadow-2xl"
        style={{ background: bgColor, border: `1px solid ${primaryColor}25` }}
      >
        <p className="text-center text-xs font-bold tracking-[0.2em] mb-3" style={{ color: primaryColor }}>
          {heading}
        </p>

        {card.venueName && (
          <p className="text-center font-semibold text-sm mb-1 uppercase tracking-wide" style={{ color: primaryColor }}>
            {card.venueName}
          </p>
        )}

        {card.venueAddress && (
          <p className="text-center text-xs leading-relaxed mb-5" style={{ color: `${primaryColor}bb` }}>
            {card.venueAddress}
          </p>
        )}

        <div className={`flex gap-3 ${hasMaps && hasWaze ? "" : "justify-center"}`}>
          {hasMaps && (
            <button
              onClick={openMaps}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
              style={navButtonStyle}
            >
              {GOOGLE_MAPS_ICON}
              Maps
            </button>
          )}
          {hasWaze && (
            <button
              onClick={openWaze}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
              style={navButtonStyle}
            >
              {WAZE_ICON}
              Waze
            </button>
          )}
        </div>
      </div>
    </InviteBottomSheet>
  )
}
