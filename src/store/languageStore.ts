import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Lang = "ms" | "en"

interface LanguageState {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: "ms",
      setLang: (lang) => set({ lang }),
    }),
    { name: "ekad_lang" }
  )
)
