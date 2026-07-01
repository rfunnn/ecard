"use client"

import { useWizardStore } from "@/store/wizardStore"
import { FieldLabel } from "../shared/FieldLabel"
import { SliderField } from "../shared/SliderField"
import { ColorField } from "../shared/ColorField"
import { FontSelect } from "../shared/FontSelect"
import { WizardInput } from "../shared/WizardInput"
import { WizardTextarea } from "../shared/WizardTextarea"

const DIVIDER = <div className="border-t border-gray-100" />

export function Page2_FrontPage() {
  const { config, updateConfig } = useWizardStore()

  return (
    <div className="space-y-6">
      {/* Event Type */}
      <div>
        <FieldLabel label="Jenis Majlis" />
        <WizardTextarea
          value={config.eventType}
          onChange={(e) => updateConfig("eventType", e.target.value)}
          rows={2}
          className="text-center"
          placeholder="Walimatul Urus"
        />
        <SliderField value={config.eventTypeSize} onChange={(v) => updateConfig("eventTypeSize", v)} min={8} max={48} />
      </div>

      {DIVIDER}

      {/* Display Name */}
      <div>
        <FieldLabel label="Nama Panggilan" required info />
        <WizardInput
          value={config.displayName}
          onChange={(e) => updateConfig("displayName", e.target.value)}
          placeholder="Arfan & Rafeka"
        />
        <div className="flex gap-2 mt-2">
          <FontSelect
            value={config.displayNameFont}
            onChange={(font) => updateConfig("displayNameFont", font)}
            className="flex-1"
          />
          <ColorField value={config.displayNameColor} onChange={(v) => updateConfig("displayNameColor", v)} />
        </div>
        <SliderField value={config.displayNameSize} onChange={(v) => updateConfig("displayNameSize", v)} min={16} max={80} />
      </div>

      {DIVIDER}

      {/* Start DateTime */}
      <div>
        <FieldLabel label="Tarikh & Waktu Majlis Bermula" required />
        <WizardInput
          type="datetime-local"
          value={config.startDateTime}
          onChange={(e) => updateConfig("startDateTime", e.target.value)}
          className="text-gray-700"
        />
      </div>

      {/* End DateTime */}
      <div>
        <FieldLabel label="Tarikh & Waktu Majlis Berakhir" required />
        <WizardInput
          type="datetime-local"
          value={config.endDateTime}
          onChange={(e) => updateConfig("endDateTime", e.target.value)}
          className="text-gray-700"
        />
      </div>

      {DIVIDER}

      {/* Day & Date display text */}
      <div>
        <FieldLabel label="Hari & Tarikh" />
        <WizardTextarea
          value={config.dayAndDate}
          onChange={(e) => updateConfig("dayAndDate", e.target.value)}
          rows={2}
          className="text-center"
          placeholder={"Ahad\n12 Januari 2025"}
        />
        <SliderField value={config.dayAndDateSize} onChange={(v) => updateConfig("dayAndDateSize", v)} min={8} max={48} />
      </div>

      {/* Venue line */}
      <div>
        <FieldLabel label="Nama Tempat/Hashtag/dll (jika ada)" />
        <WizardTextarea
          value={config.venueLine}
          onChange={(e) => updateConfig("venueLine", e.target.value)}
          rows={2}
          className="text-center"
          placeholder={"Dataran Gangsa\nMelaka"}
        />
        <FieldLabel label="Saiz Fon" />
        <SliderField value={config.venueLineSize} onChange={(v) => updateConfig("venueLineSize", v)} min={8} max={36} />
      </div>
    </div>
  )
}
