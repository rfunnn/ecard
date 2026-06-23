"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { ColorField } from "../shared/ColorField"
import { WIZARD_FONTS } from "@/types/config"

export function Page2_FrontPage() {
  const { config, updateConfig } = useWizardStore()

  return (
    <div className="space-y-6">
      {/* Event Type */}
      <div>
        <FieldLabel label="Jenis Majlis" />
        <textarea
          value={config.eventType}
          onChange={(e) => updateConfig("eventType", e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 text-center outline-none resize-none focus:ring-2 focus:ring-blue-500"
          placeholder="Walimatul Urus"
        />
        <SliderField value={config.eventTypeSize} onChange={(v) => updateConfig("eventTypeSize", v)} min={8} max={48} />
      </div>

      <div className="border-t border-gray-100" />

      {/* Display Name */}
      <div>
        <FieldLabel label="Nama Panggilan" required info />
        <input
          type="text"
          value={config.displayName}
          onChange={(e) => updateConfig("displayName", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Arfan & Rafeka"
        />
        <div className="flex gap-2 mt-2">
          <select
            value={config.displayNameFont}
            onChange={(e) => updateConfig("displayNameFont", e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-700 bg-white outline-none"
          >
            {WIZARD_FONTS.map((f) => <option key={f}>{f}</option>)}
          </select>
          <ColorField value={config.displayNameColor} onChange={(v) => updateConfig("displayNameColor", v)} />
        </div>
        <SliderField value={config.displayNameSize} onChange={(v) => updateConfig("displayNameSize", v)} min={16} max={80} />
      </div>

      <div className="border-t border-gray-100" />

      {/* Start DateTime */}
      <div>
        <FieldLabel label="Tarikh & Waktu Majlis Bermula" required />
        <input
          type="datetime-local"
          value={config.startDateTime}
          onChange={(e) => updateConfig("startDateTime", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* End DateTime */}
      <div>
        <FieldLabel label="Tarikh & Waktu Majlis Berakhir" required />
        <input
          type="datetime-local"
          value={config.endDateTime}
          onChange={(e) => updateConfig("endDateTime", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* Day & Date display text */}
      <div>
        <FieldLabel label="Hari & Tarikh" />
        <textarea
          value={config.dayAndDate}
          onChange={(e) => updateConfig("dayAndDate", e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 text-center outline-none resize-none focus:ring-2 focus:ring-blue-500"
          placeholder={"Ahad\n12 Januari 2025"}
        />
        <SliderField value={config.dayAndDateSize} onChange={(v) => updateConfig("dayAndDateSize", v)} min={8} max={48} />
      </div>

      {/* Venue line */}
      <div>
        <FieldLabel label="Nama Tempat/Hashtag/dll (jika ada)" />
        <textarea
          value={config.venueLine}
          onChange={(e) => updateConfig("venueLine", e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 text-center outline-none resize-none focus:ring-2 focus:ring-blue-500"
          placeholder={"Dataran Gangsa\nMelaka"}
        />
        <FieldLabel label="Saiz Fon" />
        <SliderField value={config.venueLineSize} onChange={(v) => updateConfig("venueLineSize", v)} min={8} max={36} />
      </div>
    </div>
  )
}
