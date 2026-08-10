"use client"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
    >
      Cetak / Muat Turun PDF
    </button>
  )
}

export function FloatingPrintButton() {
  return (
    <div className="no-print fixed bottom-6 right-6 z-50">
      <button
        onClick={() => window.print()}
        className="px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl shadow-lg hover:bg-gray-700 transition-colors"
      >
        Cetak / Muat Turun PDF
      </button>
    </div>
  )
}
