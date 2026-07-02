"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SimpleRichText } from "../shared/SimpleRichText"

const DEFAULT_SCHEDULE_MS = `Kehadiran Tetamu:\n11:00 pagi\n\nKetibaan Pengantin:\n12:15 tengah hari\n\nMakan Beradab:\n1:00 petang\n\nMajlis Berakhir:\n4:00 petang`

const DEFAULT_SCHEDULE_EN = `Guest Arrival:\n11:00 am\n\nBride & Groom Arrival:\n12:15 pm\n\nLuncheon:\n1:00 pm\n\nEvent Ends:\n4:00 pm`

export function Page5_Program() {
  const { config, updateConfig } = useWizardStore()
  const isMs = config.language === "ms"
  const DEFAULT_SCHEDULE = isMs ? DEFAULT_SCHEDULE_MS : DEFAULT_SCHEDULE_EN

  return (
    <div className="space-y-6">
      {/* Additional Info 1 */}
      <div>
        <FieldLabel label={isMs ? "Maklumat Tambahan #1 (jika ada)" : "Additional Info #1 (if any)"} />
        <SimpleRichText
          value={config.additionalInfo1}
          onChange={(v) => updateConfig("additionalInfo1", v)}
          placeholder="Insert text here ..."
          rows={3}
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* Event Program / Schedule */}
      <div>
        <FieldLabel label={isMs ? "Atur Cara Majlis" : "Event Programme"} required />
        <SimpleRichText
          value={config.eventProgram || DEFAULT_SCHEDULE}
          onChange={(v) => updateConfig("eventProgram", v)}
          placeholder={DEFAULT_SCHEDULE}
          rows={8}
        />
        <button className="mt-1 text-sm text-blue-600 hover:text-blue-800">
          {isMs ? "+Lebih tetapan" : "+More settings"}
        </button>
      </div>

      <div className="border-t border-gray-100" />

      {/* Additional Info 2 */}
      <div>
        <FieldLabel label={isMs ? "Maklumat Tambahan #2 (jika ada)" : "Additional Info #2 (if any)"} />
        <SimpleRichText
          value={config.additionalInfo2}
          onChange={(v) => updateConfig("additionalInfo2", v)}
          placeholder="Insert text here ..."
          rows={4}
        />
      </div>
    </div>
  )
}
