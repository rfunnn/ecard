import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import type { WizardConfig, ContactConfig } from "@/types/config"
import { DEFAULT_WIZARD_CONFIG } from "@/types/config"
import type { GiftItem, PhotoItem } from "@/types/invitation"

export interface TemplateInfo {
  id: string
  slug: string
  name: string
  nameMs: string
  category: "WEDDING" | "BIRTHDAY" | "CORPORATE" | "GENERIC"
  image1Url?: string | null
  image2Url?: string | null
}

interface WizardState {
  config: WizardConfig
  currentPage: number
  isDirty: boolean
  isSaving: boolean
  cardSlug: string
  isPublished: boolean
  templateOverride: TemplateInfo | null
  giftItems: GiftItem[]
  photoItems: PhotoItem[]
}

interface WizardActions {
  setConfig: (config: Partial<WizardConfig>) => void
  updateConfig: <K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) => void
  loadConfig: (saved: Partial<WizardConfig>) => void
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setCardSlug: (slug: string) => void
  setIsPublished: (published: boolean) => void
  setIsSaving: (saving: boolean) => void
  markClean: () => void
  setTemplateOverride: (t: TemplateInfo | null) => void
  addContact: () => void
  removeContact: (index: number) => void
  updateContact: (index: number, contact: Partial<ContactConfig>) => void
  moveContact: (from: number, to: number) => void
  resetToDefaults: () => void
  setGiftItems: (items: GiftItem[]) => void
  addGiftItem: (item: GiftItem) => void
  removeGiftItem: (id: string) => void
  setPhotoItems: (items: PhotoItem[]) => void
  addPhotoItem: (item: PhotoItem) => void
  removePhotoItem: (id: string) => void
}

export const TOTAL_PAGES = 12

export const useWizardStore = create<WizardState & WizardActions>()(
  immer((set) => ({
    config: { ...DEFAULT_WIZARD_CONFIG },
    currentPage: 1,
    isDirty: false,
    isSaving: false,
    cardSlug: "",
    isPublished: false,
    templateOverride: null,
    giftItems: [],
    photoItems: [],

    setConfig: (partial) =>
      set((state) => {
        Object.assign(state.config, partial)
        state.isDirty = true
      }),

    // Deep-merge saved config over defaults so nested objects (rsvp, segments, organizer) also
    // get any new default fields that were added to the schema after the card was first saved.
    loadConfig: (saved) =>
      set((state) => {
        const merged: WizardConfig = { ...DEFAULT_WIZARD_CONFIG, ...saved }
        if (saved.rsvp) {
          merged.rsvp = { ...DEFAULT_WIZARD_CONFIG.rsvp, ...saved.rsvp }
          if (saved.rsvp.showFields) {
            merged.rsvp.showFields = { ...DEFAULT_WIZARD_CONFIG.rsvp.showFields, ...saved.rsvp.showFields }
          }
        }
        if (saved.organizer1) merged.organizer1 = { ...DEFAULT_WIZARD_CONFIG.organizer1, ...saved.organizer1 }
        if (saved.organizer2) merged.organizer2 = { ...DEFAULT_WIZARD_CONFIG.organizer2, ...saved.organizer2 }
        if (saved.segments)   merged.segments   = { ...DEFAULT_WIZARD_CONFIG.segments,   ...saved.segments   }
        state.config = merged
        state.templateOverride = null
        state.isDirty = false
      }),

    setTemplateOverride: (t) =>
      set((state) => {
        state.templateOverride = t
      }),

    updateConfig: (key, value) =>
      set((state) => {
        (state.config as WizardConfig)[key] = value
        state.isDirty = true
      }),

    setPage: (page) =>
      set((state) => {
        state.currentPage = Math.min(Math.max(1, page), TOTAL_PAGES)
      }),

    nextPage: () =>
      set((state) => {
        if (state.currentPage < TOTAL_PAGES) state.currentPage++
      }),

    prevPage: () =>
      set((state) => {
        if (state.currentPage > 1) state.currentPage--
      }),

    setCardSlug: (slug) =>
      set((state) => {
        state.cardSlug = slug
      }),

    setIsPublished: (published) =>
      set((state) => {
        state.isPublished = published
      }),

    setIsSaving: (saving) =>
      set((state) => {
        state.isSaving = saving
      }),

    markClean: () =>
      set((state) => {
        state.isDirty = false
      }),

    addContact: () =>
      set((state) => {
        if (state.config.contacts.length < 7) {
          state.config.contacts.push({ name: "", role: "", phone: "", isWhatsApp: true })
          state.isDirty = true
        }
      }),

    removeContact: (index) =>
      set((state) => {
        state.config.contacts.splice(index, 1)
        state.isDirty = true
      }),

    updateContact: (index, contact) =>
      set((state) => {
        Object.assign(state.config.contacts[index], contact)
        state.isDirty = true
      }),

    moveContact: (from, to) =>
      set((state) => {
        const contacts = state.config.contacts
        if (to < 0 || to >= contacts.length) return
        const [item] = contacts.splice(from, 1)
        contacts.splice(to, 0, item)
        state.isDirty = true
      }),

    resetToDefaults: () =>
      set((state) => {
        state.config = { ...DEFAULT_WIZARD_CONFIG }
        state.isDirty = false
      }),

    setGiftItems: (items) =>
      set((state) => { state.giftItems = items }),

    addGiftItem: (item) =>
      set((state) => { state.giftItems.push(item) }),

    removeGiftItem: (id) =>
      set((state) => { state.giftItems = state.giftItems.filter((g) => g.id !== id) }),

    setPhotoItems: (items) =>
      set((state) => { state.photoItems = items }),

    addPhotoItem: (item) =>
      set((state) => { state.photoItems.push(item) }),

    removePhotoItem: (id) =>
      set((state) => { state.photoItems = state.photoItems.filter((p) => p.id !== id) }),
  }))
)
