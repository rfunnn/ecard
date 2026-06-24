"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Phone } from "lucide-react"
import type { InvitationCardData } from "@/types/invitation"
import { buildWhatsAppUrl } from "@/lib/utils"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  card: InvitationCardData
  onAnalytic?: (event: string) => void
}

export function ContactModal({ isOpen, onClose, card, onAnalytic }: ContactModalProps) {
  const { primaryColor, bgColor } = card.theme
  const label = card.language === "ms" ? "HUBUNGI" : "CONTACT"

  const handleWhatsApp = () => {
    onAnalytic?.("WHATSAPP_CLICK")
    if (card.whatsappNumber) {
      const msg =
        card.language === "ms"
          ? `Assalamualaikum ${card.contactName ?? ""}, saya ingin bertanya tentang ${card.title}.`
          : `Hello ${card.contactName ?? ""}, I would like to enquire about ${card.title}.`
      window.open(buildWhatsAppUrl(card.whatsappNumber, msg), "_blank", "noopener,noreferrer")
    }
  }

  const handleCall = () => {
    onAnalytic?.("CALL_CLICK")
    if (card.whatsappNumber) {
      window.open(`tel:${card.whatsappNumber}`, "_self")
    }
  }

  if (!card.whatsappNumber) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
            onClick={onClose}
          />

          {/* bottom sheet card */}
          <motion.div
            key="card"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-16 left-0 right-0 z-[61] flex justify-center px-4"
          >
            <div
              className="w-full max-w-md rounded-2xl px-6 py-5 shadow-2xl"
              style={{ background: bgColor, border: `1px solid ${primaryColor}25` }}
            >
              {/* title */}
              <p
                className="text-center text-xs font-bold tracking-[0.2em] mb-4"
                style={{ color: primaryColor }}
              >
                {label}
              </p>

              {/* contact row */}
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-medium"
                  style={{ color: primaryColor }}
                >
                  {card.contactName || card.whatsappNumber}
                </span>

                <div className="flex items-center gap-3">
                  {/* WhatsApp button */}
                  <button
                    onClick={handleWhatsApp}
                    aria-label="WhatsApp"
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-90"
                    style={{ border: `1.5px solid ${primaryColor}40` }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                        fill={primaryColor}
                      />
                    </svg>
                  </button>

                  {/* Phone call button */}
                  <button
                    onClick={handleCall}
                    aria-label="Call"
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-90"
                    style={{ border: `1.5px solid ${primaryColor}40` }}
                  >
                    <Phone
                      className="w-5 h-5"
                      style={{ color: primaryColor, strokeWidth: 1.5 }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
