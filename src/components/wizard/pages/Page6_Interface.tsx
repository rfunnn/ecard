"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { ColorField } from "../shared/ColorField"
import { WIZARD_FONTS } from "@/types/config"

export function Page6_Interface() {
  const { config, updateConfig } = useWizardStore()

  return (
    <div className="space-y-6">
      {/* General Text */}
      <div>
        <FieldLabel label="Teks Umum" />
        <div className="flex gap-2">
          <select
            value={config.generalFont}
            onChange={(e) => updateConfig("generalFont", e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-2 py-2.5 text-sm text-gray-700 bg-white outline-none"
          >
            {WIZARD_FONTS.map((f) => <option key={f}>{f}</option>)}
          </select>
          <ColorField value={config.generalColor} onChange={(v) => updateConfig("generalColor", v)} />
        </div>
        <SliderField value={config.generalSize} onChange={(v) => updateConfig("generalSize", v)} min={8} max={48} />
      </div>

      <div className="border-t border-gray-100" />

      {/* Title Text */}
      <div>
        <FieldLabel label="Teks Tajuk" />
        <select
          value={config.headingFont}
          onChange={(e) => updateConfig("headingFont", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-2 py-2.5 text-sm text-gray-700 bg-white outline-none"
        >
          {WIZARD_FONTS.map((f) => <option key={f}>{f}</option>)}
        </select>
        <SliderField value={config.headingSize} onChange={(v) => updateConfig("headingSize", v)} min={16} max={80} />
      </div>

      <div className="border-t border-gray-100" />

      {/* Background */}
      <div>
        <FieldLabel label="Latar Belakang" />
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <input
              type="text"
              value={config.backgroundColor}
              onChange={(e) => updateConfig("backgroundColor", e.target.value)}
              className="px-2 py-1.5 text-sm font-mono outline-none w-24"
            />
            <label className="relative w-10 h-9 cursor-pointer border-l border-gray-300">
              <div className="w-full h-full" style={{ background: config.backgroundColor }} />
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>
          </div>
          <span className="text-sm text-gray-600">Warna</span>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Side Margin */}
      <div>
        <FieldLabel label="Margin Sisi" />
        <SliderField
          value={config.sideMargin}
          onChange={(v) => updateConfig("sideMargin", v)}
          min={0}
          max={3}
          step={0.05}
          unit=" rem"
        />
      </div>
    </div>
  )
}
