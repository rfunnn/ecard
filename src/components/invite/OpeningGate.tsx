"use client"

import { useState, useCallback, useRef, MutableRefObject } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  style: string
  color: string
  onOpen: () => void
  displayName?: string
  eventType?: string
  eventDate?: string
}

interface StyleProps {
  color: string
  opening: boolean
  openingRef: MutableRefObject<boolean>
  onOpen: () => void
  tap: () => void
  displayName?: string
  eventType?: string
  eventDate?: string
}

const DUR = 0.72
const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

function textOn(hex: string): string {
  const h = (hex.replace("#", "") + "000000").slice(0, 6)
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return (r * 299 + g * 587 + b * 114) / 1000 > 130 ? "#111111" : "#f5f5f5"
}

function getLum(hex: string): number {
  const h = (hex.replace("#", "") + "000000").slice(0, 6)
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return (r * 299 + g * 587 + b * 114) / 1000
}

// ── Shared: Circular wax-seal badge ─────────────────────────────────────────

function SealBadge({ displayName, visible }: { displayName?: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="seal"
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1.5"
            style={{
              background: "rgba(255,255,255,0.93)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
              border: "1px solid rgba(196,130,154,0.18)",
            }}
          >
            {displayName ? (
              <span
                className="text-center leading-tight px-2"
                style={{
                  fontFamily: "'Dancing Script','Brush Script MT',cursive",
                  fontSize: "clamp(13px,4vw,19px)",
                  color: "#c4829a",
                  maxWidth: 106,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {displayName}
              </span>
            ) : (
              <span style={{ fontSize: 22, color: "#c4829a", opacity: 0.4 }}>✦</span>
            )}
            <span className="text-[9px] tracking-[0.38em] uppercase" style={{ color: "#b0a0a0" }}>
              BUKA
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Shared: Ribbon bow SVG ───────────────────────────────────────────────────

function BowSvg({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      style={{ width: 148, height: 89, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.14))" }}
    >
      <ellipse cx="68" cy="52" rx="58" ry="36" fill={color} opacity="0.92" />
      <ellipse cx="68" cy="46" rx="40" ry="22" fill="white" opacity="0.22" />
      <ellipse cx="132" cy="52" rx="58" ry="36" fill={color} opacity="0.92" />
      <ellipse cx="132" cy="46" rx="40" ry="22" fill="white" opacity="0.22" />
      <path d="M 90 68 Q 65 100 48 112 Q 62 93 80 75" fill={color} opacity="0.87" />
      <path d="M 110 68 Q 135 100 152 112 Q 138 93 120 75" fill={color} opacity="0.87" />
      <ellipse cx="100" cy="56" rx="16" ry="12" fill={color} />
      <ellipse cx="100" cy="52" rx="10" ry="7" fill="white" opacity="0.32" />
    </svg>
  )
}

// ── Tingkap A: Clean left-right split with seal ──────────────────────────────

function TingkapA({ color, opening, openingRef, onOpen, tap, displayName }: StyleProps) {
  return (
    <div className="absolute inset-0 z-40 cursor-pointer select-none" onClick={tap}>
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{ background: color, boxShadow: "2px 0 12px rgba(0,0,0,0.07)" }}
        animate={{ x: opening ? "-100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
        onAnimationComplete={() => { if (openingRef.current) onOpen() }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{ background: color }}
        animate={{ x: opening ? "100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
      />
      <SealBadge displayName={displayName} visible={!opening} />
    </div>
  )
}

// ── Tingkap B: Decorative panels + arch window + bow ────────────────────────

function TingkapB({ color, opening, openingRef, onOpen, tap, displayName }: StyleProps) {
  const lum = getLum(color)
  const bowColor = lum > 200 ? "#e8a0b4" : color
  return (
    <div className="absolute inset-0 z-40 cursor-pointer select-none" onClick={tap}>
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{ background: color, boxShadow: "2px 0 8px rgba(0,0,0,0.05)" }}
        animate={{ x: opening ? "-100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
        onAnimationComplete={() => { if (openingRef.current) onOpen() }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{ background: color }}
        animate={{ x: opening ? "100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
      />

      {/* Arch window overlay */}
      <AnimatePresence>
        {!opening && (
          <motion.div
            key="arch"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute z-10 pointer-events-none"
            style={{
              left: "14%", right: "14%",
              top: "7%", bottom: "10%",
              background: "rgba(255,255,255,0.18)",
              borderRadius: "50% 50% 8px 8px / 28% 28% 8px 8px",
              border: "1px solid rgba(255,255,255,0.40)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Bow */}
      <AnimatePresence>
        {!opening && (
          <motion.div
            key="bow"
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.18 }}
            className="absolute top-2 left-0 right-0 flex justify-center z-30 pointer-events-none"
          >
            <BowSvg color={bowColor} />
          </motion.div>
        )}
      </AnimatePresence>

      <SealBadge displayName={displayName} visible={!opening} />
    </div>
  )
}

// ── Tingkap C: Frosted-glass panels + bow ───────────────────────────────────

function TingkapC({ color, opening, openingRef, onOpen, tap, displayName }: StyleProps) {
  const lum = getLum(color)
  const bowColor = lum > 200 ? "#e8a0b4" : color
  const h = (color.replace("#", "") + "000000").slice(0, 6)
  const r = parseInt(h.slice(0, 2), 16) || 240
  const g = parseInt(h.slice(2, 4), 16) || 240
  const b = parseInt(h.slice(4, 6), 16) || 240
  const glass = `rgba(${r},${g},${b},0.52)`

  return (
    <div className="absolute inset-0 z-40 cursor-pointer select-none" onClick={tap}>
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{
          background: glass,
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
        animate={{ x: opening ? "-100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
        onAnimationComplete={() => { if (openingRef.current) onOpen() }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background: glass,
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
        animate={{ x: opening ? "100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
      />

      {/* Arch frame */}
      <AnimatePresence>
        {!opening && (
          <motion.div
            key="arch"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute z-10 pointer-events-none"
            style={{
              left: "14%", right: "14%",
              top: "7%", bottom: "10%",
              borderRadius: "50% 50% 8px 8px / 28% 28% 8px 8px",
              border: "1px solid rgba(255,255,255,0.45)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Bow */}
      <AnimatePresence>
        {!opening && (
          <motion.div
            key="bow"
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.18 }}
            className="absolute top-2 left-0 right-0 flex justify-center z-30 pointer-events-none"
          >
            <BowSvg color={bowColor} />
          </motion.div>
        )}
      </AnimatePresence>

      <SealBadge displayName={displayName} visible={!opening} />
    </div>
  )
}

// ── Sampul A: Envelope with fold lines and opening flap ──────────────────────

function SampulA({ color, opening, openingRef, onOpen, tap, displayName }: StyleProps) {
  return (
    <div
      className="absolute inset-0 z-40 cursor-pointer select-none"
      style={{ perspective: "1200px" }}
      onClick={tap}
    >
      {/* Envelope body — slides down after flap opens */}
      <motion.div
        className="absolute inset-0"
        style={{ background: color }}
        animate={{ y: opening ? "100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE, delay: opening ? 0.28 : 0 }}
        onAnimationComplete={() => { if (openingRef.current) onOpen() }}
      >
        {/* Diagonal fold lines creating envelope X pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to bottom right, transparent 49.7%, rgba(0,0,0,0.055) 49.7%, rgba(0,0,0,0.055) 50.3%, transparent 50.3%),
              linear-gradient(to bottom left,  transparent 49.7%, rgba(0,0,0,0.055) 49.7%, rgba(0,0,0,0.055) 50.3%, transparent 50.3%)
            `,
          }}
        />
        {/* Bottom shadow */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "45%",
            background: "linear-gradient(to top, rgba(0,0,0,0.04) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      {/* Top flap triangle — folds open before body slides */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          height: "50%",
          transformOrigin: "top center",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          background: color,
          filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.08))",
        }}
        animate={{ rotateX: opening ? -140 : 0 }}
        transition={{ duration: DUR * 0.85, ease: EASE }}
      />

      <SealBadge displayName={displayName} visible={!opening} />
    </div>
  )
}

// ── Menaik: Full invitation cover that rises to reveal card ──────────────────

function Menaik({ color, opening, openingRef, onOpen, tap, displayName, eventType, eventDate }: StyleProps) {
  const tc = textOn(color)
  const lum = getLum(color)
  const accent = lum > 150 ? "#c4829a" : lum < 80 ? "#f0d0d8" : tc

  return (
    <motion.div
      className="absolute inset-0 z-40 cursor-pointer select-none flex flex-col overflow-hidden"
      style={{ background: color }}
      animate={{ y: opening ? "-100%" : "0%" }}
      transition={{ duration: DUR + 0.1, ease: EASE }}
      onClick={tap}
      onAnimationComplete={() => { if (openingRef.current) onOpen() }}
    >
      {/* Bow */}
      <div className="flex justify-center pt-4 pointer-events-none">
        <BowSvg color={accent} />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 gap-3 relative">
        {/* Arch border frame */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "8%", right: "8%",
            top: "-8%", bottom: "8%",
            borderRadius: "50% 50% 6px 6px / 22% 22% 6px 6px",
            border: `1px solid ${accent}38`,
          }}
        />

        {eventType && (
          <p
            className="text-[11px] tracking-[0.22em] uppercase z-10"
            style={{ color: `${tc}72` }}
          >
            {eventType}
          </p>
        )}

        {displayName ? (
          <p
            className="text-4xl text-center z-10 leading-snug"
            style={{ fontFamily: "'Dancing Script','Brush Script MT',cursive", color: accent }}
          >
            {displayName}
          </p>
        ) : (
          <p className="text-sm tracking-widest uppercase z-10" style={{ color: `${tc}50` }}>
            Kad Jemputan
          </p>
        )}

        {eventDate && (
          <p className="text-[11px] tracking-widest z-10" style={{ color: `${tc}62` }}>
            {eventDate}
          </p>
        )}
      </div>

      {/* BUKA button */}
      <div className="flex justify-center pb-10 z-10">
        <div
          className="px-7 py-1.5 rounded text-[10px] tracking-[0.3em] uppercase"
          style={{ border: `1px solid ${tc}38`, color: `${tc}80` }}
        >
          BUKA
        </div>
      </div>
    </motion.div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export function OpeningGate({ style, color, onOpen, displayName, eventType, eventDate }: Props) {
  const [opening, setOpening] = useState(false)
  const openingRef = useRef(false)
  openingRef.current = opening

  const tap = useCallback(() => { if (!opening) setOpening(true) }, [opening])

  const sp: StyleProps = { color, opening, openingRef, onOpen, tap, displayName, eventType, eventDate }

  switch (style) {
    case "Tingkap A": return <TingkapA {...sp} />
    case "Tingkap B": return <TingkapB {...sp} />
    case "Tingkap C": return <TingkapC {...sp} />
    case "Sampul A":  return <SampulA  {...sp} />
    case "Menaik":    return <Menaik   {...sp} />
    default:          return <TingkapA {...sp} />
  }
}
