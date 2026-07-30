"use client"

import { useMemo, useState } from "react"
import { X, Printer, Download } from "lucide-react"
import { generatePrintHTML, type PrintPageMode } from "@/lib/print-card"
import type { WizardConfig } from "@/types/config"

interface PrintCard {
  slug: string
  cardNum: number | null
  title: string
  groomName: string | null
  brideName: string | null
  language: string
  isPublished: boolean
  wizardConfig: WizardConfig | null
  theme: { primaryColor: string; bgColor: string; bodyColor: string | null } | null
  template: { image1Url: string | null; image2Url: string | null } | null
}

interface Props {
  card: PrintCard
  onClose: () => void
}

// Native print page dimensions at 96 dpi
const PRINT_W = 480  // 5in
const PRINT_H = 672  // 7in
const PAGE_GAP = 24

export function PrintPreviewModal({ card, onClose }: Props) {
  const [pageMode, setPageMode] = useState<PrintPageMode>("4")
  const isMs = card.language === "ms"

  const html = useMemo(() => generatePrintHTML({
    slug: card.slug,
    cardNum: card.cardNum,
    title: card.title,
    groomName: card.groomName,
    brideName: card.brideName,
    language: card.language,
    isPublished: card.isPublished,
    wizardConfig: card.wizardConfig,
    theme: card.theme,
    image1Url: card.template?.image1Url ?? null,
    image2Url: card.template?.image2Url ?? null,
    pageMode,
  }), [card, pageMode])

  function openPrintWindow() {
    const w = window.open("", "_blank", "width=900,height=760")
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 1400)
  }

  function handlePrint() {
    openPrintWindow()
  }

  function handleDownload() {
    openPrintWindow()
  }

  const pageCount = pageMode === "4" ? 4 : 2
  // iframe renders at native size; we scale it down to ~75% to fit the modal comfortably
  const scale = 0.75
  const iframeH = pageCount * (PRINT_H + PAGE_GAP) + PAGE_GAP + 32
  const scaledW = Math.ceil(PRINT_W * scale)
  const scaledH = Math.ceil(iframeH * scale)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.88)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <span className="text-sm font-semibold text-white">
          {isMs ? "Pratonton Cetak" : "Print Preview"}
        </span>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Page mode toggle */}
      <div className="flex items-center justify-center gap-3 py-3 border-b border-white/10 shrink-0">
        <span className="text-xs text-white/40">{isMs ? "Format:" : "Format:"}</span>
        <div className="flex rounded-full border border-white/20 overflow-hidden">
          {(["4", "2"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setPageMode(mode)}
              className={`px-4 py-1.5 text-xs font-medium transition-all ${
                pageMode === mode
                  ? "bg-white text-black"
                  : "text-white/55 hover:text-white/80"
              }`}
            >
              {mode === "4"
                ? (isMs ? "4 Halaman" : "4 Pages")
                : (isMs ? "2 Halaman" : "2 Pages")}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable preview area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center py-5"
        style={{ background: "#4a4a4a" }}
      >
        {/* Scale wrapper: outer div collapses to scaled size, inner div is at native size with transform */}
        <div style={{ width: `${scaledW}px`, height: `${scaledH}px`, flexShrink: 0 }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: `${PRINT_W}px`, height: `${iframeH}px` }}>
            <iframe
              srcDoc={html}
              title={isMs ? "Pratonton cetak" : "Print preview"}
              style={{ width: `${PRINT_W}px`, height: `${iframeH}px`, border: "none", display: "block" }}
            />
          </div>
        </div>

        <p className="text-[10px] text-white/25 mt-4 text-center px-4 shrink-0">
          {isMs
            ? "Pratonton sahaja — reka bentuk sebenar mungkin berbeza sedikit semasa dicetak"
            : "Preview only — actual print output may differ slightly"}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 shrink-0">
        <span className="text-xs text-white/35">
          {pageCount} {isMs ? "halaman" : "pages"} &nbsp;·&nbsp; 5&Prime; &times; 7&Prime;
        </span>
        <div className="flex items-center gap-2">
          {/* Download PDF */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/25 text-white/70 text-sm font-medium hover:border-white/50 hover:text-white active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              {isMs ? "Muat Turun PDF" : "Download PDF"}
            </button>
            <span className="text-[9px] text-white/25 text-center leading-tight">
              {isMs ? "Pilih 'Save as PDF' dalam dialog" : "Select 'Save as PDF' in dialog"}
            </span>
          </div>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            {isMs ? "Cetak" : "Print"}
          </button>
        </div>
      </div>
    </div>
  )
}
