import React, { useEffect, useState } from "react"
import type { WizardConfig } from "@/types/config"

export function wizardFont(name = "Default"): string {
  const map: Record<string, string> = {
    PlayfairScript: "font-playfair",
    Cormorant:      "font-cormorant",
    Spartan:        "font-lato",
    Cinzel:         "font-cinzel",
    GreatVibes:     "font-great-vibes",
    DancingScript:  "font-dancing",
    Montserrat:     "font-montserrat",
    Lato:           "font-lato",
    Default:        "font-lato",
  }
  return map[name] ?? "font-lato"
}

export function calendarUrl(cfg: WizardConfig, venue: string): string {
  const fmt = (dt: string) => {
    const d = new Date(dt)
    const p = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
  }
  const title = encodeURIComponent(`${cfg.eventType} – ${cfg.displayName}`)
  const start = cfg.startDateTime ? fmt(cfg.startDateTime) : ""
  const end   = cfg.endDateTime   ? fmt(cfg.endDateTime)   : start
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${encodeURIComponent(venue)}`
}

export function parseProgramText(text: string) {
  return text
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.trim().split("\n")
      return { label: lines[0]?.replace(/:$/, "").trim() ?? "", time: lines.slice(1).join(" ").trim() }
    })
    .filter((r) => r.label)
}

export function useCountdown(iso: string) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    if (!iso) return
    const tick = () => {
      const diff = new Date(iso).getTime() - Date.now()
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0 }); return }
      setT({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000)  /    60_000),
        s: Math.floor((diff %    60_000)  /     1_000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [iso])
  return t
}

export function multiLine(text: string, cls = "", style: React.CSSProperties = {}) {
  return text.split("\n").map((line, i) => (
    <p key={i} className={cls} style={style}>{line || " "}</p>
  ))
}
