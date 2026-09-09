"use client"

import { useState } from "react"

export function EnableScrollButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")

  async function enable() {
    setState("loading")
    try {
      const res = await fetch(`/api/admin/cards/${slug}/scroll`, { method: "PATCH" })
      setState(res.ok ? "done" : "idle")
    } catch {
      setState("idle")
    }
  }

  if (state === "done") {
    return <span className="text-xs text-green-600 font-medium">Scroll ON</span>
  }

  return (
    <button
      onClick={enable}
      disabled={state === "loading"}
      className="text-xs px-2 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
    >
      {state === "loading" ? "..." : "Scroll"}
    </button>
  )
}
