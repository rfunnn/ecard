import type { WizardConfig } from "@/types/config"
import { DEFAULT_WIZARD_CONFIG } from "@/types/config"

/**
 * Deep-merge a saved (possibly partial / older-schema) WizardConfig over the
 * current defaults so nested objects (rsvp, showFields, organizers, segments)
 * also pick up any fields added to the schema after the config was first saved.
 *
 * Shared by the builder store (client, on card load) and card seeding (server,
 * when cloning a template's authored config) so both stay in lockstep.
 */
export function mergeWizardConfig(saved: Partial<WizardConfig> | null | undefined): WizardConfig {
  const merged: WizardConfig = { ...DEFAULT_WIZARD_CONFIG, ...(saved ?? {}) }
  if (saved?.rsvp) {
    merged.rsvp = { ...DEFAULT_WIZARD_CONFIG.rsvp, ...saved.rsvp }
    if (saved.rsvp.showFields) {
      merged.rsvp.showFields = { ...DEFAULT_WIZARD_CONFIG.rsvp.showFields, ...saved.rsvp.showFields }
    }
  }
  if (saved?.organizer1) merged.organizer1 = { ...DEFAULT_WIZARD_CONFIG.organizer1, ...saved.organizer1 }
  if (saved?.organizer2) merged.organizer2 = { ...DEFAULT_WIZARD_CONFIG.organizer2, ...saved.organizer2 }
  if (saved?.segments)   merged.segments   = { ...DEFAULT_WIZARD_CONFIG.segments,   ...saved.segments   }
  return merged
}
