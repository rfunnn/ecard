"use client"

import { useState, useCallback, useRef, useEffect, MutableRefObject } from "react"
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

// ── Tingkap B: Same as Tingkap A with 30% transparent panels ────────────────

function TingkapB({ color, opening, openingRef, onOpen, tap, displayName }: StyleProps) {
  const h = (color.replace("#", "") + "000000").slice(0, 6)
  const r = parseInt(h.slice(0, 2), 16) || 240
  const g = parseInt(h.slice(2, 4), 16) || 240
  const b = parseInt(h.slice(4, 6), 16) || 240
  const panel = `rgba(${r},${g},${b},0.70)`

  return (
    <div className="absolute inset-0 z-40 cursor-pointer select-none" onClick={tap}>
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{ background: panel, boxShadow: "2px 0 12px rgba(0,0,0,0.07)" }}
        animate={{ x: opening ? "-100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
        onAnimationComplete={() => { if (openingRef.current) onOpen() }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{ background: panel }}
        animate={{ x: opening ? "100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
      />
      <SealBadge displayName={displayName} visible={!opening} />
    </div>
  )
}

// ── Tingkap C: 4-corner frosted glass panels ─────────────────────────────────

function TingkapC({ color, opening, openingRef, onOpen, tap, displayName }: StyleProps) {
  const h = (color.replace("#", "") + "000000").slice(0, 6)
  const r = parseInt(h.slice(0, 2), 16) || 240
  const g = parseInt(h.slice(2, 4), 16) || 240
  const b = parseInt(h.slice(4, 6), 16) || 240
  const glass = `rgba(${r},${g},${b},0.62)`
  const panel = {
    background: glass,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  }

  return (
    <div className="absolute inset-0 z-40 cursor-pointer select-none" onClick={tap}>
      {/* Top-left */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-1/2"
        style={panel}
        animate={{ x: opening ? "-100%" : "0%", y: opening ? "-100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
        onAnimationComplete={() => { if (openingRef.current) onOpen() }}
      />
      {/* Top-right */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-1/2"
        style={panel}
        animate={{ x: opening ? "100%" : "0%", y: opening ? "-100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
      />
      {/* Bottom-left */}
      <motion.div
        className="absolute bottom-0 left-0 w-1/2 h-1/2"
        style={panel}
        animate={{ x: opening ? "-100%" : "0%", y: opening ? "100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
      />
      {/* Bottom-right */}
      <motion.div
        className="absolute bottom-0 right-0 w-1/2 h-1/2"
        style={panel}
        animate={{ x: opening ? "100%" : "0%", y: opening ? "100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
      />
      <SealBadge displayName={displayName} visible={!opening} />
    </div>
  )
}

// ── Sampul A: Envelope-style left-right doors with diamond fold lines ─────────

function SampulA({ color, opening, openingRef, onOpen, tap, displayName }: StyleProps) {
  const tc = textOn(color)

  return (
    <div className="absolute inset-0 z-40 cursor-pointer select-none" onClick={tap}>
      {/* Left envelope door */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
        style={{ background: color, boxShadow: "2px 0 12px rgba(0,0,0,0.08)" }}
        animate={{ x: opening ? "-100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
        onAnimationComplete={() => { if (openingRef.current) onOpen() }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Top-right and bottom-right triangles (envelope flap shading) */}
          <polygon points="0,0 100,0 100,50"   fill={tc} fillOpacity="0.05" />
          <polygon points="0,100 100,100 100,50" fill={tc} fillOpacity="0.03" />
          {/* Fold lines from top-left and bottom-left converging to right-center */}
          <line x1="0" y1="0"   x2="100" y2="50" stroke={tc} strokeOpacity="0.18" strokeWidth="0.6" />
          <line x1="0" y1="100" x2="100" y2="50" stroke={tc} strokeOpacity="0.18" strokeWidth="0.6" />
        </svg>
      </motion.div>

      {/* Right envelope door */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
        style={{ background: color }}
        animate={{ x: opening ? "100%" : "0%" }}
        transition={{ duration: DUR, ease: EASE }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Top-left and bottom-left triangles (mirrored flap shading) */}
          <polygon points="100,0 0,0 0,50"     fill={tc} fillOpacity="0.05" />
          <polygon points="100,100 0,100 0,50" fill={tc} fillOpacity="0.03" />
          {/* Fold lines from top-right and bottom-right converging to left-center */}
          <line x1="100" y1="0"   x2="0" y2="50" stroke={tc} strokeOpacity="0.18" strokeWidth="0.6" />
          <line x1="100" y1="100" x2="0" y2="50" stroke={tc} strokeOpacity="0.18" strokeWidth="0.6" />
        </svg>
      </motion.div>

      <SealBadge displayName={displayName} visible={!opening} />
    </div>
  )
}

// ── Menaik: Full invitation cover that rises to reveal card ──────────────────

function Menaik({ color, opening, openingRef, onOpen, tap, displayName, eventType, eventDate }: StyleProps) {
  const tc = textOn(color)

  return (
    <motion.div
      className="absolute inset-0 z-40 cursor-pointer select-none flex flex-col overflow-hidden"
      style={{ background: color }}
      animate={{ y: opening ? "-100%" : "0%" }}
      transition={{ duration: DUR + 0.1, ease: EASE }}
      onClick={tap}
      onAnimationComplete={() => { if (openingRef.current) onOpen() }}
    >
      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-2 relative overflow-hidden">
        {/* Arch border frame */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "8%", right: "8%",
            top: "4%", bottom: "4%",
            borderRadius: "50% 50% 6px 6px / 22% 22% 6px 6px",
            border: `1px solid ${tc}38`,
          }}
        />

        {eventType && (
          <p
            className="text-[10px] tracking-[0.22em] uppercase z-10"
            style={{ color: `${tc}72` }}
          >
            {eventType}
          </p>
        )}

        {displayName ? (
          <p
            className="text-2xl text-center z-10 leading-snug"
            style={{ fontFamily: "'Dancing Script','Brush Script MT',cursive", color: tc }}
          >
            {displayName}
          </p>
        ) : (
          <p className="text-sm tracking-widest uppercase z-10" style={{ color: `${tc}50` }}>
            Kad Jemputan
          </p>
        )}

        {eventDate && (
          <p className="text-[10px] tracking-widest z-10" style={{ color: `${tc}62` }}>
            {eventDate}
          </p>
        )}
      </div>

      {/* BUKA button */}
      <div className="flex justify-center pb-6 z-10">
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
  useEffect(() => { openingRef.current = opening }, [opening])

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
