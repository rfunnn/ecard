"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { ColorField } from "../shared/ColorField"
import { FontSelect } from "../shared/FontSelect"

const DIVIDER = <div className="border-t border-gray-100" />

export function Page6_Interface() {
  const { config, updateConfig } = useWizardStore()

  return (
    <div className="space-y-6">
      {/* General Text */}
      <div>
        <FieldLabel label="Teks Umum" />
        <div className="flex gap-2">
          <FontSelect
            value={config.generalFont}
            onChange={(font) => updateConfig("generalFont", font)}
            className="flex-1"
          />
          <ColorField value={config.generalColor} onChange={(v) => updateConfig("generalColor", v)} />
        </div>
        <SliderField value={config.generalSize} onChange={(v) => updateConfig("generalSize", v)} min={8} max={48} />
      </div>

      {DIVIDER}

      {/* Title Text */}
      <div>
        <FieldLabel label="Teks Tajuk" />
        <FontSelect
          value={config.headingFont}
          onChange={(font) => updateConfig("headingFont", font)}
          className="w-full"
        />
        <SliderField value={config.headingSize} onChange={(v) => updateConfig("headingSize", v)} min={16} max={80} />
      </div>

      {DIVIDER}

      {/* Background Color */}
      <div>
        <FieldLabel label="Latar Belakang" />
        <div className="flex items-center gap-3 mt-1">
          <ColorField
            value={config.backgroundColor}
            onChange={(v) => updateConfig("backgroundColor", v)}
          />
          <span className="text-sm text-gray-600">Warna</span>
        </div>
      </div>

      {DIVIDER}

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
