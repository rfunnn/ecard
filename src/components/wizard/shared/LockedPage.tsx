"use client"

import { Lock } from "lucide-react"

interface Props {
  feature: string
  requiredPlan: string
}

export function LockedPage({ feature, requiredPlan }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Lock className="w-7 h-7 text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">{feature}</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Ciri ini memerlukan pakej{" "}
          <span className="font-semibold text-amber-600">{requiredPlan}</span>{" "}
          ke atas.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Tukar pakej anda pada halaman{" "}
          <strong className="text-gray-500">Utama &amp; Pembukaan</strong>.
        </p>
      </div>
    </div>
  )
}
