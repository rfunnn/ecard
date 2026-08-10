"use client"

import { useState, useEffect } from "react"
import { Copy, ExternalLink, QrCode, Check } from "lucide-react"
import QRCode from "qrcode"

interface Props {
  partnerUrl: string
  partnerRate: number
}

export function PartnerDashboardClient({ partnerUrl, partnerRate }: Props) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState("")

  const fullUrl = `https://${partnerUrl}`
  const rateDisplay = `RM${(partnerRate / 100).toFixed(2)} / kad`

  useEffect(() => {
    QRCode.toDataURL(fullUrl, { width: 300, margin: 2, color: { dark: "#141414", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [fullUrl])

  function copyLink() {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--tx-1)] text-sm">URL Partner Anda</h2>
        <span className="text-[11px] text-[var(--tx-3)]">Kadar bil: <strong className="text-[var(--tx-1)]">{rateDisplay}</strong></span>
      </div>

      <div className="flex items-center gap-2 bg-[var(--pg)] border border-[var(--bd)] rounded-xl px-3.5 py-2.5">
        <span className="text-sm font-mono text-[var(--tx-1)] flex-1 truncate">{fullUrl}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-[var(--bd)] hover:border-gold/40 text-[var(--tx-1)] transition-all active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Disalin!" : "Salin Pautan"}
        </button>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-[var(--bd)] hover:border-gold/40 text-[var(--tx-1)] transition-all active:scale-95"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Buka Storefront
        </a>
      </div>

      {qrDataUrl && (
        <div>
          <p className="text-[11px] text-[var(--tx-3)] uppercase tracking-wide font-semibold mb-3 flex items-center gap-1.5">
            <QrCode className="w-3 h-3" /> Kod QR
          </p>
          <div className="inline-block p-3 bg-white rounded-xl border border-[var(--bd)]">
            <img src={qrDataUrl} alt={`QR code for ${fullUrl}`} className="w-36 h-36" />
          </div>
          <p className="text-[10px] text-[var(--tx-3)] mt-2">
            Kongsikan kod QR ini kepada pelanggan anda
          </p>
        </div>
      )}
    </div>
  )
}
