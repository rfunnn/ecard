"use client"

import { useState } from "react"
import { Landmark, CreditCard, ChevronDown } from "lucide-react"
import { FPX_BANKS } from "@/lib/payment-methods"

// Informational payment-methods panel for the checkout page. The actual bank /
// card selection happens on ToyyibPay's hosted page after redirect; this just
// reassures the payer which methods and FPX banks are accepted.
export function PaymentMethods() {
  const [showBanks, setShowBanks] = useState(false)

  return (
    <div className="rounded-xl border border-[var(--bd)] bg-[var(--pg-alt)] px-5 py-4">
      <p className="text-[10px] font-bold text-[var(--tx-3)] uppercase tracking-widest mb-3">
        Kaedah Pembayaran
      </p>

      <div className="space-y-2">
        {/* FPX */}
        <div className="rounded-lg border border-[var(--bd)] p-3">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-gold shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--tx-1)]">Perbankan Internet (FPX)</p>
              <p className="text-[11px] text-[var(--tx-3)]">Bayar terus dari akaun bank anda</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBanks((v) => !v)}
            className="mt-2 flex items-center gap-1 text-[11px] text-gold hover:text-gold/80 transition-colors"
            aria-expanded={showBanks}
          >
            {showBanks ? "Sembunyikan" : `Lihat ${FPX_BANKS.length} bank disokong`}
            <ChevronDown className={`w-3 h-3 transition-transform ${showBanks ? "rotate-180" : ""}`} />
          </button>

          {showBanks && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {FPX_BANKS.map((bank) => (
                <span
                  key={bank}
                  className="text-[10px] text-[var(--tx-2)] bg-[var(--pg)] border border-[var(--bd)] rounded-full px-2 py-0.5"
                >
                  {bank}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Credit / Debit Card */}
        <div className="rounded-lg border border-[var(--bd)] p-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gold shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--tx-1)]">Kad Kredit / Debit</p>
            <p className="text-[11px] text-[var(--tx-3)]">Visa &amp; Mastercard</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-[var(--tx-3)] leading-relaxed">
        Pilih bank atau masukkan butiran kad anda di halaman pembayaran ToyyibPay yang selamat.
      </p>
    </div>
  )
}
