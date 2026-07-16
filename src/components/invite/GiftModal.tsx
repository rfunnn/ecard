"use client"

import { Copy, Check, ChevronRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import type { InvitationCardData, GiftItem } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { GiftItemDetailModal } from "./GiftItemDetailModal"

interface GiftModalProps {
  isOpen: boolean
  onClose: () => void
  card: InvitationCardData
  onAnalytic?: (event: string) => void
  contained?: boolean
}

export function GiftModal({ isOpen, onClose, card, onAnalytic, contained }: GiftModalProps) {
  const lang = card.language === "ms"
  const { primaryColor: _primaryColor, bgColor } = card.theme
  const items = card.giftItems ?? []
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GiftItem | null>(null)

  const wizardConfig = card.wizardConfig as WizardConfig | undefined
  const primaryColor = wizardConfig?.footerIconColor || _primaryColor
  const bgImage = card.template.image2Url || card.template.image1Url || card.theme.bgImageUrl

  const bankName          = wizardConfig?.bankName || ""
  const bankAccountName   = wizardConfig?.bankAccountName || card.contactName || ""
  const bankAccountNumber = wizardConfig?.bankAccountNumber || card.whatsappNumber || ""
  const bankQrUrl         = wizardConfig?.bankQrUrl || ""

  const hasBank = !!(bankAccountName || bankAccountNumber)

  function handleCopyAccount() {
    const text = [bankAccountName, bankAccountNumber].filter(Boolean).join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAccount(true)
      setTimeout(() => setCopiedAccount(false), 2000)
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className={`${contained ? "absolute" : "fixed"} inset-0 z-60 bg-black`}
            onClick={onClose}
          />

          {/* full-height panel */}
          <motion.div
            key="panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`${contained ? "absolute" : "fixed"} bottom-0 left-0 right-0 z-61 flex justify-center`}
            style={contained ? { height: "60%" } : undefined}
          >
            <div
              className="relative w-full max-w-md flex flex-col overflow-hidden shadow-2xl rounded-t-2xl"
              style={{
                height: contained ? "100%" : "calc(100svh - 56px)",
                background: bgColor,
              }}
            >
              {/* decorative top */}
              {bgImage && (
                <div
                  className="absolute top-0 left-0 right-0 h-24 z-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "top center",
                    opacity: 0.6,
                  }}
                />
              )}

              {/* decorative bottom */}
              {bgImage && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-20 z-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "bottom center",
                    opacity: 0.6,
                  }}
                />
              )}

              {/* close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/10"
              >
                <X className="w-4 h-4" style={{ color: primaryColor }} />
              </button>

              {/* title */}
              <div className="relative z-10 pt-10 pb-3 flex flex-col items-center">
                <p className="text-sm font-bold tracking-[0.3em]" style={{ color: primaryColor }}>
                  {lang ? "HADIAH" : "GIFT REGISTRY"}
                </p>
              </div>

              {/* bank / payment section */}
              {hasBank && (
                <div className="relative z-10 mx-4 mb-3 space-y-2">
                  {/* account row */}
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: `${bgColor}ee`, border: `1px solid ${primaryColor}20` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        {bankName && (
                          <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: `${primaryColor}88` }}>
                            {bankName}
                          </p>
                        )}
                        {bankAccountName && (
                          <p className="text-sm font-semibold truncate" style={{ color: primaryColor }}>
                            {bankAccountName}
                          </p>
                        )}
                        {bankAccountNumber && (
                          <p className="text-xs mt-0.5" style={{ color: `${primaryColor}aa` }}>
                            {bankAccountNumber}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* copy account number */}
                        <button
                          onClick={handleCopyAccount}
                          className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90"
                          style={{ color: primaryColor }}
                          aria-label="Copy"
                        >
                          {copiedAccount ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* QR button */}
                        {bankQrUrl && (
                          <button
                            onClick={() => setQrOpen(true)}
                            className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90"
                            style={{ border: `1px solid ${primaryColor}40`, color: primaryColor }}
                            aria-label="QR Code"
                          >
                            <QrIcon color={primaryColor} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* scrollable gift list */}
              <div className={`relative z-10 flex-1 overflow-y-auto px-4 ${contained ? "pb-4" : "pb-24"}`} style={{ scrollbarWidth: "thin" }}>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <p className="text-sm" style={{ color: `${primaryColor}60` }}>
                      {lang ? "Tiada item hadiah" : "No gift items"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl p-3"
                        style={{ background: `${bgColor}f0`, border: `1px solid ${primaryColor}15` }}
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt={item.label ?? "gift"} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          <p className="text-sm font-semibold leading-snug" style={{ color: primaryColor }}>
                            {item.label ?? (lang ? "Pautan Hadiah" : "Gift Link")}
                          </p>
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="flex items-center gap-1 self-start px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                            style={{ border: `1px solid ${primaryColor}`, color: primaryColor }}
                          >
                            {lang ? "Tempah Hadiah" : "Book Gift"}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* QR full-screen lightbox */}
          <AnimatePresence>
            {qrOpen && bankQrUrl && (
              <motion.div
                key="qr-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`${contained ? "absolute" : "fixed"} inset-0 z-70 flex flex-col items-center justify-center bg-black/80 px-8`}
                onClick={() => setQrOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.85 }}
                  className="relative rounded-2xl overflow-hidden bg-white p-4 shadow-2xl max-w-xs w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bankQrUrl} alt="QR Code" className="w-full h-auto object-contain" />
                  <p className="text-center text-xs text-gray-500 mt-2">{bankName || (lang ? "QR Pembayaran" : "Payment QR")}</p>
                  <button
                    onClick={() => setQrOpen(false)}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100"
                  >
                    <X className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* item detail */}
          <GiftItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            card={card}
            onAnalytic={onAnalytic}
            contained={contained}
          />
        </>
      )}
    </AnimatePresence>
  )
}

function QrIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h1v1h-1z M17 14h1v1h-1z M14 17h1v1h-1z M17 17h3v3h-3z M20 14h1v1h-1z" fill={color} stroke="none" />
    </svg>
  )
}
