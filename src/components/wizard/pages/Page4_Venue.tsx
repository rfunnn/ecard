"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SimpleRichText } from "../shared/SimpleRichText"

export function Page4_Venue() {
  const { config, updateConfig } = useWizardStore()

  return (
    <div className="space-y-6">
      {/* Hijri Date */}
      <div>
        <FieldLabel label="Tarikh Hijrah (jika ada)" />
        <input
          type="text"
          value={config.hijriDate}
          onChange={(e) => updateConfig("hijriDate", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="12 Rejab 1446H"
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* Venue Address */}
      <div>
        <FieldLabel label="Alamat Majlis" required info />
        <SimpleRichText
          value={config.venueAddress}
          onChange={(v) => updateConfig("venueAddress", v)}
          placeholder={"GLASS HOUSE GLENMARIE\nLOT 16859, 3 Stone Park, Jalan Penyair U1/44,\nHicom-Glenmarie Industrial Park,\n40150 Shah Alam, Selangor"}
          rows={5}
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* Navigation */}
      <div>
        <FieldLabel label="Navigasi (jika perlu)" info />
        <div className="rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <FieldLabel label="Pautan Google Maps" />
            <input
              type="url"
              value={config.googleMapsUrl}
              onChange={(e) => updateConfig("googleMapsUrl", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://g.co/kgs/CLMxFh8"
            />
          </div>

          <div>
            <FieldLabel label="Pautan Waze" />
            <input
              type="url"
              value={config.wazeUrl}
              onChange={(e) => updateConfig("wazeUrl", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://waze.com/ul/hw22tp0I6s"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">ATAU</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <FieldLabel label="Koordinat GPS" info />
            <input
              type="text"
              value={config.gpsCoordinates}
              onChange={(e) => updateConfig("gpsCoordinates", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.870943, 103.119317"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
