"use client"

import { useEffect, useState, useRef } from "react"

interface Partner {
  id: string
  companyName: string
  logo: string | null
  slug: string
}

function Logo({ partner }: { partner: Partner }) {
  const [imgError, setImgError] = useState(false)

  if (partner.logo && !imgError) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg border border-[#FFCC00]/30 bg-[#FFCC00]/05 flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={partner.logo}
            alt={partner.companyName}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-0.5"
          />
        </div>
        <span className="text-[13px] font-semibold whitespace-nowrap text-[var(--tx-1)]">
          {partner.companyName}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#FFCC00]/10 border border-[#FFCC00]/25 flex items-center justify-center shrink-0 text-[12px] font-black text-[var(--tx-1)]">
        {partner.companyName[0]?.toUpperCase()}
      </div>
      <span className="text-[13px] font-semibold whitespace-nowrap text-[var(--tx-1)]">
        {partner.companyName}
      </span>
    </div>
  )
}

export function PartnerLogosMarquee() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/partner-logos")
      .then((r) => r.json())
      .then((data: { partners?: Partner[] }) => setPartners(data.partners ?? []))
      .catch(() => {})
  }, [])

  if (partners.length === 0) return null

  const items = [...partners, ...partners, ...partners]
  const duration = Math.max(18, partners.length * 4)

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .marquee-track {
          animation: marquee-scroll ${duration}s linear infinite;
        }
        .marquee-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="relative overflow-hidden border-y border-[#FFCC00]/25 bg-[var(--pg-alt)]"
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--pg-alt), transparent)" }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, var(--pg-alt), transparent)" }}
        />

        <div className="py-3.5 overflow-hidden">
          <div
            ref={trackRef}
            className={`marquee-track flex items-center${paused ? " paused" : ""}`}
            style={{ width: "max-content" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {items.map((p, i) => (
              <div key={`${p.id}-${i}`} className="flex items-center" style={{ paddingLeft: 28, paddingRight: 28 }}>
                <Logo partner={p} />
                {/* Diamond separator */}
                <span className="ml-6 shrink-0 text-[8px] text-[#FFCC00]/60" aria-hidden>◆</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
