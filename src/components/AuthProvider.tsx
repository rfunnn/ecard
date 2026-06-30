"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
import { getCartOwner, setCartOwner, clearCart } from "@/lib/cart"

function CartSync() {
  const { data: session, status } = useSession()
  const syncedRef = useRef<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      clearCart()
      try { localStorage.removeItem("kad_liked_templates") } catch {}
      syncedRef.current = null
      return
    }

    const userId = session?.user?.id
    if (!userId) return

    // Already synced for this user in this session
    if (syncedRef.current === userId) return
    syncedRef.current = userId

    // If the cart belongs to a different user, clear it and load the real user's cards
    const cartOwner = getCartOwner()
    if (cartOwner === userId) return

    // New user — fetch their actual cards and replace the cart
    fetch("/api/user/cards")
      .then((r) => r.json())
      .then((d) => {
        const slugs: string[] = (d.cards ?? []).map((c: { slug: string }) => c.slug)
        localStorage.setItem("kad_my_cards", JSON.stringify(slugs))
        setCartOwner(userId)
      })
      .catch(() => {
        // On failure just clear the stale cart so no wrong cards show
        clearCart()
      })
  }, [status, session?.user?.id])

  return null
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSync />
      {children}
    </SessionProvider>
  )
}
