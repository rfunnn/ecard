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
        <div className="w-8 h-8 rounded-lg border border-[var(--bd)] bg-white flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={partner.logo}
            alt={partner.companyName}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-0.5"
          />
        </div>
        <span className="text-[13px] font-semibold whitespace-nowrap text-white/80">
          {partner.companyName}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-[12px] font-black text-white">
        {partner.companyName[0]?.toUpperCase()}
      </div>
      <span className="text-[13px] font-semibold whitespace-nowrap text-white/80">
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
        className="relative overflow-hidden"
        style={{ background: "#141414" }}
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #141414, transparent)" }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #141414, transparent)" }}
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
                <span className="ml-6 shrink-0 text-[8px] text-white/25" aria-hidden>◆</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
