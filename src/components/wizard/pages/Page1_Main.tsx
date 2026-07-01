"use client"

import { useEffect, useState } from "react"
import { useWizardStore } from "@/store/wizardStore"
import type { TemplateInfo } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { ColorField } from "../shared/ColorField"
import { SliderField } from "../shared/SliderField"
import { OPENING_STYLES, EFFECT_ANIMATIONS } from "@/types/config"

export function Page1_Main() {
  const { config, updateConfig, setTemplateOverride } = useWizardStore()
  const [templates, setTemplates] = useState<TemplateInfo[]>([])

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

  return (
    <div className="space-y-6">
      {/* Language */}
      <div>
        <FieldLabel label="Bahasa Kad" />
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
        <FieldLabel label="Pakej Pilihan" info />
        <select
          value={config.packageType}
          onChange={(e) => updateConfig("packageType", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Gold (RM60)</option>
          <option>Silver (RM40)</option>
          <option>Bronze (RM20)</option>
        </select>
      </div>

      {/* Add-ons */}
      <div>
        <FieldLabel label="Add-On" info />
        <div className="space-y-2">
          {[
            { key: "addOnCustomDesign" as const, label: "Muatnaik Rekaan Sendiri (+RM10)" },
            { key: "addOnCoverVideo" as const,   label: "Muatnaik Cover Video (+RM10)" },
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
        <FieldLabel label="Kod Rekaan" required />
        <select
          value={config.designCode}
          onChange={(e) => handleDesignCode(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Rekaan --</option>
          {templates.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.nameMs || t.name}
            </option>
          ))}
        </select>
        {templates.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">Memuatkan rekaan...</p>
        )}
      </div>

      {/* Opening Style */}
      <div>
        <FieldLabel label="Gaya Pembukaan" required />
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
      <div>
        <FieldLabel label="Animasi Efek" required />
        <div className="flex gap-2">
          <select
            value={config.effectAnimation}
            onChange={(e) => updateConfig("effectAnimation", e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-white outline-none"
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
            <FieldLabel label="Saiz Animasi" />
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
    </div>
  )
}
