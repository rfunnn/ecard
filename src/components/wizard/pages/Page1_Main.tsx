"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { useWizardStore } from "@/store/wizardStore"
import type { TemplateInfo } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { ColorField } from "../shared/ColorField"
import { SliderField } from "../shared/SliderField"
import { OPENING_STYLES, EFFECT_ANIMATIONS, getPackageTier } from "@/types/config"
import type { WizardConfig } from "@/types/config"

export function Page1_Main() {
  const { config, updateConfig, setConfig, setTemplateOverride, isPublished, authoringMode } = useWizardStore()
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [designDropdownOpen, setDesignDropdownOpen] = useState(false)
  const designDropdownRef = useRef<HTMLDivElement>(null)
  const [scrollAnimDropdownOpen, setScrollAnimDropdownOpen] = useState(false)
  const scrollAnimDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!designDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (!designDropdownRef.current?.contains(e.target as Node)) setDesignDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [designDropdownOpen])

  useEffect(() => {
    if (!scrollAnimDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (!scrollAnimDropdownRef.current?.contains(e.target as Node)) setScrollAnimDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [scrollAnimDropdownOpen])

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.templates)) setTemplates(data.templates)
      })
      .catch(() => {})
  }, [])

  const handleDesignCode = (slug: string) => {
    updateConfig("designCode", slug)
    const found = templates.find((t) => t.slug === slug) ?? null
    setTemplateOverride(found)
  }

  function handlePackageChange(newPackage: string) {
    const tier = getPackageTier(newPackage)
    const updates: Partial<WizardConfig> = { packageType: newPackage }

    if (tier === "bronze") {
      updates.effectAnimation = "Tiada"
      updates.rsvp = { ...config.rsvp, mode: "NONE" }
      updates.segments = {
        ...config.segments,
        attendance: false,
        wishes: false,
        confirmBtn: false,
        writeWishBtn: false,
      }
      updates.bankName = ""
      updates.bankAccountName = ""
      updates.bankAccountNumber = ""
      updates.bankQrUrl = ""
    } else if (tier === "silver") {
      if (config.rsvp.mode === "NONE") updates.rsvp = { ...config.rsvp, mode: "RSVP_WISHES" }
      updates.segments = {
        ...config.segments,
        attendance: true,
        wishes: true,
        confirmBtn: true,
        writeWishBtn: true,
      }
      updates.bankName = ""
      updates.bankAccountName = ""
      updates.bankAccountNumber = ""
      updates.bankQrUrl = ""
    } else {
      // gold — unlock RSVP if it was locked by Bronze
      if (config.rsvp.mode === "NONE") updates.rsvp = { ...config.rsvp, mode: "RSVP_WISHES" }
      updates.segments = {
        ...config.segments,
        attendance: true,
        wishes: true,
        confirmBtn: true,
        writeWishBtn: true,
      }
    }

    setConfig(updates)
  }

  const isBronze = getPackageTier(config.packageType) === "bronze"
  const isMs = config.language === "ms"
  const packageLocked = isPublished

  return (
    <div className="space-y-6">
      {/* Language */}
      <div>
        <FieldLabel label={isMs ? "Pilih Bahasa" : "Select Language"} />
        <div className="flex gap-6 mt-1">
          {(["en", "ms"] as const).map((lang) => (
            <label key={lang} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="language"
                value={lang}
                checked={config.language === lang}
                onChange={() => updateConfig("language", lang)}
                className="accent-[#2563eb]"
              />
              <span className="text-sm text-gray-700">{lang === "en" ? "English" : "Bahasa Melayu"}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Package */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FieldLabel label={isMs ? "Pakej Pilihan" : "Package"} info />
          {packageLocked && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full leading-none">
              {isMs ? "Aktif" : "Active"}
            </span>
          )}
        </div>
        <select
          value={config.packageType}
          onChange={(e) => handlePackageChange(e.target.value)}
          disabled={packageLocked}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option>Gold (RM60)</option>
          <option>Silver (RM40)</option>
          <option>Bronze (RM20)</option>
        </select>
        {packageLocked && (
          <p className="text-[11px] text-gray-400 mt-1">
            {isMs ? "Pakej tidak boleh ditukar selepas pembayaran." : "Package cannot be changed after payment."}
          </p>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Design Code — driven by real DB templates. Hidden while authoring a
          template (the design is fixed to the template being edited). */}
      {!authoringMode && <div>
        <FieldLabel label={isMs ? "Kod Rekaan" : "Design Code"} required />
        <div className="relative mt-1" ref={designDropdownRef}>
          <button
            type="button"
            onClick={() => setDesignDropdownOpen((o) => !o)}
            className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white outline-none hover:border-gray-400 transition-colors"
          >
            {(() => {
              const sel = templates.find((t) => t.slug === config.designCode)
              return sel ? (
                <span className="flex items-center gap-2.5">
                  {(sel.image1Url || sel.image2Url) && (
                    <img src={(sel.image1Url || sel.image2Url)!} alt="" className="w-7 h-10 object-cover rounded shrink-0" />
                  )}
                  <span className="text-gray-700">{sel.nameMs || sel.name}</span>
                </span>
              ) : (
                <span className="text-gray-400">{isMs ? "-- Pilih Rekaan --" : "-- Select Design --"}</span>
              )
            })()}
            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${designDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {designDropdownOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-xs text-gray-400 px-3 py-3">{isMs ? "Memuatkan rekaan..." : "Loading designs..."}</p>
              ) : templates.map((t) => {
                const selected = config.designCode === t.slug
                const label = t.nameMs || t.name
                const imgUrl = t.image1Url || t.image2Url
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { handleDesignCode(t.slug); setDesignDropdownOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                      selected ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt={label} className="w-9 h-12 object-cover rounded shrink-0" />
                    ) : (
                      <div className="w-9 h-12 bg-gray-100 rounded shrink-0" />
                    )}
                    <span className={`text-sm flex-1 ${selected ? "font-semibold text-amber-700" : "text-gray-700"}`}>{label}</span>
                    {selected && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>}

      {/* Opening Style */}
      <div>
        <FieldLabel label={isMs ? "Gaya Pembukaan" : "Opening Style"} required />
        <div className="flex gap-2">
          <select
            value={config.openingStyle}
            onChange={(e) => updateConfig("openingStyle", e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white outline-none"
          >
            {OPENING_STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ColorField
            value={config.openingStyleColor}
            onChange={(v) => updateConfig("openingStyleColor", v)}
          />
        </div>
      </div>

      {/* Effect Animation */}
      <div className={isBronze ? "opacity-50 pointer-events-none select-none" : ""}>
        <div className="flex items-center gap-2 mb-1">
          <FieldLabel label={isMs ? "Animasi Efek" : "Effect Animation"} required />
          {isBronze && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none">
              Silver+
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={config.effectAnimation}
            onChange={(e) => updateConfig("effectAnimation", e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white outline-none"
            disabled={isBronze}
          >
            {EFFECT_ANIMATIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ColorField
            value={config.effectColor}
            onChange={(v) => updateConfig("effectColor", v)}
          />
        </div>
        {config.effectAnimation !== "Tiada" && (
          <div className="mt-3">
            <FieldLabel label={isMs ? "Saiz Animasi" : "Animation Size"} />
            <SliderField
              value={config.effectSize ?? 100}
              onChange={(v) => updateConfig("effectSize", v)}
              min={30}
              max={200}
              step={10}
              unit="%"
            />
          </div>
        )}
      </div>

      {/* Scroll Animation */}
      {(() => {
        const SCROLL_ANIMS = [
          { key: "Naik",   ms: "Naik",        en: "Rise",    msDesc: "Naik perlahan dari bawah",    enDesc: "Rises from below",      icon: "↑" },
          { key: "Timbul", ms: "Timbul",       en: "Pop",     msDesc: "Muncul dengan kesan timbul",  enDesc: "Pops in with bounce",   icon: "✦" },
          { key: "Turun",  ms: "Turun Masuk",  en: "Fall In", msDesc: "Jatuh masuk dari atas",       enDesc: "Falls from above",      icon: "↓" },
          { key: "Pudar",  ms: "Pudar",        en: "Fade",    msDesc: "Pudar masuk perlahan sahaja", enDesc: "Fades in, no movement", icon: "◎" },
        ] as const
        const currentKey = config.scrollAnimation ?? "Naik"
        const current = SCROLL_ANIMS.find((a) => a.key === currentKey) ?? SCROLL_ANIMS[0]
        return (
          <div>
            <FieldLabel label={isMs ? "Animasi Skrol" : "Scroll Animation"} />
            <div className="relative mt-1" ref={scrollAnimDropdownRef}>
              <button
                type="button"
                onClick={() => setScrollAnimDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none shrink-0">{current.icon}</span>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-gray-800">{isMs ? current.ms : current.en}</span>
                    <span className="text-[10px] text-gray-400 truncate">{isMs ? current.msDesc : current.enDesc}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${scrollAnimDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {scrollAnimDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {SCROLL_ANIMS.map(({ key, ms, en, msDesc, enDesc, icon }) => {
                    const selected = currentKey === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { updateConfig("scrollAnimation", key); setScrollAnimDropdownOpen(false) }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-amber-50 ${selected ? "bg-amber-50" : ""}`}
                      >
                        <span className="text-base leading-none shrink-0">{icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-medium ${selected ? "text-amber-700" : "text-gray-800"}`}>
                            {isMs ? ms : en}
                          </span>
                          <span className="text-[10px] text-gray-400">{isMs ? msDesc : enDesc}</span>
                        </div>
                        {selected && <span className="ml-auto text-amber-500 text-xs">✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
