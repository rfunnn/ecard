"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

const LS_KEY = "kad_liked_templates"

export function useLikes() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id ?? null
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (userId) {
      setLoading(true)
      fetch("/api/user/likes")
        .then((r) => r.json())
        .then((d: { likes?: { id: string }[] }) => {
          const ids = new Set<string>((d.likes ?? []).map((t) => t.id))
          setLiked(ids)
          // Mirror count to localStorage so NavLikesButton stays in sync
          try {
            localStorage.setItem(LS_KEY, JSON.stringify([...ids]))
            window.dispatchEvent(new Event("storage"))
          } catch {}
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      try {
        const raw = localStorage.getItem(LS_KEY)
        setLiked(new Set(raw ? (JSON.parse(raw) as string[]) : []))
      } catch {
        setLiked(new Set())
      }
      setLoading(false)
    }
  }, [status, userId])

  const toggle = useCallback(
    async (templateId: string) => {
      const isLiked = liked.has(templateId)

      // Compute next set outside the updater to avoid side effects during render
      const next = new Set(liked)
      if (isLiked) next.delete(templateId)
      else next.add(templateId)

      // Optimistic UI update
      setLiked(next)

      // Mirror to localStorage for NavLikesButton count (must be outside state updater)
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]))
        window.dispatchEvent(new Event("storage"))
      } catch {}

      if (userId) {
        await fetch("/api/user/likes", {
          method: isLiked ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId }),
        }).catch(() => {})
      }
    },
    [liked, userId]
  )

  return { liked, toggle, loading }
}
