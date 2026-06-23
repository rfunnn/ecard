"use client"

import { ChevronUp, ChevronDown, Plus } from "lucide-react"
import { useWizardStore } from "@/store/wizardStore"
import { WizardToggle } from "../shared/WizardToggle"

export function Page8_Contact() {
  const { config, addContact, removeContact, updateContact, moveContact } = useWizardStore()
  const contacts = config.contacts

  return (
    <div className="space-y-1">
      {/* Header info */}
      <div className="pb-4">
        <p className="text-sm text-blue-600 font-medium">
          Isi sehingga <span className="font-bold">7 kenalan</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Kosongkan jika tidak memerlukan</p>
      </div>

      {contacts.map((contact, i) => (
        <div key={i} className="border-t border-gray-100 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">Kenalan {i + 1} (jika ada)</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveContact(i, i - 1)}
                disabled={i === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveContact(i, i + 1)}
                disabled={i === contacts.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              {contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="p-1 text-red-400 hover:text-red-600 text-sm font-bold ml-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={contact.name}
              onChange={(e) => updateContact(i, { name: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Azman"
            />
            <input
              type="text"
              value={contact.role}
              onChange={(e) => updateContact(i, { role: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bapa"
            />
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => updateContact(i, { phone: e.target.value })}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="012967060"
            />
            <WizardToggle
              checked={contact.isWhatsApp}
              onChange={(v) => updateContact(i, { isWhatsApp: v })}
              label="WhatsApp"
            />
          </div>
        </div>
      ))}

      {/* Add contact button */}
      {contacts.length < 7 && (
        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={addContact}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4" />
            Tambah Kenalan
          </button>
        </div>
      )}
    </div>
  )
}
