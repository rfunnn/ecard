import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import type {
  InvitationCardData,
  ThemeSettings,
  MediaConfig,
  ScrollConfig,
} from "@/types/invitation"
import { DEFAULT_THEME, DEFAULT_MEDIA, DEFAULT_SCROLL } from "@/types/invitation"

interface BuilderState {
  card: Partial<InvitationCardData>
  isDirty: boolean
  isSaving: boolean
  activePanel: "content" | "style" | "media" | "scroll" | "gift" | "share"
  previewMode: "desktop" | "mobile"
}

interface BuilderActions {
  setCard: (card: Partial<InvitationCardData>) => void
  updateContent: (updates: Partial<InvitationCardData>) => void
  updateTheme: (updates: Partial<ThemeSettings>) => void
  updateMedia: (updates: Partial<MediaConfig>) => void
  updateScroll: (updates: Partial<ScrollConfig>) => void
  setActivePanel: (panel: BuilderState["activePanel"]) => void
  setPreviewMode: (mode: BuilderState["previewMode"]) => void
  setIsSaving: (saving: boolean) => void
  markClean: () => void
}

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  immer((set) => ({
    card: {
      theme: { ...DEFAULT_THEME },
      media: { ...DEFAULT_MEDIA },
      scrollConfig: { ...DEFAULT_SCROLL },
    },
    isDirty: false,
    isSaving: false,
    activePanel: "content",
    previewMode: "mobile",

    setCard: (card) =>
      set((state) => {
        state.card = {
          ...card,
          theme: { ...DEFAULT_THEME, ...card.theme },
          media: { ...DEFAULT_MEDIA, ...card.media },
          scrollConfig: { ...DEFAULT_SCROLL, ...card.scrollConfig },
        }
        state.isDirty = false
      }),

    updateContent: (updates) =>
      set((state) => {
        Object.assign(state.card, updates)
        state.isDirty = true
      }),

    updateTheme: (updates) =>
      set((state) => {
        if (!state.card.theme) state.card.theme = { ...DEFAULT_THEME }
        Object.assign(state.card.theme, updates)
        state.isDirty = true
      }),

    updateMedia: (updates) =>
      set((state) => {
        if (!state.card.media) state.card.media = { ...DEFAULT_MEDIA }
        Object.assign(state.card.media, updates)
        state.isDirty = true
      }),

    updateScroll: (updates) =>
      set((state) => {
        if (!state.card.scrollConfig) state.card.scrollConfig = { ...DEFAULT_SCROLL }
        Object.assign(state.card.scrollConfig, updates)
        state.isDirty = true
      }),

    setActivePanel: (panel) =>
      set((state) => {
        state.activePanel = panel
      }),

    setPreviewMode: (mode) =>
      set((state) => {
        state.previewMode = mode
      }),

    setIsSaving: (saving) =>
      set((state) => {
        state.isSaving = saving
      }),

    markClean: () =>
      set((state) => {
        state.isDirty = false
      }),
  }))
)
