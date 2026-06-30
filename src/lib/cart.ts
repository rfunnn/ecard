const CART_KEY      = "kad_my_cards"
const CART_USER_KEY = "kad_my_cart_user"

export function getCartOwner(): string | null {
  if (typeof window === "undefined") return null
  try { return localStorage.getItem(CART_USER_KEY) } catch { return null }
}

export function setCartOwner(userId: string) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(CART_USER_KEY, userId) } catch {}
}

export function clearCart() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(CART_KEY)
    localStorage.removeItem(CART_USER_KEY)
  } catch {}
}

export function getCartSlugs(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function addToCart(slug: string) {
  if (typeof window === "undefined") return
  try {
    const slugs = getCartSlugs().filter((s) => s !== slug)
    slugs.unshift(slug)
    localStorage.setItem(CART_KEY, JSON.stringify(slugs.slice(0, 20)))
  } catch {}
}

export function removeFromCart(slug: string) {
  if (typeof window === "undefined") return
  try {
    const slugs = getCartSlugs().filter((s) => s !== slug)
    localStorage.setItem(CART_KEY, JSON.stringify(slugs))
  } catch {}
}

export function getCartCount(): number {
  return getCartSlugs().length
}
