"use client"

import { useLanguageStore } from "@/store/languageStore"

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguageStore()

  return (
    <button
      onClick={() => setLang(lang === "ms" ? "en" : "ms")}
      className="flex items-center gap-0.5 text-[11px] font-bold tracking-wide border border-[var(--bd)] rounded-full px-2.5 py-1 text-[var(--tx-2)] hover:text-[var(--tx-1)] hover:border-gold/40 transition-colors select-none"
      title={lang === "ms" ? "Switch to English" : "Tukar ke Bahasa Melayu"}
    >
      <span className={lang === "ms" ? "text-gold" : "text-[var(--tx-3)]"}>BM</span>
      <span className="text-[var(--tx-3)] mx-0.5">/</span>
      <span className={lang === "en" ? "text-gold" : "text-[var(--tx-3)]"}>EN</span>
    </button>
  )
}
