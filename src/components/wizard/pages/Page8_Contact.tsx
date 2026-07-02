"use client"

import { ChevronUp, ChevronDown, Plus } from "lucide-react"
import { useWizardStore } from "@/store/wizardStore"
import { WizardInput } from "../shared/WizardInput"
import { WizardToggle } from "../shared/WizardToggle"

const MAX_CONTACTS = 7

export function Page8_Contact() {
  const { config, addContact, removeContact, updateContact, moveContact } = useWizardStore()
  const contacts = config.contacts
  const isMs = config.language === "ms"

  return (
    <div className="space-y-1">
      <div className="pb-4">
        <p className="text-sm text-blue-600 font-medium">
          {isMs
            ? <>{`Isi sehingga `}<span className="font-bold">{MAX_CONTACTS} kenalan</span></>
            : <>{`Fill up to `}<span className="font-bold">{MAX_CONTACTS} contacts</span></>
          }
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{isMs ? "Kosongkan jika tidak memerlukan" : "Leave blank if not needed"}</p>
      </div>

      {contacts.map((contact, index) => (
        <div key={index} className="border-t border-gray-100 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">{isMs ? `Kenalan ${index + 1} (jika ada)` : `Contact ${index + 1} (if any)`}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveContact(index, index - 1)}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveContact(index, index + 1)}
                disabled={index === contacts.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="p-1 text-red-400 hover:text-red-600 text-sm font-bold ml-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <WizardInput
              value={contact.name}
              onChange={(e) => updateContact(index, { name: e.target.value })}
              placeholder="Azman"
            />
            <WizardInput
              value={contact.role}
              onChange={(e) => updateContact(index, { role: e.target.value })}
              placeholder={isMs ? "Bapa" : "Father"}
            />
          </div>

          <div className="flex gap-2 items-center">
            <WizardInput
              type="tel"
              value={contact.phone}
              onChange={(e) => updateContact(index, { phone: e.target.value })}
              className="flex-1"
              placeholder="012967060"
            />
            <WizardToggle
              checked={contact.isWhatsApp}
              onChange={(v) => updateContact(index, { isWhatsApp: v })}
              label="WhatsApp"
            />
          </div>
        </div>
      ))}

      {contacts.length < MAX_CONTACTS && (
        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={addContact}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4" />
            {isMs ? "Tambah Kenalan" : "Add Contact"}
          </button>
        </div>
      )}
    </div>
  )
}
