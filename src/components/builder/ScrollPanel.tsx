"use client"

import { useBuilderStore } from "@/store/builderStore"
import { Toggle } from "@/components/ui/Toggle"
import { Select } from "@/components/ui/Select"

export function ScrollPanel() {
  const { card, updateScroll } = useBuilderStore()
  const cfg = card.scrollConfig
  const lang = card.language === "ms"

  if (!cfg) return null

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full pb-6">
      <div className="space-y-1 pb-2">
        <h3 className="text-xs font-semibold text-gold/80 uppercase tracking-widest">Auto-Skrol</h3>
        <p className="text-xs text-cream/30">
          {lang ? "Kad akan skrol automatik seperti cerita" : "Card scrolls automatically like a story"}
        </p>
      </div>

      <Toggle
        label={lang ? "Aktifkan Auto-Skrol" : "Enable Auto-Scroll"}
        description={lang ? "Kad skrol sendiri apabila dibuka" : "Card scrolls on its own when opened"}
        checked={cfg.autoScroll}
        onChange={(v) => updateScroll({ autoScroll: v })}
      />

      {cfg.autoScroll && (
        <>
          <Select
            label={lang ? "Kelajuan" : "Speed"}
            value={cfg.speed}
            onChange={(e) => updateScroll({ speed: e.target.value as "SLOW" | "MEDIUM" | "FAST" })}
            options={[
              { value: "SLOW", label: lang ? "Perlahan" : "Slow" },
              { value: "MEDIUM", label: lang ? "Sederhana" : "Medium" },
              { value: "FAST", label: lang ? "Laju" : "Fast" },
            ]}
          />

          <Toggle
            label={lang ? "Jeda apabila disentuh" : "Pause on touch"}
            description={lang ? "Berhenti skrol apabila tetamu menyentuh skrin" : "Pauses scrolling when guest touches screen"}
            checked={cfg.pauseOnHover}
            onChange={(v) => updateScroll({ pauseOnHover: v })}
          />
        </>
      )}

      {!cfg.autoScroll && (
        <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-center">
          <p className="text-xs text-cream/30">
            {lang
              ? "Aktifkan auto-skrol untuk tetamu mengalami kad seperti paparan cerita yang halus."
              : "Enable auto-scroll for guests to experience the card like a smooth story reveal."}
          </p>
        </div>
      )}
    </div>
  )
}
