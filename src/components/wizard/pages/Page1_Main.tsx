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
  const { config, updateConfig, setConfig, setTemplateOverride, isPublished } = useWizardStore()
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [designDropdownOpen, setDesignDropdownOpen] = useState(false)
  const designDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!designDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (!designDropdownRef.current?.contains(e.target as Node)) setDesignDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [designDropdownOpen])

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
        <FieldLabel label={isMs ? "Bahasa Kad" : "Card Language"} />
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

      {/* Add-ons */}
      <div>
        <FieldLabel label={isMs ? "Add-On" : "Add-Ons"} info />
        <div className="space-y-2">
          {[
            { key: "addOnCustomDesign" as const, label: isMs ? "Muatnaik Rekaan Sendiri (+RM10)" : "Upload Custom Design (+RM10)" },
            { key: "addOnCoverVideo" as const,   label: isMs ? "Muatnaik Cover Video (+RM10)" : "Upload Cover Video (+RM10)" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <span
                onClick={() => updateConfig(key, !config[key])}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${config[key] ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config[key] ? "translate-x-5" : ""}`} />
              </span>
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Design Code — driven by real DB templates */}
      <div>
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
      </div>

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

      {/* Footer Bar */}
      <div>
        <FieldLabel label={isMs ? "Bar Menu (Bawah)" : "Footer Bar"} />
        <div className="space-y-3 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{isMs ? "Warna Latar" : "Background"}</span>
            <ColorField
              value={config.footerBgColor || "#ffffff"}
              onChange={(v) => updateConfig("footerBgColor", v)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{isMs ? "Kelegapan" : "Opacity"}</span>
              <span className="text-xs text-gray-400">{config.footerBgOpacity ?? 70}%</span>
            </div>
            <SliderField
              value={config.footerBgOpacity ?? 70}
              onChange={(v) => updateConfig("footerBgOpacity", v)}
              min={10}
              max={100}
              step={5}
              unit="%"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{isMs ? "Warna Ikon" : "Icon Color"}</span>
            <ColorField
              value={config.footerIconColor || "#c4a265"}
              onChange={(v) => updateConfig("footerIconColor", v)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
