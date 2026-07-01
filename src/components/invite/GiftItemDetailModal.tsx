"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Copy, Check, ExternalLink } from "lucide-react"
import type { InvitationCardData, GiftItem } from "@/types/invitation"
import type { WizardConfig } from "@/types/config"
import { buildWhatsAppUrl } from "@/lib/utils"

interface GiftItemDetailModalProps {
  item: GiftItem | null
  onClose: () => void
  card: InvitationCardData
  onAnalytic?: (event: string) => void
  contained?: boolean
}

export function GiftItemDetailModal({ item, onClose, card, onAnalytic, contained }: GiftItemDetailModalProps) {
  const lang = card.language === "ms"
  const { primaryColor, bgColor } = card.theme
  const cfg = card.wizardConfig as WizardConfig | undefined

  const bgImage = card.template.image2Url || card.template.image1Url || card.theme.bgImageUrl

  const deliveryAddress = cfg?.deliveryAddress || ""
  const hasDelivery = !!(card.contactName || card.whatsappNumber || deliveryAddress)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [nameErr, setNameErr] = useState(false)
  const [phoneErr, setPhoneErr] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopyAddress() {
    const text = [card.contactName, card.whatsappNumber, deliveryAddress].filter(Boolean).join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleBook() {
    const n = name.trim()
    const p = phone.trim()
    setNameErr(!n)
    setPhoneErr(!p)
    if (!n || !p) return

    onAnalytic?.("GIFT_CLICK")
    const itemLabel = item?.label ?? (lang ? "Hadiah" : "Gift")
    const msg = lang
      ? `Assalamualaikum! Saya ingin menempah hadiah untuk majlis anda.\n\nHadiah: ${itemLabel}\nNama: ${n}\nNo. Telefon: ${p}\n\nTerima kasih!`
      : `Hello! I would like to book a gift for your event.\n\nGift: ${itemLabel}\nName: ${n}\nPhone: ${p}\n\nThank you!`

    if (card.whatsappNumber) {
      window.open(buildWhatsAppUrl(card.whatsappNumber, msg), "_blank", "noopener,noreferrer")
    }
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="detail"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className={`${contained ? "absolute" : "fixed"} bottom-0 left-0 right-0 z-62 flex justify-center`}
        >
          <div
            className="relative w-full max-w-md flex flex-col overflow-hidden"
            style={{ height: contained ? "calc(100% - 56px)" : "calc(100svh - 56px)", background: bgColor }}
          >
            {/* decorative top */}
            {bgImage && (
              <div
                className="absolute top-0 left-0 right-0 h-28 z-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  opacity: 0.6,
                }}
              />
            )}

            {/* back button */}
            <div className="relative z-10 pt-4 px-4">
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black/10 transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
            </div>

            {/* scrollable body */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: "none" }}>
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>

              {/* title */}
              <p
                className="text-center text-sm font-bold tracking-[0.25em] mt-2 mb-5"
                style={{ color: primaryColor }}
              >
                {lang ? "TEMPAH HADIAH" : "BOOK GIFT"}
              </p>

              {/* product image */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-44 h-44 rounded-2xl overflow-hidden"
                  style={{ border: `1.5px solid ${primaryColor}30` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.label ?? "gift"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* product name */}
              <p
                className="text-center text-base font-bold mb-3"
                style={{ color: primaryColor }}
              >
                {item.label ?? (lang ? "Hadiah" : "Gift")}
              </p>

              {/* product link button */}
              {item.link && (
                <div className="flex justify-center mb-5">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95"
                    style={{ border: `1px solid ${primaryColor}`, color: primaryColor }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {lang ? "Pautan Produk" : "Product Link"}
                  </a>
                </div>
              )}

              {/* booking note */}
              <p
                className="text-center text-xs leading-relaxed mb-5 px-2"
                style={{ color: `${primaryColor}99` }}
              >
                {lang
                  ? "Sila buat tempahan hadiah bagi mengelakkan penerimaan hadiah yang berulang."
                  : "Please book your gift to avoid duplicate gifts being received."}
              </p>

              {/* delivery address */}
              {hasDelivery && (
                <div className="mb-5">
                  <p className="text-xs mb-2" style={{ color: `${primaryColor}99` }}>
                    {lang ? "Untuk pengeposaan boleh dihantar ke:" : "For delivery, please send to:"}
                  </p>
                  <div
                    className="relative rounded-xl px-4 py-3 pr-12"
                    style={{ border: `1px solid ${primaryColor}30`, background: `${primaryColor}08` }}
                  >
                    <div className="text-center space-y-0.5">
                      {card.contactName && (
                        <p className="text-sm font-medium" style={{ color: primaryColor }}>
                          {card.contactName}
                        </p>
                      )}
                      {card.whatsappNumber && (
                        <p className="text-xs" style={{ color: `${primaryColor}aa` }}>
                          {card.whatsappNumber}
                        </p>
                      )}
                      {deliveryAddress && (
                        <p className="text-xs leading-relaxed mt-1" style={{ color: `${primaryColor}aa` }}>
                          {deliveryAddress}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full transition-all active:scale-90"
                      style={{ color: primaryColor }}
                      aria-label="Copy address"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* form */}
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameErr(false) }}
                  placeholder={lang ? "Nama Penuh" : "Full Name"}
                  className="w-full px-4 py-3 rounded-full text-sm outline-none transition-all"
                  style={{
                    border: `1px solid ${nameErr ? "#ef4444" : `${primaryColor}40`}`,
                    background: "transparent",
                    color: primaryColor,
                  }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneErr(false) }}
                  placeholder={lang ? "Nombor Telefon" : "Phone Number"}
                  className="w-full px-4 py-3 rounded-full text-sm outline-none transition-all"
                  style={{
                    border: `1px solid ${phoneErr ? "#ef4444" : `${primaryColor}40`}`,
                    background: "transparent",
                    color: primaryColor,
                  }}
                />
              </div>

              {/* action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-90 shrink-0"
                  style={{ border: `1px solid ${primaryColor}40`, color: primaryColor }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleBook}
                  className="flex-1 py-3 rounded-full text-sm font-bold tracking-wide transition-all active:scale-95"
                  style={{ background: primaryColor, color: bgColor }}
                >
                  {lang ? "Tempah Sekarang" : "Book Now"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
