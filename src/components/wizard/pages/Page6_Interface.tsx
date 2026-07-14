"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { ColorField } from "../shared/ColorField"
import { FontSelect } from "../shared/FontSelect"

const DIVIDER = <div className="border-t border-gray-100" />

export function Page6_Interface() {
  const { config, updateConfig } = useWizardStore()
  const isMs = config.language === "ms"

  return (
    <div className="space-y-6">
      {/* General Text */}
      <div>
        <FieldLabel label={isMs ? "Teks Umum" : "General Text"} />
        <div className="flex gap-2">
          <FontSelect
            value={config.generalFont}
            onChange={(font) => updateConfig("generalFont", font)}
            className="flex-1"
            sampleText="Dengan penuh rasa syukur"
          />
          <ColorField value={config.generalColor} onChange={(v) => updateConfig("generalColor", v)} />
        </div>
        <SliderField value={config.generalSize} onChange={(v) => updateConfig("generalSize", v)} min={8} max={48} />
      </div>

      {DIVIDER}

      {/* Title Text */}
      <div>
        <FieldLabel label={isMs ? "Teks Tajuk" : "Title Text"} />
        <FontSelect
          value={config.headingFont}
          onChange={(font) => updateConfig("headingFont", font)}
          className="w-full"
          sampleText="Walimatul Urus"
        />
        <SliderField value={config.headingSize} onChange={(v) => updateConfig("headingSize", v)} min={16} max={80} />
      </div>

      {DIVIDER}

      {/* Background Color */}
      <div>
        <FieldLabel label={isMs ? "Latar Belakang" : "Background"} />
        <div className="flex items-center gap-3 mt-1">
          <ColorField
            value={config.backgroundColor}
            onChange={(v) => updateConfig("backgroundColor", v)}
          />
          <span className="text-sm text-gray-600">{isMs ? "Warna" : "Colour"}</span>
        </div>
      </div>

      {DIVIDER}

      {/* Side Margin */}
      <div>
        <FieldLabel label={isMs ? "Margin Sisi" : "Side Margin"} />
        <SliderField
          value={config.sideMargin}
          onChange={(v) => updateConfig("sideMargin", v)}
          min={0}
          max={3}
          step={0.05}
          unit=" rem"
        />
      </div>

      {DIVIDER}

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
