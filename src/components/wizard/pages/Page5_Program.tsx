"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SimpleRichText } from "../shared/SimpleRichText"

const DEFAULT_SCHEDULE = `Kehadiran Tetamu:\n11:00 pagi\n\nKetibaan Pengantin:\n12:15 tengah hari\n\nMakan Beradab:\n1:00 petang\n\nMajlis Berakhir:\n4:00 petang`

export function Page5_Program() {
  const { config, updateConfig } = useWizardStore()

  return (
    <div className="space-y-6">
      {/* Additional Info 1 */}
      <div>
        <FieldLabel label="Maklumat Tambahan #1 (jika ada)" />
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
        <FieldLabel label="Atur Cara Majlis" required />
        <SimpleRichText
          value={config.eventProgram || DEFAULT_SCHEDULE}
          onChange={(v) => updateConfig("eventProgram", v)}
          placeholder={DEFAULT_SCHEDULE}
          rows={8}
        />
        <button className="mt-1 text-sm text-blue-600 hover:text-blue-800">
          +Lebih tetapan
        </button>
      </div>

      <div className="border-t border-gray-100" />

      {/* Additional Info 2 */}
      <div>
        <FieldLabel label="Maklumat Tambahan #2 (jika ada)" />
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
