"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { WizardInput } from "../shared/WizardInput"
import { SimpleRichText } from "../shared/SimpleRichText"

const DIVIDER = <div className="border-t border-gray-100" />

export function Page4_Venue() {
  const { config, updateConfig } = useWizardStore()
  const isMs = config.language === "ms"

  return (
    <div className="space-y-6">
      {/* Hijri Date */}
      <div>
        <FieldLabel label={isMs ? "Tarikh Hijrah (jika ada)" : "Hijri Date (if any)"} />
        <WizardInput
          value={config.hijriDate}
          onChange={(e) => updateConfig("hijriDate", e.target.value)}
          placeholder="12 Rejab 1446H"
        />
      </div>

      {DIVIDER}

      {/* Venue Address */}
      <div>
        <FieldLabel label={isMs ? "Alamat Majlis" : "Event Address"} required info />
        <SimpleRichText
          value={config.venueAddress}
          onChange={(v) => updateConfig("venueAddress", v)}
          placeholder={"GLASS HOUSE GLENMARIE\nLOT 16859, 3 Stone Park, Jalan Penyair U1/44,\nHicom-Glenmarie Industrial Park,\n40150 Shah Alam, Selangor"}
          rows={5}
        />
      </div>

      {DIVIDER}

      {/* Navigation */}
      <div>
        <FieldLabel label={isMs ? "Navigasi (jika perlu)" : "Navigation (if needed)"} info />
        <div className="rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <FieldLabel label={isMs ? "Pautan Google Maps" : "Google Maps Link"} />
            <WizardInput
              type="url"
              value={config.googleMapsUrl}
              onChange={(e) => updateConfig("googleMapsUrl", e.target.value)}
              className="text-blue-600"
              placeholder="https://g.co/kgs/CLMxFh8"
            />
          </div>

          <div>
            <FieldLabel label={isMs ? "Pautan Waze" : "Waze Link"} />
            <WizardInput
              type="url"
              value={config.wazeUrl}
              onChange={(e) => updateConfig("wazeUrl", e.target.value)}
              className="text-blue-600"
              placeholder="https://waze.com/ul/hw22tp0I6s"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">{isMs ? "ATAU" : "OR"}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <FieldLabel label={isMs ? "Koordinat GPS" : "GPS Coordinates"} info />
            <WizardInput
              value={config.gpsCoordinates}
              onChange={(e) => updateConfig("gpsCoordinates", e.target.value)}
              placeholder="1.870943, 103.119317"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
